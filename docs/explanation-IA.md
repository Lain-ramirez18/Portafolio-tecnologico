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
    Docs["docs/ (Documentation)"]
    
    Root --> Assets
    Root --> CSS
    Root --> JS
    Root --> Docs
    
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
    Docs --> ExpIA["explanation-IA.md"]
    Docs --> ExpLain["explanation-LAIN.md"]
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

- **Custom Branding Styling (Phase 5 Update)**: Reverted the navbar logo back to the text `[LSRR]`. Styled the 3D orbit core logo (`.orbit-center`) using pure CSS (`background: #000000;`, `color: #FFFFFF;`, `font-family: 'Space Grotesk'`) to match the user's reference image style without relying on raster images. Generated a crisp vector SVG (`favicon.svg`) with the same black background and white `LR` text for infinite resolution. `sw.js` cache bumped to `v7`.
  - **Backup**: Pre-upgrade snapshot saved to `backup_promax/` for instant rollback if needed.
- **Tablet Responsive Logic**: Adjusted CSS `@media (max-width: 1024px)` to activate the `.bottom-bar` navigation and hide `.nav-links`. This resolves previous Hamburger UI redundancy and provides a flawless app-like Dock experience on iPad/Tablet screens.
- **Build Architecture & High Security Obfuscation**: Transitioned from a pure static repository to a build-step repository using Node.js (`npm`).
  - **Source Code**: Readable, well-documented source files now reside in `src/js/` and `src/css/`.
  - **Build Process**: `build.js` executes `javascript-obfuscator` and `clean-css-cli`.
  - **Obfuscation**: JS is compiled with strict protections: `controlFlowFlattening`, `stringArrayEncoding (rc4)`, `deadCodeInjection`, and `debugProtection` (crashes DevTools when attackers try to inspect the logic).
  - **Deployment**: Vercel automatically runs `npm run build` targeting `package.json` before serving the root directory, ensuring that `js/` and `css/` are always overwritten with highly secure, unreadable payloads on the live site while preserving `src/` for the developer.

- **Skills Bento Grid Rebalance & IA Card Enhancement (Phase 6)**:
  - **Grid change**: `grid-template-columns` reverted from `repeat(4, 1fr)` (asymmetric `span 3 + span 1`) to `repeat(2, 1fr)` (symmetric `span 1` for all 4 children). This eliminates the disproportionate 75%/25% desktop split on `.skill-category:nth-child(3)` / `:nth-child(4)`.
  - **IA card accent**: `.skill-category:nth-child(3)` receives `background: linear-gradient(135deg, surface-2, color-mix(primary 6%, surface-2))` and `border-color: color-mix(primary 30%, border)` to visually distinguish it without breaking the design system.
  - **Decorative watermark**: `::before` pseudo-element on `:nth-child(3)` renders the Font Awesome `\f544` (fa-robot) glyph at `6rem / opacity: 0.04` — purely cosmetic, `pointer-events: none`, `user-select: none`.
  - **Hover glow**: `:nth-child(3):hover` adds `box-shadow: 0 8px 40px color-mix(primary 18%, transparent)` for a themed depth effect.
  - **Pill stagger animation**: `.skill-tag-pill` now enters with `animation: pill-enter 0.4s forwards` (opacity 0→1, translateY 8px→0). Delays are scoped to `nth-child(3) .skill-tag-pill:nth-child(n)` at 50ms increments (50ms–400ms).
  - **Mobile reset**: `@media (max-width: 768px)` overrides `.skill-category:nth-child(3)` back to `background: surface-2` and resets `border-color` to prevent color-mix artifacts; `::before` font-size reduced to `4rem`.
  - **Tablet**: `@media (max-width: 1024px)` already used 2-col equal-span — comments updated for clarity.

