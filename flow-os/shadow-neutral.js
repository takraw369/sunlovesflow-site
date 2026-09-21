(() => {
  if (typeof shadowMap === 'undefined' || typeof buildLocalResult === 'undefined') return;

  shadowMap.neutral = {
    label: '特になし',
    collapse: '今は強い「影」が前面に出ていない状態。問題を無理に探すより、現在のFlowを維持しながら小さな違和感や身体の変化を観察する方が合っている。',
    truth: '今の自分をそのまま観察できる余白',
    weapon: '余白と安定感',
    reset: '大きく変えようとせず、呼吸・視線・足裏を10秒だけ確認する。崩れていない時の身体感覚を覚えておく。',
    action: '感情を無理に燃料化せず、今うまく回っているものを一つ確認し、その流れを次の一手へつなげる。'
  };

  const baseBuildLocalResult = buildLocalResult;
  buildLocalResult = function buildLocalResultWithNeutral(input) {
    const result = baseBuildLocalResult(input);
    if (input.shadow !== 'neutral') return result;

    const roleData = roleMap[input.role];
    return {
      ...result,
      collapse_pattern: '今は強い影が前面に出ていない。無理に問題を作らず、調子が崩れ始める小さなサインだけを観察しておく。',
      shadow: {
        key: 'neutral',
        label: '特になし',
        truth: '今の自分をそのまま観察できる余白',
        text: '今は強い「影」が前面に出ていない状態。何かを悪者にする必要はなく、フラットな現在地そのものを基準として覚えておく。'
      },
      weapon: {
        label: '余白と安定感',
        text: '今の武器は「余白と安定感」。感情を無理に燃料化せず、整っている時の感覚を再現できるようにしておく。'
      },
      reset_protocol: {
        text: '大きく変えようとせず、呼吸・視線・足裏を10秒だけ確認する。崩れていない今の身体感覚を、自分の基準値として覚えておく。'
      },
      next_move: {
        text: `${roleData.move} そのうえで、今うまく回っているものを一つ言語化し、その流れを壊さず次へつなげる。`
      },
      protocol: 'SEE：今のフラットさに気づく → NAME：「今は強い影なし」と確認する → BODY：呼吸・視線・足裏の基準値を覚える → CONVERT：安定を再現可能な武器にする → ACT：今のFlowを保ったまま次の一手へ進む。'
    };
  };

  if (typeof requestPersistedResult === 'function') {
    const baseRequestPersistedResult = requestPersistedResult;
    requestPersistedResult = async function requestPersistedResultWithNeutral(input) {
      if (input.shadow !== 'neutral') return baseRequestPersistedResult(input);

      const response = await fetch('https://qydbtholbwbuwiswmqsr.supabase.co/functions/v1/flow-os-neutral-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: flowToken, ...input })
      });

      let payload = null;
      try { payload = await response.json(); } catch (_) {}
      if (!response.ok || !payload?.ok || !payload?.result) {
        const error = new Error(payload?.error || `http_${response.status}`);
        error.code = payload?.error || `http_${response.status}`;
        throw error;
      }
      return payload;
    };
  }

  function loadOptionalShadow() {
    if (document.querySelector('script[src="./shadow-optional.js"]')) return;
    const optional = document.createElement('script');
    optional.src = './shadow-optional.js';
    document.body.appendChild(optional);
  }

  if (!document.querySelector('script[src="./flow-hijutsu.js"]')) {
    const script = document.createElement('script');
    script.src = './flow-hijutsu.js';
    script.onload = loadOptionalShadow;
    script.onerror = loadOptionalShadow;
    document.body.appendChild(script);
  } else {
    loadOptionalShadow();
  }
})();
