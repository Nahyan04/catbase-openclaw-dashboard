import "server-only";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { paths } from "@/lib/workspace/paths";
import { existsSafe, readFileSafe } from "@/lib/workspace/fs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BudgetCategory = { category: string; monthlyUsd: number };

export type Budget = {
  /** Total of categories OR explicit "monthlyBurnUsd" if present in source. */
  monthlyBurnUsd: number;
  categories: BudgetCategory[];
};

export type Actuals = {
  cashOnHandUsd: number;
  /** Optional override for the budget-derived burn. */
  monthlyBurnUsd?: number;
  /** ISO date. */
  asOfDate?: string;
};

export type Transaction = {
  /** ISO date. */
  date: string;
  description: string;
  /** Positive = income, negative = expense. */
  amountUsd: number;
  category?: string;
};

export type LedgerView =
  | { scaffoldNeeded: true }
  | {
      scaffoldNeeded: false;
      budget: Budget | null;
      actuals: Actuals | null;
      transactions: Transaction[];
      /** Cash on hand divided by monthly burn. Null when not computable. */
      runwayMonths: number | null;
    };

// ---------------------------------------------------------------------------
// Zod schemas (loose — invalid shapes are treated as null)
// ---------------------------------------------------------------------------

const BudgetCategorySchema = z.object({
  category: z.string(),
  monthlyUsd: z.number(),
});

const BudgetSchema = z.object({
  monthlyBurnUsd: z.number().optional(),
  categories: z.array(BudgetCategorySchema).optional(),
});

const ActualsSchema = z.object({
  cashOnHandUsd: z.number(),
  monthlyBurnUsd: z.number().optional(),
  asOfDate: z.string().optional(),
});

const TransactionSchema = z.object({
  date: z.string(),
  description: z.string(),
  amountUsd: z.number(),
  category: z.string().optional(),
});

const TransactionsSchema = z.array(TransactionSchema);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Try to load a structured object from `<financeDir>/<name>.json` first, then
 * fall back to `<financeDir>/<name>.md` parsed via gray-matter (returning the
 * front-matter `data` object). Returns `null` when neither exists or both fail
 * to parse.
 */
async function readStructured(name: string): Promise<unknown | null> {
  const jsonPath = path.join(paths.financeDir, `${name}.json`);
  if (await existsSafe(jsonPath)) {
    const raw = await readFileSafe(jsonPath);
    if (raw !== null) {
      try {
        return JSON.parse(raw);
      } catch (err) {
        console.warn(`[finance/ledger] Failed to parse ${jsonPath}:`, err);
      }
    }
  }

  const mdPath = path.join(paths.financeDir, `${name}.md`);
  if (await existsSafe(mdPath)) {
    const raw = await readFileSafe(mdPath);
    if (raw !== null) {
      try {
        const parsed = matter(raw);
        return parsed.data ?? null;
      } catch (err) {
        console.warn(`[finance/ledger] Failed to parse ${mdPath}:`, err);
      }
    }
  }

  return null;
}

function parseBudget(raw: unknown): Budget | null {
  if (raw === null || typeof raw !== "object") return null;
  const result = BudgetSchema.safeParse(raw);
  if (!result.success) return null;

  const categories = result.data.categories ?? [];
  const explicit = result.data.monthlyBurnUsd;
  const summed = categories.reduce((acc, c) => acc + c.monthlyUsd, 0);
  const monthlyBurnUsd =
    typeof explicit === "number" && Number.isFinite(explicit)
      ? explicit
      : summed;

  return { monthlyBurnUsd, categories };
}

function parseActuals(raw: unknown): Actuals | null {
  if (raw === null || typeof raw !== "object") return null;
  const result = ActualsSchema.safeParse(raw);
  if (!result.success) return null;
  return result.data;
}

function parseTransactions(raw: unknown): Transaction[] {
  if (raw === null) return [];
  // Accept either a top-level array or { transactions: [...] }
  const candidate = Array.isArray(raw)
    ? raw
    : typeof raw === "object" &&
        raw !== null &&
        Array.isArray((raw as { transactions?: unknown }).transactions)
      ? (raw as { transactions: unknown[] }).transactions
      : null;
  if (!candidate) return [];
  const result = TransactionsSchema.safeParse(candidate);
  if (!result.success) return [];
  return result.data;
}

function computeRunway(
  actuals: Actuals | null,
  budget: Budget | null,
): number | null {
  if (!actuals) return null;
  const burn = actuals.monthlyBurnUsd ?? budget?.monthlyBurnUsd ?? null;
  if (burn === null || burn <= 0) return null;
  const months = actuals.cashOnHandUsd / burn;
  if (!Number.isFinite(months)) return null;
  return Math.round(months * 10) / 10;
}

// ---------------------------------------------------------------------------
// Main reader
// ---------------------------------------------------------------------------

export async function readLedger(): Promise<LedgerView> {
  if (!paths.financeDir) {
    return { scaffoldNeeded: true };
  }

  const exists = await existsSafe(paths.financeDir);
  if (!exists) {
    return { scaffoldNeeded: true };
  }

  const [budgetRaw, actualsRaw, transactionsRaw] = await Promise.all([
    readStructured("budget"),
    readStructured("actuals"),
    readStructured("transactions"),
  ]);

  const budget = parseBudget(budgetRaw);
  const actuals = parseActuals(actualsRaw);
  const transactions = parseTransactions(transactionsRaw);
  const runwayMonths = computeRunway(actuals, budget);

  return {
    scaffoldNeeded: false,
    budget,
    actuals,
    transactions,
    runwayMonths,
  };
}
