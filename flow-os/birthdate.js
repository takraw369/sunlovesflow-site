(() => {
  const yearSelect = document.getElementById('birth-year');
  const monthSelect = document.getElementById('birth-month');
  const daySelect = document.getElementById('birth-day');
  const hiddenBirthdate = document.getElementById('birthdate');

  if (!yearSelect || !monthSelect || !daySelect || !hiddenBirthdate) return;

  const currentYear = new Date().getFullYear();
  const oldestYear = currentYear - 120;

  for (let year = currentYear; year >= oldestYear; year -= 1) {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = `${year}年`;
    yearSelect.appendChild(option);
  }

  for (let month = 1; month <= 12; month += 1) {
    const option = document.createElement('option');
    option.value = String(month).padStart(2, '0');
    option.textContent = `${month}月`;
    monthSelect.appendChild(option);
  }

  function daysInMonth(year, month) {
    if (!year || !month) return 31;
    return new Date(Number(year), Number(month), 0).getDate();
  }

  function rebuildDays() {
    const previousDay = daySelect.value;
    const maxDays = daysInMonth(yearSelect.value, monthSelect.value);

    daySelect.innerHTML = '<option value="">日</option>';

    for (let day = 1; day <= maxDays; day += 1) {
      const option = document.createElement('option');
      option.value = String(day).padStart(2, '0');
      option.textContent = `${day}日`;
      daySelect.appendChild(option);
    }

    if (previousDay && Number(previousDay) <= maxDays) {
      daySelect.value = previousDay;
    }
  }

  function syncBirthdate() {
    const year = yearSelect.value;
    const month = monthSelect.value;
    const day = daySelect.value;
    hiddenBirthdate.value = year && month && day ? `${year}-${month}-${day}` : '';
  }

  yearSelect.addEventListener('change', () => {
    rebuildDays();
    syncBirthdate();
  });

  monthSelect.addEventListener('change', () => {
    rebuildDays();
    syncBirthdate();
  });

  daySelect.addEventListener('change', syncBirthdate);

  rebuildDays();
})();
