# ADR 0001: Single-page timeline portfolio in plain HTML/CSS/JS

- **Status:** Accepted
- **Date:** 2026-11-15
- **Owner:** Luyando Mulonda

## Context

I'm a Computer Science graduate (Mukuba University, 2026) looking for roles in network engineering, IT support and web development. I need a public site that a recruiter can scan in under a minute, that I can link to individual items from (a CV, LinkedIn, an application), and that I can keep up to date without a build toolchain.

My experience is a mix of different kinds of item: a degree, an internship, a final-year project, a CTF placing, an award and a batch of short certifications. Several of these overlap in time. The source material is my CV.

Hosting is Netlify, from this repository.

## Decision

Build **one page**: a reverse-chronological timeline of everything, with a filterable anchor-link nav and no subpages.

### What we're building

| Part | Decision |
|---|---|
| **Stack** | Plain `index.html`, `styles.css`, `app.js`. No framework, no build step, no dependencies other than one Google Font (Fraunces). |
| **Top of page** | Name, one-line role, a 1–2 sentence intro in my own voice, a "Now" line saying what I'm looking for, email / LinkedIn / GitHub, and a one-line toolbox of skills. |
| **Timeline** | A single column, newest first, grouped under year headings (2026, 2025, Earlier). Overlapping items, such as the project and the degree, sit in the same column and are told apart by a type label. |
| **Entry model** | Every entry has the same shape: type, date range, title, org, an optional lede, optional bullets, and tags. The types are `work`, `project`, `education`, `award` and `certification`. |
| **Visual weight** | 3–5 entries are marked `feature` and shown larger. The rest are compact. |
| **Anchors** | Every year and every entry has a stable `id`, e.g. `#zamren-intern`, so it can be deep-linked. |
| **Filtering** | Filter by type and by tag. The filter state lives in the URL (`?type=project&tag=security`) so a filtered view can be shared. The page shows a count ("3 of 8 entries") and a clear button. Clicking a tag on an entry applies that filter. A deep link to a hidden entry clears the filter so the entry is never lost. |
| **Content location** | Entries are written directly in `index.html`. `data-type` and `data-tags` attributes drive the filters. |
| **Progressive enhancement** | Without JavaScript the full timeline and every anchor still work. `app.js` only adds the filter bar and highlights the current year in the nav. |
| **Style** | Minimal and a bit personal: one pink accent (my favourite colour), Fraunces for headings, system sans for body text, automatic dark mode, and a print stylesheet that hides the nav and shows every entry. |
| **Accessibility** | Semantic HTML (`<article>`, `<time datetime>`), a skip link, keyboard-reachable filter chips using `aria-pressed`, visible focus rings, smooth scrolling only when reduced motion isn't requested, and accent colours checked for contrast. |
| **Hosting** | Netlify publishes the repo root with no build command. `netlify.toml` sets a strict Content-Security-Policy and standard security headers. |

### Content rules

- Write impact, not duties, and **never invent numbers or claims** that aren't in the CV.
- Merge small items: the seven MTN Skills Academy courses are **one** entry, so they don't bury the internship and the award.
- Collapse old history into **Earlier**. Secondary school is the only pre-university item.
- Keep tags to a small controlled set (currently 7: networking, security, web, databases, monitoring, support, productivity) and stay under about 15.

## Explicitly out of scope

These are deliberately not part of the site. Adding any of them needs a new ADR.

- **Subpages**, including a separate about page, project detail pages, a blog or a case-study section. Anything that needs more than a few lines links out to a repo or write-up instead.
- **A separate skills section, skill bars or percentages.** The toolbox line and the entry tags already show where each skill was used.
- **An about-me essay or testimonials.** The 1–2 sentence intro is the personal part.
- **Phone number and referees' contact details.** A public page gets scraped, and the referees didn't agree to be listed. Any downloadable PDF CV must be a public copy with the references section removed.
- **Contact forms** or anything else that needs a backend. Contact is by email link.
- **Analytics beyond Netlify's built-in stats, tracking scripts and cookie banners.**
- **Scroll animation, parallax, typewriter effects and other decorative motion.** They get in the way of scanning.
- **Modals and expandable detail panels.**

## Alternatives considered and rejected

### A framework or static-site generator (React, Next.js, Astro)
**Rejected.** The site is one page with fewer than 20 entries. A framework would add a build step, dependencies to keep updated and slower first paint, and it would give nothing the plain files don't already do. If the site ever grows past one page, Astro is the first thing to revisit.

### Entries in a separate `data.json`, rendered by JavaScript
**Rejected**, although it was the original plan. It separates content from layout neatly, but the timeline would be blank without JavaScript and harder for search engines and link previews to read. That breaks the progressive-enhancement rule above. Writing the entries in HTML costs a little copy-and-paste per new entry, which is acceptable at this size.

### Parallel lanes (work / projects / education side by side)
**Rejected** in favour of one column with type labels. Lanes show overlap more literally, but they collapse badly on phones, make filtering awkward, and look empty when one lane has only one or two items.

### Multi-page site (Home / Experience / Projects / Contact)
**Rejected.** Every extra page is another click between a recruiter and the information. Filters and anchors give the same "show me just the projects" view without leaving the page.

### One card per certification
**Rejected.** Seven equal cards for short online courses would outweigh the internship and the award. They're grouped into one compact entry.

### Equal-weight cards for every entry
**Rejected.** A flat list reads like a log file. Feature entries (the award, the degree, the helpdesk project, ZAMREN) get larger type and a filled dot.

### GitHub Pages
**Not chosen.** It would work just as well for a static site. Netlify was picked for drag-and-drop deploys and for setting security headers in `netlify.toml`.

## Consequences

- **Adding an entry means editing HTML.** Copy an existing `<article class="entry">`, then set its `id`, `data-type` and `data-tags` and its year section. New tags and types show up in the filter bar automatically. A new *type* also needs a label in `TYPE_LABELS` in `app.js`.
- **A new year needs a new `<section class="year">` and a matching link in the nav.**
- **The CSP means no inline scripts or styles and no third-party embeds** unless `netlify.toml` is updated as well.
- **Without JavaScript, tag links (`?tag=…`) reload the unfiltered page.** That's acceptable because nothing is lost; the visitor just sees everything.
- **The page is only as good as its copy.** The intro line, the "Now" line and the helpdesk project's date and links still need to be confirmed by me before launch.
