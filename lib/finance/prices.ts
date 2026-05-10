// Anthropic public pricing as of May 2026 — USD per 1,000,000 tokens.
// Update this table when Anthropic publishes new prices.

export type PriceEntry = {
  inputPerMTokens: number;
  outputPerMTokens: number;
};

export const MODEL_PRICES: Record<string, PriceEntry> = {
  "claude-opus-4-7": { inputPerMTokens: 15, outputPerMTokens: 75 },
  "claude-sonnet-4-6": { inputPerMTokens: 3, outputPerMTokens: 15 },
  "claude-haiku-4-5": { inputPerMTokens: 0.8, outputPerMTokens: 4 },
};

export const FALLBACK_PRICE: PriceEntry = MODEL_PRICES["claude-sonnet-4-6"];

/**
 * Resolve a `PriceEntry` for the given model id.
 *
 * Matching is case-insensitive and tolerant of dated/snapshot suffixes — e.g.
 * `"claude-opus-4-7-20251010"` resolves to the `"claude-opus-4-7"` entry. If
 * no key matches, returns FALLBACK_PRICE.
 */
export function priceFor(modelId: string | undefined): PriceEntry {
  if (!modelId) return FALLBACK_PRICE;
  const id = modelId.toLowerCase();

  // Exact match takes priority.
  if (MODEL_PRICES[id]) return MODEL_PRICES[id];

  // Otherwise pick the longest key that the model id starts with / contains —
  // longest-first so `claude-opus-4-7` wins over a shorter `claude-opus`.
  const keys = Object.keys(MODEL_PRICES).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (id.includes(key)) return MODEL_PRICES[key];
  }

  return FALLBACK_PRICE;
}
