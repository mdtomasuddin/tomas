/* ============================================================
   MD. Tomas Uddin — Portfolio
   assets/js/main.js — Vanilla JS, no dependencies
   Modules:
     01. Helpers & state
     01b. Smooth scrolling (Lenis)
     02. Theme (system detect + manual toggle + localStorage)
     03. Preloader
     04. Scroll progress & navbar state
     05. Mobile menu
     06. Scroll-spy navigation
     07. Typing effect
     08. Animated counters
     09. Scroll reveal
     10. Skills (render + animated bars)
     11. Projects (data, render, filter)
     12. Ripple effect
     13. Contact form (validation + success)
     14. Back to top
     15. Cursor effects
     16. Footer year
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 01. Helpers & state ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // Shared Lenis instance — used by the back-to-top & mobile-menu modules
  let lenis = null;

  /* ---------- 01b. Smooth scrolling (Lenis) ---------- */
  (function initSmoothScroll() {
    if (reducedMotion || !window.Lenis) return; // graceful fallback to native scroll

    lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    // Drive Lenis with requestAnimationFrame
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Smooth-scroll every in-page anchor link with a header offset
    // Uses event delegation for complete coverage (navbar, hero CTAs, footer, mobile-menu, etc.)
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -88, duration: 1.2 });
    });
  })();

  /* ---------- 02. Theme ---------- */
  (function initTheme() {
    const root = document.documentElement;
    const KEY = 'portfolio-theme';
    const toggle = $('#themeToggle');

    const applyTheme = (dark) => {
      root.classList.toggle('dark', dark);
      root.style.colorScheme = dark ? 'dark' : 'light';
      if (toggle) toggle.setAttribute('aria-pressed', String(dark));
    };

    // 1) saved preference → 2) system preference → 3) light
    const saved = localStorage.getItem(KEY);
    let dark;
    if (saved === 'dark' || saved === 'light') {
      dark = saved === 'dark';
    } else {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme(dark);

    if (toggle) {
      toggle.addEventListener('click', () => {
        dark = !root.classList.contains('dark');
        localStorage.setItem(KEY, dark ? 'dark' : 'light');
        applyTheme(dark);
      });
    }
  })();

  /* ---------- 03. Preloader ---------- */
  (function initPreloader() {
    const pre = $('#preloader');
    if (!pre) return;
    const hide = () => pre.classList.add('done');
    // Hide once everything is loaded, with a safety timeout.
    window.addEventListener('load', () => setTimeout(hide, 350));
    setTimeout(hide, 3000);
  })();

  /* ---------- 04. Scroll progress & navbar state ---------- */
  (function initScrollChrome() {
    const header = $('#siteHeader');
    const progress = $('#scrollProgress');
    const backTop = $('#backToTop');

    const onScroll = () => {
      const y = window.scrollY;
      if (header) header.classList.toggle('scrolled', y > 10);
      if (progress) {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = total > 0 ? `${(y / total) * 100}%` : '0%';
      }
      if (backTop) backTop.classList.toggle('show', y > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    if (lenis) lenis.on('scroll', onScroll);
    onScroll();

    if (backTop) {
      backTop.addEventListener('click', () => {
        if (lenis) lenis.scrollTo(0, { duration: 1.3 });
        else window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    }
  })();

  /* ---------- 05. Mobile menu ---------- */
  (function initMobileMenu() {
    const btn = $('#menuBtn');
    const menu = $('#mobileMenu');
    if (!btn || !menu) return;

    const setMenu = (open) => {
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      // Lock page scroll behind the open menu (Lenis-aware)
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      if (open) {
        menu.hidden = false;
        // Wait a frame so the browser can paint before the transition starts
        requestAnimationFrame(() => menu.classList.add('open'));
      } else {
        menu.classList.remove('open');
        // Let the close transition play out before hiding
        setTimeout(() => { if (!btn.classList.contains('open')) menu.hidden = true; }, 350);
      }
    };

    btn.addEventListener('click', () => setMenu(menu.hidden || !btn.classList.contains('open')));

    // Close on link click
    $$('.mobile-link', menu).forEach((link) => link.addEventListener('click', () => setMenu(false)));

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.classList.contains('open')) setMenu(false);
    });

    // Reset on desktop resize
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && btn.classList.contains('open')) setMenu(false);
    });
  })();

  /* ---------- 06. Scroll-spy navigation ---------- */
  (function initScrollSpy() {
    const links = $$('.nav-link');
    const sections = links
      .map((l) => $(l.getAttribute('href')))
      .filter(Boolean);

    if (!sections.length) return;

    const onScroll = () => {
      const pos = window.scrollY + 140;
      let current = sections[0].id;
      sections.forEach((sec) => {
        if (sec.offsetTop <= pos) current = sec.id;
      });
      links.forEach((l) => {
        const active = l.getAttribute('href') === `#${current}`;
        l.classList.toggle('is-active', active);
        if (active) l.setAttribute('aria-current', 'page');
        else l.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    if (lenis) lenis.on('scroll', onScroll);
    onScroll();
  })();

  /* ---------- 07. Typing effect ---------- */
  (function initTyping() {
    const el = $('#typedText');
    if (!el) return;

    const words = ['Laravel Backend Developer', 'Backend Architect', 'API Engineer', 'Laravel Specialist'];
    if (reducedMotion) { el.textContent = words[0]; return; }

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const speed = 65;
    const pause = 1600;

    const tick = () => {
      const word = words[wordIndex];
      charIndex += deleting ? -1 : 1;
      el.textContent = word.slice(0, charIndex);

      if (!deleting && charIndex === word.length) {
        deleting = true;
        setTimeout(tick, pause);
        return;
      }
      if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, deleting ? speed / 2 : speed);
    };
    tick();
  })();

  /* ---------- 08. Animated counters ---------- */
  (function initCounters() {
    const counters = $$('.counter');
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const dur = reducedMotion ? 0 : 1600;
      const start = performance.now();

      const frame = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        el.textContent = Math.round(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
      // Ensure the final value is exact
      setTimeout(() => { el.textContent = target.toLocaleString(); }, dur + 100);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => io.observe(c));
  })();

  /* ---------- 09. Scroll reveal ---------- */
  (function initReveal() {
    const els = $$('.reveal');
    if (!els.length) return;

    if (reducedMotion) {
      els.forEach((el) => el.classList.add('in-view'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  })();

  /* ---------- 10. Skills ---------- */
  (function initSkills() {
    const grid = $('#skillsGrid');
    if (!grid) return;

    const sections = [
      {
        title: 'Backend Ecosystem',
        items: [
          { name: 'Laravel', desc: 'Advanced Framework', icon: '🔴' },
          { name: 'PHP', desc: 'Modern PHP 8+', icon: '🐘' },
          { name: 'MySQL', desc: 'Database Optimization', icon: '🗄️' },
          { name: 'REST API', desc: 'Scalable Architecture', icon: '🔌' },
          { name: 'Redis', desc: 'Caching & Queues', icon: '⚡' },
        ],
      },
      {
        title: 'Packages & Integrations',
        items: [
          { name: 'Stripe', desc: 'Payment & Subscriptions', icon: '💳' },
          { name: 'PayPal', desc: 'Global Checkout Integration', icon: '💰' },
          { name: 'Printify', desc: 'Print-on-Demand API', icon: '👕' },
          { name: 'bKash', desc: 'Local Mobile Banking', icon: '📱' },
          { name: 'Google APIs', desc: 'OAuth & Calendar Sync', icon: '📅' },
        ],
      },
      {
        title: 'Frontend Ecosystem',
        items: [
          { name: 'React.js', desc: 'Component Library', icon: '⚛️' },
          { name: 'Vue.js', desc: 'Progressive Framework', icon: '💚' },
          { name: 'Tailwind CSS', desc: 'Modern Styling', icon: '🎨' },
          { name: 'JavaScript', desc: 'ES6+ Core Engine', icon: '💻' },
          { name: 'HTML5 & CSS3', desc: 'Responsive Web Design', icon: '🌐' },
        ],
      },
      {
        title: 'DevOps & Tools',
        items: [
          { name: 'Docker', desc: 'Containerization', icon: '🐳' },
          { name: 'Git & GitHub', desc: 'Version Control', icon: '📦' },
          { name: 'AWS', desc: 'EC2, S3, RDS, Deployment', icon: '☁️' },
          { name: 'Azure', desc: 'Cloud Services & Hosting', icon: '🔷' },
          { name: 'CI/CD', desc: 'Automated Deployment', icon: '🔄' },
          { name: 'Linux Server', desc: 'Server Administration', icon: '🐧' },
        ],
      },
    ];

    const renderCard = (item) => `
      <div class="skill-mini-card">
        <div class="skill-mini-icon-raw" aria-hidden="true">${item.icon}</div>
        <h4 class="skill-mini-title">${item.name}</h4>
        <p class="skill-mini-desc">${item.desc}</p>
      </div>`;

    const renderSection = (sec) => `
      <div class="skill-section-block">
        <div class="flex items-center gap-4 mb-6">
          <h3 class="skill-section-title">${sec.title}</h3>
          <div class="h-px bg-slate-200 dark:bg-white/10 w-full"></div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          ${sec.items.map(renderCard).join('')}
        </div>
      </div>`;

    grid.innerHTML = sections.map(renderSection).join('');
  })();

  /* ---------- 11. Projects ---------- */
  (function initProjects() {
    const grid = $('#projectsGrid');
    const filterBar = $('#projectFilters');
    if (!grid || !filterBar) return;

    // Categories (also drives the filter buttons)
    const categories = [
      'Laravel', 'API', 'Dashboard', 'SaaS', 'Ecommerce', 'Mobile Backend',
      'Booking System', 'Payment', 'Calendar', 'Face Verification',
    ];

    const projects = [
      {
        title: 'Multi-Vendor E-Commerce Marketplace',
        cat: ['Ecommerce', 'Laravel', 'Payment'],
        emoji: '🛒',
        grad: 'from-primary/25 via-secondary/20 to-accent/25',
        status: 'Live', st: 'st-live',
        desc: 'A full marketplace where vendors manage stores, inventory and payouts while customers enjoy one-click checkout.',
        features: ['Vendor wallets & automated payouts', 'Stripe + bKash checkout', 'Redis-powered cart & search'],
        tech: ['Laravel 11', 'MySQL', 'Redis', 'Stripe'],
      },
      {
        title: 'Multi-Tenant SaaS Starter Kit',
        cat: ['SaaS', 'Laravel'],
        emoji: '🚀',
        grad: 'from-secondary/25 via-accent/20 to-success/25',
        status: 'In Development', st: 'st-dev',
        desc: 'A rock-solid base for SaaS products: tenant isolation, billing, roles and feature flags out of the box.',
        features: ['Single-database multi-tenancy', 'Subscription billing & invoices', 'Team roles & permissions'],
        tech: ['Laravel', 'PostgreSQL', 'Stripe', 'Docker'],
      },
      {
        title: 'Clinic Appointment Booking System',
        cat: ['Booking System', 'Laravel'],
        emoji: '🏥',
        grad: 'from-success/25 via-primary/20 to-secondary/25',
        status: 'Live', st: 'st-live',
        desc: 'Patients book doctors in real time; clinics manage schedules, reminders and reports from one dashboard.',
        features: ['Slot-based scheduling with conflicts', 'SMS & email reminders', 'Doctor availability APIs'],
        tech: ['Laravel', 'MySQL', 'Twilio', 'Nginx'],
      },
      {
        title: 'Mobile Banking REST API',
        cat: ['Mobile Backend', 'API'],
        emoji: '📱',
        grad: 'from-accent/25 via-secondary/20 to-primary/25',
        status: 'Production', st: 'st-prod',
        desc: 'The API layer for a fintech app handling transactions, OTPs, KYC and statement generation at scale.',
        features: ['JWT + OAuth with refresh rotation', '50K+ daily requests, <200ms p95', 'Idempotent transactions'],
        tech: ['Laravel', 'MySQL', 'Redis', 'AWS'],
      },
      {
        title: 'Real-Time Admin Dashboard',
        cat: ['Dashboard'],
        emoji: '📊',
        grad: 'from-warning/25 via-primary/20 to-accent/25',
        status: 'Live', st: 'st-live',
        desc: 'A blazing admin panel with live metrics, role-based access and one-click CSV/Schedule exports.',
        features: ['Live charts via polling & SSE', 'Granular RBAC with policies', 'Queued report exports'],
        tech: ['Laravel', 'Vue', 'Chart.js', 'Redis'],
      },
      {
        title: 'Stripe Subscription Billing Engine',
        cat: ['Payment', 'API'],
        emoji: '💳',
        grad: 'from-secondary/25 via-primary/20 to-warning/25',
        status: 'Completed', st: 'st-done',
        desc: 'A reusable billing module: plans, trials, proration, dunning emails and webhook-safe ledger updates.',
        features: ['Checkout & customer portal', 'Webhook event handling', 'Trials, coupons & proration'],
        tech: ['Laravel', 'Stripe', 'MySQL', 'Horizon'],
      },
      {
        title: 'Google Calendar Meeting Scheduler',
        cat: ['Calendar', 'API'],
        emoji: '📅',
        grad: 'from-primary/25 via-accent/20 to-success/25',
        status: 'Completed', st: 'st-done',
        desc: 'Clients pick a free slot and get a Google Meet link auto-created — no back-and-forth emails.',
        features: ['OAuth with Google Calendar', 'Slots synced in real time', 'Auto Meet link generation'],
        tech: ['Laravel', 'Google APIs', 'MySQL', 'Queue'],
      },
      {
        title: 'Smart Attendance with Face Verification',
        cat: ['Face Verification', 'Laravel'],
        emoji: '😀',
        grad: 'from-accent/25 via-success/20 to-primary/25',
        status: 'Production', st: 'st-prod',
        desc: 'Face-recognition attendance with liveness detection for remote branches, synced to a live dashboard.',
        features: ['Liveness & anti-spoofing', '99.2% verification accuracy', 'Offline sync for field teams'],
        tech: ['Laravel', 'Python', 'AWS Rekognition', 'Redis'],
      },
      {
        title: 'Inventory Management API',
        cat: ['API', 'Laravel'],
        emoji: '📦',
        grad: 'from-success/25 via-accent/20 to-secondary/25',
        status: 'In Development', st: 'st-dev',
        desc: 'A GraphQL-first inventory core: stock levels, movements, barcode scanning and low-stock alerts.',
        features: ['GraphQL schema & queries', 'Stock movement ledger', 'Low-stock notification jobs'],
        tech: ['Laravel', 'GraphQL', 'PostgreSQL', 'Lighthouse'],
      },
    ];

    /* Filters */
    filterBar.innerHTML = ['All', ...categories]
      .map((c, i) => `<button type="button" class="filter-btn${i === 0 ? ' active' : ''}" data-filter="${c}"${i === 0 ? ' aria-pressed="true"' : ''}>${c}</button>`)
      .join('');

    /* Cards */
    const card = (p) => `
      <article class="project-card glass">
        <div class="project-thumb bg-gradient-to-br ${p.grad}">
          <span class="project-status ${p.st}">${p.status}</span>
          <span class="emoji" aria-hidden="true">${p.emoji}</span>
        </div>
        <div class="project-body">
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.desc}</p>
          <div class="project-tags">${p.cat.map((t) => `<span class="p-tag">${t}</span>`).join('')}</div>
          <ul class="project-features">
            ${p.features.map((f) => `<li>${f}</li>`).join('')}
          </ul>
          <div class="project-tech">${p.tech.map((t) => `<span class="p-tag">${t}</span>`).join('')}</div>
          <div class="project-actions">
            <a href="https://github.com/yourname" target="_blank" rel="noopener" class="p-btn p-btn-ghost" aria-label="View ${p.title} on GitHub">View Code</a>
            <a href="#contact" class="p-btn p-btn-solid">Live Demo</a>
            <a href="#featured" class="p-btn p-btn-ghost">Case Study</a>
          </div>
        </div>
      </article>`;

    const render = (filter) => {
      const list = filter === 'All' ? projects : projects.filter((p) => p.cat.includes(filter));
      grid.innerHTML = list.map(card).join('');
    };

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      $$('.filter-btn', filterBar).forEach((b) => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      render(btn.dataset.filter);
      // Re-trigger entrance animation
      $$('.project-card', grid).forEach((c) => {
        c.classList.remove('pop');
        void c.offsetWidth;
        c.classList.add('pop');
      });
    });

    render('All');
  })();


  /* ---------- 13. Ripple effect ---------- */
  (function initRipple() {
    const attach = (el) => {
      el.addEventListener('pointerdown', (e) => {
        if (reducedMotion) return;
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const span = document.createElement('span');
        span.className = 'ripple';
        span.style.width = span.style.height = `${size}px`;
        span.style.left = `${e.clientX - rect.left - size / 2}px`;
        span.style.top = `${e.clientY - rect.top - size / 2}px`;
        el.appendChild(span);
        span.addEventListener('animationend', () => span.remove());
      });
    };
    $$('.btn, .icon-btn, .p-btn, .filter-btn').forEach(attach);
  })();

  /* ---------- 14. Contact form ---------- */
  (function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    const fields = {
      name: { el: $('#cf-name'), error: $('#cf-name-error'), validate: (v) => v.trim().length >= 2 || 'Please enter your name (min 2 characters).' },
      email: { el: $('#cf-email'), error: $('#cf-email-error'), validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please enter a valid email address.' },
      subject: { el: $('#cf-subject'), error: $('#cf-subject-error'), validate: (v) => v.trim().length >= 3 || 'Please add a subject (min 3 characters).' },
      message: { el: $('#cf-message'), error: $('#cf-message-error'), validate: (v) => v.trim().length >= 10 || 'Message should be at least 10 characters.' },
    };

    const status = $('#formStatus');

    const setError = (key, msg) => {
      const f = fields[key];
      f.el.closest('.field').classList.toggle('error', !!msg);
      f.error.textContent = msg || '';
    };

    // Live validation on blur
    Object.entries(fields).forEach(([key, f]) => {
      f.el.addEventListener('blur', () => {
        if (f.el.value.trim()) setError(key, f.validate(f.el.value) === true ? '' : f.validate(f.el.value));
      });
      f.el.addEventListener('input', () => {
        const field = f.el.closest('.field');
        if (field.classList.contains('error')) setError(key, f.validate(f.el.value) === true ? '' : f.validate(f.el.value));
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      Object.entries(fields).forEach(([key, f]) => {
        const msg = f.validate(f.el.value);
        setError(key, msg === true ? '' : msg);
        if (msg !== true) valid = false;
      });
      if (status) status.textContent = '';

      if (!valid) {
        if (status) status.textContent = 'Please fix the highlighted fields.';
        return;
      }

      // Simulate a successful submit (wire to Formspree / your API — see README)
      if (status) status.textContent = 'Sending...';
      setTimeout(() => {
        form.classList.add('is-sent');
        form.style.display = 'none';
        const success = $('#formSuccess');
        if (success) success.hidden = false;
        form.reset();
      }, 700);
    });

    // "Send another message" resets the form
    const resetBtn = $('#resetForm');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.style.display = '';
        form.classList.remove('is-sent');
        const success = $('#formSuccess');
        if (success) success.hidden = true;
        if (status) status.textContent = '';
        Object.keys(fields).forEach((k) => setError(k, ''));
      });
    }
  })();

  /* ---------- 15. Back to top (state handled in module 04) ---------- */

  /* ---------- 16. Cursor effects ---------- */
  (function initCursor() {
    if (isTouch || reducedMotion) return;
    const glow = $('#cursorGlow');
    const dot = $('#cursorDot');
    if (!glow || !dot) return;

    document.body.classList.add('cursor-on');

    let mx = -100, my = -100;   // mouse position
    let gx = -100, gy = -100;   // glow lerp position

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    });

    const loop = () => {
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;
      glow.style.left = `${gx}px`;
      glow.style.top = `${gy}px`;
      requestAnimationFrame(loop);
    };
    loop();

    // Grow dot over interactive elements
    const interactive = 'a, button, input, textarea, select, [role="button"]';
    document.addEventListener('mouseover', (e) => {
      document.body.classList.toggle('cursor-hover', !!e.target.closest(interactive));
    });
  })();

  /* ---------- 17. Footer year ---------- */
  (function initYear() {
    const el = $('#year');
    if (el) el.textContent = new Date().getFullYear();
  })();
})();
