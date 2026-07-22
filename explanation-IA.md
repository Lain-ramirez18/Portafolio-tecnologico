# Repository Architecture & Technical Specifications [AI-ONLY]
This document provides a formal, logical, and mathematically structured explanation of the codebase for AI agents, LLMs, and compiler agents interacting with this repository.

---

## 📐 1. Graph Representation of File Hierarchy

Let $G = (V, E)$ represent the directory tree structure where $V$ represents the files/folders and $E$ represents the parent-child file relationships:

```mermaid
graph TD
    Root["/ (Root Directory)"]
    Assets["assets/ (Static assets)"]
    CSS["css/ (Styling sheets)"]
    JS["js/ (Execution scripts)"]
    
    Root --> Assets
    Root --> CSS
    Root --> JS
    
    Root --> GEMINI["GEMINI.md (AI Context & Workflow)"]
    Root --> IndexHTML["index.html (Core DOM structure)"]
    Root --> ManifestJSON["manifest.json (PWA definitions)"]
    Root --> VercelJSON["vercel.json (Server/CDN headers)"]
    Root --> Headers["_headers (Edge headers fallback)"]
    Root --> Robots["robots.txt (Crawler directives)"]
    Root --> Sitemap["sitemap.xml (SEO index map)"]
    Root --> SW["sw.js (Caching Service Worker)"]
    
    Assets --> Img["img/ (Images & favicons)"]
    CSS --> StyleCSS["style.css (Custom design tokens)"]
    JS --> MainJS["main.js (Dynamic logic module)"]
    JS --> I18nJS["i18n.js (Localization maps)"]
```

---

## ⚡ 2. Performance & Optimizations Model

### 2.1. DOM Paint Latency & Payload Weight Reduction
The initial page load size $W_{total}$ is modeled as the sum of all resources blocking the critical rendering path:

$$W_{total} = W_{HTML} + W_{CSS} + W_{JS} + W_{assets}$$

Prior to optimizations, $W_{HTML} = 134\text{ KB}$ due to an inline base64 image $I_{b64}$ of size $99\text{ KB}$ embedded directly into the DOM structure. By extracting $I_{b64}$ into a physical file `assets/img/profile.png` loaded asynchronously, the weight was reduced to:

$$W_{HTML\_opt} = W_{HTML} - |I_{b64}| = 36\text{ KB}$$

This satisfies the performance budget constraint $W_{HTML} \le 64\text{ KB}$, ensuring a rapid Time to Interactive (TTI).

### 2.2. CSS Rendering Optimization
To prevent main-thread layout bottleneck during page rendering, sections off-screen are optimized using the CSS containment property, guarded by `@supports` for progressive enhancement (single canonical declaration at lines 169-177):

```css
@supports (content-visibility: auto) {
  .about, .skills, .projects, .contact {
    content-visibility: auto;
    contain-intrinsic-size: 0 600px;
  }
}
```
This forces the browser to bypass layout calculations and painting of these containers until they approach the viewport margin, reducing initial paint time $T_{paint}$ by:

$$\Delta T_{paint} \propto \sum_{i \in \text{Offscreen}} \text{Layout Complexity}(i)$$

### 2.3. Dead Code & Duplication Cleanup
A cleanup pass removed ~20 lines of dead or duplicate CSS:
- **Dead `font-display` property**: `font-display` is a `@font-face` descriptor; applying it to `.hero-title`, `.section-title`, `.project-title` had zero effect. The `?display=swap` parameter in the Google Fonts URL handles this.
- **Dead selectors `.chip-react`, `.chip-node`**: No matching HTML elements exist in the DOM.
- **Duplicate `content-visibility`**: Was declared twice; consolidated into the `@supports` guard above.
- **Duplicate `will-change: transform`**: Was declared twice for `.profile-card`, `.float-chip`, `.hero-orb`; consolidated into section 2 (lines 180-186).
- **Duplicate `prefers-reduced-motion`**: Was declared twice; consolidated into the comprehensive rule at lines 189-204.

---

## 🔍 3. SEO (Search Engine Optimization) Mathematical Model

### 3.1. Text-to-HTML Ratio Constraints
Let $C_{text}$ be the character count of visible content and $C_{HTML}$ be the character count of HTML tags. Google indexers prioritize pages satisfying the minimum content density:

