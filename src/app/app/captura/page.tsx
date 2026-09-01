'use client';

import { ArrowLeft, Camera, RefreshCw, Sun } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Alert } from '@/components/ui/feedback';

type Stage = 'idle' | 'streaming' | 'captured' | 'error';

/**
 * Guided facial capture (Sección 9.3).
 *
 * The framing overlay is not decoration: the specification asks for a guide covering full face,
 * frontal light and a suggested distance, because the model is trained on cropped faces and an
 * off-frame or backlit photograph degrades the prediction it will later be judged on.
 *
 * The captured frame never leaves the device until the patient explicitly sends it.
 */
export default function CapturaPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopStream, [stopStream]);

  const start = useCallback(async () => {
    setError(null);
    if (typeof navigator === 'undefined' || navigator.mediaDevices?.getUserMedia === undefined) {
      setStage('error');
      setError(
        'Este navegador no permite el acceso a la cámara. Abra la aplicación desde el navegador ' +
          'del teléfono, o adjunte una fotografía desde el portal del centro.',
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current !== null) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStage('streaming');
    } catch {
      setStage('error');
      setError(
        'No se pudo acceder a la cámara. Revise los permisos del navegador e inténtelo de nuevo.',
      );
    }
  }, []);

  function capture(): void {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video === null || canvas === null) return;

    // Square centre crop: it matches the model's input geometry, so what the patient frames is
    // what the network will actually see.
    const side = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = side;
    canvas.height = side;

    const context = canvas.getContext('2d');
    if (context === null) return;
    context.drawImage(
      video,
      (video.videoWidth - side) / 2,
      (video.videoHeight - side) / 2,
      side,
      side,
      0,
      0,
      side,
      side,
    );

    setPreview(canvas.toDataURL('image/jpeg', 0.92));
    setStage('captured');
    stopStream();
  }

  return (
    <div className="space-y-4">
      <Link
        href="/app"
        className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver
      </Link>

      <Card>
        <CardBody className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-(family-name:--font-poppins) text-base font-semibold text-slate-900 dark:text-slate-100">
              Guía de encuadre
            </h2>
            <ul className="list-disc space-y-0.5 pl-4 text-sm text-slate-500 dark:text-slate-400">
              <li>Rostro completo dentro del óvalo, mirando de frente.</li>
              <li>Luz frontal y uniforme; evite contraluces y sombras duras.</li>
              <li>Distancia aproximada de 30 cm, sin maquillaje ni filtros.</li>
            </ul>
          </div>

          <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
            {stage === 'captured' && preview !== null ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Fotografía capturada" className="h-full w-full object-cover" />
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                  aria-label="Vista previa de la cámara"
                />
                {/* Framing overlay */}
                <svg
                  viewBox="0 0 100 100"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  aria-hidden
                >
                  <ellipse
                    cx="50"
                    cy="46"
                    rx="27"
                    ry="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    strokeDasharray="3 2"
                    className="text-cyan-700 dark:text-cyan-400"
                  />
                </svg>
              </>
            )}

            {stage === 'idle' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <Button onClick={() => void start()}>
                  <Camera className="h-4 w-4" aria-hidden />
                  Activar cámara
                </Button>
              </div>
            ) : null}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {error !== null ? <Alert tone="danger">{error}</Alert> : null}

          {stage === 'streaming' ? (
            <Button block onClick={capture}>
              <Camera className="h-4 w-4" aria-hidden />
              Tomar fotografía
            </Button>
          ) : null}

          {stage === 'captured' ? (
            <div className="space-y-2">
              <Alert tone="info" title="Revise la fotografía">
                Compruebe que el rostro se ve completo y bien iluminado antes de enviarla.
              </Alert>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  block
                  onClick={() => {
                    setPreview(null);
                    void start();
                  }}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Repetir
                </Button>
                <Button block disabled title="Requiere vincular la cuenta del paciente">
                  Enviar al centro
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                El envío directo desde la app requiere vincular su cuenta con el centro. Mientras
                tanto, muestre esta fotografía en consulta o envíela por el canal que le indicaron.
              </p>
            </div>
          ) : null}

          {stage !== 'captured' ? (
            <p className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Sun className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              La fotografía no sale de su teléfono hasta que usted decida enviarla.
            </p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
