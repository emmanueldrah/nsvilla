/**
 * TS Module: Navigation and Shared Custom Layouts
 * Centralized components for the shared website headers, footers, logo SVGs, and mobile dropdown menus.
 */

// Custom Premium SVG logo markup for luxury branding
export const NS_LOGO_SVG = `
<svg class="h-8 w-auto" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="54" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="4 4" class="animate-spin" style="animation-duration: 60s; transform-origin: 60px 60px;"/>
  <circle cx="60" cy="60" r="48" stroke="#D4AF37" stroke-width="1"/>
  <!-- Elegant Monogram -->
  <path d="M42 80V40L58 64V40H62V80L46 56V80H42Z" fill="#D4AF37" />
  <path d="M68 74C68 77.5 71.5 79 75 79C79.5 79 82 76 82 72.5C82 66.5 70 68 70 61C70 57.5 73.5 55 77 55C81 55 83.5 57 84 60.5H80C79.5 58.5 78 57.5 76.5 57.5C73.5 57.5 74 61.5 77.5 62C81.5 62.5 86 65 86 71.5C86 76.5 81.5 81.5 75 81.5C70.5 81.5 68 79.5 68 74Z" fill="#D4AF37" />
</svg>
`;

/**
 * Injects the shared navigation header and footer across all multi-page layouts.
 */
