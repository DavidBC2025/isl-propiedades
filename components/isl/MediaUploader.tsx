"use client";

import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";
import { createImageThumbnail, isHeicFile, optimizeImageForUpload } from "@/lib/image-client";
import { parseVideoUrl } from "@/lib/media";
import { supabase } from "@/lib/supabase";

type MediaKind = "image" | "image-multiple" | "video" | "pdf";

type MediaUploaderProps = {
  kind: MediaKind;
  bucket: string;
  pathPrefix: string;
  existingUrls?: string[];
  maxFiles?: number;
  allowUrlInstead?: boolean;
  onChange: (urls: string[]) => void;
};

type UploadedItem = {
  id: string;
  url: string;
  preview?: string;
};

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

function makeId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const values = new Uint32Array(2);
  globalThis.crypto.getRandomValues(values);
  return `${values[0].toString(36)}-${values[1].toString(36)}`;
}

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toLocaleString("es-CL", { maximumFractionDigits: 1 })} MB`;
}

function storagePath(pathPrefix: string, fileName: string): string {
  const folder = pathPrefix.replace(/^\/+|\/+$/g, "");
  const safeName = fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const uniqueName = `${Date.now()}-${makeId()}-${safeName}`;
  return folder ? `${folder}/${uniqueName}` : uniqueName;
}

function toItems(urls: string[]): UploadedItem[] {
  return urls.map((url) => ({ id: makeId(), url, preview: url }));
}

export function MediaUploader({
  kind,
  bucket,
  pathPrefix,
  existingUrls,
  maxFiles,
  allowUrlInstead = false,
  onChange,
}: MediaUploaderProps) {
  const initialUrlsKey = existingUrls?.join("\u0000") ?? "";
  const [items, setItems] = useState<UploadedItem[]>(() => toItems(existingUrls ?? []));
  const itemsRef = useRef(items);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [urlMode, setUrlMode] = useState<"upload" | "link">("upload");
  const [videoLink, setVideoLink] = useState("");
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  useEffect(() => {
    const nextItems = toItems(existingUrls ?? []);
    itemsRef.current = nextItems;
    setItems(nextItems);
  }, [initialUrlsKey]);

  const replaceItems = (nextItems: UploadedItem[]) => {
    itemsRef.current = nextItems;
    setItems(nextItems);
    onChange(nextItems.map((item) => item.url));
  };

  const uploadToStorage = async (file: File, destination: string): Promise<string> => {
    const { error } = await supabase.storage.from(bucket).upload(destination, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (error) {
      throw new Error("No pudimos subirlo. Intenta de nuevo.");
    }

    return supabase.storage.from(bucket).getPublicUrl(destination).data.publicUrl;
  };

  const uploadImage = async (file: File, position: number, total: number, replaceExisting = false) => {
    setMessage(`Optimizando foto ${position} de ${total}…`);
    const optimizedImage = await optimizeImageForUpload(file);
    const heicCouldNotConvert = isHeicFile(file) && isHeicFile(optimizedImage);
    const thumbnail = await createImageThumbnail(optimizedImage);
    const destination = storagePath(pathPrefix, optimizedImage.name);

    setMessage(`Subiendo foto ${position} de ${total}…`);
    const url = await uploadToStorage(optimizedImage, destination);

    if (thumbnail) {
      try {
        const folder = pathPrefix.replace(/^\/+|\/+$/g, "");
        const thumbnailDestination = `${folder ? `${folder}/` : ""}thumbnails/${destination.split("/").pop() ?? thumbnail.name}`;
        await uploadToStorage(thumbnail, thumbnailDestination);
      } catch {
        // La foto principal ya está disponible; la miniatura se puede regenerar más adelante.
      }
    }

    replaceItems([...(replaceExisting ? [] : itemsRef.current), { id: makeId(), url, preview: URL.createObjectURL(optimizedImage) }]);

    if (heicCouldNotConvert) {
      setMessage("Subimos la foto tal como venía. Para próximas fotos, en iPhone puedes elegir “Más compatible” en Ajustes > Cámara > Formatos.");
    }
  };

  const uploadSingleFile = async (file: File) => {
    setMessage(kind === "pdf" ? "Subiendo documento…" : "Subiendo video…");
    const destination = storagePath(pathPrefix, file.name);
    const url = await uploadToStorage(file, destination);
    replaceItems([{ id: makeId(), url }]);
    setMessage(kind === "pdf" ? "Documento listo." : "Video listo.");
  };

  const isAccepted = (file: File): boolean => {
    if (kind === "pdf") return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (kind === "video") return file.type.startsWith("video/") || /\.(mp4|webm)$/i.test(file.name);
    return file.type.startsWith("image/") || isHeicFile(file);
  };

  const handleFiles = async (incomingFiles: File[]) => {
    const acceptedFiles = incomingFiles.filter(isAccepted);

    if (!acceptedFiles.length) {
      setMessage(kind === "pdf" ? "Elige un documento PDF." : kind === "video" ? "Elige un video para continuar." : "Elige una foto para continuar.");
      return;
    }

    if (kind === "video") {
      setSelectedVideo(acceptedFiles[0]);
      setMessage(`Video elegido: ${formatSize(acceptedFiles[0].size)}.`);
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      if (kind === "pdf") {
        await uploadSingleFile(acceptedFiles[0]);
        return;
      }

      const imageFiles = kind === "image" ? acceptedFiles.slice(0, 1) : acceptedFiles;
      const availableSlots = maxFiles === undefined ? Number.POSITIVE_INFINITY : Math.max(0, maxFiles - itemsRef.current.length);
      const filesToUpload = imageFiles.slice(0, availableSlots);

      if (!filesToUpload.length) {
        setMessage("Ya alcanzaste la cantidad de fotos para este espacio.");
        return;
      }

      for (const [index, file] of filesToUpload.entries()) {
        await uploadImage(file, index + 1, filesToUpload.length, kind === "image");
      }
      if (!filesToUpload.some((file) => isHeicFile(file))) setMessage("Fotos listas.");
    } catch {
      setMessage(kind === "pdf" ? "No pudimos subir este documento. Intenta de nuevo." : "No pudimos subir esta foto. Intenta de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void handleFiles(Array.from(event.dataTransfer.files));
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= itemsRef.current.length) return;
    const nextItems = [...itemsRef.current];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);
    replaceItems(nextItems);
  };

  const saveVideoLink = () => {
    const video = parseVideoUrl(videoLink);
    if (video.kind !== "youtube" && video.kind !== "vimeo") {
      setMessage("Revisa el link de YouTube o Vimeo e inténtalo nuevamente.");
      return;
    }

    replaceItems([{ id: makeId(), url: videoLink.trim() }]);
    setMessage("Link de video listo.");
  };

  const accepts = kind === "pdf" ? "application/pdf,.pdf" : kind === "video" ? "video/mp4,video/webm,.mp4,.webm" : "image/*,.heic,.heif";
  const isImage = kind === "image" || kind === "image-multiple";
  const helperText = kind === "video" ? "Toca para elegir un video" : kind === "pdf" ? "Toca para elegir un documento PDF" : "Arrastra tus fotos aquí o toca para elegirlas";

  return (
    <div className="space-y-4">
      {kind === "video" && allowUrlInstead ? (
        <div className="flex gap-2 border-b border-isl-black/15" role="tablist" aria-label="Forma de agregar video">
          <button type="button" role="tab" aria-selected={urlMode === "upload"} onClick={() => setUrlMode("upload")} className={`px-3 py-2 text-sm ${urlMode === "upload" ? "border-b-2 border-isl-gold text-isl-black" : "text-isl-gray"}`}>Subir video</button>
          <button type="button" role="tab" aria-selected={urlMode === "link"} onClick={() => setUrlMode("link")} className={`px-3 py-2 text-sm ${urlMode === "link" ? "border-b-2 border-isl-gold text-isl-black" : "text-isl-gray"}`}>Pegar link de YouTube o Vimeo</button>
        </div>
      ) : null}

      {kind !== "video" || urlMode === "upload" ? (
        <div
          className="isl-upload-zone cursor-pointer px-6 py-10 text-center"
          data-dragging={isDragging || undefined}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }}
        >
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept={accepts}
            multiple={kind === "image-multiple"}
            capture={isImage ? "environment" : undefined}
            onChange={handleInputChange}
          />
          <p className="font-serif text-2xl text-isl-black">{helperText}</p>
          {isImage ? <p className="mt-2 text-sm text-isl-black/60">También puedes sacar una foto con la cámara.</p> : null}
        </div>
      ) : (
        <div className="isl-upload-zone space-y-3 p-5">
          <label htmlFor="video-link" className="block text-sm text-isl-black">Link de YouTube o Vimeo</label>
          <input id="video-link" value={videoLink} onChange={(event) => setVideoLink(event.target.value)} placeholder="Pega el link aquí" className="w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 py-2 text-sm" />
          <button type="button" onClick={saveVideoLink} className="rounded-sm bg-isl-black px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-isl-white">Usar este link</button>
        </div>
      )}

      {selectedVideo ? (
        <div className="border border-isl-black/10 bg-isl-offwhite p-4 text-sm text-isl-black">
          <p>Video elegido: {selectedVideo.name} ({formatSize(selectedVideo.size)})</p>
          {selectedVideo.size > MAX_VIDEO_SIZE ? <p className="mt-2 text-isl-black/70">Este video pesa más de 50 MB. Puede demorar; si puedes, comprímelo antes de subirlo{allowUrlInstead ? " o usa un link de YouTube o Vimeo." : "."}</p> : null}
          <button type="button" onClick={() => { setIsUploading(true); void uploadSingleFile(selectedVideo).catch(() => setMessage("No pudimos subir este video. Intenta de nuevo.")).finally(() => { setIsUploading(false); setSelectedVideo(null); }); }} disabled={isUploading} className="mt-4 rounded-sm bg-isl-black px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-isl-white disabled:opacity-50">Subir video</button>
        </div>
      ) : null}

      {isUploading ? <div className="flex items-center gap-3 text-sm text-isl-black" role="status"><span className="size-4 animate-spin rounded-full border-2 border-isl-gold border-t-transparent" aria-hidden="true" />{message ?? "Preparando…"}</div> : null}
      {!isUploading && message ? <p className="text-sm text-isl-black/70" role="status">{message}</p> : null}

      {isImage && items.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, index) => (
            <div key={item.id} draggable={kind === "image-multiple"} onDragStart={() => setDraggedItemId(item.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { const fromIndex = itemsRef.current.findIndex((current) => current.id === draggedItemId); if (fromIndex >= 0) moveItem(fromIndex, index); setDraggedItemId(null); }} className="group relative aspect-square overflow-hidden rounded-sm bg-isl-offwhite">
              <img src={item.preview ?? item.url} alt={`Foto ${index + 1}`} className="size-full object-cover" />
              {index === 0 ? <span className="absolute left-2 top-2 rounded-sm bg-isl-gold px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-isl-black">Portada</span> : null}
              <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                <button type="button" onClick={() => moveItem(index, index - 1)} disabled={index === 0} className="rounded-sm bg-isl-white px-2 py-1 text-xs disabled:opacity-40" aria-label={`Mover foto ${index + 1} hacia atrás`}>←</button>
                <button type="button" onClick={() => moveItem(index, index + 1)} disabled={index === items.length - 1} className="rounded-sm bg-isl-white px-2 py-1 text-xs disabled:opacity-40" aria-label={`Mover foto ${index + 1} hacia adelante`}>→</button>
                <button type="button" onClick={() => replaceItems(itemsRef.current.filter((current) => current.id !== item.id))} className="rounded-sm bg-isl-black px-2 py-1 text-xs text-isl-white" aria-label={`Quitar foto ${index + 1}`}>Quitar</button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!isImage && items.length ? <div className="flex items-center justify-between border border-isl-black/10 bg-isl-offwhite p-4 text-sm"><span>{kind === "pdf" ? "Documento listo." : "Video listo."}</span><button type="button" onClick={() => replaceItems([])} className="underline">Quitar</button></div> : null}
    </div>
  );
}
