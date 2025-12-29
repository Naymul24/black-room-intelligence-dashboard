document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------------------------------------
     Backend config
  ------------------------------------------------------- */
  const API_BASE = "http://127.0.0.1:5050/api"; // Flask server
  const AUTH_TOKEN = localStorage.getItem("bri_token"); // your real token key

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {})
    };
  }

  /* -------------------------------------------------------
     Demo data (shows until user adds their first RSS feed)
  ------------------------------------------------------- */
  const demoNewsData = [
    {
      title: "Cybersecurity Alert: New Malware Detected",
      description: "A new malware targeting enterprise networks has been uncovered by researchers.",
      source: "CyberSec News",
      date: "2024-11-25",
      content: "Detailed blog post about the malware, its effects, and mitigation strategies.",
      link: ""
    },
    {
      title: "Top 10 Open Source Tools for Investigations",
      description: "Explore the most useful free tools for cyber threat analysis.",
      source: "TechRadar",
      date: "2024-11-20",
      content: "A comprehensive list of tools along with their features and how to use them.",
      link: ""
    }
  ];

  let hasUserAddedFeed = false;

  /* -------------------------------------------------------
     State
  ------------------------------------------------------- */
  let rssFeeds = [];            // load per user from backend
  let articles = [...demoNewsData];

  /* -------------------------------------------------------
     Elements
  ------------------------------------------------------- */
  const feedsListEl = document.getElementById("feedsList");
  const newsListEl = document.getElementById("newsList");
  const newsEmptyEl = document.getElementById("newsEmpty");

  const openAddRssBtn = document.getElementById("openAddRss");
  const openAddRssBtn2 = document.getElementById("openAddRss2");
  const refreshBtn = document.getElementById("refreshFeeds");

  const rssModal = document.getElementById("rssModal");
  const articleModal = document.getElementById("articleModal");

  const rssForm = document.getElementById("rssForm");
  const rssUrlInput = document.getElementById("rssUrl");

  const articleTitleEl = document.getElementById("articleTitle");
  const articleBodyEl = document.getElementById("articleBody");

  const newsSearch = document.getElementById("newsSearch");

  /* -------------------------------------------------------
     Helpers
  ------------------------------------------------------- */
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add("is-open");
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("is-open");
  }

  function stripHtml(html = "") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || div.innerText || "").trim();
  }

  function formatDate(input) {
    try {
      const d = new Date(input);
      if (Number.isNaN(d.getTime())) return input || "";
      return d.toLocaleDateString();
    } catch {
      return input || "";
    }
  }

  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  function setEmptyState() {
    const hasArticles = articles.length > 0;
    newsListEl.style.display = hasArticles ? "flex" : "none";
    newsEmptyEl.style.display = hasArticles ? "none" : "block";
  }

  /* -------------------------------------------------------
     Backend connected functions
  ------------------------------------------------------- */
  async function loadUserFeeds() {
    try {
      const res = await fetch(`${API_BASE}/rss-feeds`, {
        method: "GET",
        headers: authHeaders()
      });

      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.feeds) ? data.feeds : [];
    } catch (e) {
      console.warn("loadUserFeeds failed:", e);
      return [];
    }
  }

  async function saveFeedToBackend(url) {
    try {
      const res = await fetch(`${API_BASE}/rss-feeds`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ url })
      });
      return res.ok;
    } catch (e) {
      console.warn("saveFeedToBackend failed:", e);
      return false;
    }
  }

  async function deleteFeedFromBackend(url) {
    try {
      const res = await fetch(`${API_BASE}/rss-feeds`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ url })
      });
      return res.ok;
    } catch (e) {
      console.warn("deleteFeedFromBackend failed:", e);
      return false;
    }
  }

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */
  function renderFeeds() {
    feedsListEl.innerHTML = "";

    if (rssFeeds.length === 0) {
      feedsListEl.innerHTML = `
        <div class="tiny-muted" style="padding: 6px 2px;">
          No feeds saved yet. Add one to begin.
        </div>
      `;
      return;
    }

    rssFeeds.forEach((feedUrl) => {
      const name = (() => {
        try {
          const u = new URL(feedUrl);
          return u.hostname.replace("www.", "");
        } catch {
          return "RSS Feed";
        }
      })();

      const item = document.createElement("div");
      item.className = "feed-item";
      item.innerHTML = `
        <div class="feed-item__meta">
          <div class="feed-item__name">${name}</div>
          <div class="feed-item__url">${feedUrl}</div>
        </div>
        <div class="feed-item__actions">
          <button type="button" class="icon-btn" title="Refresh this feed" data-refresh-feed="${feedUrl}">
            <i class="fa fa-rotate-right"></i>
          </button>
          <button type="button" class="icon-btn" title="Remove feed" data-remove-feed="${feedUrl}">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      `;
      feedsListEl.appendChild(item);
    });
  }

  function renderArticles(list = articles) {
    newsListEl.innerHTML = "";

    list.forEach((a, idx) => {
      const card = document.createElement("div");
      card.className = "news-card";
      card.setAttribute("data-article-index", String(idx));

      const title = a.title || "Untitled";
      const source = a.source || "Unknown Source";
      const date = a.date || "";

      const desc = stripHtml(a.description || a.content || "").slice(0, 180);
      const safeDesc = desc ? `${desc}${desc.length >= 180 ? "…" : ""}` : "No description available.";

      card.innerHTML = `
        <div class="news-card__top">
          <div class="news-card__title">${title}</div>
          <div class="news-card__meta">
            <div class="news-meta">${source}</div>
            <div class="news-meta">${date}</div>
          </div>
        </div>
        <div class="news-card__desc">${safeDesc}</div>
      `;
      newsListEl.appendChild(card);
    });

    setEmptyState();
  }

  /* -------------------------------------------------------
     RSS fetcher
     (still uses rss2json like you had)
  ------------------------------------------------------- */
  async function fetchFeed(url) {
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint);

    if (!res.ok) throw new Error("RSS fetch failed");

    const data = await res.json();
    if (!data || data.status !== "ok") throw new Error("RSS parse failed");

    const feedTitle = data.feed?.title || (() => {
      try { return new URL(url).hostname; } catch { return "RSS Feed"; }
    })();

    const items = Array.isArray(data.items) ? data.items : [];

    return items.map((item) => {
      const title = item.title || "Untitled";
      const link = item.link || "";
      const pub = item.pubDate || item.published || "";
      const date = formatDate(pub);

      const description = item.description || "";
      const content = item.content || item.contentSnippet || description;

      return {
        title,
        description,
        content,
        source: feedTitle,
        date,
        link
      };
    });
  }

  async function refreshAllFeeds() {
    if (rssFeeds.length === 0) {
      // No feeds, keep demo if user hasn't added anything yet
      renderFeeds();
      renderArticles(articles);
      return;
    }

    // When user has feeds, demo items should not show
    hasUserAddedFeed = true;

    const merged = [];
    for (const feedUrl of rssFeeds) {
      try {
        const feedArticles = await fetchFeed(feedUrl);
        merged.push(...feedArticles);
      } catch (err) {
        console.warn("Feed failed:", feedUrl, err);
      }
    }

    // Remove demo once feeds exist
    articles = merged.length ? merged : [];
    renderArticles(articles);
  }

  async function refreshSingleFeed(feedUrl) {
    try {
      const feedArticles = await fetchFeed(feedUrl);

      // Remove demo once feeds exist
      hasUserAddedFeed = true;

      // Merge: keep other feed articles, replace this feed's articles
      const others = articles.filter(a => a._feedUrl && a._feedUrl !== feedUrl);
      const tagged = feedArticles.map(a => ({ ...a, _feedUrl: feedUrl }));
      articles = [...others, ...tagged];

      renderArticles(articles);
    } catch (err) {
      alert("Failed to refresh this feed.");
    }
  }

  /* -------------------------------------------------------
     Article modal
  ------------------------------------------------------- */
  function openArticleModal(article) {
    if (!article) return;

    articleTitleEl.textContent = article.title || "Article";

    const source = article.source || "Unknown";
    const date = article.date || "";
    const link = article.link || "";

    const safeText = stripHtml(article.content || article.description || "Content not available.");
    const preview = safeText ? safeText.slice(0, 2500) : "Content not available.";

    articleBodyEl.innerHTML = `
      <div class="modal-section">
        <div class="modal-section__title">Metadata</div>
        <div class="article-meta-row">
          <span><strong>Source:</strong> ${source}</span>
          <span><strong>Date:</strong> ${date}</span>
        </div>

        <div class="article-actions">
          ${link ? `<a class="btn btn-primary btn-sm" href="${link}" target="_blank" rel="noopener noreferrer">Read Full Article</a>` : ""}
          <button type="button" class="btn btn-secondary btn-sm" id="copyArticleTitle">Copy title</button>
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section__title">Summary</div>
        <div class="article-content">${preview || "Content not available."}</div>
      </div>
    `;

    // Copy title button
    const copyBtn = document.getElementById("copyArticleTitle");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(article.title || "");
          copyBtn.textContent = "Copied";
          setTimeout(() => (copyBtn.textContent = "Copy title"), 1200);
        } catch {
          copyBtn.textContent = "Copy failed";
          setTimeout(() => (copyBtn.textContent = "Copy title"), 1200);
        }
      });
    }

    openModal(articleModal);
  }

  /* -------------------------------------------------------
     Events
  ------------------------------------------------------- */
  // Open RSS modal buttons
  openAddRssBtn?.addEventListener("click", () => openModal(rssModal));
  openAddRssBtn2?.addEventListener("click", () => openModal(rssModal));

  // Close modals via backdrop / close buttons
  document.querySelectorAll("[data-modal-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-modal-close");
      if (target === "rss") closeModal(rssModal);
      if (target === "article") closeModal(articleModal);
    });
  });

  // Escape closes modals
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeModal(rssModal);
    closeModal(articleModal);
  });

  // Example feed quick fill
  document.querySelectorAll("[data-example-feed]").forEach(btn => {
    btn.addEventListener("click", () => {
      const url = btn.getAttribute("data-example-feed");
      if (!rssUrlInput || !url) return;
      rssUrlInput.value = url;
      rssUrlInput.focus();
    });
  });

  // Add RSS feed
  rssForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = (rssUrlInput?.value || "").trim();

    if (!url || !isValidUrl(url)) {
      alert("Please enter a valid RSS URL.");
      return;
    }

    // No duplicates
    const exists = rssFeeds.some(f => f.toLowerCase() === url.toLowerCase());
    if (exists) {
      alert("That feed is already added.");
      return;
    }

    // Backend-ready save
    const ok = await saveFeedToBackend(url);
    if (!ok) {
      alert("Failed to save feed.");
      return;
    }

    rssFeeds.push(url);
    renderFeeds();

    // First RSS added -> remove demo items
    hasUserAddedFeed = true;
    articles = []; // clear demo
    renderArticles(articles);

    closeModal(rssModal);
    rssUrlInput.value = "";

    // Fetch immediately
    await refreshAllFeeds();
  });

  // Refresh all
  refreshBtn?.addEventListener("click", async () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = "Refreshing...";
    try {
      await refreshAllFeeds();
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.textContent = "Refresh";
    }
  });

  // Feed actions: remove / refresh single
  feedsListEl?.addEventListener("click", async (e) => {
    const removeBtn = e.target.closest("[data-remove-feed]");
    const refreshBtn = e.target.closest("[data-refresh-feed]");

    if (removeBtn) {
      const url = removeBtn.getAttribute("data-remove-feed");
      if (!url) return;

      const ok = await deleteFeedFromBackend(url);
      if (!ok) {
        alert("Failed to remove feed.");
        return;
      }

      rssFeeds = rssFeeds.filter(f => f !== url);
      renderFeeds();

      // Remove articles from that feed
      articles = articles.filter(a => a._feedUrl !== url);
      renderArticles(articles);

      // If no feeds and user hasn't added any feeds -> demo comes back
      if (rssFeeds.length === 0) {
        hasUserAddedFeed = false;
        articles = [...demoNewsData];
        renderArticles(articles);
      }
    }

    if (refreshBtn) {
      const url = refreshBtn.getAttribute("data-refresh-feed");
      if (!url) return;
      await refreshSingleFeed(url);
    }
  });

  // Click article opens modal
  newsListEl?.addEventListener("click", (e) => {
    const card = e.target.closest(".news-card");
    if (!card) return;
    const idx = Number(card.getAttribute("data-article-index"));
    const article = articles[idx];
    openArticleModal(article);
  });

  // Search filter on articles
  newsSearch?.addEventListener("input", () => {
    const q = (newsSearch.value || "").trim().toLowerCase();
    if (!q) {
      renderArticles(articles);
      return;
    }

    const filtered = articles.filter(a => {
      const title = (a.title || "").toLowerCase();
      const source = (a.source || "").toLowerCase();
      const text = stripHtml(a.description || a.content || "").toLowerCase();
      return title.includes(q) || source.includes(q) || text.includes(q);
    });

    // Render filtered list without changing the underlying articles array
    newsListEl.innerHTML = "";
    filtered.forEach((a) => {
      const title = a.title || "Untitled";
      const source = a.source || "Unknown Source";
      const date = a.date || "";
      const desc = stripHtml(a.description || a.content || "").slice(0, 180);
      const safeDesc = desc ? `${desc}${desc.length >= 180 ? "…" : ""}` : "No description available.";

      const card = document.createElement("div");
      card.className = "news-card";
      card.addEventListener("click", () => openArticleModal(a));

      card.innerHTML = `
        <div class="news-card__top">
          <div class="news-card__title">${title}</div>
          <div class="news-card__meta">
            <div class="news-meta">${source}</div>
            <div class="news-meta">${date}</div>
          </div>
        </div>
        <div class="news-card__desc">${safeDesc}</div>
      `;
      newsListEl.appendChild(card);
    });

    newsEmptyEl.style.display = filtered.length ? "none" : "block";
    newsListEl.style.display = filtered.length ? "flex" : "none";
  });

  /* -------------------------------------------------------
     Init: load feeds (backend later), show demo for now
  ------------------------------------------------------- */
  (async function init() {
    const saved = await loadUserFeeds();
    rssFeeds = Array.isArray(saved) ? saved : [];

    renderFeeds();

    if (rssFeeds.length > 0) {
      hasUserAddedFeed = true;
      articles = [];
      renderArticles(articles);
      await refreshAllFeeds();
    } else {
      hasUserAddedFeed = false;
      articles = [...demoNewsData];
      renderArticles(articles);
    }
  })();
});
