// Shared interactions for YAKSHA pages
// Missions, case studies, stats, testimonials, awards, media, events
// No dependencies. Designed for static HTML pages.

function yak$ (sel, root = document) { return root.querySelector(sel); }
function yak$$ (sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ----------------------------
// Navbar dropdown (deduped)
// ----------------------------
function initDropdownNav() {
  yak$$('.dropdown > a').forEach(link => {
    if (link.__yakBound) return;
    link.__yakBound = true;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdown = link.nextElementSibling;
      yak$$('.dropdown-menu').forEach(menu => {
        if (menu !== dropdown) menu.style.display = 'none';
      });
      dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
      yak$$('.dropdown-menu').forEach(menu => (menu.style.display = 'none'));
    }
  });
}

// ----------------------------
// Number ticker / odometer
// ----------------------------
function formatNumber(n) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

function animateNumber(el, to, durationMs = 1200) {
  const from = 0;
  const start = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function frame(now) {
    const t = Math.min(1, (now - start) / durationMs);
    const v = Math.floor(from + (to - from) * ease(t));
    el.textContent = formatNumber(v);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function initTickers() {
  const nodes = yak$$('[data-yak-ticker]');
  if (!nodes.length) return;

  const run = () => {
    nodes.forEach(el => {
      if (el.__yakDone) return;
      el.__yakDone = true;
      const to = Number(el.getAttribute('data-to') || '0');
      const ms = Number(el.getAttribute('data-ms') || '1200');
      if (prefersReducedMotion()) {
        el.textContent = formatNumber(to);
      } else {
        animateNumber(el, to, ms);
      }
    });
  };

  // Requirement: "When the user scrolls to the top of the page"
  // We treat the hero being visible as "top".
  const hero = yak$('.yak-hero');
  if (!hero) {
    run();
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) run();
    });
  }, { threshold: 0.35 });

  io.observe(hero);
}

