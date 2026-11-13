// Node module-resolution hook for the unit tests (npm test).
//
// The tests are plain TypeScript run by Node's own test runner with type stripping
// (node --test --experimental-strip-types), so no test framework or transpiler is
// a dependency. Node does not add file extensions when resolving, and the app's
// imports are extensionless (`./session`), as Next.js and TypeScript expect. This
// hook:
//   - maps the app's `@/` alias to `src/` (tsconfig `paths`), so modules that import
//     `@/lib/...` can be tested;
//   - retries a failed relative or `@/` import with .ts, .tsx and /index.ts appended;
//   - retries a failed bare package subpath (`next/server`) with .js appended, which
//     is how Node's ESM loader needs it for packages without an exports map.
// It changes nothing else, and it only runs under `npm test`, never in the app.
const SRC = new URL("../../src/", import.meta.url);

export async function resolve(specifier, context, nextResolve) {
  const target = specifier.startsWith("@/") ? new URL(specifier.slice(2), SRC).href : specifier;
  try {
    return await nextResolve(target, context);
  } catch (err) {
    if (/\.[cm]?[jt]sx?$/.test(target)) throw err;
    const local = target.startsWith("./") || target.startsWith("../") || target.startsWith("file:");
    const bareSubpath = !local && !target.startsWith("node:") && /^(@[^/]+\/)?[^/@.][^/]*\/.+/.test(target);
    const exts = local ? [".ts", ".tsx", "/index.ts"] : bareSubpath ? [".js"] : [];
    for (const ext of exts) {
      try {
        return await nextResolve(target + ext, context);
      } catch {
        // try the next extension
      }
    }
    throw err;
  }
}
