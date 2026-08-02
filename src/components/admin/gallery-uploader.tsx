"use client";

import { GripVertical, ImagePlus, Library, Trash2 } from "lucide-react";
import { useId, useState, type DragEvent } from "react";
import { toast } from "sonner";

import { useAdminAuth } from "@/components/admin/auth-provider";
import { MediaLibraryPicker } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { deleteStorageObject, uploadImage, UploadError } from "@/lib/firebase/storage";
import { cn } from "@/lib/utils";
import type { MediaFolder, PortfolioImage } from "@/types";

/**
 * Multi-image gallery editor.
 *
 * Uploads run in parallel with per-file progress; a single failure reports
 * itself and the rest continue. Removing an image also deletes the Storage
 * object when this record owns it (`path` is set).
 */
export function GalleryUploader({
  images,
  onChange,
  folder,
  label = "Gallery images",
  description,
}: {
  images: PortfolioImage[];
  onChange: (images: PortfolioImage[]) => void;
  folder: MediaFolder;
  label?: string;
  description?: string;
}) {
  const { admin } = useAdminAuth();
  const inputId = useId();

  const [uploading, setUploading] = useState<Record<string, number>>({});
  const [dragging, setDragging] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    const uploaded = await Promise.all(
      list.map(async (file): Promise<PortfolioImage | null> => {
        const key = `${file.name}-${file.size}-${Math.random()}`;
        setUploading((state) => ({ ...state, [key]: 0 }));

        try {
          const result = await uploadImage(file, folder, {
            uploadedBy: admin?.uid ?? admin?.id ?? null,
            onProgress: (percent) => setUploading((state) => ({ ...state, [key]: percent })),
          });
          return { url: result.url, path: result.path, alt: null } satisfies PortfolioImage;
        } catch (error) {
          const message =
            error instanceof UploadError ? error.message : `Could not upload "${file.name}".`;
          toast.error(message);
          return null;
        } finally {
          setUploading((state) => {
            const next = { ...state };
            delete next[key];
            return next;
          });
        }
      }),
    );

    const successful = uploaded.filter((item): item is PortfolioImage => item !== null);
    if (successful.length > 0) {
      onChange([...images, ...successful]);
      toast.success(`${successful.length} image${successful.length === 1 ? "" : "s"} added.`);
    }
  }

  async function removeAt(index: number) {
    const image = images[index];
    onChange(images.filter((_, i) => i !== index));

    if (image.path) {
      try {
        await deleteStorageObject(image.path);
      } catch {
        // Already reported by the storage helper; the list is updated either way.
      }
    }
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  const uploadingKeys = Object.keys(uploading);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-navy-800 dark:text-navy-200">{label}</span>
      {description && (
        <p className="text-xs leading-relaxed text-navy-500 dark:text-navy-400">{description}</p>
      )}

      {(images.length > 0 || uploadingKeys.length > 0) && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <li
              key={`${image.url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (dragIndex !== null) reorder(dragIndex, index);
                setDragIndex(null);
              }}
              className={cn(
                "group relative overflow-hidden rounded-xl border border-navy-200 bg-navy-50 dark:border-navy-700 dark:bg-navy-950",
                dragIndex === index && "opacity-40",
              )}
            >
              <span className="relative block aspect-4/3">
                <SmartImage
                  src={image.url}
                  alt={image.alt || `Gallery image ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover"
                />
              </span>

              <span
                aria-hidden
                className="absolute top-1.5 left-1.5 flex size-6 cursor-grab items-center justify-center rounded-md bg-white/85 text-navy-600 opacity-0 transition-opacity group-hover:opacity-100"
                title="Drag to reorder"
              >
                <GripVertical className="size-3.5" />
              </span>

              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove image ${index + 1}`}
                className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-md bg-white/85 text-red-600 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Trash2 aria-hidden className="size-3.5" />
              </button>

              <input
                type="text"
                value={image.alt ?? ""}
                placeholder="Alt text (recommended)"
                onChange={(event) => {
                  const next = [...images];
                  next[index] = { ...image, alt: event.target.value || null };
                  onChange(next);
                }}
                className="w-full border-t border-navy-200 bg-white px-2 py-1.5 text-[11.5px] focus:outline-none dark:border-navy-700 dark:bg-navy-900"
              />
            </li>
          ))}

          {uploadingKeys.map((key) => (
            <li
              key={key}
              className="flex aspect-4/3 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 dark:border-brand-500/40 dark:bg-brand-500/5"
            >
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-navy-200 dark:bg-navy-800">
                <div
                  className="h-full rounded-full bg-brand-600 transition-[width] duration-200"
                  style={{ width: `${uploading[key]}%` }}
                />
              </div>
              <p className="text-[11px] text-navy-500 tabular-nums">{uploading[key]}%</p>
            </li>
          ))}
        </ul>
      )}

      <div
        onDragOver={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer.files.length > 0) void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "mt-1 flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-5 py-6 text-center transition-colors",
          dragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : "border-navy-200 bg-navy-50/50 hover:border-brand-400 dark:border-navy-700 dark:bg-navy-950/50",
        )}
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-white text-navy-400 shadow-xs dark:bg-navy-800">
          <ImagePlus aria-hidden className="size-4.5" />
        </span>
        <p className="text-[13px] text-navy-600 dark:text-navy-300">
          Drop images here, or add them from
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <label
            htmlFor={inputId}
            className="cursor-pointer rounded-lg bg-navy-950 px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-navy-800 dark:bg-white dark:text-navy-950"
          >
            Your device
          </label>
          <Button variant="outline" size="sm" onClick={() => setLibraryOpen(true)}>
            <Library aria-hidden className="size-3.5" />
            Media library
          </Button>
        </div>
        <p className="text-[11px] text-navy-400">Select several at once · drag thumbnails to reorder</p>
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <MediaLibraryPicker
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(item) => {
          // `path: null` on purpose: the Media Library owns this file, so
          // removing it from this project must not delete the shared object.
          onChange([...images, { url: item.url, path: null, alt: item.alt ?? null }]);
          setLibraryOpen(false);
        }}
      />
    </div>
  );
}
