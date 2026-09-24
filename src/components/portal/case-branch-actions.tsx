'use client';

import { Camera, Hospital } from 'lucide-react';

import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { ConfirmAction } from '@/components/ui/confirm';
import { api } from '@/lib/api';
import { useAction } from '@/lib/use-api';

/**
 * Las dos salidas del caso que no son diagnosticar.
 *
 * Ambas exigen motivo escrito, y no por formalismo: al técnico le llega ese texto en su bandeja, y
 * devolver un caso sin decir qué falta obliga a adivinar y garantiza una segunda devolución — que
 * en la práctica es una segunda visita del paciente.
 *
 * Lo que cada una le hace a la medición, y por qué difieren:
 *
 *  - **Devolver por fotos** INVALIDA la medición en curso. Entre la devolución y la reposición
 *    pueden pasar días de espera en el mostrador, y contarlos haría de TRM (OE1) una medida de la
 *    logística de la clínica y no del trabajo del especialista.
 *  - **Derivar a presencial** la CIERRA normalmente. El especialista sí dedicó ese tiempo a
 *    revisar, así que TRM debe recogerlo; lo que el caso no produce es un diagnóstico comparable,
 *    de modo que queda fuera de TPD (OE2) y no cuenta como caso resuelto para TCAD (OE4).
 */
export function CaseBranchActions({
  caseId,
  status,
  onChanged,
}: {
  caseId: string;
  status: string;
  onChanged: () => void;
}) {
  const requestPhotos = useAction(async (reason: string) =>
    api.post(`/cases/${caseId}/request-photos`, { reason }),
  );
  const refer = useAction(async (reason: string) => api.post(`/cases/${caseId}/refer`, { reason }));

  return (
    <Card>
      <CardHeader
        title="Si el caso no se puede resolver aquí"
        description="Ambas acciones dejan constancia del motivo para quien recibe el caso."
      />
      <CardBody className="flex flex-wrap gap-2">
        <ConfirmAction
          label="Pedir más fotos"
          icon={<Camera className="h-4 w-4" aria-hidden />}
          tone="warning"
          title="Devolver el caso al mostrador"
          description={
            <>
              El caso vuelve a admisión y su cronómetro se descarta: el tiempo que pase esperando
              fotos no es tiempo de revisión médica. Cuando el técnico reponga lo que falta, la
              revisión empieza de nuevo.
            </>
          }
          confirmLabel="Devolver al mostrador"
          requireReason
          reasonLabel="Qué falta"
          pending={requestPhotos.pending}
          error={requestPhotos.error?.message ?? null}
          onConfirm={(reason) => {
            void requestPhotos.run(reason).then((result) => {
              if (result !== null) onChanged();
            });
          }}
        />

        <ConfirmAction
          label="Derivar a presencial"
          icon={<Hospital className="h-4 w-4" aria-hidden />}
          title="Sacar el caso del circuito digital"
          description={
            <>
              La teleconsulta no alcanza y el paciente debe ser visto en persona. Es un estado
              final: el caso ya no produce diagnóstico, de modo que queda fuera de la precisión
              diagnóstica y no cuenta como caso resuelto de la jornada.
            </>
          }
          confirmLabel="Derivar"
          requireReason
          reasonLabel="Por qué requiere atención presencial"
          disabled={status === 'derivar_presencial'}
          pending={refer.pending}
          error={refer.error?.message ?? null}
          onConfirm={(reason) => {
            void refer.run(reason).then((result) => {
              if (result !== null) onChanged();
            });
          }}
        />
      </CardBody>
    </Card>
  );
}
