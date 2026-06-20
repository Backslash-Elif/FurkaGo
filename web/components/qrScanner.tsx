"use client";
import React, { useRef, useEffect, useState } from "react";
import jsQR, { QRCode } from "jsqr";
import { useRouter } from "next/navigation";
import { Button, Disclosure } from "@heroui/react";

export default function QRScanner({ className, style, viewfinderSize = 0.6 }: any) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [lastDecoded, setLastDecoded] = useState<string | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let mountedOk = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!mountedOk) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          tick();
        }
      } catch {
        setError("Camera not available or permission denied");
      }
    }

    function stopCamera() {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }

    function isValidHttpUrl(str: string): URL | null {
      try {
        const url = new URL(str);
        if (url.protocol === "http:" || url.protocol === "https:") return url;
        return null;
      } catch {
        return null;
      }
    }

    function drawBoundingBox(
      ctx: CanvasRenderingContext2D,
      loc: {
        topLeftCorner: { x: number; y: number };
        topRightCorner: { x: number; y: number };
        bottomRightCorner: { x: number; y: number };
        bottomLeftCorner: { x: number; y: number };
      },
      offsetX = 0,
      offsetY = 0
    ) {
      const stroke = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(offsetX + p1.x, offsetY + p1.y);
        ctx.lineTo(offsetX + p2.x, offsetY + p2.y);
        ctx.stroke();
      };
      stroke(loc.topLeftCorner, loc.topRightCorner);
      stroke(loc.topRightCorner, loc.bottomRightCorner);
      stroke(loc.bottomRightCorner, loc.bottomLeftCorner);
      stroke(loc.bottomLeftCorner, loc.topLeftCorner);
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (video.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = vw;
      canvas.height = vh;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      ctx.drawImage(video, 0, 0, vw, vh);

      const size = Math.min(vw, vh) * Math.max(0.01, Math.min(1, viewfinderSize));
      const sx = Math.round((vw - size) / 2);
      const sy = Math.round((vh - size) / 2);

      const imageData = ctx.getImageData(sx, sy, Math.round(size), Math.round(size));
      const code = jsQR(imageData.data, imageData.width, imageData.height) as QRCode | null;

      if (code) {
        drawBoundingBox(ctx, code.location, sx, sy);
        const text = code.data.trim();

        if (text && text !== lastDecoded) {
          setLastDecoded(text);

          const url = isValidHttpUrl(text);
          if (url) {
            stopCamera();
            const sameOrigin = url.origin === window.location.origin;
            if (sameOrigin) router.push(url.pathname + url.search + url.hash);
            else window.location.href = url.toString();
            return;
          } else {
            setError("QR code detected but not a valid http/https URL");
            setTimeout(() => setError(null), 1000);
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    if (isExpanded) startCamera();
    else stopCamera();

    return () => {
      mountedOk = false;
      stopCamera();
    };
  }, [isExpanded, router, viewfinderSize, lastDecoded]);

  // ✅ Prevent server/client mismatch by not rendering the Disclosure body until mounted
  if (!mounted) {
    return (
      <Disclosure isExpanded={false} onExpandedChange={setIsExpanded}>
        <Disclosure.Heading>
          <Button slot="trigger" variant="secondary">
            Open Camera
            <Disclosure.Indicator />
          </Button>
        </Disclosure.Heading>
      </Disclosure>
    );
  }

  return (
    <Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
      <Disclosure.Heading>
        <Button slot="trigger" variant="secondary">
          Open Camera
          <Disclosure.Indicator />
        </Button>
      </Disclosure.Heading>

      <Disclosure.Content>
        <Disclosure.Body className="shadow-panel flex flex-col items-center rounded-3xl bg-surface p-4 text-center">
          <video
            ref={videoRef}
            style={{ width: "100%", height: "auto", objectFit: "cover" }}
            playsInline
            muted
          />

          <div
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: `${Math.round(viewfinderSize * 100)}%`,
              height: `${Math.round(viewfinderSize * 100)}%`,
              transform: "translate(-50%, -50%)",
              border: "2px dashed rgba(255,255,255,0.9)",
              boxSizing: "border-box",
              borderRadius: 8,
              pointerEvents: "none",
            }}
          />

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {error && <div style={{ color: "red", marginTop: 8 }} role="status">{error}</div>}
          <p>Depending on your device the QR scanner might need a few seconds to start. No data is being processed remotely.</p>
        </Disclosure.Body>
      </Disclosure.Content>
    </Disclosure>
  );
}
