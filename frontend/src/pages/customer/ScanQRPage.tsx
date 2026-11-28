import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  CameraOff,
  QrCode,
  Keyboard,
  ScanLine,
  CircleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { SimulatedBadge } from "@/components/ui/SimulatedBadge";
import { useDemoReceipts } from "@/hooks/useDemoReceipts";

// Minimal typings for the experimental BarcodeDetector API.
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (opts: {
  formats: string[];
}) => BarcodeDetectorLike;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorCtor;
  }
}

export default function ScanQRPage() {
  const navigate = useNavigate();
  const demo = useDemoReceipts();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);

  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [manual, setManual] = useState("");

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "BarcodeDetector" in window);
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setActive(false);
  }, []);

  const goVerify = useCallback(
    (rawValue: string) => {
      stopCamera();
      navigate(`/app/verify?id=${encodeURIComponent(rawValue)}`);
    },
    [navigate, stopCamera],
  );

  const scanLoop = useCallback(() => {
    const detector = detectorRef.current;
    const video = videoRef.current;
    if (!detector || !video) return;
    detector
      .detect(video)
      .then((codes) => {
        if (codes.length > 0 && codes[0].rawValue) {
          goVerify(codes[0].rawValue);
          return;
        }
        rafRef.current = requestAnimationFrame(scanLoop);
      })
      .catch(() => {
        rafRef.current = requestAnimationFrame(scanLoop);
      });
  }, [goVerify]);

  const startCamera = useCallback(async () => {
    setError(null);
    if (!window.BarcodeDetector) {
      setSupported(false);
      setError(
        "This browser doesn't support on-device QR detection. Use the manual entry below, or open this page in Chrome on Android.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      detectorRef.current = new window.BarcodeDetector({
        formats: ["qr_code"],
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      rafRef.current = requestAnimationFrame(scanLoop);
    } catch (e) {
      setError(
        e instanceof Error && e.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access or use manual entry."
          : "Could not start the camera. Use manual entry below.",
      );
    }
  }, [scanLoop]);

  const onManualSubmit = () => {
    if (!manual.trim()) return;
    goVerify(manual.trim());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Scan & go"
        title="Scan a receipt QR code"
        description="Point your camera at the QR code on a ZRA Smart Invoice. We'll read the receipt ID and verify it for you."
        action={<SimulatedBadge label="On-device scan" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <div className="relative aspect-[4/3] w-full bg-ink-950">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`h-full w-full object-cover ${active ? "block" : "hidden"}`}
            />
            {!active && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-white">
                  <QrCode className="h-10 w-10" />
                </span>
                <p className="max-w-xs px-6 text-sm text-ink-300">
                  Camera preview appears here. Keep the QR code inside the frame.
                </p>
                <Button
                  onClick={startCamera}
                  leftIcon={<Camera className="h-4 w-4" />}
                >
                  Start camera
                </Button>
              </div>
            )}

            {/* Scan frame overlay */}
            {active && (
              <>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-48 w-48 rounded-2xl border-2 border-brand-400/80">
                    <span className="absolute left-0 right-0 top-0 h-0.5 animate-[scan_2s_ease-in-out_infinite] bg-brand-400 shadow-[0_0_12px_2px_rgba(16,185,129,0.8)]" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-ink-950/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-ink-950/80"
                >
                  <CameraOff className="h-4 w-4" /> Stop
                </button>
              </>
            )}
          </div>
          <CardBody className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <ScanLine className="h-4 w-4 text-brand-600" />
              {active ? "Scanning for a QR code…" : "Camera is off"}
            </div>
            {supported === false && (
              <Badge tone="warning">Unsupported browser</Badge>
            )}
          </CardBody>
        </Card>

        <div className="space-y-4">
          {error && (
            <Alert variant="warning" title="Heads up" action={<CircleAlert className="h-4 w-4" />}>
              {error}
            </Alert>
          )}

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-ink-400" />
              <h3 className="text-base font-semibold text-ink-900">
                Enter manually
              </h3>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              No camera? Paste the receipt ID or the full QR link.
            </p>
            <div className="mt-4 space-y-3">
              <Input
                placeholder="RCP-DEMO-OK or https://…/verify?id=RCP-DEMO-OK"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onManualSubmit()}
              />
              <Button
                fullWidth
                onClick={onManualSubmit}
                disabled={!manual.trim()}
                leftIcon={<QrCode className="h-4 w-4" />}
              >
                Continue to verify
              </Button>
            </div>
          </Card>

          <Card className="border-dashed bg-ink-50/50 p-5">
            <p className="text-sm font-semibold text-ink-700">Just exploring?</p>
            <p className="mt-1 text-sm text-ink-500">
              Simulate a scan with a demo receipt.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {demo.all.map((id) => (
                <Button
                  key={id}
                  size="sm"
                  variant="outline"
                  onClick={() => goVerify(id)}
                >
                  {id}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}