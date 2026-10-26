# Portfolio SEO and indexing

Production: https://jafeer-abdullah-portfolio.vercel.app/

## Audit and implementation

The site is React + TypeScript + Vite, hosted on Vercel. It has one homepage with section anchors; project details are dialogs, not separate routes. No custom domain was configured in the inspected Vercel account.

Before this update, sharing tags and a production canonical existed, but the HTML app container was empty. There was no robots.txt, sitemap, or JSON-LD. Metadata now comes from `src/data/seo.ts` through the Vite HTML plugin, using the verified production domain for every build. Preview deployments and development use `noindex, follow`; production uses `index, follow, max-image-preview:large`. Vercel's deployment protection remains unchanged.

The page has one descriptive title and description, one canonical, complete Open Graph and Twitter card tags, image dimensions and alternative text, and accurate Person/WebSite JSON-LD. Profile information and skills come from the actual portfolio data. No invented project URLs, qualifications, employment, ratings, or search functionality are included.

`public/sitemap.xml` contains only the canonical homepage, with no fragment URLs or fabricated last-modified dates. `public/robots.txt` permits crawling and identifies the sitemap. If a custom production domain is added later, update the SEO configuration and both files together, then set the preferred domain in Vercel.

## Rendering and assets

`npm run build` type-checks and builds the client, then `scripts/prerender.mjs` renders the existing React application with `react-dom/server`. The resulting static HTML hydrates on the client. No runtime server or browser installation is required. A `<noscript>` document provides usable links and the same real project, skill, and certificate data when JavaScript is disabled; it is not shown to visitors using the interactive portfolio.

The shared reduced-motion hook keeps server and initial hydration output consistent, then follows the visitor's current and future OS preference. The existing hero, section reveals, skill orbit, portrait transitions, dialogs, and Three.js scene retain their design. No production stylesheet was changed.

The existing 1440 × 756 branded sharing image is publicly served at `/images/social-cover.jpg`. The hero portrait remains a high-priority WebP with explicit dimensions. Two critical local WOFF2 fonts are preloaded. Below-the-fold images keep their explicit dimensions, correct proportions, and lazy/asynchronous loading. Original certificate scans, the introduction video, and vendor icon source files are preserved. The Three.js chunk remains lazy and is not requested on the initial mobile viewport; its existing large-chunk build warning is retained.

The supplied `Jafeer_Abdullah_Resume .pdf` replaces the old PDF byte for byte at the existing `/documents/Jafeer-Abdullah-CV.pdf` URL. Both download links therefore remain compatible. The About introduction now says “I’m Jafeer Abdullah.”

## Validation

Run locally with Node.js 24:

```sh
npm run build
npm run test:e2e
```

`tests/seo.spec.ts` checks raw prerendered content, unique metadata, valid JSON-LD syntax and real profile data, canonical sitemap XML, crawling directives, internal anchors and resource links, unchanged résumé bytes, the full About name, a usable mobile document without JavaScript, and hydration without browser errors with both motion preferences. The existing interaction suite covers the galleries, projects, skills, video, responsive layouts, and reduced motion.

Local structured-data validation does not establish Google rich-result eligibility. Google Rich Results Test and PageSpeed Insights have not been run as part of these automated checks. There is no field INP or Search Console indexing result available from this workspace.

### Measured mobile performance

Three cold Chrome runs before and after the update used a 390 × 844 viewport, 4× CPU throttling, 70 ms network latency, and 200 kB/s download throughput. Buffered LCP and layout-shift observers ran until six seconds after load. These are local lab samples, not Lighthouse scores or field Core Web Vitals.

| Metric | Before | After |
| --- | ---: | ---: |
| Median LCP | 5,220 ms | 6,732 ms |
| Median CLS (maximum session window) | 0.00006 | 0.00011 |
| Initial Three.js chunk requests | 0 | 0 |

The initial before/after run did not establish an LCP improvement. A follow-up diagnostic alternated three client-rendered and three prerendered loads using the same current bundles and throttling, intercepting only the HTML document for both variants. Median first contentful paint was 5,540 ms for client rendering and 2,940 ms for prerendering; median LCP was 6,504 ms and 6,104 ms respectively. That diagnostic excludes document network timing and is not interchangeable with the first table. It shows earlier visible content, but does not justify a general speed or field-CWV claim. The prerendered LCP candidate was the animated H1; further mobile LCP work remains, while the requested hero animations are preserved.

The production build and all 48 Playwright checks passed locally, including normal/reduced-motion hydration and desktop/mobile interaction coverage. The existing lazy Three.js chunk warning remains.

All seven repository URLs, the public Codomax site, the GitHub profile, and both Credly badges returned HTTP 200 during the external-link check. LinkedIn rejected the automated HEAD request with HTTP 405, so that profile's availability was not established by the check. No link was guessed or substituted.

## Google Search Console: owner steps

1. Open [Google Search Console](https://search.google.com/search-console/) in your Google account. Add a **URL-prefix** property for `https://jafeer-abdullah-portfolio.vercel.app/`. The Vercel subdomain is appropriate for URL-prefix verification; you do not control the DNS zone for `vercel.app`.
2. Choose **HTML file** verification, matching the downloaded file supplied for this property. Its exact contents are kept in `public/google6a9b34cd85afa87d.html` and deployed at the same filename in the site root. Return to Search Console and click **Verify** once that URL is publicly accessible. Keep the file in the project and future deployments after verification succeeds. No environment variable is needed for this method. The optional `GOOGLE_SITE_VERIFICATION` build variable remains available if you later choose HTML-tag verification instead.
3. Under **Sitemaps**, submit `https://jafeer-abdullah-portfolio.vercel.app/sitemap.xml` and check its processing status.
4. Use **URL inspection** for the exact homepage URL, run the live test, and request indexing if available. Inspect any reported fetch, canonical, or indexing issue before retrying.
5. Monitor **Page indexing** for exclusions or errors and **Performance → Search results** for queries, impressions, clicks, and average position as data appears. Inspect Core Web Vitals when sufficient real-user data is available.

These steps require the owner's Google account. No ownership verification, indexing request, or successful Google indexing is claimed by this implementation. Sitemaps and valid metadata do not guarantee indexing or ranking.

References: [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), and [ownership verification](https://support.google.com/webmasters/answer/9008080).

Optional owner checks: [Rich Results Test](https://search.google.com/test/rich-results) and [PageSpeed Insights](https://pagespeed.web.dev/). Person/WebSite schema describes the portfolio; it does not promise a Google rich result.


