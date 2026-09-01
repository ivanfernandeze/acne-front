/**
 * Display labels for the four study roles.
 *
 * The authoritative list lives in `acne-api/src/common/domain/roles.ts` and reaches the portal
 * through `GET /meta/catalogs`. This map exists only for the chrome — the top bar renders the
 * role on every screen and must not wait on a network round trip to do it. Anything that carries
 * clinical or instrumental meaning still reads the served catalogue.
 */
export const USER_ROLE_LABELS: Record<string, string> = {
  dermatologo: 'Dermatólogo',
  residente: 'Residente',
  admin: 'Administrador',
  evaluador_estadistico: 'Evaluador estadístico',
};
