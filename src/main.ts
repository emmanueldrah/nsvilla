import { injectHeaderAndFooter, initializeSerenityPlayer, initializeEliteCursor } from './components';

// Initialize global elements on document load
document.addEventListener('DOMContentLoaded', () => {
  injectHeaderAndFooter();
  initializeSerenityPlayer();
  initializeEliteCursor();

  // Run page-specific logic dynamically based on elements present
  initHourglassSlider();
  initBlueprintMap();
  initStarlinkCanvas();
  initGalleryLightbox();
  initStayPlanner();
  initScrollReveals();
});

/**
 * 1. Hourglass of Serenity: Dawn-to-Midnight Morph (index.html)
 */
function initHourglassSlider() {
  const slider = document.getElementById('hour-slider') as HTMLInputElement | null;
  const timeLabel = document.getElementById('morph-time');
  const titleLabel = document.getElementById('morph-title');
  const descLabel = document.getElementById('morph-desc');
  const amenityLabel = document.getElementById('morph-amenity');
  const imgElement = document.getElementById('morph-img') as HTMLImageElement | null;
  const container = document.getElementById('morph-container');

  if (!slider) return;

  const states = [
    {
      hour: 6,
      time: '06:00 AM — DAWN',
      title: 'Golden Rays & Private Dive',
      desc: 'Wake up to soft Volta breezes. The pristine swimming pool is crystal clear, reflecting the morning sky. Enjoy a tranquil breakfast on the gated deck with absolute privacy.',
      amenity: 'Featured: Outdoor Swimming Pool',
      img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
      bgColor: 'rgba(19, 40, 27, 0.2)' // Warm emerald glow
    },
    {
      hour: 12,
      time: '12:00 PM — ZENITH',
      title: 'Broadband Oasis & Deep Focus',
      desc: 'Work remotely on high-speed Starlink under the cool shade of our private deck. Uninterrupted power, fast latency, and fully air-conditioned living spaces ensure peak flow state.',
      amenity: 'Featured: Starlink 5G Connected Office',
      img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      bgColor: 'rgba(10, 18, 13, 0.8)' // Clean noon
    },
    {
      hour: 18,
      time: '06:00 PM — DUSK',
      title: 'Volta Sunsets & Rooftop Cocktails',
      desc: 'Ascend to the open rooftop deck. Watch the majestic orange sun set over the hills of Ho while sipping custom craft juices and cold beers from our intimate bar space.',
      amenity: 'Featured: Panoramic Rooftop Lounge',
      img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      bgColor: 'rgba(197, 168, 128, 0.08)' // Warm Golden hour
    },
    {
      hour: 24,
      time: '12:00 AM — MIDNIGHT',
      title: 'Glowing Pool & Intimate Vibe',
      desc: 'The compound comes alive under Ho’s starry sky. Floating glowing pool elements, soft ambient acoustics, and custom private bar vibes deliver total tranquility.',
      amenity: 'Featured: Private Illuminated Bar',
      img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
      bgColor: 'rgba(14, 31, 21, 0.4)' // Deep starry night
    }
  ];

  const updateMorph = (hourVal: number) => {
    // Find closest state
    const closest = states.reduce((prev, curr) =>
      Math.abs(curr.hour - hourVal) < Math.abs(prev.hour - hourVal) ? curr : prev
    );

    if (timeLabel) timeLabel.innerText = closest.time;
    if (titleLabel) titleLabel.innerText = closest.title;
    if (descLabel) descLabel.innerText = closest.desc;
    if (amenityLabel) amenityLabel.innerText = closest.amenity;
    if (imgElement && imgElement.src !== closest.img) {
      imgElement.style.opacity = '0';
      setTimeout(() => {
        imgElement.src = closest.img;
        imgElement.style.opacity = '1';
      }, 300);
    }
    if (container) {
      container.style.backgroundColor = closest.bgColor;
    }
  };

  slider.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    updateMorph(val);
  });

  // initial load trigger
  updateMorph(6);
}

/**
 * 2. 2D Blueprint Spec Reviewer (rooms.html)
 */
