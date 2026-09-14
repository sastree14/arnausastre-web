# Mañana — cerrar Comercial / CRM y prospecting

Objetivo: terminar la pestaña `Comercial → CRM y prospecting` al 100% y no abrir nuevos frentes hasta completar esta checklist.

## 1. Apollo
- [ ] Conectar Apollo como fuente de discovery/enrichment.
- [ ] Validar credenciales y límites del plan disponible.
- [ ] Mapear Apollo → `companies` y `people` sin duplicados.
- [ ] Guardar nombre, cargo, empresa, web, LinkedIn, país, industria, tamaño y evidencia disponible.
- [ ] Definir scoring ICP y motivo de recomendación.
- [ ] Separar recomendación personal (seguir / conectar / contactar) de recomendación de página (invitar a seguir SC-Analytics).
- [ ] Probar con 10 leads reales y revisar calidad antes de aumentar volumen.

## 2. Calendly
- [ ] Conectar la cuenta corporativa de Calendly.
- [ ] Ingestar nuevas reservas como `meetings`.
- [ ] Vincular meeting → persona → empresa → oportunidad cuando sea posible.
- [ ] Registrar cancelaciones/reprogramaciones.
- [ ] Convertir automáticamente una discovery relevante en señal para crear/actualizar oportunidad, pero mantener confirmación humana cuando haya ambigüedad.

## 3. Prospecting on-demand
- [ ] Hacer que `Buscar 10 leads ahora` despierte el worker inmediatamente.
- [ ] Mantener la fila en `tasks` como fuente de verdad (`queued → running → completed/failed`).
- [ ] Mantener GitHub Actions programado solo como safety net de baja frecuencia.
- [ ] Mostrar en UI el estado, hora, nº solicitado, nº encontrado y error/reintento.
- [ ] Verificar que una pulsación no genera jobs duplicados.

## 4. Seguimiento interactivo de personas
- [ ] UAT de botones: Seguido, Solicitud enviada, Conectado, Mensaje enviado, Ha respondido.
- [ ] UAT de Nota, Follow-up, Discovery propuesta, Discovery agendada, No interesado y Descartar.
- [ ] Confirmar que cada acción crea una fila en `interactions`.
- [ ] Confirmar que el estado de `people.status` cambia cuando corresponde.
- [ ] Confirmar `next_action_at` y notas.
- [ ] Verificar timeline completa en `Interacciones recientes`.

## 5. Pipeline
- [ ] Crear/editar una oportunidad desde persona/empresa.
- [ ] Definir stages finales del pipeline.
- [ ] Valor, moneda, probabilidad, siguiente acción y responsable.
- [ ] Relacionar discovery / proposal / won / lost con historial CRM.

## 6. UAT final de la pestaña
- [ ] Empresa detectada aparece correctamente.
- [ ] Persona aparece y tiene enlaces correctos.
- [ ] Acción manual puede ejecutarse y marcarse.
- [ ] Invitación a seguir SC-Analytics queda registrada.
- [ ] Meeting de Calendly aparece.
- [ ] Oportunidad aparece y puede evolucionar.
- [ ] Toda la actividad permanece en Supabase tras recargar.
- [ ] Rendimiento de la pantalla sigue siendo rápido.

## Fuera de alcance de esta pestaña
- Gmail / correo: la conexión/configuración pertenecerá a `Sistema / Integraciones` (o al módulo transversal de comunicaciones). Solo las interacciones comerciales relevantes deberán reflejarse aquí en el timeline del CRM.
- Proposals / budgets avanzados: pertenecen al flujo comercial, pero se cerrarán en su submódulo específico para no duplicar lógica en esta pantalla.