- **Industry Best Practices Audit & Sprint 1+2 Implementation (Phase 7)**:
  - **XSS fix — ToastManager**: `toast.innerHTML = \`...\`` replaced with `document.createElement` + `textContent`. Dynamic message strings can no longer inject HTML. `addEventListener('animationend', ..., { once: true })` prevents event listener leaks.
  - **RAF loop optimization — CustomCursor**: Loop now uses a `running` boolean flag + early return when `|cx - fx| < 0.5 && |cy - fy| < 0.5`. Saves ~60 calls/s when cursor is idle. `startLoop()` guard prevents duplicate RAF chains.
  - **pill-enter animation scoped correctly**: Pills changed from `opacity: 0` (global) → `opacity: 1` (global default). The `animation: pill-enter` is now scoped to `.skill-category.visible .skill-tag-pill` — only fires after the IntersectionObserver adds `.visible` to the parent. Prevents invisible pills on cards that haven't entered the viewport.
  - **`prefers-reduced-motion` override**: Added explicit `{ opacity: 1 !important; transform: none !important; animation: none !important; }` for `.skill-tag-pill` inside the `@media (prefers-reduced-motion: reduce)` block — overrides the scoped animation.
  - **hreflang corrected**: Removed duplicate `hreflang="es"` and `hreflang="en"` links pointing to the same canonical URL. Per Google's multi-regional/multilingual guidelines, a single-URL SPA with client-side i18n should only declare `hreflang="x-default"`. Duplicate same-URL alternates cause Google to arbitrarily pick a language signal.
  - **`color-scheme` meta**: `<meta name="color-scheme" content="dark light">` added. Allows browsers to style native UI elements (scrollbars, form inputs, `<select>`, `<date>`) with OS-matched dark/light rendering. Complement to `data-theme` CSS attribute.
  - **`aria-modal="true"` on `<dialog>`**: Explicit attribute added. While the native `<dialog>` element has implicit ARIA role `dialog`, adding `aria-modal="true"` ensures compatibility with AT (Assistive Technologies) that don't fully implement the implicit semantics, particularly NVDA + Firefox and older VoiceOver versions.
  - **Google Fonts `display=swap`**: URL already contained `display=swap` — confirmed correct. Prevents FOIT by showing fallback font while custom font loads (font-display: swap behavior).
  - **DOM order fix — bottom-bar**: `<nav class="bottom-bar">` moved before `<footer>` in source order. Correct semantic order: `<main>` → navigational chrome (`<nav>`) → `<footer>`. Screen readers and AT navigate by source order, not visual position.
  - **Dead code isolation**: `ContactForm` module retained but `init()` returns early on `if (!form) return` since `#contact-form` was removed from HTML when the orbit animation replaced the contact form. No execution overhead.
  - **Folder Restructuring & Build system**: Removed the obsolete `/src` folder, directing `build.js` to construct `public/` directly from root `css` and `js` source files, complying with the stated structural rule and eliminating duplication.
  - **WCAG AAA Compliance**: Injected `:focus-visible` UI state improvements in `css/style.css` matching WCAG AAA contrast ratio requirements (3px solid cyan outline with offset). Corrected primary buttons contrast for readability (#0B0D12 on cyan).
  - **Fluid Typography (Chrome UX)**: Leveraged CSS `clamp()` capabilities to map `font-size` adaptively to viewport width instead of discrete breakpoints. Integrated `prefers-reduced-motion` override.

### 4.1.6. Pro Max Cache & UI Enhancements (Phase 8 Update)
*   **Stale-While-Revalidate Caching**: `sw.js` upgraded to `Stale-While-Revalidate` for all requests, ensuring instant load times (cache-first delivery) combined with background network synchronization to update the cache for the next reload. Cache version bumped to `v8`.
*   **Proactive Auto-Update Sync**: In `main.js`, an event listener for `visibilitychange` triggers `reg.update()` whenever the tab becomes visible, forcing the browser to check for Service Worker byte-level changes and initiating an auto-refresh via the controllerchange listener without user intervention.
*   **Universal 3D Tilt**: `CardTilt` logic generalized to apply a 3D perspective rotation (`perspective(1000px) rotateY/X`) to `.project-card`, `.about-card`, and `.cert-item-card`, enhancing spatial depth.
*   **Interactive Neural Canvas**: Added a `HeroCanvas` module that dynamically renders an interactive, physics-based 3D particle network (constellation effect) in the hero section, replacing the static CSS grid for a PRO MAX visual experience.

### 4.1.7. Smart Prefetch & Contact Section Redesign (Phase 9 Update)
*   **SmartPrefetch Module**: Replaced `injectPerfHints` IIFE with a proper `SmartPrefetch` singleton. Uses a two-tier strategy: `IntersectionObserver` (`rootMargin: 50px`) triggers `preconnect` + `dns-prefetch` for external link origins when they enter the viewport, and `mouseenter`/`touchstart` events trigger a full `prefetch` `<link>` injection on user intent. Deduplication via `Set`. Respects `connection.saveData` and `2g` effective type via the Network Information API.
*   **Contact Section Redesign**: Replaced `.hero-socials` + `.social-chip` pattern in the contact section with a `.contact-links-grid` (2-col grid) of `.contact-link-card` components. Each card contains a branded `.clc-icon`, `.clc-label`, `.clc-sub`, and a `.clc-arrow` that animates on hover. Brand-specific RGBA backgrounds applied per platform (WhatsApp #25D366, LinkedIn #0A66C2, etc.).
*   **Copy Change**: Removed trailing clause "— mi línea siempre está abierta" from `contact.desc` in `index.html`.

### 4.1.8. Interactive AI Suite & Full UX Upgrade (Phase 10 Update)
*   **Interactive AI Terminal CLI (`AITerminal`)**: Integrated a retro-futuristic AI CLI modal (`#terminal-dialog`) launched via Hero button (`#btn-open-terminal`). Built with full keyboard controls (`Esc` to close, auto-focus input, command history auto-scroll). Supports interactive commands: `help`, `bio`, `stack`, `projects`, `contact`, `ai`, `clear`, `date`, `whoami`, and `exit` with custom prompt formatting (`visitor@lsrr-agent`).
*   **Project Deep-Dive Modals (`ProjectDetailModal`)**: Added a "Ver detalles" button to every project card launching a detailed breakdown dialog (`#project-modal`). Dynamically populates problem statements, architecture choices (Offline-First, LLaMA 3.3-70B + Groq API + Docker), key technical metrics, and direct live/repo CTAs.
*   **One-Click Copy to Clipboard (`CopyManager`)**: Embedded inline copy buttons (`.clc-copy-btn`) within contact cards for Email (`lainramirez18@gmail.com`) and WhatsApp/Phone (`+57 3209735859`). Executes `navigator.clipboard.writeText` with immediate bilingual Toast feedback (`ToastManager.show()`).
*   **Interactive Skills Filter (`SkillsFilterManager`)**: Added a category filter pill bar (`.skills-filter-wrap`) in the `#skills` section. Enables real-time filtering across `all`, `frontend`, `backend`, `ai`, `tools`, and `soft` categories using `.filtered-out` CSS state mapping.
*   **Animated Counter Statistics (`CounterAnim`)**: Instrumented `.stat-number[data-counter]` with an `IntersectionObserver` trigger that smoothly animates target metric counters upon viewport entrance.
*   **Security CSP Consolidation**: Synchronized Content Security Policy declarations across `vercel.json`, `_headers`, and `<meta http-equiv="Content-Security-Policy">` in `index.html` ensuring strict multi-origin compatibility for `formsubmit.co`, `vercel-insights.com`, `cdnjs.cloudflare.com`, and `fonts.googleapis.com`.
*   **Accessibility & ARIA Audit**: Enforced `aria-hidden="true"` on 3D orbit nodes and added semantic `aria-label` tags for screen readers.

