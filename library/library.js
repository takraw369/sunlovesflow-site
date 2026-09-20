(() => {
  const items = Array.isArray(window.SLF_LIBRARY) ? window.SLF_LIBRARY : [];
  const categories = [...new Set(items.map(item => item.category))];

  const shelvesRoot = document.getElementById("shelves");
  const shelfTemplate = document.getElementById("shelfTemplate");
  const filtersRoot = document.getElementById("categoryFilters");
  const searchInput = document.getElementById("librarySearch");
  const resultCount = document.getElementById("resultCount");
  const emptyState = document.getElementById("emptyState");
  const resetFilters = document.getElementById("resetFilters");
  const featuredOnlyButton = document.getElementById("featuredOnly");

  const bookModal = document.getElementById("bookModal");
  const giftModal = document.getElementById("giftModal");
  const modalBookCover = document.getElementById("modalBookCover");
  const modalCategory = document.getElementById("modalCategory");
  const modalCoverTitle = document.getElementById("modalCoverTitle");
  const modalSpineTitle = document.getElementById("modalSpineTitle");
  const modalPageKicker = document.getElementById("modalPageKicker");
  const modalTitle = document.getElementById("bookModalTitle");
  const modalSummary = document.getElementById("modalSummary");
  const modalSteps = document.getElementById("modalSteps");
  const modalQuestions = document.getElementById("modalQuestions");
  const downloadSample = document.getElementById("downloadSample");
  const downloadFromGift = document.getElementById("downloadFromGift");
  const openGiftFromBook = document.getElementById("openGiftFromBook");
  const prevBook = document.getElementById("prevBook");
  const nextBook = document.getElementById("nextBook");
  const confettiLayer = document.getElementById("confettiLayer");

  let activeCategory = "ALL";
  let featuredOnly = false;
  let currentItem = items[0] || null;
  let visibleItems = [...items];
  let lastFocus = null;

  const categoryMeta = Object.fromEntries(
    items.map(item => [item.category, {
      icon: item.icon,
      label: item.categoryLabel,
      accent: item.accent
    }])
  );

  function initFilters() {
    categories.forEach(category => {
      const meta = categoryMeta[category];
      const count = items.filter(item => item.category === category).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-chip";
      button.dataset.category = category;
      button.innerHTML = `${meta.icon} ${category} <span>${count}</span>`;
      filtersRoot.appendChild(button);
    });

    filtersRoot.addEventListener("click", event => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      activeCategory = button.dataset.category;
      [...filtersRoot.querySelectorAll(".filter-chip")].forEach(chip => {
        chip.classList.toggle("active", chip === button);
      });
      renderLibrary();
    });
  }

  function getFilteredItems() {
    const query = searchInput.value.trim().toLowerCase();
    return items.filter(item => {
      const categoryMatch = activeCategory === "ALL" || item.category === activeCategory;
      const featuredMatch = !featuredOnly || item.featured;
      const text = `${item.title} ${item.category} ${item.categoryLabel} ${item.summary}`.toLowerCase();
      const queryMatch = !query || text.includes(query);
      return categoryMatch && featuredMatch && queryMatch;
    });
  }

  function createBookCard(item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "book-card";
    button.style.setProperty("--accent", item.accent);
    button.dataset.id = item.id;
    button.setAttribute("aria-label", `${item.title} をひらく`);
    button.innerHTML = `
      <span class="book-card-inner">
        ${item.featured ? `<span class="featured-badge">おすすめ</span>` : ""}
        <span class="book-cover">
          <span class="book-index">${item.category} · ${String(item.id).padStart(3, "0")}</span>
          <h4>${escapeHTML(item.title)}</h4>
          <span class="cover-art" aria-hidden="true">
            <span class="sun"></span>
            <span class="ridge ridge-a"></span>
            <span class="ridge ridge-b"></span>
          </span>
          <span class="book-footer"><span>Sun Loves Flow</span><span class="free-dot" title="FREE"></span></span>
        </span>
      </span>
    `;
    button.addEventListener("click", () => openBook(item, button));
    return button;
  }

  function renderLibrary() {
    visibleItems = getFilteredItems();
    shelvesRoot.innerHTML = "";

    categories.forEach(category => {
      const categoryItems = visibleItems.filter(item => item.category === category);
      if (!categoryItems.length) return;

      const section = shelfTemplate.content.firstElementChild.cloneNode(true);
      const meta = categoryMeta[category];

      section.querySelector(".shelf-icon").textContent = meta.icon;
      section.querySelector(".shelf-category").textContent = category;
      section.querySelector(".shelf-description").textContent = meta.label;
      section.querySelector(".shelf-count").textContent = `${categoryItems.length} GIFT`;
      const row = section.querySelector(".books-row");
      categoryItems.forEach(item => row.appendChild(createBookCard(item)));
      shelvesRoot.appendChild(section);
    });

    resultCount.textContent = `${visibleItems.length}冊を表示中`;
    emptyState.hidden = visibleItems.length !== 0;
  }

  function openBook(item, trigger) {
    currentItem = item;
    lastFocus = trigger || document.activeElement;
    modalBookCover.style.setProperty("--accent", item.accent);
    modalCategory.textContent = item.category;
    modalCoverTitle.textContent = item.title;
    modalSpineTitle.textContent = item.title;
    modalPageKicker.textContent = `${item.category} · GIFT ${String(item.id).padStart(3, "0")}`;
    modalTitle.textContent = item.title;
    modalSummary.textContent = item.summary;
    modalSteps.innerHTML = item.steps.map(step => `<li>${escapeHTML(step)}</li>`).join("");
    modalQuestions.innerHTML = item.questions.map(question => `<li>${escapeHTML(question)}</li>`).join("");

    bookModal.hidden = false;
    document.body.classList.add("modal-open");
    history.replaceState(null, "", `#${item.slug}`);
    setTimeout(() => bookModal.querySelector(".modal-close").focus(), 20);
  }

  function closeBook() {
    bookModal.hidden = true;
    document.body.classList.remove("modal-open");
    if (location.hash.startsWith("#gift-")) {
      history.replaceState(null, "", "#library");
    }
    lastFocus?.focus?.();
  }

  function openGift() {
    if (bookModal && !bookModal.hidden) bookModal.hidden = true;
    lastFocus = document.activeElement;
    giftModal.hidden = false;
    document.body.classList.add("modal-open");
    fireConfetti();
    setTimeout(() => giftModal.querySelector(".modal-close").focus(), 20);
  }

  function closeGift() {
    giftModal.hidden = true;
    document.body.classList.remove("modal-open");
    lastFocus?.focus?.();
  }

  function fireConfetti() {
    confettiLayer.innerHTML = "";
    const palette = ["#d8b76a", "#f3e5b9", "#6d8a71", "#ffffff", "#a57538"];
    for (let i = 0; i < 44; i += 1) {
      const piece = document.createElement("i");
      piece.className = "confetti";
      const angle = (Math.PI * 2 * i) / 44 + Math.random() * 0.3;
      const radius = 150 + Math.random() * 340;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius - (80 + Math.random() * 180);
      piece.style.setProperty("--x", `${x}px`);
      piece.style.setProperty("--y", `${y}px`);
      piece.style.setProperty("--r", `${Math.round(Math.random() * 760 - 380)}deg`);
      piece.style.setProperty("--delay", `${Math.random() * 0.18}s`);
      piece.style.setProperty("--confetti-color", palette[i % palette.length]);
      confettiLayer.appendChild(piece);
    }
  }

  function markdownFor(item) {
    const lines = [
      `# ${item.title}`,
      ``,
      `Sun Loves Flow｜100 GIFT LIBRARY`,
      `${item.category} / ${item.categoryLabel}`,
      ``,
      `## このGIFTについて`,
      item.summary,
      ``,
      `## 今日やること`,
      ...item.steps.map((step, index) => `${index + 1}. ${step}`),
      ``,
      `## 今日の3つの問い`,
      ...item.questions.map(question => `- ${question}`),
      ``,
      `## 1週間の使い方`,
      `- Day 1：いまの状態を観察する`,
      `- Day 2：一番小さな変化を試す`,
      `- Day 3：身体・感情・行動の変化を記録する`,
      `- Day 4：やりすぎているものを1つ減らす`,
      `- Day 5：うまくいった条件を言葉にする`,
      `- Day 6：誰かに説明できる形へ整理する`,
      `- Day 7：次の一歩を1つ決める`,
      ``,
      `## FLOW NOTE`,
      `正解を探すより、変化を観察する。`,
      `続かなければ、意志ではなく設計を見直す。`,
      `自分の体験は、記録した瞬間から次の誰かに渡せる資産になる。`,
      ``,
      `---`,
      `© 2026 MASA / Sun Loves Flow`,
      `https://sunlovesflow.com/`,
      ``
    ];
    return lines.join("\n");
  }

  function downloadCurrent() {
    if (!currentItem) return;
    const blob = new Blob([markdownFor(currentItem)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `SLF_${String(currentItem.id).padStart(3, "0")}_${sanitizeFilename(currentItem.title)}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function changeBook(direction) {
    if (!currentItem) return;
    const source = visibleItems.length ? visibleItems : items;
    const index = source.findIndex(item => item.id === currentItem.id);
    const nextIndex = (index + direction + source.length) % source.length;
    openBook(source[nextIndex], null);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function sanitizeFilename(value) {
    return value.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_").slice(0, 55);
  }

  searchInput.addEventListener("input", renderLibrary);
  featuredOnlyButton.addEventListener("click", () => {
    featuredOnly = !featuredOnly;
    featuredOnlyButton.setAttribute("aria-pressed", String(featuredOnly));
    featuredOnlyButton.textContent = featuredOnly ? "✓ おすすめ表示中" : "✦ おすすめだけ";
    renderLibrary();
  });

  resetFilters.addEventListener("click", () => {
    activeCategory = "ALL";
    featuredOnly = false;
    searchInput.value = "";
    featuredOnlyButton.setAttribute("aria-pressed", "false");
    featuredOnlyButton.textContent = "✦ おすすめだけ";
    [...filtersRoot.querySelectorAll(".filter-chip")].forEach(chip => {
      chip.classList.toggle("active", chip.dataset.category === "ALL");
    });
    renderLibrary();
  });

  document.getElementById("openGiftHero").addEventListener("click", openGift);
  document.getElementById("openGiftFooter").addEventListener("click", openGift);
  openGiftFromBook.addEventListener("click", openGift);
  downloadSample.addEventListener("click", downloadCurrent);
  downloadFromGift.addEventListener("click", downloadCurrent);
  prevBook.addEventListener("click", () => changeBook(-1));
  nextBook.addEventListener("click", () => changeBook(1));

  document.querySelectorAll("[data-close='book']").forEach(button => button.addEventListener("click", closeBook));
  document.querySelectorAll("[data-close='gift']").forEach(button => button.addEventListener("click", closeGift));

  bookModal.addEventListener("click", event => {
    if (event.target === bookModal) closeBook();
  });
  giftModal.addEventListener("click", event => {
    if (event.target === giftModal) closeGift();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (!giftModal.hidden) closeGift();
      else if (!bookModal.hidden) closeBook();
    }
    if (!bookModal.hidden && event.key === "ArrowLeft") changeBook(-1);
    if (!bookModal.hidden && event.key === "ArrowRight") changeBook(1);
  });

  function openFromHash() {
    const match = location.hash.match(/^#gift-(\d{3})$/);
    if (!match) return;
    const id = Number(match[1]);
    const item = items.find(entry => entry.id === id);
    if (item) openBook(item, null);
  }

  initFilters();
  renderLibrary();
  openFromHash();
})();
