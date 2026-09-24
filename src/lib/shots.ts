/**
 * The photographic protocol as the portal sees it.
 *
 * The server is the authority — `CaseDetailDto.missingShots` is what actually blocks inference and
 * diagnosis — but the intake screen has the images and the catalogue before the case file is ever
 * re-read, so the same rule is applied here to disable buttons and explain why, without a round
 * trip per photograph.
 */

export interface ShotDefinitionLike {
  key: string;
  label: string;
  required: boolean;
}

export interface CaseImageLike {
  shotKey: string | null;
  isHeatmap: boolean;
}

/** Required shots with no photograph yet, in protocol order. Same rule as the API. */
export function missingRequiredShots<S extends ShotDefinitionLike>(
  images: readonly CaseImageLike[],
  shots: readonly S[],
): S[] {
  const present = new Set(
    images.filter((image) => !image.isHeatmap && image.shotKey !== null).map((i) => i.shotKey),
  );
  return shots.filter((shot) => shot.required && !present.has(shot.key));
}

/** «Vista general, Perfil izquierdo» — for banners and button hints. */
export function listShotLabels(shots: ReadonlyArray<{ label: string }>): string {
  return shots.map((shot) => shot.label).join(', ');
}

/** The label of a shot key, or a neutral fallback for photographs that followed no protocol. */
export function shotLabel(shots: readonly ShotDefinitionLike[], key: string | null): string {
  if (key === null) return 'Sin toma asignada';
  return shots.find((shot) => shot.key === key)?.label ?? key;
}

/**
 * Which image to send to the model. The frontal view is the one the grade is meant for; failing
 * that, the most recent photograph (a retaken shot supersedes the one that came out blurred).
 */
export function pickImageForInference<I extends CaseImageLike & { id: string }>(
  images: readonly I[],
): I | undefined {
  const clinical = images.filter((image) => !image.isHeatmap);
  const frontal = [...clinical].reverse().find((image) => image.shotKey === 'general');
  return frontal ?? clinical[clinical.length - 1];
}
