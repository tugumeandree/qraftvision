# CapitalMasters — Static Landing (HTML/CSS/JS)

A responsive, accessible landing site for CapitalMasters built with plain HTML, CSS, and vanilla JavaScript.

Sections:
- Why CapitalMasters
- Our Training Programs by Financial Level
- Curricula (separate page with detailed draft curricula)
- Offers (separate page showcasing revenue-stream offerings)
- MoneyKind — Financial Technology Solutions (links to the external site)
- ThrivePath — Modern Personal Financial Literacy (21st-Century Workers)
- Trusted By
- Impact Stories
- Newsletter
- Contact

## Quick start

1. Download or clone the files.
2. Open `index.html` in your browser. Visit:
   - `curricula.html` for the detailed curricula page.
   - `offers.html` for the CapitalMasters offers page.

No build tools required.

## Structure

```
.
├─ index.html       # Landing page (Programs, MoneyKind, ThrivePath, etc.)
├─ curricula.html   # Detailed draft curricula across levels
├─ offers.html      # Client-focused offerings (training, MoneyKind, consulting, partnerships, etc.)
├─ styles.css       # Styling (CSS variables, responsive grid, components)
├─ script.js        # Interactivity, data-driven programs, form handling
└─ assets/
   ├─ hero-illustration.svg
   ├─ moneykind-ui.svg
   ├─ thrivepath-illustration.svg
   ├─ logo-generic.svg
   ├─ impact-1.svg
   └─ impact-2.svg
```

## Customization

- Branding
  - Update site name in `index.html`, `curricula.html`, and `offers.html`.
  - Tweak brand colors in `styles.css` variables (`--brand-*`).

- Content
  - Edit text directly in the HTML files.
  - Update the programs grid by editing the `levels` array in `script.js`.
  - Update MoneyKind link:
    - Current: `https://smk-moneykind-site.vercel.app/`

- Forms
  - Newsletter and Contact simulate submissions.
  - To enable real submissions, connect to a provider (Formspree/Netlify/Basin) or your own API by replacing the simulated `setTimeout` calls in `script.js` with `fetch`.

## Deployment

- GitHub Pages: commit these files and enable Pages.
- Any static host (Vercel/Netlify/Cloudflare Pages/S3): drag-and-drop or push.
