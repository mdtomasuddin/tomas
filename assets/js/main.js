/* ============================================================
   Md. Tomas Uddin — Portfolio
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

    // 1) saved preference → 2) default to DARK mode
    const saved = localStorage.getItem(KEY);
    let dark;
    if (saved === 'dark' || saved === 'light') {
      dark = saved === 'dark';
    } else {
      dark = true; // Default theme is Dark Mode
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
      if (open && window.innerWidth >= 1024) open = false;
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

    const words = ['Laravel Backend Developer', 'REST API Architect', 'Full-Stack PHP Engineer'];
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
          { name: 'Laravel', desc: 'Advanced Framework', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/laravel/laravel-original.svg" alt="Laravel" class="w-8 h-8 object-contain inline-block" />' },
          { name: 'PHP', desc: 'Backend & OOP Architecture', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/php/php-original.svg" alt="PHP" class="w-8 h-8 object-contain inline-block" />' },
          { name: 'MySQL', desc: 'Database Optimization', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg" alt="MySQL" class="w-8 h-8 object-contain inline-block" />' },
          { name: 'Redis', desc: 'Caching & Queue Processing', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/redis/redis-original.svg" alt="Redis" class="w-8 h-8 object-contain inline-block" />' },
          { name: 'REST API', desc: 'Scalable Architecture', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-primary"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>' },
        ],
      },
      {
        title: 'Packages & Integrations',
        items: [
          { name: 'Stripe', desc: 'Payment & Subscriptions', icon: '<svg viewBox="0 0 32 32" class="w-8 h-8 inline-block"><rect width="32" height="32" rx="7" fill="#635BFF"/><path d="M14.9 12.8c-1.3-.5-2-.9-2-1.5 0-.5.5-.9 1.4-.9 1.2 0 2.4.4 3.3 1l.7-2.9C17.2 8.1 15.8 7.8 14.3 7.8c-3.2 0-5.4 1.7-5.4 4.5 0 3 2.7 3.7 5 4.5 1.7.6 2.2 1.1 2.2 1.8 0 .7-.7 1.1-1.8 1.1-1.5 0-3-.6-4.1-1.4l-.8 2.9c1.3.8 3 1.2 4.9 1.2 3.4 0 5.6-1.6 5.6-4.6-.1-3-2.6-3.8-5-4.6z" fill="#FFF"/></svg>' },
          { name: 'RevenueCat', desc: 'In-App Subscriptions & IAP', icon: '<img src="https://cdn.simpleicons.org/revenuecat/FF4B4B" alt="RevenueCat" class="w-8 h-8 object-contain inline-block" />' },
          { name: 'Printify', desc: 'Print-on-Demand API', icon: '<svg viewBox="0 0 24 24" fill="#27AB83" class="w-8 h-8 inline-block"><path d="M12 0L7.547 8.878 0 12l7.547 3.123L12 24l4.453-8.877L24 12l-7.547-3.122Z"/></svg>' },
          { name: 'Google APIs', desc: 'Google Workspace & OAuth', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/google/google-original.svg" alt="Google APIs" class="w-8 h-8 object-contain inline-block" />' },
          { name: 'AI Models', desc: 'OpenAI, Gemini & LLMs', icon: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-slate-800 dark:text-white inline-block"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0806 4.7992-2.7682a.798.798 0 0 0 .3992-.693v-6.7607l2.0304 1.1717a.071.071 0 0 1 .038.052v5.5824a4.504 4.504 0 0 1-4.5323 4.537zm-9.3364-4.8344a4.4755 4.4755 0 0 1-.535-3.0037l.142.0854 4.7944 2.7682a.798.798 0 0 0 .7984 0l5.857-3.3768v2.3434a.071.071 0 0 1-.0332.0617L9.57 21.054a4.504 4.504 0 0 1-5.6465-3.4593zm-1.1274-10.426a4.4707 4.4707 0 0 1 2.3414-1.968l-.0048.1634V10.93a.798.798 0 0 0 .3992.693l5.857 3.3768-2.0304 1.1717a.071.071 0 0 1-.0664.0048L3.633 13.6262a4.504 4.504 0 0 1-1.127-5.0615zM17.472 10.93l-5.857-3.3768 2.0304-1.1717a.071.071 0 0 1 .0664-.0048l4.887 2.8226a4.504 4.504 0 0 1-.7267 8.0652v-5.5824a.798.798 0 0 0-.3992-.693zm2.4646-3.0854l-.1419-.0854-4.7992-2.7682a.798.798 0 0 0-.7984 0L8.34 8.3682V6.0248a.071.071 0 0 1 .0332-.0617l4.887-2.8226a4.504 4.504 0 0 1 6.6764 4.7041zM9.011 14.54l-2.0304-1.1717a.071.071 0 0 1-.038-.052V7.7339a4.504 4.504 0 0 1 7.4087-3.4962l-.1419.0806-4.7992 2.7682a.798.798 0 0 0-.3992.693v6.7607z"/></svg>' },
          { name: 'Social & Auth', desc: 'Socialite, Sanctum, JWT & OAuth', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-primary inline-block"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>' },
        ],
      },
      {
        title: 'Frontend Ecosystem',
        items: [
          { name: 'React.js', desc: 'Component Library', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React.js" class="w-8 h-8 object-contain inline-block" />' },
          { name: 'Vue.js', desc: 'Progressive Framework', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vuejs/vuejs-original.svg" alt="Vue.js" class="w-8 h-8 object-contain inline-block" />' },
          { name: 'Tailwind CSS', desc: 'Modern Styling', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" alt="Tailwind CSS" class="w-8 h-8 object-contain inline-block" />' },
          { name: 'JavaScript', desc: 'ES6+ Core Engine', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="JavaScript" class="w-8 h-8 object-contain inline-block" />' },
          { name: 'HTML5 & CSS3', desc: 'Responsive Web Design', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" alt="HTML5" class="w-8 h-8 object-contain inline-block" />' },
        ],
      },
      {
        title: 'DevOps & Tools',
        items: [
          { name: 'Postman', desc: 'API Testing & Specs', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postman/postman-original.svg" alt="Postman" class="w-8 h-8 object-contain inline-block" />' },
          { name: 'Git & CI/CD', desc: 'Version Control & Auto Deployment', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg" alt="Git & CI/CD" class="w-8 h-8 object-contain inline-block" />' },
          { name: 'Hostinger & GoDaddy', desc: 'Basic Server & Hosting Setup', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-accent inline-block"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>' },
          { name: 'Notion', desc: 'Docs & Task Workspace', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/notion/notion-original.svg" alt="Notion" class="w-8 h-8 object-contain dark:invert inline-block" />' },
          { name: 'Docker', desc: 'Containerization', icon: '<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" alt="Docker" class="w-8 h-8 object-contain inline-block" />' },
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
    if (!grid) return;

    const projects = [
      {
        title: 'Multi-Vendor E-Commerce Marketplace',
        grad: 'from-primary/25 via-secondary/20 to-accent/25',
        status: 'Production', st: 'st-prod',
        desc: 'A full-scale marketplace where vendors manage inventory, orders and payouts while customers enjoy multi-gateway checkout.',
        features: ['Vendor wallets & automated payouts', 'Stripe & bKash payment checkout', 'Redis-powered fast cart & caching'],
        tech: ['Laravel 11', 'MySQL', 'Redis', 'Stripe'],
      },
      {
        title: 'Mobile App Backend & Banking REST API',
        grad: 'from-accent/25 via-secondary/20 to-primary/25',
        status: 'Live', st: 'st-live',
        desc: 'High-performance REST API layer powering mobile applications with secure authentication, KYC, and real-time transaction processing.',
        features: ['Sanctum & JWT token rotation', 'High-throughput endpoint optimization', 'Automated webhooks & notifications'],
        tech: ['Laravel', 'REST API', 'Sanctum / JWT', 'MySQL', 'Redis'],
      },
      {
        title: 'Multi-Tenant SaaS Platform Starter',
        grad: 'from-secondary/25 via-accent/20 to-success/25',
        status: 'Production', st: 'st-prod',
        desc: 'Scalable SaaS foundation featuring single-database multi-tenancy, subscription management, roles, and automated billing.',
        features: ['Tenant database isolation', 'Stripe subscription billing & invoices', 'Role-based access control (RBAC)'],
        tech: ['Laravel', 'PostgreSQL', 'Stripe', 'Docker'],
      },
    ];

    /* Cards */
    const card = (p) => `
      <article class="project-card glass">
        <div class="project-thumb bg-gradient-to-br ${p.grad}">
          <span class="project-status ${p.st}">${p.status}</span>
        </div>
        <div class="project-body">
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.desc}</p>
          <ul class="project-features">
            ${p.features.map((f) => `<li>${f}</li>`).join('')}
          </ul>
          <div class="project-tech">${p.tech.map((t) => `<span class="p-tag">${t}</span>`).join('')}</div>
          <div class="project-actions">
            <a href="https://github.com/mdtomasuddin" target="_blank" rel="noopener" class="p-btn p-btn-ghost" aria-label="View ${p.title} on GitHub">View Code</a>
            <a href="#contact" class="p-btn p-btn-solid">Request Demo</a>
          </div>
        </div>
      </article>`;

    grid.innerHTML = projects.map(card).join('');
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

    /* ---------- Copy to Clipboard ---------- */
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.copy-btn');
      if (!btn) return;
      const text = btn.dataset.copy;
      if (!text) return;

      navigator.clipboard.writeText(text).then(() => {
        const origTitle = btn.getAttribute('title') || 'Copy';
        btn.setAttribute('title', 'Copied!');
        btn.classList.add('text-success');

        const svg = btn.querySelector('svg');
        if (svg) {
          svg.style.transform = 'scale(1.25)';
          setTimeout(() => { svg.style.transform = ''; }, 200);
        }

        setTimeout(() => {
          btn.setAttribute('title', origTitle);
          btn.classList.remove('text-success');
        }, 2000);
      }).catch(() => {});
    });
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
