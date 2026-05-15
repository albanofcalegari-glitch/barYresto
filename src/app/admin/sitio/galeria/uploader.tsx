"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function GalleryUploader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const altRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFiles(files: FileList) {
    setError(null);
    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        const body = new FormData();
        body.append("file", file);

        const uploadRes = await fetch("/api/upload", { method: "POST", body });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          setError(uploadData.error ?? "Error al subir imagen");
          continue;
        }

        const saveBody = new FormData();
        saveBody.append("url", uploadData.url);
        saveBody.append("publicId", uploadData.publicId);
        saveBody.append("kind", "GALLERY");
        saveBody.append("alt", altRef.current?.value ?? "");

        const { addMediaAsset } = await import("@/modules/media/actions");
        await addMediaAsset(saveBody);
      } catch {
        setError("Error al subir la imagen");
      }
    }

    setUploading(false);
    if (altRef.current) altRef.current.value = "";
    startTransition(() => router.refresh());
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="label">Texto alternativo (opcional)</label>
          <input
            ref={altRef}
            type="text"
            placeholder="Ej: Salón principal, Vista del patio"
            maxLength={200}
            className="input"
          />
        </div>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="mt-3 border-2 border-dashed border-th-border rounded-lg p-6 text-center cursor-pointer hover:border-brand-500/40 transition-colors"
      >
        {uploading || pending ? (
          <div className="text-sm text-th-text-muted">Subiendo...</div>
        ) : (
          <>
            <svg className="w-8 h-8 mx-auto text-th-text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            <div className="text-sm text-th-text-muted">Click o arrastrá fotos para subir</div>
            <div className="text-xs text-th-text-muted mt-1">JPG, PNG o WebP. Máx 5 MB cada una.</div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {error && (
        <div className="text-xs text-red-400 mt-2">{error}</div>
      )}

      <p className="text-xs text-th-text-muted mt-3">
        Si Cloudinary no está configurado, podés agregar fotos por URL desde el formulario de abajo.
      </p>
    </div>
  );
}
