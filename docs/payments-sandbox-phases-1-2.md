# CondoAdmin Pro — Pagos online · Fases 1 y 2 (sandbox)

## Estado
- Diseño del modelo y SQL preparado en rama de trabajo.
- **No se ha ejecutado migración** en Supabase ni hay endpoints de cobro activos.
- Las cuatro tablas están destinadas a uso exclusivo del backend. RLS activado sin políticas para `anon`/`authenticated`.
- Los cobros reales deben permanecer inhabilitados.

## Auditoría del sistema actual
- Backend: Next.js y Supabase.
- Tablas existentes: `recibos`, `pagos`, `finanzas_config`, `pagos_validacion_historial`, `condominio_usuarios`, `inmuebles`.
- La emisión de recibos es manual; los pagos reportados se crean como `pendiente_validar`.
- Existen FK de `(condominio_id,recibo_id)` entre pagos y recibos y FK de pertenencia entre recibos e inmuebles.
- Ningún pago debe acreditarse por redirección del navegador.
- La futura API deberá verificar membresía y titularidad de la unidad, monto exacto y moneda, impedir cobros repetidos y manejar reintentos.

## Modelo propuesto
- `payment_merchants`: un comercio de Culqi **sandbox** por condominio; ninguna llave secreta en esta tabla.
- `payment_orders`: pedido ligado a un recibo con monto entero en céntimos e idempotencia por condominio.
- `payment_transactions`: resultados externos, único ID externo por comercio y una sola confirmación por orden.
- `payment_webhook_events`: deduplicación de notificaciones por comercio + evento y trazabilidad sin almacenar datos de tarjeta.

## Checklist previo a aplicar SQL
1. Crear respaldo y revisar migraciones existentes.
2. Confirmar que no existan tablas con estos nombres ni un cambio concurrente.
3. Validar RLS, grants y FKs en una base aislada; documentar pruebas negativas multi-tenant.
4. Verificar que las credenciales de sandbox por comercio estén en un gestor de secretos accesible solamente por servidor.
5. Nunca asociar credenciales live ni publicar cobros en el dominio principal durante el piloto.
6. Desarrollar API de creación de órdenes y verificación de webhooks; comprobar que ningún evento externo pueda manipular el monto.

## Pruebas de aceptación pendientes
- Orden válida asociada a recibo y comercio del mismo condominio.
- FK rechaza orden con recibo de otro condominio.
- La idempotencia bloquea órdenes duplicadas.
- El evento externo duplicado no acredita dos veces.
- La cuenta del usuario sin permiso no ve ni inicia cobros.
- `public.pagos` y `public.recibos` no cambian durante pruebas de diseño.

Referencias: https://docs.culqi.com/es/documentacion/pagos-online/webhooks/ y https://supabase.com/docs/guides/database/postgres/row-level-security
