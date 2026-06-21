"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import jsQR, { QRCode } from "jsqr";
import { useRouter } from "next/navigation";
import { Button, Disclosure } from "@heroui/react";
import { HiQrCode } from "react-icons/hi2";

export default function QRScanner({
  className,
  style,
  viewfinderSize = 0.6,
}: any) {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [lastDecoded, setLastDecoded] = useState<string | null>(null);

  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const supportsGetUserMedia = useMemo(() => {
    return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  }, []);

  useEffect(() => {
    let mountedOk = true;

    const stopCamera = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };

    const isValidHttpUrl = (str: string): URL | null => {
      try {
        const url = new URL(str);
        return url.protocol === "http:" || url.protocol === "https:" ? url : null;
      } catch {
        return null;
      }
    };

    const drawBoundingBox = (
      ctx: CanvasRenderingContext2D,
      loc: {
        topLeftCorner: { x: number; y: number };
        topRightCorner: { x: number; y: number };
        bottomRightCorner: { x: number; y: number };
        bottomLeftCorner: { x: number; y: number };
      },
      offsetX = 0,
      offsetY = 0,
    ) => {
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
    };

    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // If permission not granted yet or camera not ready, keep polling
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
            window.setTimeout(() => {
              if (mountedOk) setError(null);
            }, 1000);
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // Try immediately on component load:
    // Note: many browsers still require a user gesture to show the permission prompt.
    // If blocked, you’ll see an error below; you can switch to a gesture-based start if needed.
    (async () => {
      if (!supportsGetUserMedia) {
        setError("Camera not available in this browser");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (!mountedOk) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setHasCameraAccess(true);
          tick(); // start decoding immediately, even if disclosure is closed
        }
      } catch (e) {
        // If the browser blocks prompts without a user gesture, this will hit here.
        setError("Camera permission denied (or requires a user gesture to start).");
        console.error(e);
      }
    })();

    return () => {
      mountedOk = false;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, viewfinderSize, supportsGetUserMedia]);

  const visible = mounted && isExpanded;

  if (!mounted) {
    return (
      <Disclosure className="w-full flex flex-col items-center" isExpanded={false} onExpandedChange={setIsExpanded}>
        <Disclosure.Heading className="w-full flex flex-col items-center">
          <Button slot="trigger" variant="secondary">
            <HiQrCode /> Scan QR
            <Disclosure.Indicator />
          </Button>
        </Disclosure.Heading>
      </Disclosure>
    );
  }

  return (
    <div className="w-full max-w-md text-center" style={style}>
      <Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
        <Disclosure.Heading>
          <Button slot="trigger" variant="secondary">
            <HiQrCode /> Scan QR
            <Disclosure.Indicator />
          </Button>
        </Disclosure.Heading>

        <Disclosure.Content>
          <Disclosure.Body className="shadow-panel flex flex-col items-center rounded-3xl bg-surface p-4 text-center">
            {/* Keep the video element mounted for fastest decoding; just hide it visually when closed */}
            <div style={{ width: "100%", position: "relative" }}>
              <video
                ref={videoRef}
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                  display: visible ? "block" : "none",
                }}
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
                  display: visible ? "block" : "none",
                }}
              />
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            {error && (
              <div style={{ color: "red", marginTop: 8 }} role="status">
                {error}
              </div>
            )}

            {!error && !hasCameraAccess && <p>Requesting camera permission…</p>}
            {!error && hasCameraAccess && (
              <p>Scanner is active{visible ? " and visible" : " (camera running while disclosure is closed)"}.</p>
            )}
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </div>
  );
}
