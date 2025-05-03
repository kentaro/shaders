"use client";
import { useState, useCallback, useRef } from "react";

export function useRecorder(canvas?: HTMLCanvasElement | null) {
  const mediaRef = useRef<MediaRecorder | null>(null);
  const [url, setUrl] = useState<string>("");
  const [recording, setRecording] = useState(false);

  const start = useCallback(() => {
    if (!canvas || recording) return;
    const stream = canvas.captureStream();
    const rec = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });
    const chunks: BlobPart[] = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setUrl(URL.createObjectURL(blob));
      setRecording(false);
    };
    rec.start();
    mediaRef.current = rec;
    setRecording(true);
  }, [canvas, recording]);

  const stop = useCallback(() => {
    mediaRef.current?.stop();
  }, []);

  return { start, stop, url, recording };
} 