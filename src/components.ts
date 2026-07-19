/**
 * TS Module: Navigation and Custom Elements
 * Includes high-fidelity dynamic transitions, shared custom headers/footers, and the floating Serenity Audio Player.
 */

/**
 * Interactive Elite Fluid Cursor Follower
 * Instantiates a bespoke golden physical circle that elegantly chases the user cursor with natural inertial physics.
 */
export function initializeEliteCursor() {
  // Only initialize on desktop devices to avoid mobile touch layout overlaps
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const follower = document.createElement('div');
  follower.id = "elite-cursor-follower";
  follower.className = "fixed top-0 left-0 w-8 h-8 border border-luxury-gold rounded-full pointer-events-none z-50 transition-transform duration-75 mix-blend-difference -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-0 scale-100";

  // Create a solid center dot inside the tracker circle
  const dot = document.createElement('span');
  dot.className = "w-1 h-1 bg-luxury-gold rounded-full block";
  follower.appendChild(dot);
  document.body.appendChild(follower);

  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMoving) {
      isMoving = true;
      follower.style.opacity = "1";
    }
  });

  const updateFollower = () => {
    // Elegant inertial physics formula (smooth factor 0.1)
    const dx = mouseX - followerX;
    const dy = mouseY - followerY;
    followerX += dx * 0.12;
    followerY += dy * 0.12;

    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(updateFollower);
  };

  updateFollower();

  // Attach hover expand states on all luxury target triggers
  const attachTriggers = () => {
    const targets = document.querySelectorAll('a, button, select, input, [role="button"], .blueprint-block, .gallery-item');
    targets.forEach(target => {
      target.addEventListener('mouseenter', () => {
        follower.classList.add('scale-150', 'bg-luxury-gold/10');
        follower.classList.remove('border-luxury-gold');
        follower.style.borderColor = "rgba(250, 249, 246, 0.8)";
      });
      target.addEventListener('mouseleave', () => {
        follower.classList.remove('scale-150', 'bg-luxury-gold/10');
        follower.classList.add('border-luxury-gold');
        follower.style.borderColor = "";
      });
    });
  };

  attachTriggers();

  // Re-attach triggers on dynamic navigation or layouts changes
  const observer = new MutationObserver(attachTriggers);
  observer.observe(document.body, { childList: true, subtree: true });
}

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
  playerContainer.className = "fixed bottom-6 right-6 z-40 bg-luxury-dark/95 backdrop-blur-xl border border-luxury-gold/30 p-4 rounded-3xl shadow-[0_15px_50px_-15px_rgba(197,168,128,0.3)] flex items-center gap-4 transition-all duration-500 max-w-[90vw] md:max-w-md pointer-events-auto select-none";

  playerContainer.innerHTML = `
    <!-- Play Trigger circle -->
    <div class="relative w-12 h-12 flex items-center justify-center bg-luxury-gold text-luxury-dark rounded-full cursor-pointer transition-transform duration-300 active:scale-95 shadow-lg" id="audio-play-button">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" id="audio-play-icon">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>

    <!-- Interface controls -->
    <div class="flex flex-col gap-1.5 min-w-[140px] md:min-w-[180px]">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[10px] uppercase font-bold tracking-widest text-luxury-gold">Serenity Soundscape</span>
        <!-- Active Sound visualizer bars -->
        <div id="sound-wave-bars" class="hidden items-end gap-0.5 h-3 opacity-90">
          <span class="w-0.5 bg-luxury-gold h-1 animate-bounce" style="animation-duration: 0.8s"></span>
          <span class="w-0.5 bg-luxury-gold h-2 animate-bounce" style="animation-duration: 1.1s; animation-delay: 0.2s;"></span>
          <span class="w-0.5 bg-luxury-gold h-3 animate-bounce" style="animation-duration: 0.7s; animation-delay: 0.4s;"></span>
          <span class="w-0.5 bg-luxury-gold h-1.5 animate-bounce" style="animation-duration: 0.9s; animation-delay: 0.1s;"></span>
        </div>
      </div>

      <!-- Mode selector toggles -->
      <div class="flex items-center gap-2 bg-luxury-olive/50 border border-luxury-gold/15 p-1 rounded-sm text-[8px] uppercase tracking-widest font-bold">
        <button id="sound-mode-rain" class="flex-1 py-1 px-1.5 bg-luxury-gold text-luxury-dark rounded-xs text-center transition-all duration-300">Volta Rain</button>
        <button id="sound-mode-breeze" class="flex-1 py-1 px-1.5 text-luxury-soft/60 hover:text-luxury-cream text-center transition-all duration-300">Forest Drone</button>
      </div>

      <!-- Sophisticated micro slider -->
      <div class="flex items-center gap-2 mt-1">
        <span class="text-[8px] text-luxury-soft/50">VOL</span>
        <input type="range" id="sound-volume" min="0" max="1" step="0.05" value="0.25" class="w-full h-0.5 bg-luxury-gold/20 appearance-none cursor-pointer accent-luxury-gold">
      </div>
    </div>
  `;

  document.body.appendChild(playerContainer);

  const playBtn = document.getElementById('audio-play-button');
  const playIcon = document.getElementById('audio-play-icon');
  const waveBars = document.getElementById('sound-wave-bars');
  const modeRain = document.getElementById('sound-mode-rain');
  const modeBreeze = document.getElementById('sound-mode-breeze');
  const volSlider = document.getElementById('sound-volume') as HTMLInputElement | null;

  let audioContext: AudioContext | null = null;
  let windOscillator: OscillatorNode | null = null;
  let noiseNode: AudioBufferSourceNode | null = null;
  let gainNode: GainNode | null = null;
  let filterNode: BiquadFilterNode | null = null;

  let isPlaying = false;
  let activeMode: 'rain' | 'breeze' = 'rain';

  const synthesizeRainBuffer = (ctx: AudioContext) => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
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
    return noiseBuffer;
  };

  const startAmbientSound = () => {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      gainNode = audioContext.createGain();

      const savedVol = volSlider ? parseFloat(volSlider.value) : 0.25;
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);

      if (activeMode === 'rain') {
        const buffer = synthesizeRainBuffer(audioContext);
        noiseNode = audioContext.createBufferSource();
        noiseNode.buffer = buffer;
        noiseNode.loop = true;

        filterNode = audioContext.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(450, audioContext.currentTime);

        noiseNode.connect(filterNode);
        filterNode.connect(gainNode);
        noiseNode.start(0);
      } else {
        // Drone breeze mode
        windOscillator = audioContext.createOscillator();
        windOscillator.type = 'sine';
        windOscillator.frequency.setValueAtTime(75, audioContext.currentTime);

        filterNode = audioContext.createBiquadFilter();
        filterNode.type = 'bandpass';
        filterNode.Q.setValueAtTime(6, audioContext.currentTime);
        filterNode.frequency.setValueAtTime(120, audioContext.currentTime);

        const lfo = audioContext.createOscillator();
        lfo.frequency.setValueAtTime(0.08, audioContext.currentTime);
        const lfoGain = audioContext.createGain();
        lfoGain.gain.setValueAtTime(45, audioContext.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filterNode.frequency);

        windOscillator.connect(filterNode);
        filterNode.connect(gainNode);

        windOscillator.start(0);
        lfo.start(0);
      }

      gainNode.connect(audioContext.destination);
      gainNode.gain.linearRampToValueAtTime(savedVol, audioContext.currentTime + 2.0);
    } catch (err) {
      console.warn("AudioContext not supported on this device.", err);
    }
  };

  const stopAmbientSound = () => {
    if (gainNode && audioContext) {
      const cur = audioContext.currentTime;
      gainNode.gain.linearRampToValueAtTime(0, cur + 0.6);
      const prevNoise = noiseNode;
      const prevOsc = windOscillator;
      const prevCtx = audioContext;

      setTimeout(() => {
        try {
          if (prevNoise) prevNoise.stop();
          if (prevOsc) prevOsc.stop();
          if (prevCtx && prevCtx.state !== 'closed') prevCtx.close();
        } catch (e) {}
      }, 700);

      noiseNode = null;
      windOscillator = null;
      audioContext = null;
    }
  };

  const handleModeChange = (mode: 'rain' | 'breeze') => {
    if (activeMode === mode) return;
    activeMode = mode;

    if (mode === 'rain') {
      modeRain?.classList.add('bg-luxury-gold', 'text-luxury-dark');
      modeRain?.classList.remove('text-luxury-soft/60');
      modeBreeze?.classList.add('text-luxury-soft/60');
      modeBreeze?.classList.remove('bg-luxury-gold', 'text-luxury-dark');
    } else {
      modeBreeze?.classList.add('bg-luxury-gold', 'text-luxury-dark');
      modeBreeze?.classList.remove('text-luxury-soft/60');
      modeRain?.classList.add('text-luxury-soft/60');
      modeRain?.classList.remove('bg-luxury-gold', 'text-luxury-dark');
    }

    if (isPlaying) {
      stopAmbientSound();
      setTimeout(() => {
        if (isPlaying) startAmbientSound();
      }, 800);
    }
  };

  if (modeRain) modeRain.addEventListener('click', () => handleModeChange('rain'));
  if (modeBreeze) modeBreeze.addEventListener('click', () => handleModeChange('breeze'));

  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      const v = parseFloat((e.target as HTMLInputElement).value);
      if (gainNode && audioContext) {
        gainNode.gain.setValueAtTime(v, audioContext.currentTime);
      }
    });
  }

  if (playBtn && playIcon) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        startAmbientSound();
        waveBars?.classList.remove('hidden');
        waveBars?.classList.add('flex');
        playIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
      } else {
        stopAmbientSound();
        waveBars?.classList.remove('flex');
        waveBars?.classList.add('hidden');
        playIcon.innerHTML = `<path d="M8 5v14l11-7z" />`;
      }
    });
  }
}
