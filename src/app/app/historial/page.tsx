import { ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

import { Card, CardBody } from '@/components/ui/card';

/**
 * Patient's own history.
 *
 * Deliberately not wired to the clinical API yet: exposing a patient's cases requires a patient
 * identity provider and a consent-scoped token, which the study does not have. Showing an empty
 * shell is honest; inventing data or reusing a clinician's session would not be.
 */
export default function HistorialPage() {
  return (
    <div className="space-y-4">
      <Link
        href="/app"
        className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver
      </Link>

      <Card>
        <CardBody className="space-y-3 text-center">
          <Clock className="mx-auto h-7 w-7 text-neutral-500" aria-hidden />
          <h2 className="text-base font-semibold text-neutral-900">
            Historial no disponible todavía
          </h2>
          <p className="text-sm text-neutral-500">
            Para mostrarle sus casos necesitamos vincular esta aplicación con su identidad en el
            centro, con su consentimiento. Mientras tanto, el dermatólogo le informará el resultado
            de cada evaluación en consulta.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
