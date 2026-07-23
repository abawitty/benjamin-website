// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== ACTIVE NAV LINK (highlight current page) =====
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});

// ===== MOBILE NAV TOGGLE =====
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// ===== TYPED TEXT (index.html only) =====
// Called by render.js once the rotating titles are fetched from content/home.json.
window.startTypedText = function (titles) {
  const typedEl = document.getElementById('typedText');
  if (!typedEl || !titles || !titles.length) return;
  let tIdx = 0, cIdx = 0, deleting = false;

  function type() {
    const current = titles[tIdx];
    if (!deleting) {
      typedEl.textContent = current.slice(0, ++cIdx);
      if (cIdx === current.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      typedEl.textContent = current.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        tIdx = (tIdx + 1) % titles.length;
      }
    }
    setTimeout(type, deleting ? 50 : 80);
  }
  type();
};

// ===== GALLERY FILTER + LIGHTBOX (media.html only) =====
// Called by render.js after the gallery DOM is built from content/media.json.
window.initGalleryLightbox = function () {
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        galleryItems.forEach(item => {
          item.classList.toggle('hidden', filter !== 'all' && item.dataset.cat !== filter);
        });
        buildLightboxList();
      });
    });
  }

  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const lbImg   = document.getElementById('lbImg');
  const lbCap   = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  const lbPrev  = document.getElementById('lbPrev');
  const lbNext  = document.getElementById('lbNext');
  let lbList = [], lbCurrent = 0;

  function buildLightboxList() {
    lbList = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
  }
  buildLightboxList();

  function openLightbox(index) {
    lbCurrent = index;
    const item = lbList[index];
    lbImg.src = item.querySelector('img').src;
    lbImg.alt = item.querySelector('img').alt;
    lbCap.textContent = item.dataset.caption || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  function showNext() { openLightbox((lbCurrent + 1) % lbList.length); }
  function showPrev() { openLightbox((lbCurrent - 1 + lbList.length) % lbList.length); }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      buildLightboxList();
      const idx = lbList.indexOf(item);
      if (idx !== -1) openLightbox(idx);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbNext.addEventListener('click', showNext);
  lbPrev.addEventListener('click', showPrev);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'Escape')     closeLightbox();
  });
};

// ===== CONTACT FORM (contact.html only) =====
const form = document.getElementById('contactForm');
if (form) {
  const formNote = document.getElementById('formNote');
  form.addEventListener('submit', e => {
    e.preventDefault();
    formNote.textContent = 'Thank you! Your message has been noted. I will be in touch shortly.';
    form.reset();
    setTimeout(() => { formNote.textContent = ''; }, 5000);
  });
}

// ===== SCROLL-IN ANIMATION (all pages) =====
const styleEl = document.createElement('style');
styleEl.textContent = `.visible { opacity: 1 !important; transform: none !important; }`;
document.head.appendChild(styleEl);

// Static (non-CMS-rendered) elements can animate immediately; content
// injected later by render.js calls window.applyScrollIn() itself.
if (typeof window.applyScrollIn === 'function') {
  window.applyScrollIn();
}
