"use client";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { getFirebaseStorage } from "@/lib/firebase/client";
import { createDoc, deleteDocById, listAll } from "@/lib/firebase/repository";
import { COLLECTIONS } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { MediaFolder, MediaItem } from "@/types";

/**
 * Storage uploads for the admin panel.
 *
 * Every successful upload also writes a `media_library` document, which is
 * what makes the Media Library able to list, search and re-use assets without
 * paying for a recursive Storage listing on every page load.
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
] as const;

export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  contentType: string;
  width: number | null;
  height: number | null;
}

export class UploadError extends Error {}

function validate(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    throw new UploadError(
      `"${file.name}" is a ${file.type || "unknown"} file. Upload a JPEG, PNG, WebP, AVIF, GIF or SVG.`,
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(
      `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
    );
  }
}

/** Read intrinsic dimensions so `next/image` can avoid layout shift later. */
async function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (file.type === "image/svg+xml" || typeof createImageBitmap !== "function") return null;

  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  } catch {
    return null;
  }
}

/** Timestamped, slugified object path — collision-free and readable. */
function buildPath(folder: MediaFolder, file: File): string {
  const dot = file.name.lastIndexOf(".");
  const stem = dot > 0 ? file.name.slice(0, dot) : file.name;
  const extension = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : "bin";
  return `${folder}/${Date.now()}-${slugify(stem)}.${extension}`;
}

export async function uploadImage(
  file: File,
  folder: MediaFolder,
  options: {
    onProgress?: (percent: number) => void;
    uploadedBy?: string | null;
    /** Set `false` for transient uploads that shouldn't clutter the library. */
    addToLibrary?: boolean;
  } = {},
): Promise<UploadResult> {
  const { onProgress, uploadedBy = null, addToLibrary = true } = options;

  validate(file);

  const dimensions = await readDimensions(file);
  const path = buildPath(folder, file);
  const storageRef = ref(getFirebaseStorage(), path);

  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    cacheControl: "public, max-age=31536000, immutable",
  });

  const url = await new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      },
      (error) => {
        reject(
          new UploadError(
            error.code === "storage/unauthorized"
              ? "You don't have permission to upload files. Check your admin role."
              : `Upload failed: ${error.message}`,
          ),
        );
      },
      async () => {
        try {
          resolve(await getDownloadURL(task.snapshot.ref));
        } catch (error) {
          reject(error);
        }
      },
    );
  });

  const result: UploadResult = {
    url,
    path,
    name: file.name,
    size: file.size,
    contentType: file.type,
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
  };

  if (addToLibrary) {
    try {
      await createDoc(COLLECTIONS.mediaLibrary, {
        name: result.name,
        url: result.url,
        path: result.path,
        folder,
        contentType: result.contentType,
        size: result.size,
        width: result.width,
        height: result.height,
        uploadedBy,
        alt: null,
      });
    } catch (error) {
      // The file itself uploaded fine; a failed index write must not surface
      // as an upload failure.
      console.error("[storage] Uploaded the file but failed to index it:", error);
    }
  }

  return result;
}

/**
 * Delete an object from Storage. Missing objects resolve quietly so removing
 * a record whose file is already gone still succeeds.
 */
export async function deleteStorageObject(path?: string | null): Promise<void> {
  if (!path) return;

  try {
    await deleteObject(ref(getFirebaseStorage(), path));
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "storage/object-not-found") return;
    console.error(`[storage] Failed to delete "${path}":`, error);
    throw error;
  }
}

/** Remove a library entry and its underlying file together. */
export async function deleteMediaItem(item: MediaItem): Promise<void> {
  await deleteStorageObject(item.path);
  await deleteDocById(COLLECTIONS.mediaLibrary, item.id);
}

export async function listMedia(): Promise<MediaItem[]> {
  const items = await listAll<MediaItem>(COLLECTIONS.mediaLibrary);
  return items.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}
