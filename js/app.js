/* ============================================================================
   CORE PRESENTATION ENGINE
   - Scroll-scrubbed 3D video frames (331 frames across 11 scrolls)
   - Priority frame preloading (landing + 11 stop keyframes first, then transitions)
   - Scroll Snap State Sync (native scrollsnapchange + IntersectionObserver fallback)
   - Top scroll progress fallback when CSS scroll-timeline is unsupported
   - Native light-dismiss <dialog closedby="any"> + fallback click-outside handler
   - Keyboard navigation (Arrows, PageUp/Down, Space, Home, End, F, P, M)
   ============================================================================ */

(function () {
  'use strict';

  const TOTAL_FRAMES = 330; // frame_0001.webp .. frame_0330.webp (OmniFlash 25s -> 330 frames across 11 scrolls)
  const SLIDE_COUNT = 12;   // Slide 0 (Landing) + 11 scrolls (Slides 1..11)

  const scroller = document.getElementById('presentation');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const navLinks = Array.from(document.querySelectorAll('.slide-nav a'));
  const hudCounter = document.getElementById('hud-counter');
  const loaderStatus = document.getElementById('frame-loader-status');
  const lcpPoster = document.getElementById('lcp-poster');
  const canvas = document.getElementById('video-canvas');
  const ctx = canvas.getContext('2d');

  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnPause = document.getElementById('btn-pause-anim');
  const pauseLabel = document.getElementById('pause-btn-label');
  const btnOutline = document.getElementById('btn-outline');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  const outlineDialog = document.getElementById('outline-dialog');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let activeSlideIndex = 0;

  // ==========================================================================
  // 1. VIDEO-TO-FRAMES SCROLL SCRUBBING ENGINE
  // ==========================================================================
  const frames = new Array(TOTAL_FRAMES).fill(null);
  let loadedCount = 0;
  let targetFrame = 0;
  let currentFrame = 0;
  let lastDrawnIdx = -1;
  let canvasW = 0;
  let canvasH = 0;

  function frameUrl(zeroIdx) {
    const num = String(zeroIdx + 1).padStart(4, '0');
    return `assets/frames/frame_${num}.webp`;
  }

  function resizeVideoCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvasW = w;
    canvasH = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lastDrawnIdx = -1;
    drawNearestFrame(Math.round(currentFrame));
  }

  function drawCover(img) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const viewRatio = canvasW / canvasH;
    let drawW, drawH, offsetX, offsetY;
    if (viewRatio > imgRatio) {
      drawW = canvasW;
      drawH = canvasW / imgRatio;
      offsetX = 0;
      offsetY = (canvasH - drawH) / 2;
    } else {
      drawH = canvasH;
      drawW = canvasH * imgRatio;
      offsetX = (canvasW - drawW) / 2;
      offsetY = 0;
    }
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  function findClosestLoaded(idx) {
    if (frames[idx]) return idx;
    for (let d = 1; d < TOTAL_FRAMES; d++) {
      if (idx - d >= 0 && frames[idx - d]) return idx - d;
      if (idx + d < TOTAL_FRAMES && frames[idx + d]) return idx + d;
    }
    return -1;
  }

  function drawNearestFrame(idx) {
    const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, idx));
    const readyIdx = findClosestLoaded(clamped);
    if (readyIdx === -1 || readyIdx === lastDrawnIdx) return;
    drawCover(frames[readyIdx]);
    lastDrawnIdx = readyIdx;
    if (lcpPoster && !lcpPoster.classList.contains('is-hidden')) {
      lcpPoster.classList.add('is-hidden');
    }
  }

  function updateTargetFromScroll() {
    const maxScroll = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
    const progress = Math.max(0, Math.min(1, scroller.scrollTop / maxScroll));
    targetFrame = progress * (TOTAL_FRAMES - 1);
  }

  // Smooth scrub render loop (runs continuously only while catching up to scroll position)
  let scrubRaf = null;
  function requestScrubLoop() {
    if (!scrubRaf) {
      scrubRaf = requestAnimationFrame(scrubStep);
    }
  }

  function scrubStep() {
    scrubRaf = null;
    const diff = targetFrame - currentFrame;
    if (prefersReducedMotion.matches || Math.abs(diff) < 0.08) {
      currentFrame = targetFrame;
      drawNearestFrame(Math.round(currentFrame));
      return;
    }
    currentFrame += diff * 0.24;
    drawNearestFrame(Math.round(currentFrame));
    scrubRaf = requestAnimationFrame(scrubStep);
  }

  // Priority-ring preloader:
  // Wave 1: Exact 12 slide keyframe stops (0, 30, 60, ..., 330)
  // Wave 2: Midpoint keyframes (every 6th frame)
  // Wave 3: Remaining intermediate frames for silky 30-frames/scroll scrubbing
  function preloadFrames() {
    const queue = [];
    const seen = new Set();
    const push = (i) => {
      if (i >= 0 && i < TOTAL_FRAMES && !seen.has(i)) {
        seen.add(i);
        queue.push(i);
      }
    };

    for (let s = 0; s < SLIDE_COUNT; s++) {
      push(Math.round((s / (SLIDE_COUNT - 1)) * (TOTAL_FRAMES - 1)));
    }
    for (let i = 0; i < TOTAL_FRAMES; i += 5) push(i);
    for (let i = 0; i < TOTAL_FRAMES; i += 2) push(i);
    for (let i = 0; i < TOTAL_FRAMES; i++) push(i);

    let cursor = 0;
    const CONCURRENCY = 10;

    function loadNext() {
      if (cursor >= queue.length) return;
      const idx = queue[cursor++];
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        frames[idx] = img;
        loadedCount++;
        if (idx === 0 || Math.abs(idx - Math.round(currentFrame)) <= 2) {
          lastDrawnIdx = -1;
          drawNearestFrame(Math.round(currentFrame));
        }
        if (loaderStatus) {
          const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
          loaderStatus.textContent = pct >= 100 ? 'Video listo' : `Frames ${pct}%`;
          if (pct >= 100) loaderStatus.classList.add('is-ready');
        }
        loadNext();
      };
      img.onerror = () => {
        loadedCount++;
        loadNext();
      };
      img.src = frameUrl(idx);
    }

    for (let c = 0; c < CONCURRENCY; c++) loadNext();
  }

  // ==========================================================================
  // 2. ACTIVE SLIDE SYNC (Modern Web Guidance: scroll-snap-state-sync)
  // ==========================================================================
  function setActiveSlide(idx) {
    if (idx < 0 || idx >= SLIDE_COUNT) return;
    activeSlideIndex = idx;

    slides.forEach((sec, i) => {
      sec.classList.toggle('is-active', i === idx);
    });

    const targetHash = `#slide-${idx}`;
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === targetHash) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (hudCounter && slides[idx]) {
      hudCounter.textContent = slides[idx].dataset.label || `SLIDE ${idx}`;
    }

    if (btnPrev) btnPrev.disabled = idx === 0;
    if (btnNext) btnNext.disabled = idx === SLIDE_COUNT - 1;
  }

  function goToSlide(idx, moveFocus = false) {
    const clamped = Math.max(0, Math.min(SLIDE_COUNT - 1, idx));
    const target = slides[clamped];
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
      block: 'start'
    });
    setActiveSlide(clamped);
    if (moveFocus) {
      const heading = target.querySelector('h1, h2');
      if (heading) heading.focus({ preventScroll: true });
    }
  }

  // Native scrollsnapchange where supported, plus IntersectionObserver fallback
  if ('onscrollsnapchange' in HTMLElement.prototype) {
    scroller.addEventListener('scrollsnapchange', (event) => {
      const snapped = event.snapTargetBlock;
      if (snapped && snapped.dataset && snapped.dataset.index !== undefined) {
        setActiveSlide(Number(snapped.dataset.index));
      }
    });
  }

  // Real-time visual sync during active scroll & fallback for browsers without scrollsnapchange
  const slideObserver = new IntersectionObserver(
    (entries) => {
      let best = null;
      for (const entry of entries) {
        if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) {
          best = entry;
        }
      }
      if (best && best.target.dataset.index !== undefined) {
        setActiveSlide(Number(best.target.dataset.index));
      }
    },
    {
      root: scroller,
      threshold: [0.45, 0.7]
    }
  );
  slides.forEach((s) => slideObserver.observe(s));

  // Scroll listener drives 3D frame scrubbing + progress fallback
  const supportsScrollTimeline = CSS.supports('animation-timeline', 'scroll()');
  const progressBar = document.getElementById('scroll-progress-bar');

  scroller.addEventListener(
    'scroll',
    () => {
      updateTargetFromScroll();
      requestScrubLoop();

      if (!supportsScrollTimeline && progressBar) {
        const maxScroll = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
        const pct = Math.max(0, Math.min(1, scroller.scrollTop / maxScroll));
        progressBar.style.transform = `scaleX(${pct})`;
      }
    },
    { passive: true }
  );

  // ==========================================================================
  // 3. NAVIGATION BUTTONS, RAIL LINKS & KEYBOARD SHORTCUTS
  // ==========================================================================
  navLinks.forEach((link, idx) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(idx, true);
    });
  });

  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.goto);
      if (outlineDialog && outlineDialog.open) outlineDialog.close();
      goToSlide(idx, true);
    });
  });

  if (btnPrev) btnPrev.addEventListener('click', () => goToSlide(activeSlideIndex - 1));
  if (btnNext) btnNext.addEventListener('click', () => goToSlide(activeSlideIndex + 1));

  // WCAG 2.2.2 Pause / Play ambient animations (label swaps without aria-pressed)
  function togglePauseAnimations() {
    const paused = document.body.classList.toggle('animations-paused');
    if (pauseLabel) {
      pauseLabel.textContent = paused ? 'Reanudar animaciones' : 'Pausar animaciones';
    }
    document.dispatchEvent(new CustomEvent('deck:pausechange', { detail: { paused } }));
  }

  if (btnPause) btnPause.addEventListener('click', togglePauseAnimations);

  // Fullscreen toggle
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }
  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);

  // Native <dialog closedby="any"> + fallback for browsers without closedBy support
  function bindLightDismissDialog(dialog, triggerBtn) {
    if (!dialog) return;
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => dialog.showModal());
    }
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isInside =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (!isInside) dialog.close();
      });
    }
  }

  bindLightDismissDialog(outlineDialog, btnOutline);

  // Keyboard shortcuts for smooth live presentation
  window.addEventListener('keydown', (e) => {
    if (outlineDialog?.open) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && tag !== 'BUTTON' && tag !== 'A')) {
      e.preventDefault();
      goToSlide(activeSlideIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goToSlide(activeSlideIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(SLIDE_COUNT - 1);
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      togglePauseAnimations();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      outlineDialog?.showModal();
    }
  });

  // ==========================================================================
  // 4. INITIALIZATION
  // ==========================================================================
  window.addEventListener('resize', resizeVideoCanvas);
  resizeVideoCanvas();
  setActiveSlide(0);
  preloadFrames();
})();
