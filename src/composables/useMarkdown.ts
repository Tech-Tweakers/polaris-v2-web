import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

marked.use({ async: false });
marked.setOptions({ breaks: true });

marked.use({
  renderer: {
    code({ text, lang }) {
      const validLang = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language: validLang }).value;
      const codeId = `code-${Math.random().toString(36).slice(2, 8)}`;

      return `
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-lang">${validLang}</span>
            <span class="copy-hint" data-target="${codeId}">copiar código</span>
          </div>
          <pre><code id="${codeId}" class="hljs ${validLang}">${highlighted}</code></pre>
        </div>
      `;
    },
  },
});

export function renderMarkdown(text: string = ''): string {
  if (!text || text.trim() === '') return '';

  try {
    return marked.parse(text.trim()) as string;
  } catch (error) {
    console.error('Erro no parsing Markdown:', error);
    return text.trim();
  }
}

export function setupCopyHandler(): void {
  if (typeof window === 'undefined') return;
  if ((window as any).__copyHandlerAdded) return;
  (window as any).__copyHandlerAdded = true;

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('copy-hint')) {
      const codeId = target.getAttribute('data-target');
      const codeEl = document.getElementById(codeId ?? '');
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.innerText).then(() => {
          target.innerText = 'copiado!';
          setTimeout(() => (target.innerText = 'copiar código'), 1500);
        });
      }
    }
  });
}
