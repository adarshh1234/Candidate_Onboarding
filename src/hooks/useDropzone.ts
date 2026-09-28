import { useState, useCallback, DragEvent, ChangeEvent } from 'react';

interface UseDropzoneOptions {
  acceptedFormats: string[];
  maxSizeMB: number;
  onFileAccepted: (file: File) => void;
  onError?: (error: string) => void;
}

export function useDropzone({
  acceptedFormats,
  maxSizeMB,
  onFileAccepted,
  onError,
}: UseDropzoneOptions) {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = useCallback(
    (file: File): boolean => {
      const isFormatValid =
        acceptedFormats.length === 0 ||
        acceptedFormats.some((format) => {
          if (format.endsWith('/*')) {
            const prefix = format.replace('/*', '');
            return file.type.startsWith(prefix);
          }
          return file.type === format || file.name.toLowerCase().endsWith(format.replace('.', ''));
        });

      if (!isFormatValid) {
        const errorMsg = `Invalid file format. Allowed formats: ${acceptedFormats.map((f) => f.split('/')[1] || f).join(', ')}`;
        onError?.(errorMsg);
        return false;
      }

      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const errorMsg = `File size exceeds ${maxSizeMB}MB limit. (Current: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
        onError?.(errorMsg);
        return false;
      }

      return true;
    },
    [acceptedFormats, maxSizeMB, onError],
  );

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const firstFile = files[0];
      if (firstFile && validateFile(firstFile)) {
        onFileAccepted(firstFile);
      }
    },
    [onFileAccepted, validateFile],
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      const firstFile = files[0];
      if (firstFile && validateFile(firstFile)) {
        onFileAccepted(firstFile);
      }
      // Reset input value so re-selecting same file triggers event
      e.target.value = '';
    },
    [onFileAccepted, validateFile],
  );

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleInputChange,
  };
}