// ----------------------------
// Case file modal expansion + stamp
// ----------------------------
function initCaseFiles() {
  const modal = yak$('#yakCaseModal');
  const modalBody = yak$('#yakCaseModalBody');
  const closeBtn = yak$('#yakCaseModalClose');
  if (!modal || !modalBody || !closeBtn) return;

  function openModal(fromCard) {
    const payloadId = fromCard.getAttribute('data-case-id');
    const tpl = yak$(`#case-${payloadId}`);
    if (!tpl) return;
    modalBody.innerHTML = tpl.innerHTML;
    modal.classList.add('open');
    document.body.classList.add('yak-modal-open');

    // "Stamp" animation at end of expand
    const stamp = yak$('.yak-status-stamp', modalBody);
    if (stamp && !prefersReducedMotion()) {
      stamp.classList.remove('stamped');
      setTimeout(() => stamp.classList.add('stamped'), 420);
    }
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('yak-modal-open');
    modalBody.innerHTML = '';
  }

  yak$$('[data-case-open]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.yak-case-card');
      if (card) openModal(card);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

// ----------------------------
// Heatmap pins tooltip
// ----------------------------
function initHeatmap() {
  yak$$('.yak-pin').forEach(pin => {
    const tip = yak$('.yak-pin-tip', pin);
    if (!tip) return;
    pin.addEventListener('mouseenter', () => tip.classList.add('show'));
    pin.addEventListener('mouseleave', () => tip.classList.remove('show'));
    pin.addEventListener('focus', () => tip.classList.add('show'));
    pin.addEventListener('blur', () => tip.classList.remove('show'));
  });
}

// ----------------------------
// Case studies scrollytelling: timeline draw
// ----------------------------
function initDebriefTimeline() {
  const axis = yak$('.yak-debrief-axis');
  if (!axis) return;

  const fill = yak$('.yak-debrief-axis-fill', axis);
  const steps = yak$$('.yak-debrief-step');
  if (!fill || !steps.length) return;

  function update() {
    const rect = axis.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
    fill.style.transform = `scaleY(${progress})`;

    steps.forEach(step => {
      const r = step.getBoundingClientRect();
      const isOn = r.top < vh * 0.72;
      step.classList.toggle('active', isOn);
    });
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

// ----------------------------
// "Lidar replay" scroll scrubbing (canvas point cloud)
// ----------------------------
function initLidarScrub() {
  const canvas = yak$('#yakLidarCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;
  if (!ctx || !wrap) return;

  const pts = new Array(1200).fill(0).map(() => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random(),
    a: 0.2 + Math.random() * 0.8,
  }));

  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = Math.floor(wrap.clientWidth);
    const h = Math.floor(wrap.clientHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function render(t) {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // HUD grid
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = 'rgba(240,195,109,0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const y = (i / 5) * h;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    for (let i = 0; i < 10; i++) {
      const x = (i / 9) * w;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }

    // points (scrub moves wave through depth)
    ctx.globalAlpha = 1;
    for (const p of pts) {
      const depth = 0.25 + 0.75 * Math.sin((p.z * 8 + t * 6) * Math.PI);
      const px = p.x * w;
      const py = p.y * h;
      const r = 0.6 + depth * 2.2;
      ctx.fillStyle = `rgba(69,162,158,${0.08 + 0.25 * depth * p.a})`;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // central "thermal signature"
    ctx.fillStyle = 'rgba(255,75,43,0.18)';
    ctx.beginPath();
    ctx.arc(w * 0.62, h * 0.55, 32 + 18 * t, 0, Math.PI * 2);
    ctx.fill();
  }

  function scrubProgress() {
    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const t = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
    return t;
  }

  function loop() {
    const t = prefersReducedMotion() ? 0.6 : scrubProgress();
    render(t);
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(loop);
}

// ----------------------------
// Photo HUD overlay toggle
// ----------------------------
function initDataOverlayToggle() {
  const btn = yak$('#yakDataToggle');
  const root = yak$('.yak-case-study');
  if (!btn || !root) return;

  btn.addEventListener('click', () => {
    const on = root.classList.toggle('data-on');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.textContent = on ? 'HIDE OPERATIONAL DATA' : 'VIEW OPERATIONAL DATA';
  });
}

// ----------------------------
// Stats scrubber graph tooltip
// ----------------------------
function initAuditScrubber() {
  const el = yak$('#yakSeries');
  if (!el) return;
  const cursor = yak$('.yak-series-cursor', el);
  const tip = yak$('.yak-series-tip', el);
  const points = yak$$('[data-point]', el);
  if (!cursor || !tip || !points.length) return;

  function nearest(clientX) {
    let best = points[0], bestD = Infinity;
    points.forEach(p => {
      const r = p.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const d = Math.abs(clientX - cx);
      if (d < bestD) { bestD = d; best = p; }
    });
    return best;
  }

  function show(p) {
    const r = p.getBoundingClientRect();
    const host = el.getBoundingClientRect();
    const x = (r.left + r.width / 2) - host.left;
    cursor.style.left = `${x}px`;
    tip.style.left = `${Math.max(12, Math.min(host.width - 220, x - 110))}px`;
    tip.innerHTML = p.getAttribute('data-point');
    tip.classList.add('show');
  }

  el.addEventListener('mousemove', (e) => show(nearest(e.clientX)));
  el.addEventListener('mouseleave', () => tip.classList.remove('show'));
  show(points[points.length - 1]);
}

// ----------------------------
// Testimonials: glitch-in reveal + fake audio waveform
// ----------------------------
function initTestimonials() {
  const cards = yak$$('.yak-quote-card');
  if (!cards.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('glitch-in');
    });
  }, { threshold: 0.3 });

  cards.forEach(c => io.observe(c));

  // Waveform playback uses WebAudio oscillator as a stand-in.
  yak$$('[data-yak-audio]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.yak-quote-card');
      const wave = yak$('.yak-wave', card);
      if (!wave) return;
      const playing = card.classList.toggle('playing');
      btn.textContent = playing ? 'STOP' : 'PLAY';

      if (prefersReducedMotion()) return;

      if (playing) {
        try {
          const ac = new (window.AudioContext || window.webkitAudioContext)();
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.type = 'sine';
          o.frequency.value = 420;
          g.gain.value = 0.0008;
          o.connect(g); g.connect(ac.destination);
          o.start();
          card.__yakAudio = { ac, o };
        } catch (_) {}
      } else {
        const a = card.__yakAudio;
        if (a) {
          try { a.o.stop(); a.ac.close(); } catch (_) {}
          card.__yakAudio = null;
        }
      }
    });
  });
}

