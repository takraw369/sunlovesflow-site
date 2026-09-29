import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const OWNER_KEY_RE=/^[0-9a-f]{64}$/i;
const H={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"};
const json=(s:number,b:unknown)=>new Response(JSON.stringify(b),{status:s,headers:H});
const clamp=(s:string,n=320)=>s.replace(/\s+/g," ").trim().slice(0,n);

type Hit={title:string;level:number;start:number;page:number;kind:"chapter"|"numbered"|"markdown"};
type ChildNode={node_id:string;title:string;start_char:number;end_char:number;page_start:number;page_end:number;summary:string};
type DeepNode={node_id:string;title:string;level:number;start_char:number;end_char:number;page_start:number|null;page_end:number|null;summary:string;children:ChildNode[]};

function buildTree(content:string){
  const lines=content.split("\n");
  let cursor=0,page=1,tocPage:number|null=null;
  const hits:Hit[]=[];
  for(let i=0;i<lines.length;i++){
    const raw=lines[i];
    const ff=(raw.match(/\f/g)||[]).length;
    if(ff) page+=ff;
    const line=raw.replace(/\f|\r/g,"").trim();
    if(/^目\s*次$/.test(line)) tocPage=page;
    let title="",level=1,kind:Hit["kind"]|null=null;
    let m=line.match(/^(第\s*[0-9０-９一二三四五六七八九十百]+\s*章)\s*[：:\-–—]?\s*(.{0,100})$/);
    if(m){
      kind="chapter"; title=[m[1],m[2]].filter(Boolean).join(" ").trim();
      if((!m[2]||m[2].trim().length<2)&&i+1<lines.length){
        const next=lines[i+1].replace(/\f|\r/g,"").trim();
        if(next&&next.length<=80&&!/^CONFIDENTIAL/i.test(next)) title+=` ${next}`;
      }
    }
    if(!title){m=line.match(/^([0-9０-９]{1,2})[.)．、]\s*(.{2,100})$/);if(m){kind="numbered";level=2;title=`${m[1]}. ${m[2].trim()}`;}}
    if(!title){m=line.match(/^(#{1,4})\s+(.{2,120})$/);if(m){kind="markdown";level=m[1].length;title=m[2].trim();}}
    if(kind&&title&&title.length<=140&&!/^CONFIDENTIAL/i.test(title)) hits.push({title,level,start:cursor,page,kind});
    cursor+=raw.length+1;
  }

  const density=new Map<number,number>();
  for(const h of hits) if(h.kind==="chapter") density.set(h.page,(density.get(h.page)||0)+1);
  const tocPages=new Set([...density.entries()].filter(([,c])=>c>=4).map(([p])=>p));
  if(tocPage!==null) tocPages.add(tocPage);
  const bodyHits=hits.filter(h=>!(h.kind==="chapter"&&tocPages.has(h.page)));
  const norm=(t:string)=>t.normalize("NFKC").replace(/[\s　:：・.．、\-–—()（）]/g,"").toLowerCase();
  const keepLater=new Map<string,Hit>();
  for(const h of bodyHits) keepLater.set(`${h.kind}:${norm(h.title)}`,h);
  const dedup=[...keepLater.values()].sort((a,b)=>a.start-b.start);
  const chapterHits=dedup.filter(h=>h.kind==="chapter");
  const pageCount=Math.max(1,(content.match(/\f/g)||[]).length+1);
  const nodes:DeepNode[]=[];

  if(chapterHits.length>=2){
    for(let i=0;i<chapterHits.length;i++){
      const h=chapterHits[i],end=i+1<chapterHits.length?chapterHits[i+1].start:content.length;
      const section=content.slice(h.start,end);
      const kids=dedup.filter(x=>x.kind==="numbered"&&x.start>h.start&&x.start<end);
      const children:ChildNode[]=[];
      for(let k=0;k<kids.length;k++){
        const ch=kids[k],chEnd=k+1<kids.length?kids[k+1].start:end;
        const txt=content.slice(ch.start,chEnd);
        children.push({node_id:`n${String(i+1).padStart(3,"0")}.${k+1}`,title:ch.title,start_char:ch.start,end_char:chEnd,page_start:ch.page,page_end:ch.page+(txt.match(/\f/g)||[]).length,summary:clamp(txt.replace(ch.title,""),220)});
      }
      nodes.push({node_id:`n${String(i+1).padStart(3,"0")}`,title:h.title,level:1,start_char:h.start,end_char:end,page_start:h.page,page_end:h.page+(section.match(/\f/g)||[]).length,summary:clamp(section.replace(h.title,""),360),children});
    }
  }else{
    const structural=dedup.filter(h=>h.kind!=="numbered");
    if(structural.length>=2){
      for(let i=0;i<structural.length;i++){
        const h=structural[i],end=i+1<structural.length?structural[i+1].start:content.length,txt=content.slice(h.start,end);
        nodes.push({node_id:`n${String(i+1).padStart(3,"0")}`,title:h.title,level:h.level,start_char:h.start,end_char:end,page_start:h.page,page_end:h.page+(txt.match(/\f/g)||[]).length,summary:clamp(txt.replace(h.title,""),360),children:[]});
      }
    }else if(pageCount>=3){
      const pages=content.split("\f"); let start=0;
      for(let i=0;i<pages.length;i++){
        const p=pages[i],end=start+p.length,first=p.split("\n").map(x=>x.trim()).find(Boolean)||`Page ${i+1}`;
        nodes.push({node_id:`p${String(i+1).padStart(3,"0")}`,title:clamp(first,100),level:1,start_char:start,end_char:end,page_start:i+1,page_end:i+1,summary:clamp(p,360),children:[]}); start=end+1;
      }
    }else nodes.push({node_id:"n001",title:"Document",level:1,start_char:0,end_char:content.length,page_start:1,page_end:pageCount,summary:clamp(content,360),children:[]});
  }
  return {version:"reasoning-tree-v3",page_count:pageCount,nodes,diagnostics:{raw_heading_count:hits.length,chapter_count:chapterHits.length,toc_pages:[...tocPages],toc_marker_page:tocPage}};
}

Deno.serve(async(req:Request)=>{
  if(req.method!=="POST") return json(405,{ok:false,error:"method_not_allowed"});
  const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key) return json(500,{ok:false,error:"supabase_credentials_missing"});
  try{
    const body=await req.json().catch(()=>({})),ownerKey=String(body?.owner_key??"").trim(),driveFileId=String(body?.drive_file_id??"").trim(),force=body?.force===true;
    if(!OWNER_KEY_RE.test(ownerKey)) return json(401,{ok:false,error:"owner_auth_required"});
    if(!driveFileId) return json(400,{ok:false,error:"drive_file_id_required"});
    const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:ownerOk,error:authErr}=await db.rpc("masa_evidence_owner_ok_v1",{p_owner_key:ownerKey});
    if(authErr||ownerOk!==true) return json(403,{ok:false,error:"owner_auth_failed"});
    const {data:s,error:sErr}=await db.from("knowledge_canonical_snapshots").select("id,drive_file_id,title,canonical_url,content,content_hash,metadata,visibility").eq("drive_file_id",driveFileId).maybeSingle();
    if(sErr) throw sErr;if(!s) return json(404,{ok:false,error:"snapshot_not_found"});
    const content=String(s.content??""); if(content.length<600&&!force) return json(409,{ok:false,error:"snapshot_too_thin",chars:content.length});
    const tree=buildTree(content),structured=tree.nodes.length>=2||tree.page_count>=3;
    if(!structured&&content.length<12000&&!force) return json(200,{ok:true,indexed:false,reason:"not_deep_read_worthy",chars:content.length,node_count:tree.nodes.length});
    const {data:sourceNode}=await db.from("knowledge_fabric_nodes").select("id").eq("canonical_url",s.canonical_url).limit(1).maybeSingle();
    await db.from("knowledge_deep_indexes").update({status:"stale",updated_at:new Date().toISOString()}).eq("provider","reasoning_tree").eq("source_kind","canonical_snapshot").eq("source_key",driveFileId).neq("source_hash",s.content_hash);
    const now=new Date().toISOString();
    const row={source_kind:"canonical_snapshot",source_key:driveFileId,drive_file_id:driveFileId,source_node_id:sourceNode?.id??null,title:s.title,canonical_url:s.canonical_url,source_hash:s.content_hash,provider:"reasoning_tree",tree,source_chars:content.length,node_count:tree.nodes.length,status:"ready",index_version:"reasoning-tree-v3",indexed_at:now,updated_at:now,metadata:{page_count:tree.page_count,structure_detected:structured,snapshot_scope:s.metadata?.snapshot_scope??null,visibility:s.visibility,hierarchical:true}};
    const {data:idx,error:iErr}=await db.from("knowledge_deep_indexes").upsert(row,{onConflict:"provider,source_kind,source_key,source_hash"}).select("id,provider,node_count,source_chars,status,indexed_at,index_version").single(); if(iErr) throw iErr;
    await db.from("knowledge_canonical_snapshots").update({metadata:{...(s.metadata??{}),deep_read_index_id:idx.id,deep_read_provider:"reasoning_tree",deep_read_status:"ready",deep_read_index_version:"reasoning-tree-v3",deep_read_indexed_at:idx.indexed_at},updated_at:now}).eq("id",s.id);
    await db.rpc("knowledge_fabric_record_feedback_v1",{p_event_type:"ingestion",p_outcome:"success",p_observation:"Hierarchical Deep Read tree built from canonical snapshot.",p_query_text:null,p_subject_node_id:sourceNode?.id??null,p_subject_edge_id:null,p_related_rule_key:"deep_read_router",p_expected_result:"Build a rebuildable structural index that preserves chapters and nested subheadings.",p_actual_result:`provider=reasoning_tree-v3; nodes=${tree.nodes.length}; chars=${content.length}; pages=${tree.page_count}`,p_evidence:[{drive_file_id:driveFileId,title:s.title,node_count:tree.nodes.length,page_count:tree.page_count}],p_proposed_action:null,p_actor:"knowledge-deep-index",p_metadata:{architecture_version:"deep-read-v3",provider:"reasoning_tree",source_hash:s.content_hash}});
    return json(200,{ok:true,indexed:true,index:idx,tree_summary:{page_count:tree.page_count,node_count:tree.nodes.length,titles:tree.nodes.slice(0,30).map((n:DeepNode)=>({title:n.title,children:n.children.map(c=>c.title)}))}});
  }catch(e){console.error("knowledge-deep-index",e);return json(500,{ok:false,error:"deep_index_failed",detail:e instanceof Error?e.message:String(e)});}
});