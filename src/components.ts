/**
 * TS Module: Navigation and Custom Elements
 * Includes high-fidelity dynamic transitions, shared custom headers/footers, and the floating Serenity Audio Player.
 */

// Custom Premium SVG logo markup for luxury branding
export const NS_LOGO_SVG = `
<svg class="h-10 w-auto" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="54" stroke="#C5A880" stroke-width="1.5" stroke-dasharray="4 4" class="animate-spin" style="animation-duration: 40s; transform-origin: 60px 60px;"/>
  <circle cx="60" cy="60" r="48" stroke="#C5A880" stroke-width="1"/>
  <!-- Elegant Monogram -->
  <path d="M42 80V40L58 64V40H62V80L46 56V80H42Z" fill="#C5A880" />
  <path d="M68 74C68 77.5 71.5 79 75 79C79.5 79 82 76 82 72.5C82 66.5 70 68 70 61C70 57.5 73.5 55 77 55C81 55 83.5 57 84 60.5H80C79.5 58.5 78 57.5 76.5 57.5C73.5 57.5 74 61.5 77.5 62C81.5 62.5 86 65 86 71.5C86 76.5 81.5 81.5 75 81.5C70.5 81.5 68 79.5 68 74Z" fill="#C5A880" />
  <!-- Accent diamonds -->
  <path d="M60 18L63 21L60 24L57 21L60 18Z" fill="#C5A880"/>
  <path d="M60 96L63 99L60 102L57 99L60 96Z" fill="#C5A880"/>
</svg>
`;

