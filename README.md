# Jafeer Abdullah — Developer Portfolio

A complete React, Vite, and TypeScript portfolio with a cinematic dark cover, original portraits, seven genuine projects, a certificate archive, and shared-element transitions. The design uses a charcoal base, warm typography, and restrained champagne accents.

Live portfolio: [jafeer-abdullah-portfolio.vercel.app](https://jafeer-abdullah-portfolio.vercel.app)

The header, footer, and browser icon use the `Abu.` wordmark. Jafeer Abdullah remains the portfolio's name and identity.

## Run locally

Requires Node.js 24, matching the production build configured in `package.json`.

```powershell
git clone https://github.com/jafeerabdullah/jafeer-abdullah-portfolio.git
cd jafeer-abdullah-portfolio
npm ci
npm run dev
```

Open the Local URL printed by Vite. For a production build:

```powershell
npm run build
npm run preview
```

`dist/` is the deployment-ready static site. You can deploy it to Vercel, Netlify, Cloudflare Pages, or any HTTPS static host. Set the build command to `npm run build` and the output directory to `dist`. No runtime environment variables or backend are required.

## Content and assets

- `src/data/portfolio.ts` holds profile information, project descriptions, verified repository URLs, skills, and certifications.
- The original supplied CV is served at `/documents/Jafeer-Abdullah-CV.pdf` and downloads directly from the navigation and cover.
- The cover portrait is the supplied `Monochrome Gentleman in a Dark Studio.png`, optimized as `jafeer-studio-portrait.webp`. CSS frames its silhouette without retouching the supplied face or its monochrome treatment. The About section uses the supplied outdoor photograph wearing sunglasses and a striped shirt, preserved as `jafeer-about-sunglasses.jpeg`; the shared portrait transition uses the same photo.
- ERP and Abu Fashion Store screenshots are downloaded from the respective original GitHub repositories. The Codomax Blog Website preview is an actual screenshot of its public website. Other project graphics are explicitly labeled concept visuals. Graph Performance Analyzer has its own complexity comparison illustration; Student Records & Campus Routes has a student directory card and architectural campus map. These distinct covers are shared by the project cards and their detail dialogs.
- The certificate archive includes seven unique documents: two Cisco course completion PDFs, ICTA / Open Office training, G.C.E. Ordinary Level, an Energy Club innovation award, the Ahadhiyyah intermediate examination, and Islamic Studies / Arabic Language. The two photos of the same Energy Club award are represented once. The ICTA certificate's printed recipient is preserved as supplied and confirmed by the owner.
- `/certificates/` serves five new high-resolution TapScanner JPEG scans, copied byte for byte for both preview and download. The two original Cisco PDFs are preserved, with sharp, lossless PNG previews rendered directly at 3× resolution. Preview images retain every source pixel and their complete official borders; lazy loading and asynchronous decoding avoid unnecessary initial work. Technical credentials, academic records, and other achievements have separate filters. Both Cisco courses link to the supplied Credly badge pages. Credential levels are stated as printed; course completion is not presented as professional certification.
- Fonts and images are served locally. Project screenshots and the cover portrait use optimized WebP files; the About photo is the original JPEG, and certificates use the high-resolution formats described above. No visitor-facing AI services or remote image requests are used.
- On Vercel, `vite.config.ts` derives the canonical URL and absolute social-image URLs from the public `VERCEL_PROJECT_PRODUCTION_URL` system variable, falling back to `VERCEL_URL`. Local builds use the local social-image path and omit a canonical URL. No private credentials are read or embedded in the client bundle.

## Contact form

The form validates name, email, subject, and message, then opens the visitor's email application with a prefilled draft. The visitor completes sending there. Feedback explicitly describes this behavior; the site never claims an email was delivered. A selectable, copyable draft remains available when no email handler is configured. Direct email, telephone, GitHub, and LinkedIn links are also provided.

For server-side delivery in the future, connect an actual email provider through a server endpoint, keep provider credentials server-side, and only report delivery after a successful provider response. The current site requires no secrets.

## Motion, accessibility, and 3D

`HeroHeadline` cycles through Full Stack Developer, UI/UX Designer, Digital Creator, Data Analyst, and Graphic Designer with their matching emojis. The primary role is complete on the first render; subsequent roles type at a gently varied pace, pause for two seconds, and delete before the next role. A thin bronze cursor blinks during pauses. The role span owns its timer, preserving the original tagline animation and avoiding hero-wide character updates. Timers are cleaned up and pause offscreen or in hidden tabs. Reduced motion displays the complete primary role with a static cursor; the heading's stable accessible name and native tooltip include all five roles without per-character announcements. `HeroTypewriter.css` reserves the original line height and keeps all roles on one line.

Project details use Motion's shared `layoutId` values for the card, visual, category, and title, with coordinated forward and reverse transitions. The dialog supports Escape, focus trapping, focus restoration, inert background content, backdrop dismissal, and scroll locking.

The Projects section presents all seven projects in a responsive 3D card stack with category filters, previous/next controls, direct selection, keyboard navigation, and touch swipes. Skills use a category-based circular gallery with original colored logos, a glossy selected icon, and a keyboard-accessible list. Both reuse the installed Motion dependency, preserve the original content, and respect reduced motion.

The skills wheel automatically completes a slow 72-second clockwise orbit, eases through a stop, then reverses for the next full orbit. The central logo, name, and counter update as each skill reaches the bottom selection position. Manual selection uses the existing spring and pauses automatic rotation for four seconds without resetting cycle progress; hover, keyboard focus, active gestures, hidden tabs, and an offscreen wheel also pause rotation. A small pause/resume control is available in the wheel's upper corner. Category changes keep the current direction and restart a valid cycle for their own skill count. A bounded CSS layer adds diffused violet, indigo, teal, and champagne light with 26 subtle stars; it never captures input or creates a canvas. Background animations pause offscreen and in hidden tabs. Reduced motion disables automatic rotation and background animation while retaining all manual controls.

Certificate cards morph into a dark document reader with fit-to-view, zoom, scrollable documents, original downloads, and the same keyboard and background handling. The dedicated Certificates navigation link participates in the section morph transitions. The new supplied scans are already upright and are displayed without image edits.

The certificate section reuses `src/components/CertificateCard.tsx`, `Certificates.tsx`, and `Certificates.css` for a CSS 3D coverflow. The centered active card is at most 420 × 480px; smaller, inward-rotated side cards show the previous and next documents. Fixed preview and metadata rows keep titles, issuers, dates, and actions stable, with full descriptions and achievements retained in the existing document reader. Previous/next buttons, clickable side cards, mouse dragging, real touch swipes, and focused-gallery arrow/Home/End keys navigate all seven documents and the existing category filters. A counter and progress line identify the active document. Inactive card contents are inert, only nearby selection controls are exposed, and selection is announced in a polite live region. There is no autoplay or new WebGL canvas. Motion animates springs and entrance; reduced motion uses immediate, flat positioning. Mobile filters remain visible in two columns.

`NavigationDepth.css` adds a dark translucent capsule behind the desktop links, subtle hover elevation, a softly raised résumé button, and matching mobile menu surfaces. The gold active dot fades smoothly; the section observer retains intersection state with a small switching margin to avoid flickering at boundaries.

Every certificate uses the same preview dimensions at each breakpoint. Images fill a consistent element with `object-fit: contain` and centered positioning, preserving the complete portrait or landscape document. Gallery and reader backgrounds use dark charcoal, with no white container frames, image borders, or image shadows. Titles, issuers, dates, descriptions, badge links, download functionality, zoom, and morph transitions are preserved.

On desktop, the hero portrait stays in view and transforms into the About photograph as the page scrolls: position, size, frame radius, and the two real images interpolate continuously. Scrolling back reverses the same transition. The bridge is disabled on narrow screens and for reduced motion.

The portrait's subtle bronze “Meet Me” control opens the reusable `IntroVideoModal`. The existing homepage markup changes only to mount `IntroVideoExperience`; its portrait, layout, styles, and navigation remain intact. The control appears on portrait hover or keyboard focus and stays visible on touch devices and narrow screens. Its transparent overlay lets existing homepage links receive clicks.

`public/videos/jafeer-intro.mp4` is an exact copy of the supplied `Abdullah_Intro.mp4` (1920 × 1080, H.264/AAC, about 24 seconds). The video is requested only when the modal opens and starts only after an explicit Play or Replay action. The charcoal dialog provides seeking, play/pause, mute, volume, replay, a completion-only “Explore My Work” action, focus trapping/restoration, Escape and backdrop dismissal, scroll preservation, reduced motion, and a direct-video fallback if loading fails. No dependencies were added.

Section links use the browser View Transition API to morph the actual section image and heading while the new page opens through an asymmetric rounded aperture. Unsupported browsers receive a rounded aperture transition without taking a snapshot. Back navigation, keyboard focus, interrupted navigation, and reduced motion are handled; Escape finishes a running transition. Normal manual scrolling remains available.

The decorative Three.js / React Three Fiber / Drei sculpture is lazy-loaded only near the education section, on capable desktop devices with a fine pointer and WebGL2. It unmounts when offscreen. Mobile, reduced-motion, and unsupported environments receive a static fallback. A rendering boundary prevents scene failures from affecting the portfolio.

The site includes a skip link, visible keyboard focus, semantic sections, labeled forms and errors, a collapsible mobile menu, active navigation, image alt text, and reduced-motion support.

## Browser checks

```powershell
npm run build
npm run test:e2e
```

The Playwright checks use the installed Google Chrome browser and launch a local production preview automatically. They cover:

- All project previews, source links, category filters, stack navigation, and accessible detail dialogs.
- Certificate sources, original downloads, Credly links, full-image containment, coverflow interactions, and reader controls.
- Colored skill logos, category selection, keyboard controls, responsive orbit layouts, and asset attribution hashes.
- The complete five-role typewriter cycle, introduction video playback and controls, portrait morph, section transitions, and Back navigation.
- Contact form validation, honest email drafts, mobile navigation, layouts at 320–1440px, focus handling, and reduced motion.

Tests, configuration, icon licenses, and active assets are retained. Obsolete certificate previews, superseded portraits, old review screenshots, and temporary preparation scripts have been removed. Test runs may recreate ignored `.local/` screenshots, `test-results/`, and the TypeScript build cache; these generated files are not needed to run or deploy the site.

## Deploy on Vercel

Import [jafeerabdullah/jafeer-abdullah-portfolio](https://github.com/jafeerabdullah/jafeer-abdullah-portfolio) into your Vercel account and select the `main` production branch. The application is at the repository root; leave Root Directory as `./`.

`vercel.json` records the deployment settings:

- Framework: Vite.
- Install command: `npm ci`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Node.js: `24.x`, from `package.json`.
- Environment variables: none required. Vercel's automatically provided public hostname is used only for social metadata.

Navigation uses section hashes such as `/#skills` and `/#projects`, so reloading those links requests the root page and retains the selected section. The site has no server-side routes or API endpoints.

Authorize Vercel's GitHub integration for this repository when prompted. Once connected, pushes to `main` trigger production deployments; other branches receive previews. The Git connection must be confirmed in the Vercel project before relying on automatic deployments.

For future updates:

```powershell
npm run build
npm run test:e2e
git add .
git commit -m "Update portfolio"
git push origin main
```

Generated builds, installed dependencies, test output, local environment files, and local deployment state in `.vercel/` or `.openai/` are excluded from Git. The original CV, introduction video, project covers, certificate documents, icon sources, and their licenses are included.
