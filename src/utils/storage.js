export function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (saved) {
      return JSON.parse(saved);
    }

    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

export function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