export function injectHeaderAndFooter() {
  const headerContainer = document.getElementById('main-header');
  const footerContainer = document.getElementById('main-footer');
  const currentPath = window.location.pathname;

  const getLinkClass = (path: string) => {
    const isCurrent = currentPath.endsWith(path) || (path === '/' && (currentPath.endsWith('index.html') || currentPath === '/'));
    return `text-xs uppercase tracking-luxury transition-all duration-300 relative py-2 ${
      isCurrent ? 'text-luxury-gold font-medium' : 'text-luxury-soft/80 hover:text-luxury-gold'
    }`;
  };

  const getActiveIndicator = (path: string) => {
    const isCurrent = currentPath.endsWith(path) || (path === '/' && (currentPath.endsWith('index.html') || currentPath === '/'));
    return isCurrent ? '<span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-luxury-gold rounded-full"></span>' : '';
  };

  if (headerContainer) {
    headerContainer.className = "fixed top-0 left-0 w-full z-50 transition-all duration-500 bg-luxury-dark/90 backdrop-blur-md border-b border-luxury-gold/10";
    headerContainer.innerHTML = `
      <div class="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-3 group">
          ${NS_LOGO_SVG}
          <div class="flex flex-col">
            <span class="font-serif text-xl tracking-widest text-luxury-gold font-semibold group-hover:text-luxury-cream transition-colors duration-300">NS LUXURY</span>
            <span class="text-[9px] uppercase tracking-[0.25em] text-luxury-soft/60">VILLA · HO</span>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-10">
          <a href="index.html" class="${getLinkClass('index.html')}">
            Overview
            ${getActiveIndicator('index.html')}
          </a>
          <a href="rooms.html" class="${getLinkClass('rooms.html')}">
            Suites & Suites
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
            Inquire & Map
            ${getActiveIndicator('contact.html')}
          </a>
        </nav>

        <!-- CTA Direct WhatsApp -->
        <div class="hidden lg:block">
          <a href="https://wa.me/233550000000?text=Hello%20NS%20Luxury%20Villa,%20I'm%20interested%20in%20planning%20a%20luxury%20stay!" target="_blank" class="px-6 py-3 border border-luxury-gold/40 text-xs tracking-widest uppercase text-luxury-gold hover:bg-luxury-gold hover:text-luxury-dark transition-all duration-500 rounded-sm">
            Book Stay
          </a>
        </div>

        <!-- Mobile Menu Trigger -->
        <button id="mobile-menu-toggle" class="md:hidden flex flex-col justify-center items-end gap-1.5 w-8 h-8 group focus:outline-none" aria-label="Toggle Navigation">
          <span class="w-8 h-0.5 bg-luxury-gold group-hover:bg-luxury-cream transition-all duration-300"></span>
          <span class="w-6 h-0.5 bg-luxury-gold group-hover:bg-luxury-cream transition-all duration-300"></span>
          <span class="w-7 h-0.5 bg-luxury-gold group-hover:bg-luxury-cream transition-all duration-300"></span>
        </button>
      </div>

      <!-- Mobile Dropdown Overlay Menu -->
      <div id="mobile-dropdown" class="fixed inset-0 top-24 bg-luxury-dark/98 backdrop-blur-xl z-40 hidden opacity-0 flex flex-col justify-center items-center gap-8 transition-all duration-500 border-t border-luxury-gold/10">
        <a href="index.html" class="font-serif text-2xl tracking-widest text-luxury-cream hover:text-luxury-gold transition-all">Overview</a>
        <a href="rooms.html" class="font-serif text-2xl tracking-widest text-luxury-cream hover:text-luxury-gold transition-all">Suites & Rooms</a>
        <a href="amenities.html" class="font-serif text-2xl tracking-widest text-luxury-cream hover:text-luxury-gold transition-all">Amenities</a>
        <a href="gallery.html" class="font-serif text-2xl tracking-widest text-luxury-cream hover:text-luxury-gold transition-all">Gallery</a>
        <a href="contact.html" class="font-serif text-2xl tracking-widest text-luxury-cream hover:text-luxury-gold transition-all">Inquire & Map</a>

        <a href="https://wa.me/233550000000" target="_blank" class="mt-4 px-8 py-3 bg-luxury-gold text-luxury-dark font-medium tracking-luxury text-sm rounded-sm">
          WhatsApp Inquiry
        </a>
      </div>
    `;

    // Mobile navigation logic
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileDropdown = document.getElementById('mobile-dropdown');

    if (menuToggle && mobileDropdown) {
      menuToggle.addEventListener('click', () => {
        const isHidden = mobileDropdown.classList.contains('hidden');
        if (isHidden) {
          mobileDropdown.classList.remove('hidden');
          setTimeout(() => {
            mobileDropdown.classList.add('opacity-100');
          }, 50);
          // animate toggle button to close cross
          const lines = menuToggle.children;
          (lines[0] as HTMLElement).style.transform = 'translateY(8px) rotate(45deg)';
          (lines[1] as HTMLElement).style.opacity = '0';
          (lines[2] as HTMLElement).style.transform = 'translateY(-8px) rotate(-45deg)';
        } else {
          mobileDropdown.classList.remove('opacity-100');
          setTimeout(() => {
            mobileDropdown.classList.add('hidden');
          }, 500);
          const lines = menuToggle.children;
          (lines[0] as HTMLElement).style.transform = 'none';
          (lines[1] as HTMLElement).style.opacity = '1';
          (lines[2] as HTMLElement).style.transform = 'none';
        }
      });
    }

    // Shrink header on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        headerContainer.classList.add('h-20');
        headerContainer.classList.remove('h-24');
      } else {
        headerContainer.classList.add('h-24');
        headerContainer.classList.remove('h-20');
      }
    });
  }

  if (footerContainer) {
    footerContainer.className = "bg-luxury-olive border-t border-luxury-gold/15 py-16 px-6 mt-20 relative overflow-hidden";
    footerContainer.innerHTML = `
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-luxury-accent/40 via-transparent to-transparent pointer-events-none"></div>
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <!-- Brand Segment -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            ${NS_LOGO_SVG}
            <div class="flex flex-col">
              <span class="font-serif text-xl tracking-widest text-luxury-gold font-semibold">NS LUXURY</span>
              <span class="text-[9px] uppercase tracking-[0.25em] text-luxury-soft/60">VILLA · HO</span>
            </div>
          </div>
          <p class="text-xs text-luxury-soft/70 leading-relaxed max-w-xs mt-2">
            A private, secure, and serene gated oasis in the heart of Ho, Volta Region, Ghana. A perfect integration of modern luxury, custom pool, cozy private bar, rooftop lounge, and high-speed Starlink.
          </p>
        </div>

        <!-- Links -->
        <div class="flex flex-col gap-4">
          <h4 class="font-serif text-sm uppercase tracking-luxury text-luxury-gold">Navigate</h4>
          <ul class="flex flex-col gap-2.5 text-xs text-luxury-soft/80">
            <li><a href="index.html" class="hover:text-luxury-gold transition-colors">Overview</a></li>
            <li><a href="rooms.html" class="hover:text-luxury-gold transition-colors">Suites & Rooms</a></li>
            <li><a href="amenities.html" class="hover:text-luxury-gold transition-colors">Premium Amenities</a></li>
            <li><a href="gallery.html" class="hover:text-luxury-gold transition-colors">Curated Gallery</a></li>
            <li><a href="contact.html" class="hover:text-luxury-gold transition-colors">Inquire & Map</a></li>
          </ul>
        </div>

        <!-- Amenities Brief -->
        <div class="flex flex-col gap-4">
          <h4 class="font-serif text-sm uppercase tracking-luxury text-luxury-gold">Features</h4>
          <ul class="flex flex-col gap-2.5 text-xs text-luxury-soft/80">
            <li>✦ Pristine Swimming Pool</li>
            <li>✦ Intimate Private Lounge Bar</li>
            <li>✦ Panorama Rooftop Space</li>
            <li>✦ Secure Gated Compound (CCTV)</li>
            <li>✦ Starlink High-Speed WiFi</li>
          </ul>
        </div>

        <!-- Contact/Directions -->
        <div class="flex flex-col gap-4">
          <h4 class="font-serif text-sm uppercase tracking-luxury text-luxury-gold">Location & Contact</h4>
          <p class="text-xs text-luxury-soft/80 leading-relaxed">
            Ho, Volta Region, Ghana<br>
            <span class="text-[10px] text-luxury-gold/80 block mt-1">📍 Near Ho DVLA District Office</span>
          </p>
          <div class="flex flex-col gap-2.5 mt-2">
            <a href="tel:+233550000000" class="text-xs text-luxury-gold hover:text-luxury-cream transition-colors">📞 +233 55 000 0000</a>
            <a href="mailto:stay@nsluxuryvilla.com" class="text-xs text-luxury-gold hover:text-luxury-cream transition-colors">✉ stay@nsluxuryvilla.com</a>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto mt-16 pt-8 border-t border-luxury-gold/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-luxury-soft/40 uppercase tracking-widest relative z-10">
        <span>© 2026 NS LUXURY VILLA, HO. ALL RIGHTS RESERVED.</span>
        <span>Crafted for Serenity & Discretion</span>
      </div>
    `;
  }
}

