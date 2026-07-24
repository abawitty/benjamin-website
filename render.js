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

// ---- HOME (index.html) ----
async function renderHome() {
  const heading = document.getElementById("heroHeading");
  if (!heading) return;

  const [home, about, practice, experience, legaltree, credentials, footer, contact] = await Promise.all([
    loadJSON("content/home.json"),
    loadJSON("content/about.json"),
    loadJSON("content/practice.json"),
    loadJSON("content/experience.json"),
    loadJSON("content/legaltree.json"),
    loadJSON("content/credentials.json"),
    loadJSON("content/footer.json"),
    loadJSON("content/contact.json"),
  ]);

  // Hero
  heading.innerHTML = home.headingLines.map((line) => mdEm(line)).join("<br>");
  document.getElementById("heroLede").textContent = home.lede;
  document.getElementById("heroTags").innerHTML = home.tags
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join("");
  document.getElementById("heroCtaPrimary").textContent = home.ctaPrimary;
  document.getElementById("heroCtaSecondary").textContent = home.ctaSecondary;

  // About
  if (about.photo) {
    document.getElementById("aboutPortrait").innerHTML =
      `<img src="${escapeHtml(about.photo)}" alt="Addo Benjamin Armah" />`;
  }
  document.getElementById("aboutParagraphs").innerHTML = about.paragraphs
    .map((p) => `<p>${mdBold(p)}</p>`)
    .join("");
  document.getElementById("aboutStats").innerHTML = about.stats
    .map(
      (s) =>
        `<div class="stat"><b>${escapeHtml(s.num)}</b><span>${escapeHtml(s.label)}</span></div>`
    )
    .join("");

  // Practice
  document.getElementById("practiceEyebrow").textContent = practice.eyebrow;
  document.getElementById("practiceHeading").textContent = practice.heading;
  document.getElementById("practiceCards").innerHTML = practice.cards
    .map(
      (c) => `
        <div class="card">
          <span class="eyebrow">${escapeHtml(c.tag)}</span>
          <h3>${escapeHtml(c.title)}</h3>
          <p>${escapeHtml(c.description)}</p>
        </div>`
    )
    .join("");

  // Experience
  document.getElementById("experienceEyebrow").textContent = experience.eyebrow;
  document.getElementById("experienceHeading").textContent = experience.heading;
  document.getElementById("experienceClusters").innerHTML = experience.clusters
    .map(
      (cluster) => `
        <div class="exp-cluster">
          <span class="eyebrow">${escapeHtml(cluster.label)}</span>
          ${cluster.items
            .map(
              (it) => `
              <div class="exp-row">
                <div><div class="exp-org">${escapeHtml(it.org)}</div><div class="exp-date">${escapeHtml(it.date)}</div></div>
                <div><div class="exp-role">${escapeHtml(it.role)}</div><div class="exp-desc">${escapeHtml(it.description)}</div></div>
              </div>`
            )
            .join("")}
        </div>`
    )
    .join("");

  // Legal Tree
  document.getElementById("ltEyebrow").textContent = legaltree.eyebrow;
  document.getElementById("ltHeading").textContent = legaltree.heading;
  document.getElementById("ltParagraphs").innerHTML = legaltree.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
  document.getElementById("ltPanelHeading").textContent = legaltree.panelHeading;
  document.getElementById("ltPanelText").textContent = legaltree.panelText;
  document.getElementById("ltCta").textContent = legaltree.ctaText;

  // Credentials
  document.getElementById("credEyebrow").textContent = credentials.eyebrow;
  document.getElementById("credHeading").textContent = credentials.heading;
  document.getElementById("credGrid").innerHTML = credentials.items
    .map(
      (c) => `
        <div class="cred">
          <div class="cred-top"><h4>${escapeHtml(c.title)}</h4><span class="cred-date">${escapeHtml(c.date)}</span></div>
          <p>${escapeHtml(c.description)}</p>
          ${c.verifyUrl ? `<a href="${escapeHtml(c.verifyUrl)}" target="_blank" rel="noopener">${escapeHtml(c.verifyLabel || "Verify credential →")}</a>` : ""}
        </div>`
    )
    .join("");

  // Footer / contact teaser
  document.getElementById("footerEyebrow").textContent = footer.eyebrow;
  document.getElementById("footerHeading").textContent = footer.heading;
  document.getElementById("contactLinks").innerHTML = `
    <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>
    <a href="tel:${escapeHtml(contact.phone.replace(/\s+/g, ""))}">${escapeHtml(contact.phone)}</a>
    <a href="${escapeHtml(contact.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>
    <a href="contact.html">Full contact form →</a>
    <a href="#legaltree">${escapeHtml(footer.legalTreeLinkText)}</a>`;
  document.getElementById("footerCopyright").textContent = footer.copyright;
  document.getElementById("footerTagline").textContent = footer.tagline;
}

// ---- CONTACT (contact.html) ----
async function renderContact() {
  const root = document.getElementById("contactRoot");
  if (!root) return;
  const [contact, memberships] = await Promise.all([
    loadJSON("content/contact.json"),
    loadJSON("content/memberships.json"),
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
  document.getElementById("contactMemberships").innerHTML = memberships.memberships
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
renderContact();
renderMedia();
