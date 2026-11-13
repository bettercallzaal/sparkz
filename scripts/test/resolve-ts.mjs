// Node module-resolution hook for the unit tests (npm test).
//
// The tests are plain TypeScript run by Node's own test runner with type stripping
// (node --test --experimental-strip-types), so no test framework or transpiler is
// a dependency. Node does not add file extensions when resolving, and the app's
// imports are extensionless (`./session`), as Next.js and TypeScript expect. This
// hook retries a failed relative import with .ts, .tsx and /index.ts appended. It
// changes nothing else, and it only runs under `npm test`, never in the app.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    const relative = specifier.startsWith("./") || specifier.startsWith("../");
    if (!relative || /\.[cm]?[jt]sx?$/.test(specifier)) throw err;
    for (const ext of [".ts", ".tsx", "/index.ts"]) {
      try {
        return await nextResolve(specifier + ext, context);
      } catch {
        // try the next extension
      }
    }
    throw err;
  }
}
