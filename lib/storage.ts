/**
 * Thin wrapper around localStorage.
 *
 * Why?
 *  - Every call goes through the same try/catch so we never crash if the
 *    browser blocks storage (Safari private mode, quota exceeded, etc.).
 *  - JSON serialisation is centralised so callers don't need to think about it.
 */

const PREFIX = 'ims_';

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[storage] read failed for "${key}":`, err);
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[storage] write failed for "${key}":`, err);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (err) {
      console.warn(`[storage] remove failed for "${key}":`, err);
    }
  },
};