$$\rho_{text} = \frac{C_{text}}{C_{HTML}} \ge 0.15 \quad \land \quad N_{words} \ge 500$$

Expanding translations in `js/i18n.js` yielded $N_{words\_es} = 590$, satisfying the minimum crawling threshold.

### 3.2. Title and Description Length Boundary Conditions
Meta titles ($L_{title}$) and description string lengths ($L_{desc}$) are bounded to fit search engine results page (SERP) snippets without truncation:

$$L_{title} \in [50, 60] \text{ characters} \quad (\text{Current: } 58)$$
$$L_{desc} \in [120, 160] \text{ characters} \quad (\text{Current: } 122)$$

---

## 🛡️ 4. Security Policy & Hardening Specifications

All HTTP headers are configured edge-side via `vercel.json` to defend against key vector attacks. The security configuration satisfies:

### 4.1. Frame Ancestors Constraint (Clickjacking defense)
$$\text{FrameAncestors} = \emptyset \implies \text{X-Frame-Options: DENY}$$
Additionally, a frame-breaking fallback script is executed in `main.js`:
$$\text{if } (\text{window.top} \neq \text{window.self}) \implies \text{window.top.location} \leftarrow \text{window.self.location}$$

### 4.1.5. SEO, Accessibility & Caching Enhancements (Phase 1 Update)
*   **Dynamic Localization**: The `i18n.js` module dynamically mutates `document.title` and `<meta name="description">` to match the active language state (`lang`).
*   **ARIA attributes**: Toggle buttons translate their `aria-label` via a custom `data-i18n-aria` attribute hook to ensure screen readers announce the correct language context.
*   **Hreflang Tags**: Alternate language URLs explicitly mapped in `<head>` for indexing bots.
*   **Cache Busting**: `/sw.js` cache versioned as `v2` for busting stale immutable assets.