/**
 * Serenity Audio Experience Component (Floating Ambient Audio Player)
 * Using high-fidelity custom synthesized ambient soundwaves.
 */
export function initializeSerenityPlayer() {
  const playerContainer = document.createElement('div');
  playerContainer.id = "serenity-audio-player";
  playerContainer.className = "fixed bottom-6 right-6 z-40 bg-luxury-olive/90 backdrop-blur-md border border-luxury-gold/30 p-3.5 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-500 group hover:pr-6 hover:rounded-full";

  playerContainer.innerHTML = `
    <!-- Pulse Waveform -->
    <div class="relative w-8 h-8 flex items-center justify-center bg-luxury-gold text-luxury-dark rounded-full cursor-pointer transition-transform duration-300 active:scale-95" id="audio-play-button">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    </div>
    <!-- Sound visualizer bars -->
    <div id="sound-wave-bars" class="hidden items-end gap-0.5 h-6 opacity-80 group-hover:flex">
      <span class="w-0.5 bg-luxury-gold h-1 animate-bounce" style="animation-duration: 0.8s"></span>
      <span class="w-0.5 bg-luxury-gold h-2 animate-bounce" style="animation-duration: 1.1s; animation-delay: 0.2s;"></span>
      <span class="w-0.5 bg-luxury-gold h-3 animate-bounce" style="animation-duration: 0.7s; animation-delay: 0.4s;"></span>
      <span class="w-0.5 bg-luxury-gold h-1.5 animate-bounce" style="animation-duration: 0.9s; animation-delay: 0.1s;"></span>
      <span class="w-0.5 bg-luxury-gold h-2.5 animate-bounce" style="animation-duration: 1.3s; animation-delay: 0.3s;"></span>
    </div>
    <div class="hidden flex-col group-hover:flex">
      <span class="text-[10px] uppercase font-semibold tracking-wider text-luxury-gold leading-none">Serenity Sound</span>
      <span class="text-[8px] uppercase tracking-widest text-luxury-soft/60 mt-0.5" id="sound-status">Play Ambient</span>
    </div>
  `;

  document.body.appendChild(playerContainer);

  const playBtn = document.getElementById('audio-play-button');
  const waveBars = document.getElementById('sound-wave-bars');
  const soundStatus = document.getElementById('sound-status');

  let audioContext: AudioContext | null = null;
  let windOscillator: OscillatorNode | null = null;
  let gainNode: GainNode | null = null;
  let isPlaying = false;

  const startAmbientSound = () => {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);

      // Synthesize a soothing rustling forest sound (Pink Noise + Lowpass + Modulation)
      const bufferSize = 2 * audioContext.sampleRate;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // rescue ears
        b6 = white * 0.115926;
      }

      const noiseNode = audioContext.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      const rainFilter = audioContext.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(450, audioContext.currentTime);

      noiseNode.connect(rainFilter);
      rainFilter.connect(gainNode);

      // Synthesize slow, waving ambient drone
      windOscillator = audioContext.createOscillator();
      windOscillator.type = 'sine';
      windOscillator.frequency.setValueAtTime(85, audioContext.currentTime); // very low tranquil sound

      const windFilter = audioContext.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.Q.setValueAtTime(4, audioContext.currentTime);
      windFilter.frequency.setValueAtTime(110, audioContext.currentTime);

      // Modulate low frequency
      const lfo = audioContext.createOscillator();
      lfo.frequency.setValueAtTime(0.12, audioContext.currentTime); // slow waves
      const lfoGain = audioContext.createGain();
      lfoGain.gain.setValueAtTime(40, audioContext.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(windFilter.frequency);

      windOscillator.connect(windFilter);
      windFilter.connect(gainNode);

      gainNode.connect(audioContext.destination);

      // Start notes
      noiseNode.start(0);
      windOscillator.start(0);
      lfo.start(0);

      // Gracefully transition volume
      gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 3);
    } catch (err) {
      console.warn("AudioContext not supported on this device.", err);
    }
  };

  const stopAmbientSound = () => {
    if (gainNode && audioContext) {
      const cur = audioContext.currentTime;
      gainNode.gain.linearRampToValueAtTime(0, cur + 1);
      setTimeout(() => {
        if (windOscillator) windOscillator.stop();
        if (audioContext) audioContext.close();
      }, 1100);
    }
  };

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        startAmbientSound();
        waveBars?.classList.remove('hidden');
        waveBars?.classList.add('flex');
        if (soundStatus) soundStatus.innerText = "Playing Volta Rain";
        playBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `;
      } else {
        stopAmbientSound();
        waveBars?.classList.remove('flex');
        waveBars?.classList.add('hidden');
        if (soundStatus) soundStatus.innerText = "Audio Muted";
        playBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        `;
      }
    });
  }
}
