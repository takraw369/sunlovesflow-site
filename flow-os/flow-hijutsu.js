(() => {
  const form = document.getElementById('flow-form');
  if (!form || document.getElementById('flow-hijutsu')) return;

  // Load the dedicated styles without requiring another edit to the static page shell.
  if (!document.querySelector('link[href="./flow-hijutsu.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './flow-hijutsu.css';
    document.head.appendChild(link);
  }

  const reduce9 = (value) => {
    let total = String(value ?? '').replace(/\D/g, '').split('').reduce((sum, d) => sum + Number(d), 0);
    while (total > 9) total = String(total).split('').reduce((sum, d) => sum + Number(d), 0);
    return total || 0;
  };

  const reduceSum = (...values) => {
    let total = values.reduce((sum, value) => sum + Number(value || 0), 0);
    while (total > 9) total = String(total).split('').reduce((sum, d) => sum + Number(d), 0);
    return total || 0;
  };

  const universalYear = (year) => reduce9(year);
  const universalMonth = (year, month) => reduceSum(universalYear(year), month);
  const personalYear = (birthMonth, birthDay, year) => reduceSum(birthMonth, birthDay, universalYear(year));
  const personalMonth = (birthMonth, birthDay, year, month) => reduceSum(personalYear(birthMonth, birthDay, year), month);

  const meanings = {
    1: ['始動', '始める・決める・種を置く'],
    2: ['協調', 'つなぐ・待つ・関係を育てる'],
    3: ['表現', '話す・創る・楽しさを外へ出す'],
    4: ['基盤', '整える・仕組みにする・積み上げる'],
    5: ['変化', '動く・試す・風を入れ替える'],
    6: ['育成', '育てる・引き受ける・調和させる'],
    7: ['探究', '深める・内省する・本質を見る'],
    8: ['実現', '成果・資源・現実を動かす'],
    9: ['完了', '統合する・手放す・次へ渡す']
  };

  function japaneseEra(date) {
    const t = date.getTime();
    const eras = [
      { name: '令和', start: new Date(2019, 4, 1), year: 2019 },
      { name: '平成', start: new Date(1989, 0, 8), year: 1989 },
      { name: '昭和', start: new Date(1926, 11, 25), year: 1926 },
      { name: '大正', start: new Date(1912, 6, 30), year: 1912 },
      { name: '明治', start: new Date(1868, 0, 25), year: 1868 }
    ];
    const era = eras.find((item) => t >= item.start.getTime());
    if (!era) return { label: '西暦', eraYear: date.getFullYear(), number: universalYear(date.getFullYear()) };
    const eraYear = date.getFullYear() - era.year + 1;
    return {
      label: `${era.name}${eraYear === 1 ? '元' : eraYear}年`,
      eraYear,
      number: reduce9(eraYear)
    };
  }

  function getBirthParts() {
    const value = document.getElementById('birthdate')?.value || '';
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  }

  const shell = document.createElement('div');
  shell.id = 'flow-hijutsu';
  shell.className = 'flow-hijutsu-shell';
  shell.innerHTML = `
    <button type="button" class="flow-hijutsu-trigger" aria-expanded="false" aria-controls="flow-hijutsu-panel">
      <span class="flow-hijutsu-trigger-copy">
        <span class="flow-hijutsu-kicker">FLOW 秘術</span>
        <strong>数秘の「今」と波を見る</strong>
        <small>世界・和暦・あなたの年運と月運をひらく</small>
      </span>
      <span class="flow-hijutsu-preview" aria-hidden="true">
        <span id="flow-hijutsu-preview-number" class="flow-hijutsu-preview-number">–</span>
        <span class="flow-hijutsu-chevron">⌄</span>
      </span>
    </button>
    <div id="flow-hijutsu-panel" class="flow-hijutsu-panel" hidden>
      <p class="flow-hijutsu-intro">世界の暦の流れと、生年月日から算出したあなた自身の周期を重ねて見ます。数字は未来を断定するものではなく、今の行動を考えるための「流れのレンズ」です。</p>
      <div class="flow-hijutsu-metrics">
        <div class="flow-hijutsu-metric">
          <small>世界年数</small><strong id="hijutsu-world-year">–</strong><span id="hijutsu-world-year-copy">–</span>
        </div>
        <div class="flow-hijutsu-metric">
          <small>和暦レンズ</small><strong id="hijutsu-era-number">–</strong><span id="hijutsu-era-copy">–</span>
        </div>
        <div class="flow-hijutsu-metric is-personal">
          <small>あなたの年数</small><strong id="hijutsu-personal-year">–</strong><span id="hijutsu-personal-year-copy">生年月日を入力</span>
        </div>
        <div class="flow-hijutsu-metric">
          <small>世界月数</small><strong id="hijutsu-world-month">–</strong><span id="hijutsu-world-month-copy">–</span>
        </div>
        <div class="flow-hijutsu-metric is-personal">
          <small>あなたの月数</small><strong id="hijutsu-personal-month">–</strong><span id="hijutsu-personal-month-copy">生年月日を入力</span>
        </div>
      </div>
      <div id="hijutsu-current" class="flow-hijutsu-current"></div>
      <div id="hijutsu-empty" class="flow-hijutsu-empty">生年月日を選ぶと、あなた自身の9年周期と12か月周期が重なります。</div>
      <div class="flow-wave-grid">
        <div class="flow-wave-card">
          <div class="flow-wave-head">
            <div><strong>9年間のFLOW</strong><span>世界年数 × あなたの個人年数</span></div>
            <span class="flow-wave-legend">実線＝あなた ／ 破線＝世界</span>
          </div>
          <div id="hijutsu-year-wave" class="flow-wave-wrap"></div>
        </div>
        <div class="flow-wave-card">
          <div class="flow-wave-head">
            <div><strong>12か月のFLOW</strong><span>今年の世界月数 × あなたの個人月数</span></div>
            <span class="flow-wave-legend">実線＝あなた ／ 破線＝世界</span>
          </div>
          <div id="hijutsu-month-wave" class="flow-wave-wrap"></div>
        </div>
      </div>
      <p class="flow-hijutsu-note">計算：世界年数＝西暦年の数字和を1〜9へ還元。個人年数＝誕生月＋誕生日＋世界年数、個人月数＝個人年数＋暦月（一般的なピタゴラス数秘の暦年方式）。和暦レンズのみFLOW秘術独自の補助指標として、元号年を1〜9へ還元しています。</p>
    </div>`;

  const firstFieldset = form.querySelector('.fieldset');
  if (firstFieldset) form.insertBefore(shell, firstFieldset);
  else form.prepend(shell);

  const trigger = shell.querySelector('.flow-hijutsu-trigger');
  const panel = shell.querySelector('.flow-hijutsu-panel');
  trigger.addEventListener('click', () => {
    const open = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
    if (!open) render();
  });

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function meaning(number) {
    return meanings[number] || ['–', '–'];
  }

  function makeWave(data, currentIndex, hasPersonal) {
    const width = 620;
    const height = 210;
    const left = 28;
    const right = 20;
    const top = 24;
    const bottom = 42;
    const innerW = width - left - right;
    const innerH = height - top - bottom;
    const x = (i) => left + (data.length === 1 ? 0 : (innerW * i) / (data.length - 1));
    const y = (value) => top + ((9 - value) / 8) * innerH;
    const pathFor = (key) => data.map((row, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(row[key]).toFixed(1)}`).join(' ');

    const guides = [1, 5, 9].map((v) => `<line class="flow-wave-guide" x1="${left}" y1="${y(v)}" x2="${width - right}" y2="${y(v)}"></line><text class="flow-wave-label" x="12" y="${y(v) + 3}">${v}</text>`).join('');
    const worldPath = `<path class="flow-wave-path world" d="${pathFor('world')}"></path>`;
    const personalPath = hasPersonal ? `<path class="flow-wave-path" d="${pathFor('personal')}"></path>` : '';

    const points = data.map((row, i) => {
      const current = i === currentIndex ? ' current' : '';
      const worldPoint = `<circle cx="${x(i)}" cy="${y(row.world)}" r="3" style="fill:#fff;stroke:#7b8798;stroke-width:1.5"></circle>`;
      const personalPoint = hasPersonal ? `<circle class="flow-wave-point${current}" cx="${x(i)}" cy="${y(row.personal)}" r="5"></circle><text class="flow-wave-value" x="${x(i)}" y="${Math.max(13, y(row.personal) - 10)}">${row.personal}</text>` : '';
      return `${worldPoint}${personalPoint}<text class="flow-wave-label" x="${x(i)}" y="${height - 13}">${row.label}</text>`;
    }).join('');

    return `<svg class="flow-wave-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="数秘周期グラフ">${guides}${worldPath}${personalPath}${points}</svg>`;
  }

  function render() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const worldY = universalYear(year);
    const worldM = universalMonth(year, month);
    const era = japaneseEra(now);
    const birth = getBirthParts();

    setText('flow-hijutsu-preview-number', birth ? personalYear(birth.month, birth.day, year) : worldY);
    setText('hijutsu-world-year', worldY);
    setText('hijutsu-world-year-copy', `${year}年｜${meaning(worldY)[0]}`);
    setText('hijutsu-era-number', era.number);
    setText('hijutsu-era-copy', `${era.label}｜${meaning(era.number)[0]}`);
    setText('hijutsu-world-month', worldM);
    setText('hijutsu-world-month-copy', `${month}月｜${meaning(worldM)[0]}`);

    const empty = document.getElementById('hijutsu-empty');
    let personalY = null;
    let personalM = null;
    if (birth) {
      personalY = personalYear(birth.month, birth.day, year);
      personalM = personalMonth(birth.month, birth.day, year, month);
      setText('hijutsu-personal-year', personalY);
      setText('hijutsu-personal-year-copy', `${meaning(personalY)[0]}｜${meaning(personalY)[1]}`);
      setText('hijutsu-personal-month', personalM);
      setText('hijutsu-personal-month-copy', `${meaning(personalM)[0]}｜${meaning(personalM)[1]}`);
      if (empty) empty.hidden = true;
    } else {
      setText('hijutsu-personal-year', '–');
      setText('hijutsu-personal-year-copy', '生年月日を入力');
      setText('hijutsu-personal-month', '–');
      setText('hijutsu-personal-month-copy', '生年月日を入力');
      if (empty) empty.hidden = false;
    }

    const currentBox = document.getElementById('hijutsu-current');
    if (currentBox) {
      currentBox.innerHTML = birth
        ? `いま世界は <strong>${worldY}｜${meaning(worldY)[0]}</strong>、あなたは年周期 <strong>${personalY}｜${meaning(personalY)[0]}</strong>、今月は <strong>${personalM}｜${meaning(personalM)[0]}</strong>。世界の空気と自分の周期を分けて見ると、「外が動いているのか、自分が動く時なのか」を整理しやすくなります。`
        : `いま世界は <strong>${worldY}｜${meaning(worldY)[0]}</strong>、今月は <strong>${worldM}｜${meaning(worldM)[0]}</strong>。生年月日を入れると、ここへあなた自身の年運・月運を重ねます。`;
    }

    const yearData = [];
    for (let yv = year - 4; yv <= year + 4; yv += 1) {
      yearData.push({
        label: String(yv),
        world: universalYear(yv),
        personal: birth ? personalYear(birth.month, birth.day, yv) : universalYear(yv)
      });
    }
    const monthData = [];
    for (let m = 1; m <= 12; m += 1) {
      monthData.push({
        label: `${m}月`,
        world: universalMonth(year, m),
        personal: birth ? personalMonth(birth.month, birth.day, year, m) : universalMonth(year, m)
      });
    }

    const yearWave = document.getElementById('hijutsu-year-wave');
    const monthWave = document.getElementById('hijutsu-month-wave');
    if (yearWave) yearWave.innerHTML = makeWave(yearData, 4, Boolean(birth));
    if (monthWave) monthWave.innerHTML = makeWave(monthData, month - 1, Boolean(birth));
  }

  ['birth-year', 'birth-month', 'birth-day'].forEach((id) => {
    document.getElementById(id)?.addEventListener('change', () => setTimeout(render, 0));
  });

  render();
})();