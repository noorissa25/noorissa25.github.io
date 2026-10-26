# Noor Issa, personal site

A static site with no build step: `index.html`, `styles.css`, `script.js` and `assets/`.

## Preview locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173.

## Edit content

Everything you'd want to change is in `index.html`:

- **Hero**: the `.hero-code` lines (the typing effect adjusts to any length).
- **Experience**: one `<li class="commit">` per entry, newest first. Tags: `tag-work`, `tag-found`, `tag-school`, `tag-teach`.
- **Work**: one `<article class="project">` per case study, each with why / how / result tabs. Give each tab a unique id (`p5-t1`, `p5-brief`, …).
- **Contact**: intro text, links, stack and free-time photos. The email address is not in the HTML: it's assembled in `script.js` (`EMAIL`) and used by the message form and the resume request button.
- **Link previews**: `assets/og-image.jpg` and the `noorissa.dev` URLs in the `<head>` (canonical, `og:url`, `og:image`). Change those three if the domain changes.

Colors and fonts are tokens at the top of `styles.css` (light theme first, dark theme below).

When you change CSS or JS, bump the `?v=` number on the two links in `index.html` so browsers fetch the new file.

## Deploy

Any static host works. On GitHub Pages: push this folder to a repo, then in **Settings → Pages** pick the `main` branch and the root folder.