// ----------------------------
// Awards: horizontal filmstrip scroll
// ----------------------------
function initFilmstrip() {
  const strip = yak$('#yakFilmstrip');
  if (!strip) return;
  const track = yak$('.yak-filmtrack', strip);
  if (!track) return;

  function update() {
    const r = strip.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const total = r.height - vh;
    const t = total <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / total));
    const maxX = Math.max(0, track.scrollWidth - track.clientWidth);
    track.scrollLeft = maxX * t;
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

// ----------------------------
// Model-viewer overlay: path highlight hint
// ----------------------------
function initModelOverlays() {
  yak$$('[data-yak-model]').forEach(host => {
    const mv = yak$('model-viewer', host);
    const path = yak$('.yak-model-path', host);
    if (!mv || !path) return;

    const on = () => {
      if (prefersReducedMotion()) return;
      path.classList.add('pulse');
      clearTimeout(host.__yakPulseT);
      host.__yakPulseT = setTimeout(() => path.classList.remove('pulse'), 650);
    };

    mv.addEventListener('camera-change', on);
  });
}

// ----------------------------
// Init entrypoint
// ----------------------------
document.addEventListener('DOMContentLoaded', () => {
  initDropdownNav();
  initTickers();
  initCaseFiles();
  initHeatmap();
  initDebriefTimeline();
  initLidarScrub();
  initDataOverlayToggle();
  initAuditScrubber();
  initTestimonials();
  initFilmstrip();
  initModelOverlays();
  initGalleryFilters();
  initGalleryLightbox();
  initScrollLinkedVideo();
  initHoverScrub();
  initTelemetryOverlay();
  initVolumeEQ();
  initEventCountdown();
  initRSVP();
  initVolunteerSkillRadar();
  initVolunteerFormFX();
  initVolunteerTierXray();
  initVolunteerEquipHUD();
  initPartnerNeuralBridge();
  initPartnerKeyUnlock();
  initApiPlayground();
  initPartnerCoverageMap();
  initCareersRoleMatchHUD();
  initCareersClearanceBar();
  initDonateImpactHoverMap();
  initDonateLedger();
  initDonateReceipt();
  initReachTerminal();
  initCoordScrambler();
  initPriorityToggle();
  initLocationsHoverCoords();
  initLocationsLiveToggle();
});

// ----------------------------
// Gallery: filters
// ----------------------------
function initGalleryFilters() {
  const toggles = yak$$('[data-media-toggle]');
  const frames = yak$$('.yak-frame');
  if (!toggles.length || !frames.length) return;

  function apply() {
    const active = toggles.filter(t => t.classList.contains('on')).map(t => t.getAttribute('data-media-toggle'));
    frames.forEach(f => {
      const tag = f.getAttribute('data-tag') || '';
      if (!active.length) {
        f.style.display = '';
      } else {
        f.style.display = active.includes(tag) ? '' : 'none';
      }
    });
  }

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('on');
      apply();
    });
  });

  apply();
}

// ----------------------------
// Gallery: lightbox + loupe
// ----------------------------
function initGalleryLightbox() {
  const host = yak$('.yak-lightbox');
  if (!host) return;
  const body = yak$('.yak-lightbox-body', host);
  const meta = yak$('.yak-lightbox-meta', host);
  const close = yak$('.yak-lightbox-close', host);
  const loupe = yak$('.yak-lightbox-loupe', host);
  if (!body || !meta || !close || !loupe) return;

  function open(frame) {
    const img = frame.querySelector('img');
    if (!img) return;
    body.innerHTML = '';
    const clone = img.cloneNode(true);
    clone.removeAttribute('loading');
    body.appendChild(clone);
    meta.textContent = frame.getAttribute('data-meta') || img.getAttribute('alt') || 'IMG_CAPTURE.RAW';
    host.classList.add('open');
    document.body.classList.add('yak-modal-open');
  }

  function closeBox() {
    host.classList.remove('open');
    document.body.classList.remove('yak-modal-open');
    body.innerHTML = '';
  }

  yak$$('.yak-frame').forEach(f => {
    f.addEventListener('click', () => open(f));
  });

  close.addEventListener('click', closeBox);
  host.addEventListener('click', (e) => {
    if (e.target === host) closeBox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && host.classList.contains('open')) closeBox();
  });

  host.addEventListener('mousemove', (e) => {
    const r = host.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    loupe.style.left = `${x}%`;
    loupe.style.top = `${y}%`;
  });
}

