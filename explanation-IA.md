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
To prevent main-thread layout bottleneck during page rendering, sections off-screen are optimized using the CSS containment property:

```css
.about, .skills, .projects, .contact {
  content-visibility: auto;
  contain-intrinsic-size: 0 600px;
}
```
This forces the browser to bypass layout calculations and painting of these containers until they approach the viewport margin, reducing initial paint time $T_{paint}$ by:

$$\Delta T_{paint} \propto \sum_{i \in \text{Offscreen}} \text{Layout Complexity}(i)$$

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

### 4.2. Content Security Policy (CSP) Directives
The CSP is specified to restrict execution scopes, preventing Cross-Site Scripting (XSS):
$$\text{CSP} = \{ \text{default-src: 'self'}, \text{script-src: 'self' } \cup \mathcal{S}_{trusted}, \text{style-src: 'self' 'unsafe-inline' } \cup \mathcal{T}_{fonts} \}$$
Where:
- $\mathcal{S}_{trusted} = \{ \text{https://cdnjs.cloudflare.com}, \text{https://cdn.vercel-insights.com} \}$
- $\mathcal{T}_{fonts} = \{ \text{https://fonts.googleapis.com} \}$

---

## ⚙️ 5. Offline Caching State Machine (Service Worker Lifecycle)

The Service Worker defined in `sw.js` controls resource interception using a dual caching strategy:

```mermaid
stateDiagram-v2
    [*] --> InstallState : SW Registered
    InstallState --> PrecacheCritical : Cache CACHE_NAME ('lsrr-portfolio-v1')
    PrecacheCritical --> ActivateState
    ActivateState --> ClearOldCaches : Delete caches != [CACHE_NAME, ASSETS_CACHE]
    ClearOldCaches --> FetchInterceptor
    
    state FetchInterceptor {
        [*] --> InterceptRequest
        InterceptRequest --> IsHTML : Match Accept HTML?
        IsHTML --> NetworkFirst : Yes
        IsHTML --> IsAsset : No
        IsAsset --> CacheFirst : Yes (CSS, JS, Images)
        
        state NetworkFirst {
            [*] --> QueryNetwork
            QueryNetwork --> UpdateCache : Success
            QueryNetwork --> OfflineFallback : Failure (Fetch from local cache)
        }
        
        state CacheFirst {
            [*] --> CheckLocalCache
            CheckLocalCache --> ServeCached : Hit
            CheckLocalCache --> QueryNetworkAsync : Miss
        }
    }
```

- **HTML (Network-First):** Guarantees indexers and users always receive the newest DOM state if connected, falling back to cached cache on network disconnect.
- **Assets (Cache-First + Background Update):** Serves CSS/JS instantly from cache, updating in the background to ensure next-visit consistency.
