// ===== CMS CONTENT RENDERING =====
// Fetches content/*.json and populates each page. Runs before script.js's
// per-page logic (typed text, gallery filters, scroll-in animation), which
// call back into window.applyScrollIn() / window.startTypedText() below
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

// ---- SITE-WIDE (nav logo, every page) ----
async function renderSiteSettings() {
  const logoEl = document.getElementById("navLogo");
  if (!logoEl) return;
  const data = await loadJSON("content/site.json");
  if (data.logo) logoEl.src = data.logo;
}

// ---- HOME (index.html) ----
async function renderHome() {
  const root = document.getElementById("heroTag");
  if (!root) return;
  const data = await loadJSON("content/home.json");
  document.getElementById("heroTag").textContent = data.tag;
  document.getElementById("heroName").textContent = data.name;
  document.getElementById("heroBadges").innerHTML = data.badges
    .map((b) => `<span class="badge">${escapeHtml(b)}</span>`)
    .join("");
  if (typeof window.startTypedText === "function") {
    window.startTypedText(data.titles);
  }
}

// ---- ABOUT (about.html) ----
async function renderAbout() {
  const root = document.getElementById("aboutRoot");
  if (!root) return;
  const data = await loadJSON("content/about.json");
  document.getElementById("aboutPhoto").src = data.photo;
  document.getElementById("aboutCardLabel").textContent = data.cardLabel;
  document.getElementById("aboutCardValue").textContent = data.cardValue;
  document.getElementById("aboutCardSub").textContent = data.cardSub;
  document.getElementById("aboutIntro").textContent = data.intro;
  document.getElementById("aboutParagraphs").innerHTML = data.paragraphs
    .map((p) => `<p>${mdBold(p)}</p>`)
    .join("");
  document.getElementById("aboutFacts").innerHTML = data.facts
    .map(
      (f) =>
        `<div class="fact"><span class="fact-num">${escapeHtml(f.num)}</span><span class="fact-label">${escapeHtml(f.label)}</span></div>`
    )
    .join("");
  window.applyScrollIn();
}

// ---- EXPERIENCE (experience.html) ----
async function renderExperience() {
  const root = document.getElementById("timelineRoot");
  if (!root) return;
  const data = await loadJSON("content/experience.json");
  root.innerHTML = data.items
    .map(
      (it) => `
        <div class="tl-item">
          <div class="tl-dot"></div>
          <div class="tl-date">${escapeHtml(it.date)}</div>
          <div class="tl-card">
            <span class="tl-tag">${escapeHtml(it.tag)}</span>
            <h3>${escapeHtml(it.title)}</h3>
            <p class="tl-org">${escapeHtml(it.org)}</p>
            <p>${escapeHtml(it.description)}</p>
          </div>
        </div>`
    )
    .join("");
  window.applyScrollIn();
}

// ---- EDUCATION (education.html) ----
async function renderEducation() {
  const root = document.getElementById("eduRoot");
  if (!root) return;
  const data = await loadJSON("content/education.json");
  root.innerHTML = data.items
    .map(
      (it) => `
        <div class="edu-card${it.highlight ? " edu-card-highlight" : ""}">
          <div class="edu-icon">${escapeHtml(it.icon)}</div>
          <div>
            <p class="edu-year">${escapeHtml(it.year)}</p>
            <h3>${escapeHtml(it.title)}</h3>
            <p class="edu-field">${escapeHtml(it.field)}</p>
            <p class="edu-inst">${escapeHtml(it.institution)}</p>
          </div>
        </div>`
    )
    .join("");
  window.applyScrollIn();
}

// ---- SKILLS (skills.html) ----
async function renderSkills() {
  const root = document.getElementById("skillsRoot");
  if (!root) return;
  const data = await loadJSON("content/skills.json");
  document.getElementById("skillsGrid").innerHTML = data.skills
    .map(
      (s) => `
        <div class="skill-card">
          <div class="skill-icon">${escapeHtml(s.icon)}</div>
          <h3>${escapeHtml(s.title)}</h3>
          <p>${escapeHtml(s.desc)}</p>
        </div>`
    )
    .join("");
  document.getElementById("langList").innerHTML = data.languages
    .map((l) => `<span class="lang-badge">${escapeHtml(l)}</span>`)
    .join("");
  document.getElementById("awardsGrid").innerHTML = data.awards
    .map(
      (a) => `
        <div class="award-item">
          <div class="award-icon">${escapeHtml(a.icon || "🏅")}</div>
          <div>
            <p class="award-title">${escapeHtml(a.title)}</p>
            <p class="award-sub">${escapeHtml(a.sub)}</p>
          </div>
        </div>`
    )
    .join("");
  document.getElementById("membershipsGrid").innerHTML = data.memberships
    .map(
      (m) => `
        <div class="membership-item">
          <span class="membership-dot"></span>
          <div>
            <p class="membership-name">${escapeHtml(m.name)}</p>
            <p class="membership-year">${escapeHtml(m.years)}</p>
          </div>
        </div>`
    )
    .join("");
  window.applyScrollIn();
}

// ---- CONTACT (contact.html) ----
async function renderContact() {
  const root = document.getElementById("contactRoot");
  if (!root) return;
  const [contact, skills] = await Promise.all([
    loadJSON("content/contact.json"),
    loadJSON("content/skills.json"),
  ]);
  document.getElementById("contactIntro").textContent = contact.intro;
  document.getElementById("contactItems").innerHTML = `
    <a href="mailto:${escapeHtml(contact.email)}" class="contact-item">
      <span class="contact-icon">✉</span>
      <div><p class="contact-label">Email</p><p class="contact-value">${escapeHtml(contact.email)}</p></div>
    </a>
    <a href="tel:${escapeHtml(contact.phone.replace(/\s+/g, ""))}" class="contact-item">
      <span class="contact-icon">📞</span>
      <div><p class="contact-label">Phone</p><p class="contact-value">${escapeHtml(contact.phone)}</p></div>
    </a>
    <div class="contact-item">
      <span class="contact-icon">📍</span>
      <div><p class="contact-label">Location</p><p class="contact-value">${escapeHtml(contact.location)}</p></div>
    </div>
    <a href="${escapeHtml(contact.linkedin)}" target="_blank" rel="noopener" class="contact-item">
      <span class="contact-icon">🔗</span>
      <div><p class="contact-label">LinkedIn</p><p class="contact-value">${escapeHtml(contact.linkedin.replace(/^https?:\/\/(www\.)?/, ""))}</p></div>
    </a>`;
  document.getElementById("contactMemberships").innerHTML = skills.memberships
    .map(
      (m) =>
        `<li>${escapeHtml(m.name)} <span>${escapeHtml(m.years)}</span></li>`
    )
    .join("");
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
renderHome();
renderAbout();
renderExperience();
renderEducation();
renderSkills();
renderContact();
renderMedia();