// ----------------------------
// Scroll-linked hero video
// ----------------------------
function initScrollLinkedVideo() {
  const v = yak$('#yakScrollVideo');
  if (!v) return;
  if (!v.pause) return;

  let duration = 0;
  v.addEventListener('loadedmetadata', () => {
    duration = v.duration || 0;
  });

  function sync() {
    if (!duration) return;
    const r = v.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const t = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    v.currentTime = duration * t;
  }

  v.muted = true;
  v.playsInline = true;
  v.pause();

  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
}

// ----------------------------
// Hover scrub for thumbnails
// ----------------------------
function initHoverScrub() {
  yak$$('video[data-hover-scrub]').forEach(vid => {
    vid.muted = true;
    vid.playsInline = true;
    vid.addEventListener('mouseenter', () => {
      if (vid.readyState >= 1) vid.play().catch(() => {});
    });
    vid.addEventListener('mouseleave', () => {
      vid.pause();
    });
    vid.addEventListener('mousemove', (e) => {
      if (!vid.duration) return;
      const rect = vid.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      vid.currentTime = vid.duration * ratio;
    });
  });
}

// ----------------------------
// Telemetry overlay toggle
// ----------------------------
function initTelemetryOverlay() {
  yak$$('[data-telemetry-toggle]').forEach(btn => {
    const targetSel = btn.getAttribute('data-target');
    const host = targetSel ? yak$(targetSel) : btn.closest('.yak-player');
    if (!host) return;
    btn.addEventListener('click', () => {
      const on = host.classList.toggle('show-telemetry');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.textContent = on ? 'HIDE DATA' : 'SHOW DATA';
    });
  });
}

// ----------------------------
// Volume equalizer slider
// ----------------------------
function initVolumeEQ() {
  const wrap = yak$('.yak-volume');
  if (!wrap) return;
  const slider = yak$('input[type="range"]', wrap);
  if (!slider) return;
  const bars = yak$$('.yak-eq-bar', wrap);

  function update() {
    const v = Number(slider.value || '0');
    const norm = v / 100;
    bars.forEach((b, i) => {
      const scale = 0.4 + norm * (1 + i * 0.15);
      b.style.transform = `scaleY(${scale})`;
    });
  }

  slider.addEventListener('input', update);
  update();
}

// ----------------------------
// Events: countdown
// ----------------------------
function initEventCountdown() {
  const box = yak$('#yakCountdown');
  if (!box) return;
  const targetStr = box.getAttribute('data-target');
  if (!targetStr) return;
  const target = new Date(targetStr).getTime();
  if (!target) return;

  const dSpan = yak$('.dd', box);
  const hSpan = yak$('.hh', box);
  const mSpan = yak$('.mm', box);
  const sSpan = yak$('.ss', box);

  function tick() {
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    if (dSpan) dSpan.textContent = String(d).padStart(2, '0');
    if (hSpan) hSpan.textContent = String(h).padStart(2, '0');
    if (mSpan) mSpan.textContent = String(m).padStart(2, '0');
    if (sSpan) sSpan.textContent = String(s).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

// ----------------------------
// Events: RSVP → QR placeholder
// ----------------------------
function initRSVP() {
  yak$$('[data-rsvp]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.yak-event-pass');
      if (!card) return;
      card.classList.add('rsvp-done');
    });
  });
}

// ----------------------------
// Volunteer: skill radar (POC)
// ----------------------------
function initVolunteerSkillRadar() {
  const root = yak$('.yak-volunteer-radar');
  if (!root) return;
  const svg = yak$('svg', root);
  const poly = yak$('#yakSkillPoly', root);
  if (!svg || !poly) return;

  const sliders = yak$$('input[type="range"]', root);
  const coords = [
    [0, -1],
    [Math.sqrt(3) / 2, -0.5],
    [Math.sqrt(3) / 2, 0.5],
    [0, 1],
    [-Math.sqrt(3) / 2, 0.5],
    [-Math.sqrt(3) / 2, -0.5],
  ];

  function update() {
    const r = svg.viewBox.baseVal || { width: 200, height: 200 };
    const cx = r.width / 2;
    const cy = r.height / 2;
    const maxR = Math.min(r.width, r.height) * 0.4;
    const vals = sliders.map(s => Number(s.value || '50') / 100);
    const pts = coords.slice(0, vals.length).map((c, i) => {
      const v = vals[i];
      return [cx + c[0] * maxR * v, cy + c[1] * maxR * v];
    });
    poly.setAttribute('points', pts.map(p => p.join(',')).join(' '));
  }

  sliders.forEach(s => s.addEventListener('input', update));
  update();
}

