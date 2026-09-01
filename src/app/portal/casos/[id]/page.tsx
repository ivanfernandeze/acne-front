'use client';

import { ArrowLeft, Brain, CheckCircle2, ImageOff, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { DiagnosisForm } from '@/components/portal/diagnosis-form';
import { useSession } from '@/components/session-provider';
import { Badge, StudyModeBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Alert, ErrorState, Loading, StudyModeBlocked } from '@/components/ui/feedback';
import { api, ApiError, type PostResult } from '@/lib/api';
import { num, pct } from '@/lib/format';
import { useAction } from '@/lib/use-api';
import { igaLabel, useCatalogs } from '@/lib/use-catalogs';

type CaseDetail = PostResult<'/cases/{id}/open'>;
type Inference = PostResult<'/inference/case/{caseId}/image/{imageId}'>;
/** The API returns diagnoses as an untyped list on the detail; narrow it for rendering. */
type CaseDiagnosis = { id: string; igaClass: string; studyMode: string; createdAt: string };

/**
 * Case review screen.
 *
 * This is where the experiment actually happens, so two behaviours are load-bearing:
 *
 *  - **The chronometer is invisible.** Opening the case POSTs to `/cases/:id/open`, which stamps
 *    `t₀` server-side; submitting the diagnosis stamps `t₁`. Nothing counts down on screen: a
 *    visible timer would change how fast the physician works and bias the very measurement OE1
 *    is trying to capture.
 *  - **In pretest there is no trace of the AI.** No panel, no placeholder, no "hidden" section —
 *    and the server refuses the route anyway (RF-TR-01).
 */
export default function CasoDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { data: catalogs } = useCatalogs();

  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const caseId = params.id;

  const open = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // POST, not GET: this call is what starts the measurement, and browsers freely retry and
      // prefetch GETs.
      const result = await api.post<CaseDetail>(`/cases/${caseId}/open`);
      setDetail(result);
      const clinical = result.images.find((image) => !image.isHeatmap);
      setSelectedImage(clinical?.id ?? null);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught
          : new ApiError(0, caught instanceof Error ? caught.message : String(caught)),
      );
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void open();
  }, [open]);

  const requestInference = useAction(async (imageId: string) =>
    api.post<Inference>(`/inference/case/${caseId}/image/${imageId}`),
  );

  const closeCase = useAction(async () => api.post(`/cases/${caseId}/close`));

  if (loading) return <Loading label="Abriendo la ficha del caso…" />;
  if (error !== null) return <ErrorState message={error.message} onRetry={() => void open()} />;
  if (detail === null) return null;

  const clinicalImages = detail.images.filter((image) => !image.isHeatmap);
  const heatmap = detail.images.find(
    (image) => image.isHeatmap && image.id === detail.inference?.heatmapImageId,
  );
  const displayed =
    showHeatmap && heatmap !== undefined && detail.aiVisible
      ? heatmap
      : (clinicalImages.find((image) => image.id === selectedImage) ?? clinicalImages[0]);

  const diagnoses = detail.diagnoses as unknown as CaseDiagnosis[];
  const alreadyDiagnosed = diagnoses.some((diagnosis) => diagnosis.studyMode === user?.studyMode);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/portal/casos"
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver a la bandeja
          </Link>
          <h1 className="mt-1 font-display text-xl font-bold text-foreground">
            {detail.caseCode}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="font-mono text-xs">{detail.patientCode}</span>
            <span aria-hidden>·</span>
            <Badge variant="neutral">
              {catalogs?.caseStatuses.labels[detail.status] ?? detail.status}
            </Badge>
            {detail.isSynthetic ? <Badge variant="outline">sintético</Badge> : null}
          </p>
        </div>
        {user !== null ? <StudyModeBadge mode={user.studyMode} /> : null}
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Imagen clínica"
              description={
                detail.aiVisible && heatmap !== undefined
                  ? 'Puede alternar entre la fotografía y el mapa de calor Grad-CAM.'
                  : 'Fotografía facial del caso.'
              }
              action={
                detail.aiVisible && heatmap !== undefined ? (
                  <Button
                    variant={showHeatmap ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setShowHeatmap((value) => !value)}
                  >
                    <Sparkles className="h-4 w-4" aria-hidden />
                    {showHeatmap ? 'Ver original' : 'Ver Grad-CAM'}
                  </Button>
                ) : null
              }
            />
            <CardBody>
              {displayed === undefined ? (
                <div className="flex flex-col items-center gap-2 py-12 text-muted">
                  <ImageOff className="h-8 w-8" aria-hidden />
                  <p className="text-sm">Este caso todavía no tiene imágenes.</p>
                </div>
              ) : (
                <>
                  {/* Signed URL with a 15-minute TTL, served decrypted by the API (RNF-02). */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={api.url(displayed.url.replace(/^\/api/, ''))}
                    alt={`Imagen clínica del caso ${detail.caseCode}`}
                    className="w-full rounded-md border border-border bg-surface-muted object-contain"
                  />
                  {clinicalImages.length > 1 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {clinicalImages.map((image, index) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => {
                            setSelectedImage(image.id);
                            setShowHeatmap(false);
                          }}
                          className={
                            image.id === selectedImage
                              ? 'rounded-md border-2 border-primary px-3 py-1 text-xs font-medium text-primary'
                              : 'rounded-md border border-border px-3 py-1 text-xs text-muted hover:border-primary'
                          }
                        >
                          Imagen {index + 1}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Diagnóstico preliminar de la IA" />
            <CardBody>
              {!detail.aiVisible ? (
                <StudyModeBlocked />
              ) : detail.inference === null ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted">
                    Este caso aún no tiene una inferencia. Encólela para obtener la clase IGA
                    sugerida y el mapa Grad-CAM.
                  </p>
                  <Button
                    loading={requestInference.pending}
                    disabled={clinicalImages.length === 0}
                    onClick={() => {
                      const target = clinicalImages[0];
                      if (target !== undefined) {
                        void requestInference.run(target.id).then(() => {
                          window.setTimeout(() => void open(), 2500);
                        });
                      }
                    }}
                  >
                    <Brain className="h-4 w-4" aria-hidden />
                    Solicitar inferencia
                  </Button>
                  {requestInference.error !== null ? (
                    requestInference.error.isStudyModeBlock ? (
                      <StudyModeBlocked />
                    ) : (
                      <Alert tone="danger">{requestInference.error.message}</Alert>
                    )
                  ) : null}
                </div>
              ) : detail.inference.status !== 'succeeded' ? (
                <Alert tone="info" title={`Inferencia en estado "${detail.inference.status}"`}>
                  La cola procesa la imagen de forma asíncrona para que la latencia del modelo no
                  se sume al tiempo de revisión médica que mide OE1.
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => void open()}>
                    Actualizar
                  </Button>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-end gap-4">
                    <div>
                      <p className="text-xs text-muted">Clase IGA sugerida</p>
                      <p className="font-display text-2xl font-bold text-postest">
                        {igaLabel(catalogs, detail.inference.igaClass)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Confianza</p>
                      <p className="font-display text-xl font-semibold tabular-nums text-foreground">
                        {detail.inference.confidence === null
                          ? '—'
                          : pct(detail.inference.confidence * 100)}
                      </p>
                    </div>
                    <div className="ml-auto text-right text-xs text-muted">
                      <p>GAGS: {detail.inference.gagsScore ?? '—'}</p>
                      <p>{detail.inference.latencyMs ?? '—'} ms</p>
                    </div>
                  </div>

                  {detail.inference.classProbs !== null ? (
                    <div className="space-y-1.5">
                      {Object.entries(detail.inference.classProbs)
                        .sort(([, a], [, b]) => b - a)
                        .map(([igaClass, probability]) => (
                          <div key={igaClass} className="flex items-center gap-2 text-xs">
                            <span className="w-36 shrink-0 text-muted">
                              {igaLabel(catalogs, igaClass)}
                            </span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                              <div
                                className="h-full rounded-full bg-postest"
                                style={{ width: `${Math.round(probability * 100)}%` }}
                              />
                            </div>
                            <span className="w-12 text-right tabular-nums text-foreground">
                              {num(probability * 100, 1)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : null}

                  {detail.inference.modelBackend === 'stub' ? (
                    <Alert tone="warning" title="Backend de demostración">
                      El motor opera con el clasificador determinista{' '}
                      <code>{detail.inference.modelVersion}</code>. Esta sugerencia{' '}
                      <strong>no proviene de una CNN entrenada</strong> y no puede citarse como
                      resultado de la tesis.
                    </Alert>
                  ) : null}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          {alreadyDiagnosed ? (
            <Card className="border-success/50">
              <CardBody className="space-y-3">
                <p className="flex items-center gap-2 font-display text-sm font-semibold text-success">
                  <CheckCircle2 className="h-5 w-5" aria-hidden />
                  Caso ya diagnosticado en esta condición
                </p>
                <p className="text-sm text-muted">
                  Cada caso aporta una única medición por condición experimental. Para la otra
                  observación, cambie su modo de estudio.
                </p>
                {detail.timing?.durationMinutes != null ? (
                  <p className="text-sm text-muted">
                    Tiempo de revisión registrado:{' '}
                    <strong className="text-foreground">
                      {num(detail.timing.durationMinutes)} min
                    </strong>
                  </p>
                ) : null}
                {detail.status === 'diagnosed' ? (
                  <Button
                    variant="outline"
                    loading={closeCase.pending}
                    onClick={() => void closeCase.run().then(() => open())}
                  >
                    Cerrar caso
                  </Button>
                ) : null}
              </CardBody>
            </Card>
          ) : (
            <DiagnosisForm
              caseId={detail.id}
              aiSuggestion={detail.aiVisible ? (detail.inference?.igaClass ?? null) : null}
              onSubmitted={() => {
                void open();
                router.refresh();
              }}
            />
          )}

          <Card>
            <CardHeader title="Mediciones registradas" />
            <CardBody className="space-y-2 text-sm">
              {diagnoses.length === 0 ? (
                <p className="text-muted">Sin diagnósticos todavía.</p>
              ) : (
                diagnoses.map((diagnosis) => (
                  <div
                    key={diagnosis.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                  >
                    <StudyModeBadge mode={diagnosis.studyMode} />
                    <span className="text-foreground">
                      {igaLabel(catalogs, diagnosis.igaClass)}
                    </span>
                  </div>
                ))
              )}
              {detail.groundTruthIga !== null ? (
                <p className="pt-2 text-xs text-muted">
                  Patrón de consenso del lote:{' '}
                  <strong className="text-foreground">
                    {igaLabel(catalogs, detail.groundTruthIga)}
                  </strong>{' '}
                  — es lo que hace comparables pretest y postest (RF-OE2-05).
                </p>
              ) : (
                <p className="pt-2 text-xs text-warning">
                  Este caso no tiene patrón de consenso, por lo que no aporta al cálculo de TPD.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
