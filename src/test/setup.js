// Node 22+ ships an experimental global `localStorage` that can shadow the
// jsdom implementation and is unusable unless Node is started with
// `--localstorage-file`. Provide a small in-memory Storage so application code
// and tests share a working implementation.
class MemoryStorage {
  #store = new Map();

  get length() {
    return this.#store.size;
  }

  key(index) {
    return Array.from(this.#store.keys())[index] ?? null;
  }

  getItem(key) {
    const normalized = String(key);
    return this.#store.has(normalized) ? this.#store.get(normalized) : null;
  }

  setItem(key, value) {
    this.#store.set(String(key), String(value));
  }

  removeItem(key) {
    this.#store.delete(String(key));
  }

  clear() {
    this.#store.clear();
  }
}

function installStorage(name) {
  const storage = new MemoryStorage();
  const targets = new Set([globalThis]);
  if (typeof window !== "undefined") targets.add(window);

  for (const target of targets) {
    Object.defineProperty(target, name, {
      value: storage,
      configurable: true,
      writable: true,
    });
  }
}

installStorage("localStorage");
installStorage("sessionStorage");
