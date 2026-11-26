import { createHash } from "node:crypto";

// Canonical JSON for contribution receipts: RFC 8785 (JCS) for the values receipts use
// (objects, arrays, strings, booleans, null and safe integers). Keys are sorted by UTF-16
// code unit, no whitespace. The bytes are the UTF-8 of the result, and a receipt is named
// by the sha256 of those bytes. Floats are refused rather than guessed at.
export function canonicalize(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) throw new Error("canonical receipts allow only safe integers");
    return String(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(obj[k])}`).join(",")}}`;
  }
  throw new Error(`canonical receipts cannot hold a ${typeof value}`);
}

export function sha256Hex(bytes: string): string {
  return createHash("sha256").update(Buffer.from(bytes, "utf8")).digest("hex");
}
