'use client';

import { StaffRoleSection } from '@/components/portal/staff-role-section';
import { hasSection } from '@/lib/portals';
import { usePortal } from '@/lib/use-portal';

/**
 * Alta y mantenimiento del personal de admisión.
 *
 * La misma pantalla en dos portales, y esa es la única razón por la que decide algo: en el del
 * administrador cada fila enlaza a la ficha completa de la cuenta; en el del especialista no,
 * porque `/usuarios/:id` no existe ahí y ofrecer un enlace a un 404 es peor que no ofrecerlo. Se
 * pregunta por la SECCIÓN y no por el rol de quien mira: es la propiedad de la que depende.
 */
export default function TecnicosPage(): JSX.Element {
  const { portal } = usePortal();

  return (
    <StaffRoleSection
      role="tecnico"
      title="Técnicos"
      description="Quien recibe al paciente, abre el caso y toma la anamnesis y las fotografías. No diagnostica."
      formTitle="Registrar un técnico"
      formDescription="La cuenta se crea activa. La persona podrá cambiar su contraseña desde «Mi cuenta»."
      listTitle="Técnicos registrados"
      roleLockHint="Esta sección da de alta solo cuentas de mostrador. El servidor lo comprueba también."
      linkToDetail={hasSection(portal, '/usuarios')}
    />
  );
}
