import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  File,
  FileText,
  CheckCircle2,
  Trash2,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { DocTypeConfig, UploadedDoc } from '@/types';
import { useDropzone } from '@/hooks/useDropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatBytes, cn } from '@/lib/utils';

export interface FileDropzoneProps {
  config: DocTypeConfig;
  uploadedDoc?: UploadedDoc;
  onUploadSuccess: (doc: UploadedDoc) => void;
  onRemove: (docId: string) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  config,
  uploadedDoc,
  onUploadSuccess,
  onRemove,
}) => {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (file: File) => {
    setErrorMessage(null);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 10;
        if (prev >= 90) {
          clearInterval(interval);
          // Complete upload
          setTimeout(() => {
            const previewUrl = file.type.startsWith('image/')
              ? URL.createObjectURL(file)
              : undefined;

            const newDoc: UploadedDoc = {
              id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              type: config.id,
              name: file.name,
              size: file.size,
              mimeType: file.type || 'application/octet-stream',
              uploadedAt: new Date().toISOString(),
              previewUrl,
            };

            onUploadSuccess(newDoc);
            setUploadProgress(null);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 120);
  };

  const { isDragging, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, handleInputChange } =
    useDropzone({
      acceptedFormats: config.acceptedFormats,
      maxSizeMB: config.maxSizeMB,
      onFileAccepted: (file) => {
        simulateUpload(file);
      },
      onError: (msg) => {
        setErrorMessage(msg);
      },
    });

  const handleDownload = () => {
    if (!uploadedDoc) return;
    if (uploadedDoc.previewUrl) {
      const a = document.createElement('a');
      a.href = uploadedDoc.previewUrl;
      a.download = uploadedDoc.name;
      a.click();
    } else {
      // Mock download for pdfs
      const blob = new Blob([`Simulated document content for ${uploadedDoc.name}`], {
        type: uploadedDoc.mimeType,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = uploadedDoc.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const isImage =
    uploadedDoc?.mimeType.startsWith('image/') ||
    uploadedDoc?.name.match(/\.(jpeg|jpg|png|webp)$/i);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-soft transition-all duration-150">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-heading text-sm font-semibold text-slate-900 dark:text-slate-100">
              {config.title}
            </h4>
            {config.required ? (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                Required
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Optional
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {config.description}
          </p>
        </div>

        {uploadedDoc && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Uploaded
          </span>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept={config.acceptedFormats.join(',')}
        onChange={handleInputChange}
      />

      {/* Uploading State */}
      {uploadProgress !== null ? (
        <div className="py-6 px-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 text-center space-y-3">
          <div className="w-9 h-9 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="max-w-xs mx-auto space-y-1.5">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Uploading & scanning document...
            </p>
            <Progress value={uploadProgress} showLabel />
          </div>
        </div>
      ) : uploadedDoc ? (
        /* Uploaded Document Card */
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3 min-w-0">
            {/* Thumbnail or Icon */}
            {isImage && uploadedDoc.previewUrl ? (
              <img
                src={uploadedDoc.previewUrl}
                alt={uploadedDoc.name}
                className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                {uploadedDoc.mimeType === 'application/pdf' ? (
                  <FileText className="w-6 h-6" />
                ) : (
                  <File className="w-6 h-6" />
                )}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {uploadedDoc.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {formatBytes(uploadedDoc.size)} • Uploaded{' '}
                {new Date(uploadedDoc.uploadedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              title="Download file"
              aria-label={`Download ${uploadedDoc.name}`}
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              title="Replace document"
              aria-label={`Replace ${uploadedDoc.name}`}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Replace
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onRemove(uploadedDoc.id)}
              title="Delete document"
              aria-label={`Remove ${uploadedDoc.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Empty Dropzone Container */
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={cn(
            'group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 text-center select-none focus:outline-none focus:ring-2 focus:ring-indigo-500',
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/40 dark:bg-slate-900/40',
          )}
        >
          <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-all mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-300 underline-offset-2">
              Click to browse
            </span>{' '}
            or drag and drop file here
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Accepts: {config.acceptedFormats.map((f) => f.replace('application/', '').replace('image/', '')).join(', ').toUpperCase()} (Max {config.maxSizeMB}MB)
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-500 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