function initBlueprintMap() {
  const blocks = document.querySelectorAll('.blueprint-block');
  const infoCard = document.getElementById('bp-info-card');

  if (!infoCard || blocks.length === 0) return;

  const dataMap: Record<string, { title: string; subtitle: string; desc: string; metrics: string[] }> = {
    'bp-suite-a': {
      title: 'The Sanctuary Suite',
      subtitle: 'Premium Master Apartment Layout',
      desc: 'Fully furnished, high-contrast signature master suite. Fully isolated utility systems (power, water controls) for total independence. Fully equipped open-concept gourmet kitchen and separate dining.',
      metrics: ['✦ Capacity: 2 - 4 Guests', '✦ Size: 110 sqm', '✦ En-Suite Luxury Master Bath']
    },
    'bp-suite-b': {
      title: 'The Canopy Vista',
      subtitle: 'Upper Floor Sky Suites',
      desc: 'Stands adjacent to the serene rooftop recreation space. Exceptional light-filled windows overlooking Ho’s hills. Includes en-suite master bedroom with integrated Starlink internet coverage.',
      metrics: ['✦ Capacity: 2 Guests', '✦ Direct Rooftop Access', '✦ 24/7 CCTV Surveillance']
    },
    'bp-pool-deck': {
      title: 'Lounge Bar & Private Pool',
      subtitle: 'Outdoor Relaxation Quarter',
      desc: 'Beautiful customized private swimming pool integrated with an elegant bar setup and gated lounge furniture. Fully illuminated at night. Ideal for private retreats, secure gatherings, and relaxation.',
      metrics: ['✦ Starlink Coverage: High Speed', '✦ Safe Gated Boundary', '✦ Professional Sound Integration']
    }
  };

  const updateCard = (id: string) => {
    const data = dataMap[id];
    if (!data) return;

    infoCard.style.opacity = '0';
    infoCard.style.transform = 'translateY(10px)';

    setTimeout(() => {
      infoCard.innerHTML = `
        <span class="text-[9px] uppercase tracking-[0.25em] text-luxury-gold font-bold">${data.subtitle}</span>
        <h3 class="font-serif text-2xl font-bold text-luxury-cream">${data.title}</h3>
        <p class="text-xs text-luxury-soft/80 leading-relaxed">${data.desc}</p>
        <div class="flex flex-col gap-1 text-[10px] uppercase tracking-wider text-luxury-gold mt-2">
          ${data.metrics.map(m => `<span>${m}</span>`).join('')}
        </div>
      `;
      infoCard.style.opacity = '1';
      infoCard.style.transform = 'translateY(0)';
    }, 200);
  };

  blocks.forEach(block => {
    block.addEventListener('mouseenter', () => {
      updateCard(block.id);
    });
    block.addEventListener('click', () => {
      updateCard(block.id);
    });
  });
}

/**
 * 3. Starlink Satellite Constellation: Canvas Simulator (amenities.html)
 */
