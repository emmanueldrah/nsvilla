import { injectHeaderAndFooter } from './components';

// Initialize global elements on document load
document.addEventListener('DOMContentLoaded', () => {
  injectHeaderAndFooter();

  // Initialize useful, standard interactions
  initGalleryLightbox();
  initStayInquiryForm();
  initScrollReveals();
});

/**
 * Booking Inquiry Form Handler (contact.html)
 * Formats options and redirects directly to WhatsApp with a clean, clear message.
 */
function initStayInquiryForm() {
  const form = document.getElementById('stay-planner-form') as HTMLFormElement | null;
  const selectSuite = document.getElementById('plan-suite') as HTMLSelectElement | null;
  const inputNights = document.getElementById('plan-nights') as HTMLInputElement | null;
  const inputGuests = document.getElementById('plan-guests') as HTMLInputElement | null;

  if (!form || !selectSuite || !inputNights || !inputGuests) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedOption = selectSuite.options[selectSuite.selectedIndex];
    const selectionName = selectedOption.text.trim();
    const nights = Math.max(1, parseInt(inputNights.value) || 1);
    const guests = Math.max(1, parseInt(inputGuests.value) || 1);

    // Collect requested preferences
    const prefPool = (document.getElementById('req-pool') as HTMLInputElement)?.checked ? '✓ Poolside access' : '';
    const prefStarlink = (document.getElementById('req-starlink') as HTMLInputElement)?.checked ? '✓ Starlink WiFi' : '';
    const prefLounge = (document.getElementById('req-lounge') as HTMLInputElement)?.checked ? '✓ Rooftop terrace access' : '';
    const prefBar = (document.getElementById('req-bar') as HTMLInputElement)?.checked ? '✓ Indoor bar access' : '';

    const preferences = [prefPool, prefStarlink, prefLounge, prefBar].filter(Boolean).join('\n');

    // Build a simple, honest, human message for the host
    const messageText = `Hello NS Luxury Villa!\n\nI would like to inquire about booking details for:\n\n📅 Type of stay/event: ${selectionName}\n🌙 Nights: ${nights}\n👥 Guests: ${guests}\n\nAdditional Preferences:\n${preferences || 'None'}\n\nPlease let me know your rates and availability. Thank you!`;
    const encoded = encodeURIComponent(messageText);

    // Redirect to the direct WhatsApp line
    window.open(`https://wa.me/233550000000?text=${encoded}`, '_blank');
  });
}

/**
 * Filter Gallery & Custom Lightbox (gallery.html)
 */
function initGalleryLightbox() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxImg = document.getElementById('lightbox-main-img') as HTMLImageElement | null;
  const captionCat = document.getElementById('lightbox-caption-cat');
  const captionTitle = document.getElementById('lightbox-caption-title');

  if (items.length === 0) return;

  // Filters logic
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('border-luxury-gold', 'text-luxury-gold');
        b.classList.add('border-transparent', 'text-luxury-soft/60');
      });
      btn.classList.add('border-luxury-gold', 'text-luxury-gold');
      btn.classList.remove('border-transparent', 'text-luxury-soft/60');

      const filter = btn.getAttribute('data-filter');
      items.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          (item as HTMLElement).style.display = 'block';
          setTimeout(() => {
            (item as HTMLElement).style.opacity = '1';
            (item as HTMLElement).style.transform = 'scale(1)';
          }, 50);
        } else {
          (item as HTMLElement).style.opacity = '0';
          (item as HTMLElement).style.transform = 'scale(0.95)';
          setTimeout(() => {
            (item as HTMLElement).style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // Lightbox navigation
  let activeIndex = 0;
  const activeImagesList: Array<{ src: string; title: string; cat: string }> = [];

  const updateActiveImages = () => {
    activeImagesList.length = 0;
    items.forEach(item => {
      if ((item as HTMLElement).style.display !== 'none') {
        const src = item.getAttribute('data-img-src') || '';
        const title = item.querySelector('span.font-serif')?.textContent || '';
        const cat = item.querySelector('span.text-\\[9px\\]')?.textContent || '';
        activeImagesList.push({ src, title, cat });
      }
    });
  };

  const showSlide = (index: number) => {
    if (!lightboxImg || activeImagesList.length === 0) return;
    if (index < 0) index = activeImagesList.length - 1;
    if (index >= activeImagesList.length) index = 0;
    activeIndex = index;

    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.98)';

    setTimeout(() => {
      const slide = activeImagesList[activeIndex];
      lightboxImg.src = slide.src;
      if (captionCat) captionCat.innerText = slide.cat;
      if (captionTitle) captionTitle.innerText = slide.title;
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 250);
  };

  items.forEach(item => {
    item.addEventListener('click', () => {
      updateActiveImages();
      const targetSrc = item.getAttribute('data-img-src') || '';
      const idx = activeImagesList.findIndex(x => x.src === targetSrc);

      if (lightbox) {
        lightbox.classList.remove('hidden');
        setTimeout(() => {
          lightbox.classList.add('opacity-100');
        }, 50);
        showSlide(idx >= 0 ? idx : 0);
      }
    });
  });

  const closeLightbox = () => {
    if (lightbox) {
      lightbox.classList.remove('opacity-100');
      setTimeout(() => {
        lightbox.classList.add('hidden');
      }, 500);
    }
  };

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => showSlide(activeIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => showSlide(activeIndex + 1));

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }
}

/**
 * Scroll Reveal Engine
 */
function initScrollReveals() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (elements.length === 0) return;

  const revealCheck = () => {
    const trigger = window.innerHeight * 0.85;
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < trigger) {
        el.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', revealCheck);
  revealCheck();
}
