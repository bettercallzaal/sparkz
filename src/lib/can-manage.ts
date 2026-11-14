// Who may see a Hearth's Manage page: its owner or an admin. The same rule the server
// enforces in requireHearthOwner (lib/auth.ts); this copy only decides what the page
// shows, so a visitor who types /c/<slug>/settings no longer sees forms they cannot save
// (Zaal, 14 Nov 2026: "why can anyone edit a hearth"). Pure, so it is unit-tested.
export function canManageHearth(viewer: { admin: boolean; fid: number | null }, ownerFid: number | null): boolean {
  if (viewer.admin) return true;
  return viewer.fid !== null && ownerFid !== null && viewer.fid === ownerFid;
}
