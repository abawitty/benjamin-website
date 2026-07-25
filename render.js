// ===== CMS CONTENT RENDERING =====
// Fetches content/*.json and populates each page. Runs before script.js's
// per-page logic (nav toggle, gallery filters, scroll-in animation), which
// call back into window.applyScrollIn() / window.initGalleryLightbox() below
// once their DOM is in place.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Supports **bold** markdown syntax only; everything else is escaped.
function mdBold(str) {
  return escapeHtml(str).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

// Supports *emphasis* markdown syntax only; everything else is escaped.
function mdEm(str) {
  return escapeHtml(str).replace(/\*(.+?)\*/g, "<em>$1</em>");
}

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("Failed to load " + path);
  return res.json();
}

// Re-applies the scroll-in fade/slide animation to any matching elements
// that haven't been initialized yet. Safe to call repeatedly.
window.applyScrollIn = function () {
  const observer = window.__scrollInObserver || (window.__scrollInObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  ));
  document
    .querySelectorAll(
      ".tl-item, .edu-card, .skill-card, .award-item, .gallery-item, .fact, .ql-card, .membership-item"
    )
    .forEach((el) => {
      if (el.dataset.scrollInit) return;
      el.dataset.scrollInit = "1";
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.45s ease, transform 0.45s ease";
      observer.observe(el);
    });
};

// ---- SITE-WIDE (logo, every page) ----
async function renderSiteSettings() {
  const targets = ["navLogo", "heroSeal", "ltSeal"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!targets.length) return;
  const data = await loadJSON("content/site.json");
  if (data.logo) targets.forEach((el) => (el.src = data.logo));
}

// ---- HERO BACKGROUND SLIDESHOW (index.html + about/experience/education/skills) ----
function startHeroSlideshow(container, images) {
  if (!container || !images || !images.length) return;
  container.innerHTML = images
    .map(
      (src, i) =>
        `<div class="hero-bg-slide${i === 0 ? " active" : ""}" style="background-image:url('${escapeHtml(src)}')"></div>`
    )
    .join("");
  if (images.length < 2) return;
  const slides = container.querySelectorAll(".hero-bg-slide");
  let index = 0;
  setInterval(() => {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }, 5000);
}

async function renderHeroBackground() {
  const container = document.getElementById("heroBg");
  if (!container) return;
  const data = await loadJSON("content/media.json");
  const album = data.albums.find((a) => a.title === "Trip to China");
  if (!album || !album.photos.length) return;
  startHeroSlideshow(container, album.photos.map((p) => p.src));
}

// ---- HOME (index.html) ----
async function renderHomePage() {
  const root = document.getElementById("homeHeroHeading");
  if (!root) return;
  const data = await loadJSON("content/home.json");

  document.getElementById("homeHeroEyebrow").textContent = data.hero.eyebrow;
  root.innerHTML = data.hero.headingLines.map((line) => mdEm(line)).join("<br>");
  document.getElementById("homeHeroLede").textContent = data.hero.lede;
  document.getElementById("homeHeroTags").innerHTML = data.hero.tags
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join("");
  document.getElementById("homeHeroCtaPrimary").textContent = data.hero.ctaPrimaryText;
  document.getElementById("homeHeroCtaSecondary").textContent = data.hero.ctaSecondaryText;
  document.getElementById("homeHeroStats").innerHTML = data.hero.stats
    .map((s) => `<div class="stat"><b>${escapeHtml(s.num)}</b><span>${escapeHtml(s.label)}</span></div>`)
    .join("");

  const lb = data.lawbenpina;
  document.getElementById("homeLbEyebrow").textContent = lb.eyebrow;
  document.getElementById("homeLbHeading").textContent = lb.heading;
  document.getElementById("homeLbParagraph").innerHTML = mdBold(lb.paragraph);
  document.getElementById("homeLbBullets").innerHTML = lb.bullets
    .map((b) => `<li>${mdBold(b)}</li>`)
    .join("");
  document.getElementById("homeLbSideText").textContent = lb.sideText;
  document.getElementById("homeLbWaNumber").textContent = lb.waNumber;

  const lt = data.legaltree;
  document.getElementById("homeLtEyebrow").textContent = lt.eyebrow;
  document.getElementById("homeLtHeading").textContent = lt.heading;
  document.getElementById("homeLtParagraphs").innerHTML = lt.paragraphs
    .map((p) => `<p>${mdBold(p)}</p>`)
    .join("");
  document.getElementById("homeLtList").innerHTML = lt.list
    .map((item) => `<div><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.text)}</div>`)
    .join("");

  const ex = data.explore;
  document.getElementById("homeExploreEyebrow").textContent = ex.eyebrow;
  document.getElementById("homeExploreHeading").textContent = ex.heading;
  document.getElementById("homeExploreGrid").innerHTML = ex.cards
    .map(
      (c) =>
        `<a class="explore-card" href="${escapeHtml(c.link)}"><span class="eyebrow">${escapeHtml(c.number)}</span><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.text)}</p></a>`
    )
    .join("");

  window.applyScrollIn();
}

