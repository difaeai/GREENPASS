"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Library, Link2, Trash2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useId, useState, type DragEvent } from "react";
import { toast } from "sonner";

import { useAdminAuth } from "@/components/admin/auth-provider";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { listMedia, uploadImage, UploadError } from "@/lib/firebase/storage";
import { cn, formatBytes } from "@/lib/utils";
import type { MediaFolder, MediaItem } from "@/types";

export interface ImageValue {
  url: string;
  path: string | null;
}

/**
 * The single image control used everywhere in the admin panel.
 *
 * Three ways to set an image: drop/choose a file, pick one already in the
 * Media Library, or paste an external URL. `path` is tracked alongside `url`
 * so deleting a record can also delete the Storage object it owns — pasted
 * external URLs carry a `null` path and are never deleted.
 */
export function ImageUploader({
  value,
  onChange,
  folder,
  label,
  description,
  aspect = "video",
  error,
}: {
  value: ImageValue;
  onChange: (value: ImageValue) => void;
  folder: MediaFolder;
  label: string;
  description?: string;
  aspect?: "video" | "square" | "portrait" | "wide";
  error?: string;
}) {
  const { admin } = useAdminAuth();
  const inputId = useId();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  const aspectClass = {
    video: "aspect-16/9",
    square: "aspect-square",
    portrait: "aspect-4/5",
    wide: "aspect-21/9",
  }[aspect];

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);

      try {
        const result = await uploadImage(file, folder, {
          onProgress: setProgress,
          uploadedBy: admin?.uid ?? admin?.id ?? null,
        });
        onChange({ url: result.url, path: result.path });
        toast.success("Image uploaded.");
      } catch (uploadError) {
        const message =
          uploadError instanceof UploadError
            ? uploadError.message
            : "Upload failed. Please try again.";
        toast.error(message);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [folder, onChange, admin],
  );

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-navy-800 dark:text-navy-200">{label}</span>
      {description && (
        <p className="text-xs leading-relaxed text-navy-500 dark:text-navy-400">{description}</p>
      )}

      {value.url ? (
        <div className="group relative overflow-hidden rounded-xl border border-navy-200 bg-navy-50 dark:border-navy-700 dark:bg-navy-950">
          <div className={cn("relative w-full", aspectClass)}>
            <SmartImage
              src={value.url}
              alt="Selected image preview"
              fill
              sizes="(max-width: 640px) 100vw, 480px"
              className="object-cover"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-navy-950/85 to-transparent p-3">
            <p className="truncate text-[11px] text-white/70">
              {value.path ? value.path.split("/").pop() : "External URL"}
            </p>
            <div className="flex shrink-0 gap-1.5">
              <label
                htmlFor={inputId}
                className="flex size-8 cursor-pointer items-center justify-center rounded-lg bg-white/90 text-navy-800 transition-colors hover:bg-white"
                title="Replace image"
              >
                <Upload aria-hidden className="size-3.5" />
                <span className="sr-only">Replace image</span>
              </label>
              <button
                type="button"
                onClick={() => onChange({ url: "", path: null })}
                title="Remove image"
                className="flex size-8 items-center justify-center rounded-lg bg-white/90 text-red-600 transition-colors hover:bg-white"
              >
                <Trash2 aria-hidden className="size-3.5" />
                <span className="sr-only">Remove image</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-5 py-9 text-center transition-colors",
            dragging
              ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
              : error
                ? "border-red-300 bg-red-50/40 dark:border-red-500/40 dark:bg-red-500/5"
                : "border-navy-200 bg-navy-50/50 hover:border-brand-400 dark:border-navy-700 dark:bg-navy-950/50",
          )}
        >
          {uploading ? (
            <>
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-navy-200 dark:bg-navy-800">
                <div
                  className="h-full rounded-full bg-brand-600 transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[13px] font-medium text-navy-600 dark:text-navy-300">
                Uploading… {progress}%
              </p>
            </>
          ) : (
            <>
              <span className="flex size-10 items-center justify-center rounded-xl bg-white text-navy-400 shadow-xs dark:bg-navy-800">
                <ImagePlus aria-hidden className="size-5" />
              </span>
              <p className="text-[13px] font-medium text-navy-700 dark:text-navy-200">
                Drop an image here, or
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <label
                  htmlFor={inputId}
                  className="cursor-pointer rounded-lg bg-navy-950 px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-navy-800 dark:bg-white dark:text-navy-950"
                >
                  Choose a file
                </label>
                <button
                  type="button"
                  onClick={() => setLibraryOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1.5 text-[12.5px] font-medium text-navy-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-navy-700 dark:text-navy-300"
                >
                  <Library aria-hidden className="size-3.5" />
                  Media library
                </button>
                <button
                  type="button"
                  onClick={() => setUrlMode((mode) => !mode)}
                  className="flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1.5 text-[12.5px] font-medium text-navy-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-navy-700 dark:text-navy-300"
                >
                  <Link2 aria-hidden className="size-3.5" />
                  Paste a URL
                </button>
              </div>
              <p className="mt-1 text-[11px] text-navy-400">
                JPEG, PNG, WebP, AVIF, GIF or SVG · up to 8 MB
              </p>
            </>
          )}
        </div>
      )}

      {urlMode && !value.url && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(event) => setUrlDraft(event.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-navy-700 dark:bg-navy-950"
          />
          <Button
            size="sm"
            onClick={() => {
              const url = urlDraft.trim();
              if (!url) return;
              onChange({ url, path: null });
              setUrlDraft("");
              setUrlMode(false);
            }}
          >
            Use
          </Button>
        </div>
      )}

      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      {error && (
        <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <MediaLibraryPicker
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(item) => {
          // `path: null` on purpose: the Media Library owns this file, so
          // clearing it here must not delete an object other records may use.
          onChange({ url: item.url, path: null });
          setLibraryOpen(false);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Media library picker                                                */
/* ------------------------------------------------------------------ */

export function MediaLibraryPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
}) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    // Reset to the loading state each time the picker opens so a stale list is
    // never shown while the refetch is in flight.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(null);

    listMedia()
      .then((media) => {
        if (!cancelled) setItems(media);
      })
      .catch((error) => {
        console.error("[media] Failed to load the library:", error);
        if (!cancelled) setItems([]);
        toast.error("Could not load the media library.");
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const needle = query.trim().toLowerCase();
  const filtered = (items ?? []).filter(
    (item) =>
      !needle ||
      item.name.toLowerCase().includes(needle) ||
      item.folder.toLowerCase().includes(needle),
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-navy-950/65 p-4 backdrop-blur-xs sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Media library"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.18 }}
            className="flex h-full max-h-[42rem] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-navy-200 bg-white shadow-lift dark:border-navy-800 dark:bg-navy-900"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-navy-200 p-4 dark:border-navy-800">
              <h2 className="text-base font-semibold text-navy-950 dark:text-white">
                Media library
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search files…"
                  aria-label="Search the media library"
                  className="w-40 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-[13px] focus:border-brand-500 focus:outline-none sm:w-56 dark:border-navy-700 dark:bg-navy-950"
                />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close the media library"
                  className="flex size-8 items-center justify-center rounded-lg text-navy-500 transition-colors hover:bg-navy-100 dark:hover:bg-navy-800"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </div>
            </div>

            <div className="scrollbar-slim flex-1 overflow-y-auto p-4">
              {items === null ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="skeleton aspect-square rounded-xl" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-20 text-center text-sm text-navy-500 dark:text-navy-400">
                  {items.length === 0
                    ? "Nothing in the library yet. Upload a file and it will appear here."
                    : `No files match "${query}".`}
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {filtered.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(item)}
                        className="group w-full overflow-hidden rounded-xl border border-navy-200 text-left transition-all hover:border-brand-500 hover:shadow-soft dark:border-navy-700"
                      >
                        <span className="relative block aspect-square bg-navy-50 dark:bg-navy-950">
                          <SmartImage
                            src={item.url}
                            alt={item.alt || item.name}
                            fill
                            sizes="160px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </span>
                        <span className="block p-2">
                          <span className="block truncate text-[11.5px] font-medium text-navy-800 dark:text-navy-100">
                            {item.name}
                          </span>
                          <span className="block text-[10.5px] text-navy-400">
                            {item.folder} · {formatBytes(item.size)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
