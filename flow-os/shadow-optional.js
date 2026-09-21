(() => {
  const form = document.getElementById('flow-form');
  const fieldset = form?.querySelector('.fieldset');
  if (!form || !fieldset || document.getElementById('shadow-optional-trigger')) return;

  const neutral = fieldset.querySelector('input[name="shadow"][value="neutral"]');
  if (!fieldset.querySelector('input[name="shadow"]:checked') && neutral) neutral.checked = true;

  const legend = fieldset.querySelector('legend');
  if (legend) legend.textContent = '今の感情状態は？';

  const style = document.createElement('style');
  style.textContent = `
    .shadow-optional-trigger{width:100%;margin:0 0 14px;padding:14px 16px;border:1px solid #ded6ca;border-radius:14px;background:#fffdf8;color:#273142;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;cursor:pointer}
    .shadow-optional-trigger strong{font-size:.84rem}.shadow-optional-trigger small{display:block;color:#8b8277;font-size:.68rem;font-weight:500;margin-top:2px}.shadow-optional-chevron{font-size:1rem;color:#8a8178;transition:transform .2s ease}.shadow-optional-trigger[aria-expanded="true"] .shadow-optional-chevron{transform:rotate(180deg)}
    .shadow-optional-fieldset[hidden]{display:none}.shadow-optional-fieldset{margin-top:0!important;padding-top:6px!important}
  `;
  document.head.appendChild(style);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.id = 'shadow-optional-trigger';
  trigger.className = 'shadow-optional-trigger';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = '<span><strong>感情の変換も見る（任意）</strong><small>怒り・不安・執着などが強い時だけ開く</small></span><span class="shadow-optional-chevron">⌄</span>';

  fieldset.classList.add('shadow-optional-fieldset');
  fieldset.hidden = true;
  fieldset.parentNode.insertBefore(trigger, fieldset);

  trigger.addEventListener('click', () => {
    const open = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!open));
    fieldset.hidden = open;
  });
})();
