
# Project Instructions - Portafolio Tecnológico

## Workflows

### Documentation Updates
- **Mandatory Update:** Every time a change is made to the codebase (structure, logic, or assets), you MUST update the following files:
    - `docs/explanation-IA.md`: Formal, mathematical, and logical explanation for AI agents.
    - `docs/explanation-LAIN.md`: Human-readable, easy-to-understand explanation for the user.

## Conventions
- **Structure:** Keep the repository organized with clear separations (Astro (SSG) + React + TypeScript, since the Phase 12/13 migrations):
    - `/docs/`: Project documentation and explanations.
    - `/public/assets/img/`: Images and icons.
    - `/public/assets/docs/`: Documents and PDFs.
    - `/src/pages/index.astro`: Entry point — pre-renders `<App>` to static HTML.
    - `/src/styles/`: Stylesheets.
    - `/src/`: Components, hooks, contexts, i18n, and data — see `docs/explanation-IA.md` §6–7 for the full layout.
- **Security:** Ensure security headers are maintained in `vercel.json` and `_headers`.
- **Performance:** Maintain low HTML weight and optimize assets using `npm run build`.
