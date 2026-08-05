# MD. Tomas Uddin — Laravel Backend Developer Portfolio

A premium, production-ready portfolio built with **HTML5 · Tailwind CSS · Vanilla JavaScript**.
Designed with a SaaS/enterprise aesthetic — glassmorphism, gradient borders, smooth micro-interactions,
full dark/light theming, and complete accessibility & SEO support.

![Stack](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![JS](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **Advanced Dark / Light mode** — auto-detects system theme, manual toggle, saved in `localStorage`
- **Sticky glass navbar** — scroll-spy active links, animated mobile menu, theme toggle
- **Hero section** — animated typing text, floating Laravel icon & code snippet cards, animated counters,
  availability badge, CTA buttons (Download Resume, Hire Me, Schedule Meeting, GitHub, LinkedIn, Email)
- **Tech marquee** — infinite scrolling technology strip
- **About** — mission / vision / philosophy cards, highlights, quick-facts panel
- **Experience & Education timelines** — work history plus education
  (Diploma — Kishoreganj Polytechnic Institute ✓ · BSc CSE — Uttara University ⏳ running)
- **Skills** — 7 animated group cards with progress bars & counting percentages
- **Featured project** — FaceVerify case study with architecture diagram & metrics
- **Projects** — 9 cards with **live filtering** across 10 categories
- **Services** — 11 service cards + project CTA
- **Testimonials** — auto-playing glass slider with dots & arrows
- **Blog preview** — 3 featured articles
- **Contact form** — live validation, error states, success animation
- **Micro-interactions** — ripple buttons, custom cursor glow, hover lifts, scroll reveal,
  scroll progress bar, page preloader, back-to-top, animated scroll indicator

## 🚀 Getting Started

No build step required. Either:

```bash
# Option A — just open it
open index.html

# Option B — serve locally (recommended)
python -m http.server 8080
# → http://localhost:8080

# Option C — no Python? Use the included zero-dependency Node server
node serve.js 8080
# → http://localhost:8080
```

### Customizing your details

| What            | Where                                                        |
| --------------- | ------------------------------------------------------------ |
| Name / title    | `<head>` title + Hero `<h1>` + footer + JSON-LD schema        |
| Social links    | Search for `yourname` / `linkedin.com/in/yourname` in `index.html` |
| Email / phone   | `hello@tomasuddin.dev`, `wa.me/8801XXXXXXXXX`                 |
| Resume PDF      | Drop your PDF at `assets/files/resume.pdf` (button already links there) |
| Skills / levels | `SKILL_GROUPS` array in `assets/js/main.js`                   |
| Projects        | `projects` array in `assets/js/main.js` (title, category, emoji, status…) |
| Testimonials    | `testimonials` array in `assets/js/main.js`                   |
| Typing words    | `words` array in `assets/js/main.js`                          |
| Experience      | Timeline markup in `index.html` (#experience section)         |
| Photo           | Replace `assets/images/avatar.svg` with your photo            |

> Company names (NovaSoft Ltd., PixelWorks IT) and stats are placeholders — edit to match your real history.

### Wiring the contact form

The form currently simulates success. To receive real messages:

1. Create a free form at [formspree.io](https://formspree.io) (or your own endpoint).
2. In `assets/js/main.js` find `// Simulate a successful submit` in the contact module and
   replace it with a `fetch` POST to your Formspree ID, e.g.:

```js
await fetch('https://formspree.io/f/yourFormId', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' },
});
```

## 📁 Structure

```
├── index.html              # Single-page markup, SEO + structured data
├── assets/
│   ├── css/style.css       # Custom styles, themes, animations & components
│   ├── js/main.js          # All logic, data & interactions (modular IIFE)
│   ├── images/
│   │   ├── avatar.svg      # Portrait placeholder (replace with your photo)
│   │   └── favicon.svg     # Site favicon
│   └── files/resume.pdf    # ← put your resume here
└── README.md
```

## 🎨 Design System

- **Fonts** — Inter (body) · Space Grotesk (display/headings)
- **Spacing** — 8px scale
- **Colors**
  | Token | Value |
  | ----- | ----- |
  | Primary | `#FF2D20` (Laravel red) |
  | Secondary | `#4F46E5` |
  | Accent | `#06B6D4` |
  | Success / Warning / Danger | `#10B981` / `#F59E0B` / `#EF4444` |
  | Light bg / Dark bg | `#F8FAFC` / `#020617` |

## ⚡ Production Notes

The project uses the **Tailwind CSS browser build** (`@tailwindcss/browser`) so it runs anywhere with
zero tooling. For maximum production performance, compile Tailwind to a static stylesheet instead:

```bash
npm init -y
npm install tailwindcss @tailwindcss/cli
npx @tailwindcss/cli -i ./assets/css/tailwind.css -o ./assets/css/tailwind.min.css --minify
```

Keep the `@theme` and `@custom-variant dark` rules in your Tailwind input file, then replace the
`<script src="…@tailwindcss/browser…">` tag and the `<style type="text/tailwindcss">` block with a
single `<link rel="stylesheet" href="assets/css/tailwind.min.css">`.

Other production tips:

- Replace all `#` / placeholder links (`github.com/yourname`, `wa.me/…`) with real URLs.
- Point `og:image` / `twitter:image` to an absolute URL of your real photo.
- Host on Vercel, Netlify, or GitHub Pages — this is a fully static site.

## ♿ Accessibility & SEO

- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`), skip-link, ARIA labels,
  keyboard-friendly menus, visible focus rings, `prefers-reduced-motion` support
- Meta description, Open Graph, Twitter Card, canonical, and JSON-LD `Person` schema
- 100/100 attainable on Lighthouse for a static page

## 📄 License

MIT — free to use, personalize, and ship.
# tomas
