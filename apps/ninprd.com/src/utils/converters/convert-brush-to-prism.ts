// Regular expression to match the brush class syntax and capture content
const brushRegex = /<pre class="brush:\s*([^;]+);[^>]*>([\s\S]*?)<\/pre>/gi;

const languageMap: { [key: string]: string } = {
  jscript: "javascript",
  ts: "typescript",
  css: "css",
  html: "html",
};

// Function to convert brush language to Prism language class and wrap with <code>
function convertAndWrap(
  match: string,
  brushLang: string,
  content: string
): string {
  const trimmedBrushLang = brushLang.trim();
  const prismLang = languageMap[trimmedBrushLang] || trimmedBrushLang;
  return `<pre class="language-${prismLang}"><code class="language-${prismLang}">${content}</code></pre>`;
}

export function convertBrushToPrism(htmlString: string): string {
  // Perform the replacement and wrapping
  return htmlString.replace(brushRegex, convertAndWrap);
}
