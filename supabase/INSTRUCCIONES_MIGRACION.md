# Aplicar la migración en Supabase

La aplicación no ejecuta SQL por sí sola. Sigue estos pasos con una cuenta que
pueda administrar el proyecto de Supabase.

1. Entra al proyecto correcto de Supabase y abre **SQL Editor**.
2. Abre `supabase/migrations/0001_isl_init.sql` en este repositorio y copia todo
   su contenido en una nueva consulta.
3. Ejecuta la consulta una vez. Crea las tablas, índices, políticas RLS, triggers
   y buckets de manera aditiva. No modifica `auth.users` ni elimina datos.
4. Ejecuta también `supabase/migrations/0002_leads_notify_alertas_baja.sql`. Crea
   las funciones `marcar_lead_notificado` y `baja_alerta` para que el sitio
   (clave anon) pueda marcar un correo enviado y dar de baja una alerta por token.
5. Comprueba en **Table Editor** que aparecen las diez tablas del contrato y en
   **Storage** los buckets `propiedades` y `contenidos`.
6. Revisa si ya existe una tabla llamada exactamente `Propiedades` con P
   mayúscula. La app actual la consulta, mientras que el contrato nuevo usa
   `propiedades`. No borres ni renombres nada: informa esa situación antes de
   migrar registros reales.
7. Si deseas cargar la configuración inicial, abre una nueva consulta, copia
   `supabase/seed_isl.sql` y ejecútala. Agrega Silvia, Ivannia, barrios en
   borrador y la configuración inicial; no agrega propiedades ni contenido falso.
8. Confirma el límite de archivos configurado en los buckets. El script fija 50
   MB solo al crear buckets nuevos; si ya existían, conserva su límite actual.
9. En **Authentication → Users**, crea las cuentas de Silvia e Ivannia (correo y
   clave). El panel `/admin` no tiene registro público: solo pueden entrar esas
   cuentas.

## Validación rápida de permisos

- Sin iniciar sesión, una lectura de contenido solo debe devolver filas públicas.
- Sin iniciar sesión se debe poder insertar un lead o alerta, pero no leerlos.
- Con un usuario autenticado se debe poder administrar contenido y medios.

Si una tabla o bucket ya existía con una estructura distinta, detén la ejecución
y revisa las diferencias antes de aplicar cambios manuales. No ejecutes SQL de
eliminación ni uses una service role desde el navegador.
