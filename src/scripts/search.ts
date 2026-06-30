interface SearchEntry {
  slug: string;
  title: string;
  content: string;
  tags: string[];
}

interface ScoredEntry {
  entry: SearchEntry;
  score: number;
  matchContent: string;
}

let searchIndex: SearchEntry[] | null = null;
let searchLoadPromise: Promise<void> | null = null;
let containerEl: HTMLDivElement | null = null;
let inputEl: HTMLInputElement | null = null;
let dropdownEl: HTMLDivElement | null = null;
let currentFocusIndex = -1;
let debounceTimer: number | null = null;
let isOpen = false;

const searchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSnippet(content: string, queryWords: string[], contextChars = 80): string {
  const lower = content.toLowerCase();
  let firstMatch = -1;
  for (const word of queryWords) {
    const pos = lower.indexOf(word);
    if (pos !== -1 && (firstMatch === -1 || pos < firstMatch)) firstMatch = pos;
  }
  if (firstMatch === -1) return '';
  const start = Math.max(0, firstMatch - contextChars);
  const end = Math.min(content.length, firstMatch + contextChars);
  let snippet = content.substring(start, end);
  if (start > 0) snippet = '…' + snippet;
  if (end < content.length) snippet += '…';
  return snippet;
}

function highlightText(text: string, queryWords: string[]): string {
  const escaped = queryWords.map(escapeRegex).join('|');
  if (!escaped) return text;
  const re = new RegExp(`(${escaped})`, 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

function searchPosts(query: string): ScoredEntry[] {
  if (!searchIndex || !query.trim()) return [];
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const results: ScoredEntry[] = [];
  for (const entry of searchIndex) {
    let score = 0;
    const titleLower = entry.title.toLowerCase();
    const contentLower = entry.content.toLowerCase();
    for (const term of terms) {
      if (titleLower.includes(term)) score += 10;
      if (entry.tags.some(t => t.toLowerCase().includes(term))) score += 5;
      if (contentLower.includes(term)) score += 1;
    }
    if (score > 0) {
      results.push({ entry, score, matchContent: getSnippet(entry.content, terms) });
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

function positionDropdown(): void {
  if (!dropdownEl || !inputEl) return;
  const rect = inputEl.getBoundingClientRect();
  const dropdownHeight = dropdownEl.offsetHeight;
  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - rect.bottom;

  dropdownEl.style.position = 'fixed';
  dropdownEl.style.insetInlineStart = rect.left + 'px';
  dropdownEl.style.inlineSize = Math.max(rect.width, 360) + 'px';

  if (spaceBelow < dropdownHeight && rect.top > dropdownHeight + 8) {
    dropdownEl.style.top = (rect.top - dropdownHeight - 8) + 'px';
  } else {
    dropdownEl.style.top = (rect.bottom + 8) + 'px';
  }
}

function renderDropdown(results: ScoredEntry[]): void {
  if (!dropdownEl) return;
  currentFocusIndex = -1;

  if (results.length === 0) {
    dropdownEl.innerHTML = '';
    dropdownEl.classList.remove('open');
    return;
  }

  dropdownEl.innerHTML = results
    .map((r, i) =>
      `<a href="/posts/${r.entry.slug}" class="search-result-item" data-index="${i}">
        <span class="search-result-title">${highlightText(r.entry.title, inputEl?.value.split(/\s+/) || [])}</span>
        ${r.matchContent ? `<span class="search-result-snippet">${highlightText(r.matchContent, inputEl?.value.split(/\s+/) || [])}</span>` : ''}
      </a>`
    )
    .join('');

  positionDropdown();
  dropdownEl.classList.add('open');
}

function onInput(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    renderDropdown(searchPosts(inputEl?.value || ''));
  }, 200);
}

function onKeyDown(e: KeyboardEvent): void {
  if (!dropdownEl?.classList.contains('open')) return;
  const items = dropdownEl.querySelectorAll('.search-result-item');
  if (items.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    currentFocusIndex = (currentFocusIndex + 1) % items.length;
    items.forEach((el, i) => {
      el.classList.toggle('focused', i === currentFocusIndex);
      if (i === currentFocusIndex) (el as HTMLElement).scrollIntoView({ block: 'nearest' });
    });
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    currentFocusIndex = (currentFocusIndex - 1 + items.length) % items.length;
    items.forEach((el, i) => {
      el.classList.toggle('focused', i === currentFocusIndex);
      if (i === currentFocusIndex) (el as HTMLElement).scrollIntoView({ block: 'nearest' });
    });
  } else if (e.key === 'Enter' && currentFocusIndex >= 0) {
    e.preventDefault();
    (items[currentFocusIndex] as HTMLAnchorElement).click();
  }
}

function closeDropdown(): void {
  if (dropdownEl) {
    dropdownEl.innerHTML = '';
    dropdownEl.classList.remove('open');
  }
  currentFocusIndex = -1;
}

async function loadSearchIndex(): Promise<void> {
  if (searchIndex) return;
  if (searchLoadPromise) return searchLoadPromise;
  searchLoadPromise = (async () => {
    try {
      const res = await fetch('/search-index.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      searchIndex = await res.json() as SearchEntry[];
      if (inputEl?.value) onInput();
    } catch {
      if (inputEl) {
        inputEl.placeholder = 'Search unavailable';
        inputEl.disabled = true;
      }
    }
  })();
  return searchLoadPromise;
}

async function openSearch(): Promise<void> {
  if (!containerEl) return;
  containerEl.classList.add('search-expanded');
  isOpen = true;
  await loadSearchIndex();
  inputEl?.focus();
}

function closeSearch(): void {
  if (!containerEl) return;
  containerEl.classList.remove('search-expanded');
  isOpen = false;
  closeDropdown();
  if (inputEl) inputEl.value = '';
  inputEl?.blur();
}

async function initSearch(): Promise<void> {
  containerEl = document.querySelector<HTMLDivElement>('#search');
  if (!containerEl) return;

  containerEl.innerHTML = '';

  const btn = document.createElement('button');
  btn.className = 'search-btn';
  btn.innerHTML = searchIcon;
  btn.setAttribute('aria-label', 'Open search');
  containerEl.appendChild(btn);

  inputEl = document.createElement('input');
  inputEl.type = 'search';
  inputEl.placeholder = 'Search posts…';
  inputEl.className = 'search-input';
  inputEl.setAttribute('aria-label', 'Search posts');
  containerEl.appendChild(inputEl);

  dropdownEl = document.createElement('div');
  dropdownEl.className = 'search-dropdown';
  document.body.appendChild(dropdownEl);

  btn.addEventListener('click', openSearch);

  inputEl.addEventListener('input', onInput);

  inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closeSearch(); return; }
    onKeyDown(e);
  });

  inputEl.addEventListener('focus', () => {
    if (inputEl?.value) onInput();
  });

  inputEl.addEventListener('blur', () => {
    setTimeout(() => {
      if (!inputEl?.value) closeSearch();
    }, 200);
  });

  document.addEventListener('scroll', () => {
    if (dropdownEl?.classList.contains('open')) positionDropdown();
  }, { passive: true });

  document.addEventListener('click', (e: MouseEvent) => {
    if (!containerEl?.contains(e.target as Node) &&
        !dropdownEl?.contains(e.target as Node) && isOpen) {
      closeSearch();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearch);
} else {
  initSearch();
}
