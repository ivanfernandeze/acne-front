import { Camera, ClipboardList, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardBody } from '@/components/ui/card';

export default function PatientHomePage() {
  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="space-y-3">
          <Camera className="h-7 w-7 text-violet-700" aria-hidden />
          <h2 className="text-base font-semibold text-neutral-900">
            Enviar una fotografía
          </h2>
          <p className="text-sm text-neutral-500">
            Tome una fotografía de su rostro siguiendo la guía de encuadre. El dermatólogo la
            revisará y le avisará cuando cierre su caso.
          </p>
          <Link href="/app/captura" className={buttonVariants({ variant: 'primary', block: true })}>
            Abrir la cámara
          </Link>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <ClipboardList className="h-6 w-6 text-purple-900" aria-hidden />
          <h2 className="text-base font-semibold text-neutral-900">
            Historial de mis casos
          </h2>
          <p className="text-sm text-neutral-500">
            Consulte el estado de las evaluaciones que ya envió.
          </p>
          <Link href="/app/historial" className={buttonVariants({ variant: 'outline', block: true })}>
            Ver historial
          </Link>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-neutral-900">Sus datos están protegidos</p>
            <p className="text-neutral-500">
              Su fotografía se cifra antes de almacenarse y solo el dermatólogo tratante puede ver
              su nombre. Puede retirarse del estudio cuando lo desee (Ley N.º 29733 de Protección
              de Datos Personales).
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