export function injectHeaderAndFooter() {
  const headerContainer = document.getElementById('main-header');
  const footerContainer = document.getElementById('main-footer');
  const currentPath = window.location.pathname;

  const getLinkClass = (path: string) => {
    const isCurrent = currentPath.endsWith(path) || (path === '/' && (currentPath.endsWith('index.html') || currentPath === '/'));
    return `text-[10px] uppercase tracking-luxury-wide transition-all duration-500 relative py-2 ${
      isCurrent ? 'text-luxury-gold font-medium' : 'text-luxury-soft/80 hover:text-luxury-gold'
    }`;
  };

  const getActiveIndicator = (path: string) => {
    const isCurrent = currentPath.endsWith(path) || (path === '/' && (currentPath.endsWith('index.html') || currentPath === '/'));
    return isCurrent ? '<span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[3px] h-[3px] bg-luxury-gold rounded-full"></span>' : '';
  };

  if (headerContainer) {
    headerContainer.className = "fixed top-0 left-0 w-full z-50 transition-all duration-700 bg-luxury-dark/95 backdrop-blur-md border-b border-luxury-gold/5";
    headerContainer.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-8 h-20 sm:h-24 flex items-center justify-between transition-all duration-500" id="header-inner">
        <!-- Logo -->
        <a href="index.html" class="flex items-center gap-2.5 sm:gap-3.5 group whitespace-nowrap">
          ${NS_LOGO_SVG}
          <div class="flex flex-col">
            <span class="font-serif text-base sm:text-lg tracking-widest text-luxury-gold font-light group-hover:text-luxury-cream transition-colors duration-500">NS LUXURY</span>
            <span class="text-[7px] sm:text-[8px] uppercase tracking-luxury-ultra text-luxury-soft/50">VILLA · HO</span>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-6 lg:gap-10">
          <a href="index.html" class="${getLinkClass('index.html')}">
            Overview
            ${getActiveIndicator('index.html')}
          </a>
          <a href="rooms.html" class="${getLinkClass('rooms.html')}">
            Suites & Rooms
            ${getActiveIndicator('rooms.html')}
          </a>
          <a href="amenities.html" class="${getLinkClass('amenities.html')}">
            Amenities
            ${getActiveIndicator('amenities.html')}
          </a>
          <a href="gallery.html" class="${getLinkClass('gallery.html')}">
            Gallery
            ${getActiveIndicator('gallery.html')}
          </a>
          <a href="contact.html" class="${getLinkClass('contact.html')}">
            Contact & Inquiries
            ${getActiveIndicator('contact.html')}
          </a>
        </nav>

        <!-- CTA Direct WhatsApp Placeholder -->
        <!-- TODO: replace 233XXXXXXXXX with real WhatsApp number -->
        <div class="hidden lg:block">
          <a href="https://wa.me/233535572774?text=Hello%2C%20I%20want%20to%20inquire%20about%20NS%20Luxury%20Villa" target="_blank" class="px-6 py-3 border border-luxury-gold/20 text-[10px] tracking-luxury-wide uppercase text-luxury-gold hover:bg-luxury-gold hover:text-luxury-dark hover:border-transparent transition-all duration-500 rounded-none">
            Book Stay
          </a>
        </div>

        <!-- Mobile Menu Trigger -->
        <button id="mobile-menu-toggle" class="md:hidden flex flex-col justify-center items-end gap-1.5 w-8 h-8 group focus:outline-none z-50" aria-label="Toggle Navigation">
          <span class="w-6 h-[1px] bg-luxury-gold group-hover:bg-luxury-cream transition-all duration-300 origin-center"></span>
          <span class="w-4 h-[1px] bg-luxury-gold group-hover:bg-luxury-cream transition-all duration-300 origin-center"></span>
          <span class="w-5 h-[1px] bg-luxury-gold group-hover:bg-luxury-cream transition-all duration-300 origin-center"></span>
        </button>
      </div>

      <!-- Mobile Dropdown Overlay Menu -->
      <div id="mobile-dropdown" class="fixed inset-0 top-20 sm:top-24 bg-luxury-dark/98 backdrop-blur-2xl z-40 hidden opacity-0 flex flex-col justify-center items-center gap-8 sm:gap-10 transition-all duration-500 border-t border-luxury-gold/5">
        <a href="index.html" class="font-serif text-2xl sm:text-3xl tracking-widest text-luxury-cream hover:text-luxury-gold transition-all duration-500">Overview</a>
        <a href="rooms.html" class="font-serif text-2xl sm:text-3xl tracking-widest text-luxury-cream hover:text-luxury-gold transition-all duration-500">Suites & Rooms</a>
        <a href="amenities.html" class="font-serif text-2xl sm:text-3xl tracking-widest text-luxury-cream hover:text-luxury-gold transition-all duration-500">Amenities</a>
        <a href="gallery.html" class="font-serif text-2xl sm:text-3xl tracking-widest text-luxury-cream hover:text-luxury-gold transition-all duration-500">Gallery</a>
        <a href="contact.html" class="font-serif text-2xl sm:text-3xl tracking-widest text-luxury-cream hover:text-luxury-gold transition-all duration-500">Contact & Inquiries</a>

        <!-- TODO: replace 233XXXXXXXXX with real WhatsApp number -->
        <a href="https://wa.me/233535572774?text=Hello%2C%20I%20want%20to%20inquire%20about%20NS%20Luxury%20Villa" target="_blank" class="mt-4 px-8 py-4 border border-luxury-gold/40 text-luxury-gold font-medium tracking-luxury text-xs hover:bg-luxury-gold hover:text-luxury-dark transition-all duration-500">
          WhatsApp Inquiry
        </a>
      </div>
    `;

    // Mobile navigation logic
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileDropdown = document.getElementById('mobile-dropdown');
    const headerInner = document.getElementById('header-inner');

    if (menuToggle && mobileDropdown) {
      menuToggle.addEventListener('click', () => {
        const isHidden = mobileDropdown.classList.contains('hidden');
        if (isHidden) {
          mobileDropdown.classList.remove('hidden');
          setTimeout(() => {
            mobileDropdown.classList.add('opacity-100');
          }, 50);
          const lines = menuToggle.children;
          (lines[0] as HTMLElement).style.transform = 'translateY(7px) rotate(45deg)';
          (lines[1] as HTMLElement).style.opacity = '0';
          (lines[2] as HTMLElement).style.transform = 'translateY(-7px) rotate(-45deg)';
          document.body.style.overflow = 'hidden';
        } else {
          mobileDropdown.classList.remove('opacity-100');
          setTimeout(() => {
            mobileDropdown.classList.add('hidden');
          }, 500);
          const lines = menuToggle.children;
          (lines[0] as HTMLElement).style.transform = 'none';
          (lines[1] as HTMLElement).style.opacity = '1';
          (lines[2] as HTMLElement).style.transform = 'none';
          document.body.style.overflow = '';
        }
      });
    }

    // Shrink header on scroll
    window.addEventListener('scroll', () => {
      if (headerInner && mobileDropdown) {
        if (window.scrollY > 50) {
          headerInner.classList.add('h-16', 'sm:h-20');
          headerInner.classList.remove('h-20', 'sm:h-24');
          mobileDropdown.classList.add('top-16', 'sm:top-20');
          mobileDropdown.classList.remove('top-20', 'sm:top-24');
        } else {
          headerInner.classList.add('h-20', 'sm:h-24');
          headerInner.classList.remove('h-16', 'sm:h-20');
          mobileDropdown.classList.add('top-20', 'sm:top-24');
          mobileDropdown.classList.remove('top-16', 'sm:top-20');
        }
      }
    });
  }

  if (footerContainer) {
    footerContainer.className = "bg-luxury-olive/40 border-t border-luxury-gold/5 py-24 px-8 relative overflow-hidden";
    footerContainer.innerHTML = `
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
        <!-- Brand Segment -->
        <div class="flex flex-col gap-6 md:col-span-2">
          <div class="flex items-center gap-3.5">
            ${NS_LOGO_SVG}
            <div class="flex flex-col">
              <span class="font-serif text-xl tracking-widest text-luxury-gold font-light">NS LUXURY VILLA</span>
              <span class="text-[8px] uppercase tracking-luxury-ultra text-luxury-soft/50">HO · VOLTA REGION</span>
            </div>
          </div>
          <p class="text-xs text-luxury-soft/70 leading-relaxed max-w-sm">
            Located in Ho, Volta Region, Ghana. We offer a secure, private compound with a pool, bar, and rooftop space for stays, retreats, and gatherings.
          </p>
        </div>

        <!-- Links -->
        <div class="flex flex-col gap-5">
          <h4 class="text-[10px] uppercase tracking-luxury text-luxury-gold font-semibold">Links</h4>
          <ul class="flex flex-col gap-3.5 text-xs text-luxury-soft/70">
            <li><a href="index.html" class="hover:text-luxury-gold transition-colors duration-300">Overview</a></li>
            <li><a href="rooms.html" class="hover:text-luxury-gold transition-colors duration-300">Suites & Rooms</a></li>
            <li><a href="amenities.html" class="hover:text-luxury-gold transition-colors duration-300">Amenities</a></li>
            <li><a href="gallery.html" class="hover:text-luxury-gold transition-colors duration-300">Gallery</a></li>
            <li><a href="contact.html" class="hover:text-luxury-gold transition-colors duration-300">Contact & Inquiries</a></li>
          </ul>
        </div>

        <!-- Contact/Directions (C. Replace with real details before launch) -->
        <div class="flex flex-col gap-5">
          <h4 class="text-[10px] uppercase tracking-luxury text-luxury-gold font-semibold">Location & Contact</h4>
          <p class="text-xs text-luxury-soft/70 leading-relaxed">
            Ho, Volta Region, Ghana<br>
            <span class="text-[9px] text-luxury-gold/80 block mt-1 tracking-widest uppercase">📍 Gated Compound</span>
          </p>
          <div class="flex flex-col gap-3 mt-1">
            <!-- TODO: replace 233XXXXXXXXX with real WhatsApp number -->
            <a href="https://wa.me/233535572774?text=Hello%2C%20I%20want%20to%20inquire%20about%20NS%20Luxury%20Villa" target="_blank" class="text-xs text-luxury-soft/80 hover:text-luxury-gold transition-colors duration-300">💬 WhatsApp: 053 557 2774</a>
            <a href="tel:+233535572774" class="text-xs text-luxury-soft/80 hover:text-luxury-gold transition-colors duration-300">📞 Phone: 053 557 2774</a>
          </div>

          <!-- Discreet Optional Social/Listing Placeholders -->
          <div class="flex flex-col gap-2 mt-2 border-t border-luxury-gold/5 pt-4 text-[10px]">
            <!-- TODO: add real Airbnb link when available -->
            <!-- Replace with real TikTok handle or link -->
            <a href="https://tiktok.com/@ns.luxury.villa" target="_blank" class="text-luxury-soft/60 hover:text-luxury-gold transition-colors duration-300">🎵 TikTok @ns.luxury.villa</a>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto mt-20 pt-8 border-t border-luxury-gold/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-luxury-soft/40 uppercase tracking-luxury-wide relative z-10">
        <span>© 2026 NS LUXURY VILLA. ALL RIGHTS RESERVED.</span>
        <span class="text-right text-luxury-soft/40">Powered by Success Above Dreams</span>
      </div>
    `;
  }
}
