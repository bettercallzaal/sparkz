// Does the start of a file really look like the image type it claims? The browser's
// File.type is whatever the client says, so an upload route that trusts it can be fed
// HTML or script labelled image/png. Checks the magic bytes of the four raster types
// /api/upload accepts. Returns the matching MIME type, or null.
export function sniffImage(head: Uint8Array): "image/png" | "image/jpeg" | "image/gif" | "image/webp" | null {
  const b = head;
  const at = (i: number, ...bytes: number[]) => bytes.every((v, k) => b[i + k] === v);
  if (b.length >= 8 && at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (b.length >= 3 && at(0, 0xff, 0xd8, 0xff)) return "image/jpeg";
  if (b.length >= 6 && (at(0, 0x47, 0x49, 0x46, 0x38, 0x37, 0x61) || at(0, 0x47, 0x49, 0x46, 0x38, 0x39, 0x61))) {
    return "image/gif";
  }
  if (b.length >= 12 && at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "image/webp";
  return null;
}