// ----------------------------
// Volunteer: digital signature form FX (POC)
// ----------------------------
function initVolunteerFormFX() {
  const form = yak$('.yak-volunteer-form');
  if (!form) return;
  const nameInput = yak$('input[name="name"]', form);
  const mirror = yak$('.yak-dot-matrix', form);
  const statusBar = yak$('.yak-verify-bar', form);
  let audio;

  if (window.AudioContext || window.webkitAudioContext) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ac = new Ctx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'square';
      osc.frequency.value = 900;
      gain.gain.value = 0;
      osc.connect(gain); gain.connect(ac.destination);
      osc.start();
      audio = { ac, gain };
    } catch (_) {}
  }

  if (nameInput && mirror) {
    nameInput.addEventListener('input', () => {
      mirror.textContent = nameInput.value.toUpperCase();
      if (audio && !prefersReducedMotion()) {
        audio.gain.gain.value = 0.001;
        setTimeout(() => { audio.gain.gain.value = 0; }, 40);
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!statusBar) return;
    statusBar.classList.add('active');
    setTimeout(() => {
      statusBar.classList.remove('active');
    }, 1800);
  });
}

// ----------------------------
// Volunteer: tier X-ray reveal (POC)
// ----------------------------
function initVolunteerTierXray() {
  yak$$('.yak-tier').forEach(tier => {
    tier.addEventListener('mouseenter', () => tier.classList.add('xray'));
    tier.addEventListener('mouseleave', () => tier.classList.remove('xray'));
    tier.addEventListener('focus', () => tier.classList.add('xray'));
    tier.addEventListener('blur', () => tier.classList.remove('xray'));
  });
}

// ----------------------------
// Volunteer: Equip HUD (POC)
// ----------------------------
function initVolunteerEquipHUD() {
  const btn = yak$('#yakEquipHUD');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const on = document.body.classList.toggle('yak-hud-on');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.textContent = on ? 'UNEQUIP INTERFACE' : 'EQUIP INTERFACE';
  });
}

