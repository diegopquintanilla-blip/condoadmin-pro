# CondoAdmin Pro — despliegue controlado

Este documento aplica a la rama `recovery/condoadmin-v2`. No fusionar con `main` ni publicar al dominio productivo sin completar los controles.

## Requisitos de configuración

- Conectar el proyecto de Vercel al repositorio correcto: `diegopquintanilla-blip/condoadmin-pro`.
- Configurar un entorno **preview** con `NEXT_PUBLIC_SUPABASE_URL` y una de estas variables públicas: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Nunca exponer `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY` ni contraseñas PostgreSQL como `NEXT_PUBLIC_*`.
- Confirmar que la rama de despliegue para pruebas sea `recovery/condoadmin-v2`, y que el dominio productivo no se modifique.
- Verificar GitHub Actions: `npm run typecheck` y `npm run build` deben terminar correctamente para el SHA que se despliega.

## Pruebas obligatorias de preview

1. Abrir `/login` sin sesión. La pantalla debe renderizar correctamente.
2. Confirmar que `/dashboard`, `/residentes` y `/etapas` redirigen al login sin sesión.
3. Iniciar sesión con una cuenta autorizada y verificar navegación y cierre de sesión.
4. Confirmar que no se muestran condominios ajenos y que el selector `?condominio=` no permite visualizar datos no autorizados.
5. Probar creación, edición y consulta de residentes y etapas con datos autorizados; comprobar RLS entre tenants (idealmente dos cuentas con condominios distintos).
6. Revisar errores de funciones y logs; comprobar las métricas/históricos de dashboard.
7. Comprobar flujos sin condominios asociados y con permisos restringidos. Nunca usar datos ficticios en producción.

## Liberación

- Registrar SHA de GitHub, URL de preview y resultados de pruebas.
- Mantener intacto el último deployment productivo conocido hasta validar.
- Promover/publicar únicamente tras pruebas aprobadas y comprobación de variables por entorno.
- Mantener disponible el deployment anterior para rollback inmediato si falla la verificación posterior.
