/**
 * Copy text to clipboard in a way that works across devices and contexts:
 * - Secure context (HTTPS/localhost): uses navigator.clipboard
 * - Insecure context or when clipboard API fails (e.g. some PCs, HTTP): fallback to execCommand
 * - Mobile/tablet: clipboard API usually works when triggered by user gesture; fallback helps older browsers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Prefer modern clipboard API (works on secure context + user gesture)
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback (e.g. permission denied, insecure context)
    }
  }

  // 2. Fallback: temporary input + execCommand (works on HTTP, older browsers, most PCs)
  try {
    const input = document.createElement("input");
    input.setAttribute("value", text);
    input.setAttribute("readonly", "");
    input.style.position = "absolute";
    input.style.left = "-9999px";
    input.style.top = "0";
    document.body.appendChild(input);

    const range = document.createRange();
    range.selectNodeContents(input);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    input.select();
    input.setSelectionRange(0, text.length);

    const ok = document.execCommand("copy");
    document.body.removeChild(input);
    selection?.removeAllRanges();
    return ok;
  } catch {
    return false;
  }
}