// ----------------------------
// Partner: Neural Bridge hero (POC)
// ----------------------------
function initPartnerNeuralBridge() {
  const canvas = yak$('#yakBridge');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const wrap = canvas.parentElement;
  const left = { x: 0.22, y: 0.5 };
  const right = { x: 0.78, y: 0.5 };
  let mouse = { x: 0.5, y: 0.5 };

  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = Math.max(320, wrap.clientWidth);
    const h = Math.max(220, wrap.clientHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const lx = left.x * w, ly = left.y * h;
    const rx = right.x * w, ry = right.y * h;
    const mx = mouse.x * w, my = mouse.y * h;

    // hubs
    ctx.fillStyle = 'rgba(240,195,109,0.22)';
    ctx.strokeStyle = 'rgba(240,195,109,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(lx, ly, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(rx, ry, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // bridge particles
    const strength = Math.max(0, 1 - Math.min(1, Math.abs(mx - w / 2) / (w * 0.45)));
    const n = Math.floor(120 + strength * 520);

    for (let i = 0; i < n; i++) {
      const t = i / n;
      const x = lx + (rx - lx) * t;
      const y = ly + (ry - ly) * t;
      const jitter = (1 - strength) * 18 + 6;
      const px = x + (Math.random() - 0.5) * jitter;
      const py = y + (Math.random() - 0.5) * jitter + Math.sin((t + performance.now() / 1800) * Math.PI * 2) * (4 + strength * 10);
      ctx.fillStyle = `rgba(9,132,227,${0.06 + 0.22 * strength})`;
      ctx.beginPath();
      ctx.arc(px, py, 0.8 + Math.random() * (1.8 + strength * 1.6), 0, Math.PI * 2);
      ctx.fill();
    }

    // center link line
    ctx.strokeStyle = `rgba(9,132,227,${0.18 + 0.45 * strength})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(rx, ry);
    ctx.stroke();

    requestAnimationFrame(draw);
  }

  wrap.addEventListener('mousemove', (e) => {
    const r = wrap.getBoundingClientRect();
    mouse = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  });

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
}

// ----------------------------
// Partner: modular key unlock (POC)
// ----------------------------
function initPartnerKeyUnlock() {
  const btn = yak$('#yakInsertKey');
  const root = yak$('.yak-partner-page');
  if (!btn || !root) return;

  btn.addEventListener('click', () => {
    const on = root.classList.toggle('yak-partner-unlocked');
    btn.textContent = on ? 'LOCK PROTOCOL' : 'INSERT KEY';
  });
}

// ----------------------------
// Partner: API playground (POC)
// ----------------------------
function initApiPlayground() {
  const code = yak$('#yakApiCode');
  const mv = yak$('#yakPartnerModel');
  if (!code || !mv) return;

  yak$$('[data-api-line]', code).forEach(line => {
    line.addEventListener('mouseenter', () => {
      const act = line.getAttribute('data-api-line');
      mv.setAttribute('data-action', act);
      mv.classList.add('active');
      clearTimeout(mv.__yakT);
      mv.__yakT = setTimeout(() => mv.classList.remove('active'), 350);
    });
  });
}

// ----------------------------
// Partner: coverage map highlight (POC)
// ----------------------------
function initPartnerCoverageMap() {
  const root = yak$('#yakCoverage');
  if (!root) return;
  const pills = yak$$('[data-region]', root);
  const zones = yak$$('[data-zone]', root);
  if (!pills.length || !zones.length) return;

  function set(region) {
    pills.forEach(p => p.classList.toggle('on', p.getAttribute('data-region') === region));
    zones.forEach(z => z.classList.toggle('on', z.getAttribute('data-zone') === region));
  }

  pills.forEach(p => p.addEventListener('click', () => set(p.getAttribute('data-region'))));
  set(pills[0].getAttribute('data-region'));
}

// ----------------------------
// Careers: role match HUD (POC)
// ----------------------------
function initCareersRoleMatchHUD() {
  const root = yak$('.yak-careers-page');
  if (!root) return;
  const list = yak$('#yakRoles');
  const panel = yak$('#yakRolePanel');
  if (!list || !panel) return;

  yak$$('[data-role]', list).forEach(item => {
    item.addEventListener('mouseenter', () => {
      panel.innerHTML = item.getAttribute('data-role');
      item.classList.add('scan');
    });
    item.addEventListener('mouseleave', () => item.classList.remove('scan'));
  });
}

// ----------------------------
// Careers: clearance bar fill on scroll (POC)
// ----------------------------
function initCareersClearanceBar() {
  const bar = yak$('#yakClearanceFill');
  const host = yak$('#yakClearance');
  if (!bar || !host) return;

  function update() {
    const r = host.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const t = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    bar.style.width = `${Math.floor(t * 100)}%`;
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

// ----------------------------
// Donate: hover-to-impact map (POC)
// ----------------------------
function initDonateImpactHoverMap() {
  const root = yak$('#yakDonateMap');
  if (!root) return;
  const buttons = yak$$('[data-amount]', root);
  const pulses = yak$$('[data-pulse]', root);
  if (!buttons.length || !pulses.length) return;

  function set(amount) {
    buttons.forEach(b => b.classList.toggle('on', b.getAttribute('data-amount') === amount));
    pulses.forEach(p => p.classList.toggle('on', p.getAttribute('data-pulse') === amount));
  }
  buttons.forEach(b => b.addEventListener('mouseenter', () => set(b.getAttribute('data-amount'))));
  buttons.forEach(b => b.addEventListener('focus', () => set(b.getAttribute('data-amount'))));
  set(buttons[0].getAttribute('data-amount'));
}

// ----------------------------
// Donate: secure ledger (POC)
// ----------------------------
function initDonateLedger() {
  const list = yak$('#yakLedger');
  if (!list) return;
  const items = yak$$('li', list);
  if (!items.length) return;

  let i = 0;
  setInterval(() => {
    const n = items[i % items.length].cloneNode(true);
    n.classList.add('new');
    list.insertBefore(n, list.firstChild);
    i++;
    const all = yak$$('li', list);
    if (all.length > 10) all.slice(10).forEach(x => x.remove());
  }, 2500);
}

// ----------------------------
// Donate: receipt / mission pass (POC)
// ----------------------------
function initDonateReceipt() {
  const btn = yak$('#yakDonateBtn');
  const pass = yak$('#yakReceipt');
  if (!btn || !pass) return;
  btn.addEventListener('click', () => {
    pass.classList.add('show');
    const id = `DON-${Math.floor(100000 + Math.random() * 900000)}`;
    const idEl = yak$('.yak-receipt-id', pass);
    if (idEl) idEl.textContent = id;
    setTimeout(() => pass.classList.remove('show'), 4200);
  });
}

// ----------------------------
// Reach Us: terminal data stream + transmit (POC)
// ----------------------------
function initReachTerminal() {
  const form = yak$('#yakReachForm');
  if (!form) return;
  const stream = yak$('.yak-data-stream-fill', form);
  if (!stream) return;
  const inputs = yak$$('input, textarea, select', form);

  function bump() {
    const filled = inputs.filter(i => i.value && i.value.trim().length > 0).length;
    const total = inputs.length || 1;
    const pct = Math.min(100, Math.max(5, Math.floor((filled / total) * 100)));
    stream.style.width = pct + '%';
  }

  inputs.forEach(i => i.addEventListener('input', bump));
  bump();
}

// ----------------------------
// Reach Us: coordinate scrambler (POC)
// ----------------------------
function initCoordScrambler() {
  const el = yak$('#yakCoordLock');
  if (!el) return;
  const target = '28.6139° N, 77.2090° E';
  let locked = false;

  function randomCoord() {
    const n1 = (20 + Math.random() * 20).toFixed(4);
    const n2 = (60 + Math.random() * 40).toFixed(4);
    return `${n1}° N, ${n2}° E`;
  }

  el.textContent = 'COORDS_SEARCHING: ' + randomCoord();
  setTimeout(() => {
    locked = true;
    el.textContent = 'COORDS_LOCKED: ' + target;
  }, 2200);

  if (!prefersReducedMotion()) {
    const id = setInterval(() => {
      if (locked) return clearInterval(id);
      el.textContent = 'COORDS_SEARCHING: ' + randomCoord();
    }, 260);
  }
}

// ----------------------------
// Reach Us: priority toggle (POC)
// ----------------------------
function initPriorityToggle() {
  const toggle = yak$('#yakPriority');
  const root = yak$('.yak-reach-page');
  if (!toggle || !root) return;
  const std = yak$('.yak-standard-form', root);
  const em = yak$('.yak-emergency-form', root);

  function apply(on) {
    root.classList.toggle('yak-emergency-mode', on);
    if (std) std.style.display = on ? 'none' : '';
    if (em) em.style.display = on ? '' : 'none';
  }

  toggle.addEventListener('click', () => {
    const on = !root.classList.contains('yak-emergency-mode');
    apply(on);
  });
  apply(false);
}

// ----------------------------
// Locations: coordinate hover readout (POC)
// ----------------------------
function initLocationsHoverCoords() {
  const map = yak$('#yakLocationsMap');
  const out = yak$('#yakCoordReadout');
  if (!map || !out) return;

  map.addEventListener('mousemove', (e) => {
    const r = map.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const lat = (40 - y * 80).toFixed(4);
    const lon = (x * 140 - 70).toFixed(4);
    out.textContent = `CURSOR_COORDS: ${lat}° N, ${lon}° E`;
  });

  map.addEventListener('mouseleave', () => {
    out.textContent = 'CURSOR_COORDS: ---';
  });
}

// ----------------------------
// Locations: live units toggle (POC)
// ----------------------------
function initLocationsLiveToggle() {
  const btn = yak$('#yakLiveToggle');
  const dots = yak$$('.yak-live-dot');
  if (!btn || !dots.length) return;

  btn.addEventListener('click', () => {
    const on = btn.classList.toggle('on');
    dots.forEach(d => d.classList.toggle('on', on));
  });
}
