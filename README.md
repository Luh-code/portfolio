# Luyando Mulonda: portfolio

**Live site:** https://luyandomulondaportfolio.netlify.app/

A single-page portfolio: one reverse-chronological timeline of my work, projects, education and awards, with filters and a link for every entry. No subpages, no framework, no build step.

## What it does

- **One timeline.** Everything is on one page, newest first, grouped under 2026, 2025 and Earlier. A few key entries (my degree, the ZAMREN internship, my final-year project, the Best Graduating Student award) are shown larger; the rest are compact.
- **Filters you can share.** Filter by type (Work, Projects, Education, Awards, Certs) or by tag (networking, security, web, …). The filter is saved in the URL, so a link like `?type=project` or `?tag=security` opens that exact view. A count shows how many entries match, with a button to clear the filter.
- **Links to single entries.** Every entry has its own anchor, e.g. `#zamren-intern`. If a link points to an entry the current filter hides, the filter is cleared so the entry still shows.
- **Works without JavaScript.** The full timeline and all links are plain HTML. JavaScript only adds the filter bar and highlights the current year in the nav.
- **Projects answer four questions.** Each project says what I built, why it exists, what problem it solves and how it adds value.
- **Accessible.** Semantic HTML, a skip link, filter buttons that work from the keyboard, visible focus rings, labels written for screen readers, and smooth scrolling only for people who haven't asked for reduced motion. It's checked against WCAG 2.1 AA in both light and dark mode.
- **Light and dark mode, plus print.** The page follows the system theme. Printing gives a clean, CV-style page with every entry shown.

## Tech stack

| Part | Choice |
|---|---|
| Page | One self-contained [`index.html`](index.html): HTML5 with the CSS in a `<style>` block and vanilla JavaScript in a `<script>` block |
| Fonts | [Fraunces](https://fonts.google.com/specimen/Fraunces) for headings (Google Fonts), the system font for body text |
| Hosting | [Netlify](https://www.netlify.com/), no build command ([`netlify.toml`](netlify.toml)) |
| Security | A strict Content-Security-Policy that allows the inline CSS and JS by their SHA-256 hashes, not with `'unsafe-inline'`, plus standard security headers |
| Tests | [Playwright](https://playwright.dev/) using the installed Google Chrome, and [axe-core](https://github.com/dequelabs/axe-core) for accessibility scans |
| Tooling | Python 3 for the hash script, Node.js for the tests |

The reasons for these choices, and what's deliberately left out, are in [ADR 0001](docs/adr/0001-single-page-timeline-portfolio.md).

## Project structure

```
index.html              the whole site
netlify.toml            Netlify settings and security headers (CSP hashes live here)
scripts/update-csp.py   recalculates the CSP hashes after a CSS or JS edit
docs/adr/               architecture decision records
tests/                  Playwright test suite (own package.json, not deployed as code)
.gitattributes          keeps line endings as LF so hashes match on every machine
```

## Working on it

**Preview:** double-click `index.html`, or run `cd tests && node server.mjs` and open http://localhost:4173. The test server sends the same headers as Netlify.

**Add an entry:** copy an existing `<article class="entry">` into the right year section. Set its `id`, `data-type` and `data-tags`, and add matching tag links. New tags show up in the filter bar automatically. A new *type* also needs a label in `TYPE_LABELS` in the script.

**Edit the CSS or JavaScript:** afterwards, run

```
python scripts/update-csp.py
```

If you don't, the live site will block the changed styles or script. Editing text outside the `<style>` and `<script>` blocks doesn't need this.

## Tests

You need Node.js and Google Chrome.

```
cd tests
npm install        # first time only
npm test           # full suite: desktop and phone
npm run test:ui    # interactive runner
npm run report     # HTML report from the last run
```

The suite checks that:

- the CSP hashes match the page, and nothing is blocked in the browser;
- the content follows the entry model in the ADR, and works with JavaScript off;
- headings, link labels and alt text are correct, with an axe WCAG 2.1 AA scan in light and dark mode;
- filters, URL state, the Back button and deep links all work;
- layout works on desktop and phone, and print shows every entry;
- no phone numbers or third-party email addresses appear on the page.

Before launch, also run the launch checklist, which fails while any `DRAFT` placeholder is left:

```
LAUNCH=1 npm test                                   # Git Bash
$env:LAUNCH=1; npm test; Remove-Item Env:LAUNCH     # PowerShell
```

## Deploying

Push to the GitHub repo connected to Netlify, or drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop). There's no build step. Netlify serves the folder as it is and applies the headers in `netlify.toml`.

## AI-assisted workflow

This site was built with an AI coding assistant, [Claude Code](https://claude.com/claude-code). I want to be clear about how that worked.

**What I did**
- Decided what the site should be: a single-page timeline, plain HTML/CSS/JS, minimal but personal, pink, hosted on Netlify.
- Supplied the source material: my CV, my final-year project report, and my other project folders.
- Reviewed every claim about me and corrected the ones that were wrong. For example: the wedding site was for my sister; my part of the helpdesk project was mostly the front end; and I removed TypeScript, React, Next.js and Tailwind from my skills because an AI wrote most of that project's code, not me.
- Made the final calls on scope, wording and what to leave out.

**What the AI did**
- Proposed what a timeline portfolio should and shouldn't include, then recorded the agreed decisions in an [ADR](docs/adr/0001-single-page-timeline-portfolio.md).
- Wrote the HTML, CSS and JavaScript, the CSP hash script, and the test suite.
- Pulled my experience, projects and skills out of my CV, project report and repos, and drafted the project write-ups for me to check.
- Reviewed the page for accessibility and applied the fixes.

**Rules we followed**
- **No invented facts.** Every claim comes from my CV, my report or my code history. Anything inferred was flagged for me to confirm, not published as fact.
- **Only skills I actually have.** Technologies from AI-built projects aren't listed as my skills, and AI-assisted projects are labelled as such on the page.
- **Privacy by default.** My phone number and my referees' details stay off the public site, and a test enforces this.
- **Verify, don't assume.** Changes were checked in a real browser with the live security policy enforced, and the automated tests have to pass. The tests have already caught real problems, including an accessibility bug the AI itself had introduced.

The AI wrote the drafts, and I'm responsible for what's published.

## Contact

[luyandomulonda@gmail.com](mailto:luyandomulonda@gmail.com) · [LinkedIn](https://www.linkedin.com/in/luyando-mulonda) · [GitHub](https://github.com/Luh-code)