// ---- ABOUT (about.html) ----
async function renderAboutPage() {
  const root = document.getElementById("aboutParagraphs");
  if (!root) return;
  const data = await loadJSON("content/about.json");

  document.getElementById("heroEyebrow").textContent = data.hero.eyebrow;
  document.getElementById("heroHeading").textContent = data.hero.heading;
  document.getElementById("heroLede").textContent = data.hero.lede;

  root.innerHTML = data.paragraphs.map((p) => `<p>${mdBold(p)}</p>`).join("");

  document.getElementById("principlesEyebrow").textContent = data.principles.eyebrow;
  document.getElementById("principlesHeading").textContent = data.principles.heading;
  document.getElementById("principlesGrid").innerHTML = data.principles.cards
    .map((c) => `<div class="skill-card"><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.text)}</p></div>`)
    .join("");

  window.applyScrollIn();
}

// ---- EXPERIENCE (experience.html) ----
function entryHtml(entry) {
  return `
    <div class="entry">
      <div class="entry-meta"><div class="org">${escapeHtml(entry.org)}</div><div class="date">${escapeHtml(entry.date)}</div></div>
      <div class="entry-body"><h3>${escapeHtml(entry.title)}</h3>${entry.paragraphs.map((p) => `<p>${mdBold(p)}</p>`).join("")}</div>
    </div>`;
}

async function renderExperiencePage() {
  const root = document.getElementById("experienceClusters");
  if (!root) return;
  const data = await loadJSON("content/experience.json");

  document.getElementById("heroEyebrow").textContent = data.hero.eyebrow;
  document.getElementById("heroHeading").textContent = data.hero.heading;
  document.getElementById("heroLede").textContent = data.hero.lede;

  root.innerHTML = data.clusters
    .map(
      (cluster, i) => `
        <div class="entry-cluster-group"${i > 0 ? ' style="margin-top:60px;"' : ""}>
          <span class="eyebrow">${escapeHtml(cluster.label)}</span>
          <div class="entry-cluster">${cluster.entries.map(entryHtml).join("")}</div>
        </div>`
    )
    .join("");

  window.applyScrollIn();
}

// ---- EDUCATION (education.html) ----
async function renderEducationPage() {
  const root = document.getElementById("educationEntries");
  if (!root) return;
  const data = await loadJSON("content/education.json");

  document.getElementById("heroEyebrow").textContent = data.hero.eyebrow;
  document.getElementById("heroHeading").textContent = data.hero.heading;
  document.getElementById("heroLede").textContent = data.hero.lede;

  root.innerHTML = data.entries.map(entryHtml).join("");

  window.applyScrollIn();
}

