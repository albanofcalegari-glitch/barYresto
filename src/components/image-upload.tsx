"use client";

import { useRef, useState } from "react";

interface ImageUploadProps {
  name: string;
  defaultValue?: string;
  label?: string;
  hint?: string;
}

export function ImageUpload({ name, defaultValue, label, hint }: ImageUploadProps) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al subir imagen");
        return;
      }

      setUrl(data.url);
    } catch {
      setError("Error de conexión");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      {label && (
        <label className="label">{label}</label>
      )}

      <input type="hidden" name={name} value={url} />

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-zinc-200 rounded-lg p-4 text-center cursor-pointer hover:border-brand-400 transition-colors"
      >
        {uploading ? (
          <div className="py-4">
            <div className="text-sm text-zinc-500">Subiendo...</div>
          </div>
        ) : url ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Preview"
              className="max-h-40 mx-auto rounded-md object-cover"
            />
            <div className="text-xs text-zinc-500">Click o arrastrá para cambiar</div>
          </div>
        ) : (
          <div className="py-6">
            <svg className="w-8 h-8 mx-auto text-zinc-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <div className="text-sm text-zinc-500">Click o arrastrá una imagen</div>
            <div className="text-xs text-zinc-400 mt-1">JPG, PNG o WebP. Máx 5 MB.</div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleChange}
      />

      {/* Fallback: manual URL input */}
      <div className="mt-2">
        <input
          type="url"
          placeholder="O pegá una URL de imagen"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input text-xs"
        />
      </div>

      {error && (
        <div className="text-xs text-red-600 mt-1">{error}</div>
      )}
      {hint && !error && (
        <p className="text-xs text-zinc-500 mt-1">{hint}</p>
      )}
    </div>
  );
}
