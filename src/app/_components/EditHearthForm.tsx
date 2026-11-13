"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useViewer } from "@/lib/view-as";
import { useToast } from "./toast";

const LINK_KEYS = ["website", "github", "docs", "x", "farcaster", "discord"] as const;
type LinkKey = (typeof LINK_KEYS)[number];
const LINK_LABEL: Record<LinkKey, string> = {
  website: "Website",
  github: "GitHub",
  docs: "Docs",
  x: "X",
  farcaster: "Farcaster",
  discord: "Discord",
};

export interface HearthDetails {
  name: string;
  bio: string | null;
  about?: string;
  image?: string;
  tags?: string[];
  links?: Partial<Record<LinkKey, string>>;
}

// Edit a Hearth's public details: name, one-line bio, about, picture, tags and links.
// Shown to the owner (session FID equals owner_fid) or an admin; the server checks the
// same thing (requireHearthOwner in /api/capsules/update). Pattern credit: Luma's and
// Partiful's edit-your-event page. Links and the picture must be https.
export default function EditHearthForm({
  hearthId,
  ownerFid,
  current,
}: {
  hearthId: string;
  ownerFid: number | null;
  current: HearthDetails;
}) {
  const router = useRouter();
  const toast = useToast();
  const { admin, fid } = useViewer();
  const [name, setName] = useState(current.name);
  const [bio, setBio] = useState(current.bio ?? "");
  const [about, setAbout] = useState(current.about ?? "");
  const [image, setImage] = useState(current.image ?? "");
  const [tags, setTags] = useState((current.tags ?? []).join(", "));
  const [links, setLinks] = useState<Record<LinkKey, string>>(
    Object.fromEntries(LINK_KEYS.map((k) => [k, current.links?.[k] ?? ""])) as Record<LinkKey, string>,
  );
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload a picture from the phone or computer: /api/upload with this Hearth's id,
  // which lets the owner (or an admin) upload. The returned public https URL fills the
  // Picture field; Save details stores it.
  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Pictures can be up to 2 MB.", "error");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("hearth_id", hearthId);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.ok && typeof json.data?.url === "string") {
        setImage(json.data.url);
        toast("Picture uploaded. Press Save details to keep it.", "success");
      } else {
        toast(json.error ?? "Could not upload. Try again.", "error");
      }
    } catch {
      toast("Could not upload. Try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  const canEdit = admin || (fid !== null && ownerFid !== null && fid === ownerFid);
  if (!canEdit) return null;

  const httpsOk = (u: string) => u.trim() === "" || /^https:\/\/\S+$/.test(u.trim());
  const badUrl = [image, ...Object.values(links)].some((u) => !httpsOk(u));
  const tagList = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const tooManyTags = tagList.length > 8;
  const invalid = !name.trim() || badUrl || tooManyTags;

  const save = async () => {
    if (invalid) return;
    setBusy(true);
    try {
      const res = await fetch("/api/capsules/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hearth_id: hearthId,
          name: name.trim(),
          bio: bio.trim(),
          about: about.trim(),
          image: image.trim(),
          tags: tagList,
          links: Object.fromEntries(LINK_KEYS.map((k) => [k, links[k].trim()])),
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast("Saved.", "success");
        router.refresh();
      } else {
        toast(json.error ?? "Could not save. Try again.", "error");
      }
    } catch {
      toast("Could not save. Try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <section className="glass mt-8 p-4">
      <h2 className="text-base font-semibold">Details</h2>
      <p className="mt-1 text-sm text-muted">What people see on this Hearth&apos;s page.</p>
      <div className="mt-4 grid gap-3">
        <label className="text-xs text-muted">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className={input} />
        </label>
        <label className="text-xs text-muted">
          One-line bio
          <input value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} className={input} />
        </label>
        <label className="text-xs text-muted">
          About
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            maxLength={4000}
            rows={5}
            className={`${input} min-h-28`}
          />
        </label>
        <label className="text-xs text-muted">
          Picture (upload one, or paste an https link)
          <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className={input} />
        </label>
        <label className="inline-flex min-h-11 w-fit cursor-pointer items-center rounded-md border border-border px-4 text-sm active:bg-white/10">
          {uploading ? "Uploading..." : "Upload a picture"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => upload(e.target.files?.[0])}
          />
        </label>
        <label className="text-xs text-muted">
          Tags (comma separated, up to 8)
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="music, live, zao" className={input} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {LINK_KEYS.map((k) => (
            <label key={k} className="text-xs text-muted">
              {LINK_LABEL[k]}
              <input
                value={links[k]}
                onChange={(e) => setLinks({ ...links, [k]: e.target.value })}
                placeholder="https://..."
                className={input}
              />
            </label>
          ))}
        </div>
      </div>
      {badUrl && <p className="mt-2 text-xs text-red-400">Links and the picture must start with https://</p>}
      {tooManyTags && <p className="mt-2 text-xs text-red-400">Up to 8 tags.</p>}
      <button
        type="button"
        onClick={save}
        disabled={busy || invalid}
        className="btn-spark mt-4 min-h-11 rounded-md px-5 text-sm disabled:opacity-40"
      >
        {busy ? "Saving..." : "Save details"}
      </button>
    </section>
  );
}