// ---- SKILLS (skills.html) ----
async function renderSkillsPage() {
  const root = document.getElementById("competenciesGrid");
  if (!root) return;
  const [data, memberships] = await Promise.all([
    loadJSON("content/skills.json"),
    loadJSON("content/memberships.json"),
  ]);

  document.getElementById("heroEyebrow").textContent = data.hero.eyebrow;
  document.getElementById("heroHeading").textContent = data.hero.heading;
  document.getElementById("heroLede").textContent = data.hero.lede;

  const cardsHtml = (cards) =>
    cards
      .map(
        (c) =>
          `<div class="skill-card"><h3>${escapeHtml(c.title)}</h3>${c.paragraphs.map((p) => `<p>${mdBold(p)}</p>`).join("")}</div>`
      )
      .join("");

  document.getElementById("competenciesEyebrow").textContent = data.competencies.eyebrow;
  root.innerHTML = cardsHtml(data.competencies.cards);

  document.getElementById("aiLiteracyEyebrow").textContent = data.aiLiteracy.eyebrow;
  document.getElementById("aiLiteracyGrid").innerHTML = cardsHtml(data.aiLiteracy.cards);

  document.getElementById("awardsEyebrow").textContent = data.awards.eyebrow;
  document.getElementById("awardsGrid").innerHTML = cardsHtml(data.awards.cards);

  document.getElementById("membershipsEyebrow").textContent = data.membershipsEyebrow;
  document.getElementById("membershipsList").innerHTML = memberships.memberships
    .map((m) => `<div class="member-row"><span>${escapeHtml(m.name)}</span><span>${escapeHtml(m.years)}</span></div>`)
    .join("");

  window.applyScrollIn();
}

// ---- MEDIA (media.html) ----
const CATEGORY_ORDER = [
  { key: "political", label: "Political Work" },
  { key: "student", label: "Student Leadership" },
  { key: "community", label: "Community Service" },
  { key: "business", label: "Business" },
  { key: "media", label: "Media & Press" },
  { key: "faith", label: "Faith & Culture" },
  { key: "personal", label: "Personal & Social" },
];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function renderMedia() {
  const navRoot = document.getElementById("albumNav");
  const galleryRoot = document.getElementById("galleryRoot");
  if (!navRoot || !galleryRoot) return;
  const data = await loadJSON("content/media.json");

  const byCategory = {};
  data.albums.forEach((album) => {
    (byCategory[album.category] = byCategory[album.category] || []).push(album);
  });

  let navHtml = "";
  let galleryHtml = "";

  CATEGORY_ORDER.forEach(({ key, label }) => {
    const albums = byCategory[key];
    if (!albums || !albums.length) return;

    navHtml += `<div class="album-nav-group"><h4>${escapeHtml(label)}</h4><ul>`;
    galleryHtml += `<div class="gallery-category" id="cat-${key}"><h2 class="gallery-category-title">${escapeHtml(label)}</h2>`;

    albums.forEach((album) => {
      const anchor = slugify(album.title);
      navHtml += `<li><a href="#${anchor}">${escapeHtml(album.title)}</a></li>`;
      galleryHtml += `<div class="album-group" id="${anchor}"><h3 class="gallery-group-title">${escapeHtml(album.title)}</h3><div class="gallery-grid">`;
      album.photos.forEach((photo) => {
        const caption = photo.caption || album.caption || album.title;
        galleryHtml += `
          <div class="gallery-item" data-cat="${key}" data-caption="${escapeHtml(caption)}">
            <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(album.title)}" loading="lazy" />
            <div class="gallery-overlay"><span>${escapeHtml(album.title)}</span></div>
          </div>`;
      });
      galleryHtml += `</div></div>`;
    });

    navHtml += `</ul></div>`;
    galleryHtml += `</div>`;
  });

  navRoot.innerHTML = navHtml;
  galleryRoot.innerHTML = galleryHtml;

  if (typeof window.initGalleryLightbox === "function") {
    window.initGalleryLightbox();
  }
  window.applyScrollIn();
}

renderSiteSettings();
renderMedia();
renderHeroBackground();
renderHomePage();
renderAboutPage();
renderExperiencePage();
renderEducationPage();
renderSkillsPage();
