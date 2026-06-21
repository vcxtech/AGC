/**
 * When true, public routes use bundled/static fallbacks instead of Prisma.
 *
 * - `BUILD_WITHOUT_DB=1` — Next.js Docker build with no database (see Dockerfile).
 * - `DEV_WITHOUT_DB=1` — local `next dev` when Postgres is not running (add to `.env.local`).
 *
 * `/admin` and other authenticated flows still expect a real `DATABASE_URL`.
 */
export function skipDatabaseUse(): boolean {
  return process.env.BUILD_WITHOUT_DB === "1" || process.env.DEV_WITHOUT_DB === "1";
}

/** Connection / init failures (Postgres not running, wrong port, etc.). */
export function isPrismaUnreachable(e: unknown): boolean {
  if (typeof e !== "object" || e === null) return false;
  const rec = e as Record<string, unknown>;
  if (rec.name === "PrismaClientInitializationError") return true;
  const code = rec.code;
  return code === "P1000" || code === "P1001" || code === "P1017";
}

/** After one unreachable error in dev, skip further Prisma calls (stops prisma:error spam). */
let devDbUnreachableInDev = false;

let devDbUnreachableNotified = false;

function notifyDevDbUnreachableOnce(): void {
  if (process.env.NODE_ENV !== "development" || devDbUnreachableNotified) return;
  devDbUnreachableNotified = true;
  console.warn(
    "[agc-site] Database unreachable in development — public reads use empty/bundled fallbacks. Start Postgres (e.g. docker compose up -d agc-db) or set DEV_WITHOUT_DB=1 in .env.local."
  );
}

/** True when env says skip DB, or dev has already hit an unreachable Prisma error this process. */
export function shouldSkipPrismaCalls(): boolean {
  if (skipDatabaseUse()) return true;
  if (process.env.NODE_ENV === "development" && devDbUnreachableInDev) return true;
  return false;
}

/** Call when a Prisma call failed with an unreachable error so later code skips Prisma in dev. */
export function markDevDatabaseUnreachable(): void {
  if (process.env.NODE_ENV !== "development") return;
  devDbUnreachableInDev = true;
  notifyDevDbUnreachableOnce();
}

/**
 * Run a Prisma read for public routes; in development, return `fallback` when the DB is
 * unreachable or the schema is missing a column (P2022), instead of crashing the page.
 */
export async function devPublicRead<T>(fallback: T, run: () => Promise<T>): Promise<T> {
  if (shouldSkipPrismaCalls()) return fallback;
  try {
    return await run();
  } catch (e) {
    const isSchema =
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2022";
    if (isSchema) {
      console.warn(
        "[agc-site] Prisma P2022 (schema/column mismatch) — using read fallback. Run `npx prisma migrate deploy` against production.",
      );
      return fallback;
    }
    if (process.env.NODE_ENV === "development" && isPrismaUnreachable(e)) {
      markDevDatabaseUnreachable();
      return fallback;
    }
    throw e;
  }
}
