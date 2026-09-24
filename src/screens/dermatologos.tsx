'use client';

import { StaffRoleSection } from '@/components/portal/staff-role-section';

/**
 * Alta y mantenimiento de los especialistas. Solo del administrador.
 *
 * El dermatólogo es el SUJETO que el estudio mide, y por eso su alta no vive donde vive la del
 * mostrador: a un técnico lo da de alta quien lo necesita en consulta, pero incorporar a otro
 * profesional al censo de la tesis es una decisión sobre la muestra, no sobre el turno.
 */
export default function DermatologosPage(): JSX.Element {
  return (
    <StaffRoleSection
      role="dermatologo"
      title="Dermatólogos"
      description="Quien emite el diagnóstico de referencia y firma la receta. Es el profesional que el estudio mide (OE1–OE4)."
      formTitle="Registrar un dermatólogo"
      formDescription="La cuenta se crea activa. Su consentimiento informado (RNF-07) lo firma la propia persona desde «Mi cuenta»."
      listTitle="Dermatólogos registrados"
      roleLockHint="Esta sección da de alta solo especialistas. Use «Usuarios» para cualquier otro rol."
      linkToDetail
    />
  );
}
