import { describe, expect, it } from 'vitest';
import { translations } from './translations';

describe('translations', () => {
  it('has identical key sets across es and en', () => {
    const esKeys = Object.keys(translations.es).sort();
    const enKeys = Object.keys(translations.en).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('has no empty translation values', () => {
    for (const [lang, dict] of Object.entries(translations)) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.trim(), `${lang}.${key} should not be empty`).not.toBe('');
      }
    }
  });
});
