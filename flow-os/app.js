const form = document.getElementById('flow-form');
const resultSection = document.getElementById('result');
const retryButton = document.getElementById('retry-button');

['energy', 'pressure', 'clarity'].forEach((id) => {
  const input = document.getElementById(id);
  const output = document.getElementById(`${id}-output`);
  input.addEventListener('input', () => { output.value = input.value; });
});

const shadowMap = {
  anger: {
    label: '怒り',
    collapse: '反応が先に立つと、相手・環境・結果に主導権を渡しやすい。正しさを証明しようとするほど、視野が狭くなりやすい。',
    truth: '守りたい境界線・尊厳・譲れない価値',
    weapon: '境界線と突破力',
    reset: '息を長く吐き、肩と顎の力を抜く。怒りの相手ではなく「守りたいもの」を一言で言語化する。',
    action: '怒りを説明に使わず、最初の一歩を速くするためのエネルギーに変える。'
  },
  jealousy: {
    label: '嫉妬',
    collapse: '比較が続くと、他人の進捗が自分の価値を決めているように感じやすい。自己否定か模倣に寄りすぎる。',
    truth: '本当は自分も望んでいる未来・可能性',
    weapon: '方向感覚と欲望の発見',
    reset: '比較対象から距離を取り、「羨ましい点」を事実として3語以内で書く。そこから欲しい未来だけを抜き出す。',
    action: '嫉妬の相手を追わず、今日一つだけ自分の質を上げる。'
  },
  fear: {
    label: '恐怖',
    collapse: '失敗を避ける意識が強くなると、判断が遅れ、準備と回避の区別が曖昧になりやすい。',
    truth: '安全・生存・大切なものを守るための警報',
    weapon: '準備力と危機察知',
    reset: '視線を広げ、足裏の接地を確認する。最悪の想像ではなく「次の1プレー／1行動」だけを見る。',
    action: '恐怖を消そうとせず、最初の3プレー／3工程を丁寧にする準備へ変える。'
  },
  attachment: {
    label: '執着',
    collapse: '結果や相手を握ろうとすると、手放せないこと自体が目的になり、柔軟な修正が遅れやすい。',
    truth: '達成したい願い・愛着・やり切りたい意志',
    weapon: '継続力と粘着力',
    reset: '「変えられること／変えられないこと」を分け、変えられる側の最小単位だけを選ぶ。',
    action: '結果への執着を、今日やり切る一つの反復に変える。'
  },
  solitude: {
    label: '孤独',
    collapse: '一人で抱え込みすぎると、深く考える力が閉鎖性に変わり、助けや情報まで遮断しやすい。',
    truth: '自分の感覚を守りたい欲求・深く潜る力',
    weapon: '洞察力と独自性',
    reset: '静かな時間を5分確保し、自分の感覚を一度言葉にする。その後、信頼できる一人に一文だけ共有する。',
    action: '孤独を閉じるためではなく、周囲に流されない集中時間として使う。'
  }
};

const roleMap = {
  life: {
    core: '自分の感覚と現実の両方を観察し、「どう生きたいか」を日々の選択へ落とす力。',
    winning: '大きな答えを一度に出すより、自分の状態を読みながら小さく選び直すほどFlowに乗りやすい。',
    move: '今日の予定から「やらなくてもいいこと」を1つ外し、本当に進めたいことへ20分使う。'
  },
  athlete: {
    core: '結果ではなく、今この瞬間の身体・視線・リズムへ戻る力。勝負を細かいプレー単位に分解できるほど強い。',
    winning: '試合全体を支配しようとせず、最初の3プレーで自分のリズムを作る。感情は動作へ変換して使う。',
    move: '次の練習で「最初の3プレーのテーマ」を1つだけ決め、終了後に再現率を記録する。'
  },
  coach: {
    core: '答えを与えるより、選手の状態を観察し、その人自身が戻れる問いと環境を設計する力。',
    winning: '技術修正の前に、選手のStateと身体反応を確認する。指示を増やすより、焦点を1つに絞るほど伝わりやすい。',
    move: '次の指導で「何が悪い？」ではなく「今どこに力が入ってる？」と一度だけ問い、反応を観察する。'
  },
  business: {
    core: '情報を増やすより、Purposeから逆算して最重要の一手を選ぶ力。感情を意思決定の材料として読む。',
    winning: '複数案件を同時に押すより、今のボトルネックを1つ特定し、そこへ時間・信用・資源を集中させる。',
    move: '今日の仕事を「売上・資産・信用」の3つに分け、最も波及効果が高い1件を先に完了する。'
  }
};