### 4.2. Content Security Policy (CSP) Directives
The CSP is specified to restrict execution scopes, preventing Cross-Site Scripting (XSS):
$$\text{CSP} = \{ \text{default-src: 'self'}, \text{script-src: 'self' } \cup \mathcal{S}_{trusted}, \text{style-src: 'self' 'unsafe-inline' } \cup \mathcal{T}_{fonts} \}$$
Where:
- $\mathcal{S}_{trusted} = \{ \text{https://cdnjs.cloudflare.com}, \text{https://cdn.vercel-insights.com} \}$
- $\mathcal{T}_{fonts} = \{ \text{https://fonts.googleapis.com} \}$

---

## ⚙️ 5. Offline Caching State Machine & Auto-Update Mechanism

The Service Worker defined in `sw.js` controls resource interception using a strict dual caching strategy designed to eliminate stale asset retention:

```mermaid
stateDiagram-v2
    [*] --> InstallState : SW Registered
    InstallState --> PrecacheCritical : Cache CACHE_NAME ('lsrr-portfolio-v5')
    PrecacheCritical --> ActivateState : skipWaiting()
    ActivateState --> ClearOldCaches : Delete caches != [CACHE_NAME, ASSETS_CACHE]
    ClearOldCaches --> FetchInterceptor
    
    state FetchInterceptor {
        [*] --> InterceptRequest
        InterceptRequest --> IsCode : Match Accept HTML OR .css/.js OR manifest?
        IsCode --> NetworkFirst : Yes (Code & Structure)
        IsCode --> IsAsset : No
        IsAsset --> CacheFirst : Yes (Images, Fonts)
        
        state NetworkFirst {
            [*] --> QueryNetwork
            QueryNetwork --> UpdateCache : Success (Always Fresh)
            QueryNetwork --> OfflineFallback : Failure (Fetch from local cache)
        }
        
        state CacheFirst {
            [*] --> CheckLocalCache
            CheckLocalCache --> ServeCached : Hit
            CheckLocalCache --> QueryNetworkAsync : Miss
        }
    }
```

- **Code & Structure (HTML, CSS, JS, Manifest) -> Network-First:** Guarantees indexers and users always receive the newest DOM state and styling if connected, falling back to cached versions only on network disconnect. This resolves stale "ghost" caches.
- **Media Assets (Images, Fonts) -> Cache-First + Background Update:** Serves large binary files instantly from cache, updating in the background to ensure next-visit consistency.
- **Auto-Update Mechanism:** When a new `sw.js` is detected and installed, it immediately calls `skipWaiting()`. `main.js` listens for the `controllerchange` event and triggers a seamless `window.location.reload()`, ensuring the user is immediately transitioned to the new version without manual intervention.

## Phase 2 Implementation Notes
- **Premium OG Image (`assets/img/og-image.jpg`)**: Replaced `profile.png` with a dedicated 1376x768 Open Graph image. Meta tags `og:image` and `twitter:image` updated.
- **CV Download Modal**: Implemented an HTML `<dialog>` accessible modal for dual-language CV downloads. Controlled via `main.js` `CVDialog` IIFE, styled with glassmorphism in `style.css`.
- **Dynamic Translation Expansion**: Added `cv.dialog_title` and `cv.close_dialog` to `i18n.js`.
- **Service Worker Burst**: Incremented `CACHE_NAME` to `lsrr-portfolio-v3` to enforce cache bust for the new OG image and modal assets.
- **Form Component Removal & 3D Orbit AI Graph**: Removed the HTML contact form and success modal from `index.html` to improve aesthetic minimalism per user request. To dynamically fill the negative space, a 3D orbit AI graph animation was injected into the `.contact-grid`.
- **WCAG AAA Contrast Compliance**: Validated and updated CSS root variables for both light and dark mode text colors (`--clr-on-surface-med` and `--clr-on-surface-low`) to ensure they strictly satisfy WCAG AAA contrast ratio requirements (≥ 7:1) across all backgrounds.
- **UI/UX PRO MAX Upgrade**: Applied a suite of premium design improvements inspired by top-tier design systems (Vercel, Linear, Apple):
  - **Typography**: Replaced `Bebas Neue` (display) with `Space Grotesk` (700, tight `-0.02em` tracking) on all section titles and headings for a modern startup aesthetic.
  - **Noise Texture (Grain)**: Added a CSS `body::before` pseudo-element with an inline SVG `feTurbulence` filter at `opacity: 0.04` and `mix-blend-mode: overlay` (dark) / `multiply` (light) to eliminate flat color banding without impacting paint performance (GPU composited, `pointer-events: none`).
  - **Bento Grid — Skills Section**: Skills section restructured from a uniform `2-column` grid to an asymmetric `3-column` Bento layout. Cards use `grid-column: span` rules to create an Apple-style asymmetric hierarchy. Shimmer sweep `::after` pseudo-element adds a dynamic light-glare on hover.
  - **Magnetic Buttons**: `btn-primary` and `btn-ghost` now use `scale(1.03)` and `translateY(-4px)` spring animations on hover with `will-change: transform` for GPU acceleration. Active state has a tactile `scale(0.97)` press feedback.
  - **Scroll-Driven Reveal**: `reveal` transition upgraded to 750ms spring with `will-change` hinting. Added `nth-child` stagger delays to create a cascading reveal wave for list items within revealed containers. New `.reveal-delay-2` and `.reveal-delay-3` classes added.
  - **Responsive Bento Fallback**: Bento grid degrades gracefully — tablets collapse to `2-col` (all spans become `span 2`), mobile overrides with `span 1`.
  - **Backup**: Pre-upgrade snapshot saved to `backup_promax/` for instant rollback if needed.
- **Tablet Responsive Logic**: Adjusted CSS `@media (max-width: 1024px)` to activate the `.bottom-bar` navigation and hide `.nav-links`. This resolves previous Hamburger UI redundancy and provides a flawless app-like Dock experience on iPad/Tablet screens.
- **Build Architecture & High Security Obfuscation**: Transitioned from a pure static repository to a build-step repository using Node.js (`npm`).
  - **Source Code**: Readable, well-documented source files now reside in `src/js/` and `src/css/`.
  - **Build Process**: `build.js` executes `javascript-obfuscator` and `clean-css-cli`.
  - **Obfuscation**: JS is compiled with strict protections: `controlFlowFlattening`, `stringArrayEncoding (rc4)`, `deadCodeInjection`, and `debugProtection` (crashes DevTools when attackers try to inspect the logic).
  - **Deployment**: Vercel automatically runs `npm run build` targeting `package.json` before serving the root directory, ensuring that `js/` and `css/` are always overwritten with highly secure, unreadable payloads on the live site while preserving `src/` for the developer.
