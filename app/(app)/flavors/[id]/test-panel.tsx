"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import type { StudyImageSet, ImageRecord } from "@/app/lib/types";

const API_BASE = "https://api.almostcrackd.ai";

type ImageStatus = "pending" | "running" | "done" | "error";

interface TestImage extends ImageRecord {
  status: ImageStatus;
  captions: string[];
  error?: string;
}

interface ImageSetImages {
  [setId: number]: ImageRecord[];
}

export default function TestPanel({
  flavorId,
  imageSets,
  imageSetImages,
}: {
  flavorId: number;
  imageSets: StudyImageSet[];
  imageSetImages: ImageSetImages;
}) {
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [images, setImages] = useState<TestImage[]>([]);
  const [running, setRunning] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Get access token
  useEffect(() => {
    async function getToken() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setAccessToken(session.access_token);
    }
    getToken();
  }, []);

  // Load images from pre-fetched server data when set is selected
  const loadImages = useCallback((setId: number) => {
    setSelectedSetId(setId);
    const imgs = imageSetImages[setId] ?? [];
    setImages(
      imgs.map((img) => ({
        ...img,
        status: "pending" as ImageStatus,
        captions: [],
      }))
    );
  }, [imageSetImages]);

  const runTest = useCallback(async () => {
    if (!accessToken || images.length === 0) return;
    setRunning(true);

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    for (let i = 0; i < images.length; i++) {
      setImages((prev) =>
        prev.map((img, j) =>
          j === i ? { ...img, status: "running" as ImageStatus } : img
        )
      );

      try {
        const res = await fetch(`${API_BASE}/pipeline/generate-captions`, {
          method: "POST",
          headers,
          body: JSON.stringify({ imageId: images[i].id, humorFlavorId: flavorId }),
        });

        if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
        const data = await res.json();
        const captions = Array.isArray(data)
          ? data.map((c: { content?: string }) => c.content ?? JSON.stringify(c))
          : [];

        setImages((prev) =>
          prev.map((img, j) =>
            j === i ? { ...img, status: "done" as ImageStatus, captions } : img
          )
        );
      } catch (err) {
        setImages((prev) =>
          prev.map((img, j) =>
            j === i
              ? {
                  ...img,
                  status: "error" as ImageStatus,
                  error: err instanceof Error ? err.message : "Unknown error",
                }
              : img
          )
        );
      }
    }

    setRunning(false);
  }, [accessToken, images, flavorId]);

  return (
    <div className="space-y-4">
      <h2 className="font-head text-xl uppercase tracking-tight">Test Flavor</h2>

      <div className="flex items-center gap-3">
        <select
          value={selectedSetId ?? ""}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val) loadImages(val);
          }}
          className="px-3 py-2 border-2 border-[var(--border)] text-sm bg-[var(--background)] font-sans"
        >
          <option value="">Select image set...</option>
          {imageSets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.slug} {s.description ? `— ${s.description}` : ""}
            </option>
          ))}
        </select>

        <button
          onClick={runTest}
          disabled={running || images.length === 0}
          className="px-4 py-2 bg-[var(--accent-green)] text-white border-2 border-[var(--border)] text-sm font-bold uppercase tracking-wide shadow-[var(--shadow-sm)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer disabled:opacity-50"
        >
          {running ? "Running..." : "Run Test"}
        </button>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          {images.map((img) => (
            <div key={img.id} className="border-2 border-[var(--border)] shadow-[var(--shadow-sm)] p-4 flex gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-24 flex-shrink-0 border-2 border-[var(--border)] overflow-hidden">
                <img
                  src={img.url}
                  alt={img.image_description ?? "Test image"}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                {/* Status badge */}
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-bold uppercase border-2 border-[var(--border)] ${
                    img.status === "pending"
                      ? "bg-[var(--foreground)]/10"
                      : img.status === "running"
                      ? "bg-[var(--primary)] text-[var(--secondary)]"
                      : img.status === "done"
                      ? "bg-[var(--accent-green)] text-white"
                      : "bg-[var(--accent-red)] text-white"
                  }`}
                >
                  {img.status}
                </span>

                {/* Error */}
                {img.error && (
                  <p className="text-xs text-[var(--accent-red)]">{img.error}</p>
                )}

                {/* Captions */}
                {img.captions.length > 0 && (
                  <div className="space-y-1">
                    {img.captions.map((c, i) => (
                      <p key={i} className="text-sm border-l-3 border-[var(--primary)] pl-2">
                        {c}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
