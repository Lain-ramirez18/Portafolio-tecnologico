# Project Instructions - Portafolio Tecnológico (Claude Version)

## Workflows

### Documentation Updates
- **Mandatory Update:** Every time a change is made to the codebase (structure, logic, or assets), you MUST update the following files:
    - `docs/explanation-IA.md`: Formal, mathematical, and logical explanation for AI agents.
    - `docs/explanation-LAIN.md`: Human-readable, easy-to-understand explanation for the user.

## Conventions
- **Structure:** Keep the repository organized with clear separations:
    - `/docs/`: Project documentation and explanations.
    - `/assets/img/`: Images and icons.
    - `/assets/docs/`: Documents and PDFs.
    - `/css/`: Stylesheets.
    - `/js/`: Scripts and logic.
- **Security:** Ensure security headers are maintained in `vercel.json` and `_headers`.
- **Performance:** Maintain low HTML weight and optimize assets using `npm run build`.
- **Accessibility:** UI components, buttons, and text must adhere to WCAG AAA standards. Ensure correct color contrast, screen reader compatibility, and focus states (`:focus-visible`).
- **Responsive & Adaptive:** Ensure Chrome UX best practices are followed and the page works fluidly across desktop, tablet, and mobile breakpoints.
