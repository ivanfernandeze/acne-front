import type { ReactNode } from 'react';

import { PortalShell } from '@/components/portal/portal-shell';

/**
 * Administración — portal del rol `admin`.
 *
 * El armazon es comun a los tres portales; lo unico propio de cada uno es que secciones existen, y
 * eso lo declara `lib/portals.ts`. `PortalShell` resuelve la sesion y rechaza a quien no sea de
 * este rol, de modo que la frontera es una propiedad de la URL y no una condicion por pantalla.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <PortalShell slug="admin">{children}</PortalShell>;
}