const numberLens = {
  1: '始める・切り拓く。先頭に立つ時に力が出やすい反面、全部を一人で背負わないこと。',
  2: 'つなぐ・感じ取る。関係性の機微を読む力がある反面、相手に合わせすぎないこと。',
  3: '表現する・遊ぶ。言葉や創造性が流れを作る反面、散漫さを一つの作品へ束ねること。',
  4: '積み上げる・整える。再現性と基盤づくりが強み。固めすぎず修正余地を残すこと。',
  5: '動く・変える。変化への適応が武器。刺激を追うだけでなく、経験を資産化すること。',
  6: '育てる・調和する。人や場を整える力がある反面、抱え込みと過責任に注意。',
  7: '探究する・深める。独自の洞察が武器。考え切る前でも小さく現実に出すこと。',
  8: '動かす・実現する。資源や成果を扱う力がある反面、結果だけで自分を測らないこと。',
  9: '統合する・還元する。広い視点と共感が強み。終わらせる勇気が次の流れを作る。'
};

function getFlowNumber(dateString) {
  const digits = dateString.replace(/\D/g, '').split('').map(Number);
  let total = digits.reduce((sum, n) => sum + n, 0);
  while (total > 9) total = String(total).split('').reduce((sum, n) => sum + Number(n), 0);
  return total || 1;
}

function stateLabel(energy, pressure, clarity) {
  if (energy <= 2) return '回復優先';
  if (pressure >= 4 && clarity <= 2) return '過覚醒';
  if (energy >= 4 && clarity >= 4) return '前進モード';
  if (pressure <= 2 && clarity >= 4) return '設計モード';
  return '調律モード';
}

function mbtiLens(value) {
  const mbti = value.trim().toUpperCase();
  if (!/^[IE][NS][TF][JP]$/.test(mbti)) return '';
  const energy = mbti[0] === 'I' ? '一人で整理する時間' : '外とのやり取り';
  const info = mbti[1] === 'N' ? '意味・可能性' : '具体的事実・経験';
  const decision = mbti[2] === 'T' ? '構造と整合性' : '価値観と関係性';
  const pace = mbti[3] === 'J' ? '区切りと計画' : '余白と探索';
  return `MBTIレンズでは、${energy}からエネルギーを整え、${info}を手掛かりにし、${decision}で判断し、${pace}があると動きやすい傾向を観察できる。`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const birthdate = document.getElementById('birthdate').value;
  const role = document.getElementById('role').value;
  const mbti = document.getElementById('mbti').value;
  const shadowKey = new FormData(form).get('shadow');
  const energy = Number(document.getElementById('energy').value);
  const pressure = Number(document.getElementById('pressure').value);
  const clarity = Number(document.getElementById('clarity').value);
  const bodySignal = document.getElementById('bodySignal').value.trim();
  const challenge = document.getElementById('challenge').value.trim();

  const shadow = shadowMap[shadowKey];
  const roleData = roleMap[role];
  const flowNumber = getFlowNumber(birthdate);
  const state = stateLabel(energy, pressure, clarity);
  const bodyText = bodySignal ? `あなたの場合は「${bodySignal}」がサイン。そこを早期警報として使う。` : '感情が強くなった時は、呼吸・顎・肩・足裏のどこが変わるかを最初の観察点にする。';
  const mbtiText = mbtiLens(mbti);

  let stateAdvice = '大きく変えず、今のリズムを保ちながら一つだけ精度を上げる。';
  if (state === '回復優先') stateAdvice = '今は出力を上げるより回復が先。睡眠・食事・呼吸・休息を「練習の一部」として扱う。';
  if (state === '過覚醒') stateAdvice = '情報と判断を増やさず、視線・呼吸・足裏へ戻り、次の一手だけに焦点を絞る。';
  if (state === '前進モード') stateAdvice = '状態は動かせる側。難度を一段上げるか、重要課題を先に処理すると勢いを成果へ変えやすい。';
  if (state === '設計モード') stateAdvice = '頭が使える状態。実行前に、目的・順序・やらないことを短く決めると強い。';

  document.getElementById('result-name').textContent = name;
  document.getElementById('flow-number').textContent = flowNumber;
  document.getElementById('result-summary').textContent = `現在のStateは「${state}」。Flow Number ${flowNumber} のレンズでは「${numberLens[flowNumber]}」がテーマ。今越えたいものは「${challenge}」。`;
  document.getElementById('core-result').textContent = `${roleData.core} ${mbtiText}`;
  document.getElementById('winning-result').textContent = `${roleData.winning} ${stateAdvice}`;
  document.getElementById('collapse-result').textContent = shadow.collapse;
  document.getElementById('shadow-result').textContent = `${shadow.label}の奥には「${shadow.truth}」がある。影を悪者にせず、何を守ろうとしているのかを見る。`;
  document.getElementById('weapon-result').textContent = `${shadow.label}から取り出す武器は「${shadow.weapon}」。感情を消すのではなく、役割を与える。`;
  document.getElementById('reset-result').textContent = `${shadow.reset} ${bodyText}`;
  document.getElementById('next-result').textContent = `${roleData.move} 加えて、${shadow.action}`;
  document.getElementById('protocol-result').textContent = `SEE：${shadow.label}に気づく → NAME：「いま${shadow.label}がある」と言う → BODY：身体のサインへ戻る → CONVERT：「${shadow.weapon}」へ意味変換する → ACT：具体的な1動作にする。`;

  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

retryButton.addEventListener('click', () => {
  document.getElementById('flow-check').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
