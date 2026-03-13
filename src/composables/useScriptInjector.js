/**
 * useScriptInjector.js — Safe DOM Script Injection Composable
 *
 * Safely injects raw HTML strings (containing <script> and other tags) into
 * document.head or document.body. Unlike v-html, this approach ensures that
 * <script> elements are actually executed by the browser.
 *
 * Usage:
 *   const { injectScripts } = useScriptInjector()
 *   injectScripts(headerHtml, footerHtml)
 *
 * Call injectScripts once per session — the composable keeps an internal flag
 * to prevent duplicate injection across hot-reloads or route changes.
 *
 * Security note:
 *   Only Google Ads / Analytics snippets should be placed in these fields.
 *   The backend MUST restrict access to the PUT /settings endpoint to
 *   admin/owner roles — never expose this form to regular users.
 */

let injected = false;

/**
 * Re-create a <script> element so the browser actually executes it.
 * Cloning an existing <script> node does NOT re-execute it.
 *
 * @param {HTMLScriptElement} sourceEl
 * @returns {HTMLScriptElement}
 */
function cloneExecutableScript(sourceEl) {
  const script = document.createElement("script");

  // Copy all attributes (src, async, defer, type, data-* etc.)
  Array.from(sourceEl.attributes).forEach((attr) => {
    script.setAttribute(attr.name, attr.value);
  });

  // Copy inline script text (must set textContent, not innerHTML)
  if (sourceEl.textContent) {
    script.textContent = sourceEl.textContent;
  }

  return script;
}

/**
 * Parse an HTML string and append each top-level element to `container`.
 * <script> elements are re-created so the browser executes them.
 *
 * @param {string} htmlString  Raw HTML to inject
 * @param {Element} container  document.head or document.body
 */
function injectHtml(htmlString, container) {
  if (!htmlString?.trim()) return;

  const tmp = document.createElement("div");
  tmp.innerHTML = htmlString;

  Array.from(tmp.children).forEach((el) => {
    if (el.tagName === "SCRIPT") {
      container.appendChild(cloneExecutableScript(el));
    } else {
      container.appendChild(el.cloneNode(true));
    }
  });
}

/**
 * Composable factory.
 *
 * Calling `useScriptInjector()` returns a single `injectScripts` function.
 * The first call with non-empty strings performs the injection; subsequent
 * calls are silently ignored (session-level singleton).
 */
export function useScriptInjector() {
  /**
   * Inject header_scripts into <head> and footer_scripts into <body>.
   *
   * @param {string} [headerHtml]  Scripts for <head>
   * @param {string} [footerHtml]  Scripts for <body>
   * @param {boolean} [force=false] Re-inject even if already done (dev use)
   */
  function injectScripts(headerHtml, footerHtml, gaId = "", adsId = "", force = false) {
    if (injected && !force) return;

    // 1. Google Tag (gtag.js) Boilerplate
    // If either ID is provided, we inject the foundational Google Tag script
    const primaryId = gaId || adsId;
    if (primaryId) {
      const gTagScript = document.createElement("script");
      gTagScript.async = true;
      gTagScript.src = `https://www.googletagmanager.com/gtag/js?id=${primaryId}`;
      document.head.appendChild(gTagScript);

      const gTagConfig = document.createElement("script");
      gTagConfig.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        ${gaId ? `gtag('config', '${gaId}');` : ""}
        ${adsId ? `gtag('config', '${adsId}');` : ""}
      `;
      document.head.appendChild(gTagConfig);
    }

    // 2. Custom HTML Scripts from Database
    if (headerHtml) injectHtml(headerHtml, document.head);
    if (footerHtml) injectHtml(footerHtml, document.body);

    injected = true;
  }

  return { injectScripts };
}
