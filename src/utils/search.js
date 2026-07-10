import { normalizeText } from './helpers.js';

export function searchDocuments(documents, keyword) {
  const q = normalizeText(keyword);
  if (!q) return documents;
  return documents
    .map((doc) => {
      const haystack = normalizeText(`${doc.title} ${doc.subject} ${doc.category} ${doc.school} ${(doc.tags || []).join(' ')}`);
      let score = 0;
      if (haystack.includes(q)) score += 100;
      q.split(/\s+/).forEach((part) => {
        if (haystack.includes(part)) score += 20;
      });
      return { doc, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.doc);
}

export function buildSuggestions(documents, categories, keyword) {
  const q = normalizeText(keyword);
  const terms = new Set();
  documents.forEach((doc) => {
    terms.add(doc.title);
    terms.add(doc.subject);
    (doc.tags || []).forEach((tag) => terms.add(tag));
  });
  categories.forEach((cat) => terms.add(cat.name));
  return Array.from(terms)
    .filter((term) => !q || normalizeText(term).includes(q))
    .slice(0, 8);
}