function initStarlinkCanvas() {
  const canvas = document.getElementById('starlink-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = canvas.width = canvas.offsetWidth;
  let height = canvas.height = canvas.offsetHeight;

  window.addEventListener('resize', () => {
    if (canvas) {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
  });

  interface Satellite {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    pulse: number;
  }

  const satellitesCount = 28;
  const satellites: Satellite[] = [];

  for (let i = 0; i < satellitesCount; i++) {
    satellites.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 1,
      pulse: Math.random() * Math.PI
    });
  }

  const mouse = { x: -1000, y: -1000 };
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  const animate = () => {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, width, height);

    // Draw central node representing the villa
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#C5A880';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#C5A880';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw satellites and lines
    satellites.forEach(sat => {
      // update position
      sat.x += sat.vx;
      sat.y += sat.vy;

      // boundary collision
      if (sat.x < 0 || sat.x > width) sat.vx *= -1;
      if (sat.y < 0 || sat.y > height) sat.vy *= -1;

      // interactive curve pull near mouse cursor
      const dx = mouse.x - sat.x;
      const dy = mouse.y - sat.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let renderX = sat.x;
      let renderY = sat.y;

      if (dist < 100) {
        const force = (100 - dist) / 100;
        renderX -= dx * force * 0.2;
        renderY -= dy * force * 0.2;
      }

      // draw line back to center node if close
      const centerDist = Math.sqrt((renderX - centerX) ** 2 + (renderY - centerY) ** 2);
      if (centerDist < 160) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(renderX, renderY);
        ctx.strokeStyle = `rgba(197, 168, 128, ${0.12 * (1 - centerDist / 160)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw constellation connections between adjacent satellites
      satellites.forEach(other => {
        if (sat === other) return;
        const sDist = Math.sqrt((renderX - other.x) ** 2 + (renderY - other.y) ** 2);
        if (sDist < 80) {
          ctx.beginPath();
          ctx.moveTo(renderX, renderY);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(230, 223, 211, ${0.08 * (1 - sDist / 80)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      // render single satellite dot
      sat.pulse += 0.02;
      const currentSize = sat.size + Math.sin(sat.pulse) * 0.4;
      ctx.beginPath();
      ctx.arc(renderX, renderY, currentSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230, 223, 211, ${0.4 + Math.sin(sat.pulse) * 0.2})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  };

  animate();
}

/**
 * 4. Staggered Lightbox & Filter Gallery (gallery.html)
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
      // clear active underline border classes
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

  // Lightbox dynamic controls
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

  // close on overlay click outside image
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }
}

/**
 * 5. BespokeStay WhatsApp Orchestrator Calculator (contact.html)
 */
function initStayPlanner() {
  const form = document.getElementById('stay-planner-form') as HTMLFormElement | null;
  const selectSuite = document.getElementById('plan-suite') as HTMLSelectElement | null;
  const inputNights = document.getElementById('plan-nights') as HTMLInputElement | null;
  const inputGuests = document.getElementById('plan-guests') as HTMLInputElement | null;

  const invoiceSuite = document.getElementById('invoice-suite-name');
  const invoiceCalc = document.getElementById('invoice-suite-calc');
  const invoiceTaxLevy = document.getElementById('invoice-tax-levy');
  const invoiceEcoTax = document.getElementById('invoice-eco-tax');
  const invoiceDiscountRow = document.getElementById('invoice-discount-row');
  const invoiceDiscount = document.getElementById('invoice-discount');
  const invoiceTotal = document.getElementById('invoice-total');

  if (!form || !selectSuite || !inputNights || !invoiceSuite || !invoiceCalc || !invoiceTotal) return;

  const calculateTotal = () => {
    const selectedOption = selectSuite.options[selectSuite.selectedIndex];
    const rate = parseFloat(selectedOption.getAttribute('data-price') || '0');
    const nights = Math.max(1, parseInt(inputNights.value) || 1);
    const suiteName = selectedOption.text.split('(')[0].trim();

    const baseCost = rate * nights;

    // Luxury 1.5% Volta Tourism Levy
    const levy = baseCost * 0.015;

    // Discretionary Eco Tax ($5 flat fee)
    const ecoTax = 5.00;

    // Apply special 5% Multi-night discount for bookings of 4 or more nights
    let discount = 0;
    if (nights >= 4) {
      discount = baseCost * 0.05;
      if (invoiceDiscountRow && invoiceDiscount) {
        invoiceDiscountRow.classList.remove('hidden');
        invoiceDiscount.innerText = `-$${discount.toFixed(2)}`;
      }
    } else {
      if (invoiceDiscountRow) invoiceDiscountRow.classList.add('hidden');
    }

    const finalTotal = baseCost + levy + ecoTax - discount;

    if (invoiceSuite) invoiceSuite.innerText = suiteName;
    if (invoiceCalc) invoiceCalc.innerText = `$${rate} x ${nights} night${nights > 1 ? 's' : ''}`;
    if (invoiceTaxLevy) invoiceTaxLevy.innerText = `$${levy.toFixed(2)}`;
    if (invoiceEcoTax) invoiceEcoTax.innerText = `$${ecoTax.toFixed(2)}`;
    if (invoiceTotal) invoiceTotal.innerText = `$${finalTotal.toFixed(2)}`;

    return { suiteName, rate, nights, total: finalTotal };
  };

  // Recalculate on input events
  selectSuite.addEventListener('change', calculateTotal);
  inputNights.addEventListener('input', calculateTotal);
  inputNights.addEventListener('change', calculateTotal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = calculateTotal();
    const guests = inputGuests ? inputGuests.value : '2';

    // Collect requested complementary features
    const rPool = (document.getElementById('req-pool') as HTMLInputElement)?.checked ? '✓ Swimming Pool Access' : '';
    const rStarlink = (document.getElementById('req-starlink') as HTMLInputElement)?.checked ? '✓ Starlink WiFi Access' : '';
    const rLounge = (document.getElementById('req-lounge') as HTMLInputElement)?.checked ? '✓ Rooftop Lounge Access' : '';
    const rBar = (document.getElementById('req-bar') as HTMLInputElement)?.checked ? '✓ Private Bar Setup' : '';

    const extras = [rPool, rStarlink, rLounge, rBar].filter(Boolean).join('\n');

    // Build perfect luxury message
    const rawMsg = `Hello NS Luxury Villa Concierge!\n\nI would like to request an exclusive stay invitation for:\n\n🏠 Suite Style: *${data.suiteName}*\n🌙 Stay duration: *${data.nights} Night${data.nights > 1 ? 's' : ''}*\n👥 Guests count: *${guests} Guests*\n💵 Est. Total: *$${data.total.toFixed(2)}* (Inclusive of Tourism Levy & Eco Surcharges)\n\nSpecial Complementary Requests:\n${extras || 'None'}\n\nPlease confirm availability for these details. Thank you!`;
    const encoded = encodeURIComponent(rawMsg);

    // Redirect to direct WhatsApp concierge desk (+233 55 000 0000)
    window.open(`https://wa.me/233550000000?text=${encoded}`, '_blank');
  });

  calculateTotal();
}

/**
 * 6. Scroll Reveal Engine (All Pages)
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
  revealCheck(); // trigger once immediately
}
