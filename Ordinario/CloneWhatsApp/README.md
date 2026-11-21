# CloneWhatsApp — Proyecto Completo (Fases 1 a 12)

Aplicación de mensajería instantánea para Android desarrollada en **Java + XML**, integrada con **Supabase** (Auth, PostgreSQL, Realtime, Storage, Edge Functions y Row Level Security) y **Firebase Cloud Messaging (FCM HTTP v1)**.

---

## Estructura del Paquete Entregado

- `app/` — Código fuente completo en Java y diseños XML (Fases 1 a 12).
- `supabase_setup.sql` — Script SQL completo para crear tablas, buckets de Storage y políticas de seguridad **Row Level Security (RLS)** (Fases 2, 8, 11 y 12).
- `supabase/functions/notify-new-message/index.ts` — **Supabase Edge Function** lista para desplegar que envía notificaciones push vía **FCM HTTP v1** cuando llega un nuevo mensaje (Fase 10).
- `local.properties.example` — Plantilla para proteger credenciales fuera del repositorio (Fase 12).

---

## Guía Paso a Paso para Configurar y Ejecutar

### 1. Configurar Base de Datos, Storage y RLS en Supabase (Fases 2, 8, 11 y 12)
1. Entra a tu proyecto en **Supabase** > **SQL Editor** > **New Query**.
2. Copia y pega todo el contenido de `supabase_setup.sql` y haz clic en **Run**.
3. Este script crea:
   - Tablas: `profiles`, `devices`, `conversaciones`, `conversaciones_members`, `messages`.
   - Buckets de Storage: `avatars` y `chat-images`.
   - Políticas **Row Level Security (RLS)** para proteger conversaciones, mensajes, dispositivos y perfiles.

### 2. Configurar Credenciales en Android Studio (Fase 12)
1. Abre la carpeta `CloneWhatsApp` en **Android Studio** (`File > Open`).
2. Abre o crea el archivo `local.properties` en la raíz del proyecto y agrega:
   ```properties
   SUPABASE_URL=https://kjpzaxgeicreidwuazam.supabase.co
   SUPABASE_KEY=tu_publishable_key_de_supabase
   ```
   *(Opcionalmente también puedes colocarlas directamente en `SupabaseConfig.java` si no usas `local.properties`).*

### 3. Configurar Firebase Cloud Messaging (Fase 9)
1. Ve a [Firebase Console](https://console.firebase.google.com/) y crea un proyecto (ej. `CloneWhatsApp`).
2. Registra una app **Android** con el nombre de paquete exacto:
   `com.example.clonewhatsapp`
3. Descarga el archivo **`google-services.json`** y reemplaza el archivo plantilla ubicado en:
   `app/google-services.json`
4. En Firebase Console > **Configuración del proyecto > Cuentas de servicio**, haz clic en **Generar nueva clave privada** para descargar el JSON de la Service Account (lo usarás en el siguiente paso).

### 4. Desplegar Supabase Edge Function para Notificaciones Push (Fase 10)
1. Instala la CLI de Supabase o crea la función desde el Dashboard (**Edge Functions > Create a new function** llamada `notify-new-message`).
2. Pega el código de `supabase/functions/notify-new-message/index.ts`.
3. En **Edge Functions > Secrets**, agrega las variables:
   - `FIREBASE_PROJECT_ID`: ID de tu proyecto en Firebase.
   - `FIREBASE_CLIENT_EMAIL`: `client_email` del JSON de tu Service Account de Firebase.
   - `FIREBASE_PRIVATE_KEY`: `private_key` del JSON de tu Service Account de Firebase.
   - `WEBHOOK_SECRET`: una clave secreta elegida por ti (ej. `mi_secreto_webhook_2026`).
4. En Supabase Dashboard > **Database > Webhooks > Create a new hook**:
   - **Name:** `notify_on_new_message`
   - **Table:** `messages` | **Events:** `Insert`
   - **Type:** `Supabase Edge Functions` -> `notify-new-message`
   - **HTTP Headers:** `x-webhook-secret: mi_secreto_webhook_2026`

### 5. Generar el APK de Liberación o Pruebas (Fase 12)
1. En Android Studio, sincroniza Gradle (**Sync Project with Gradle Files**).
2. Para probar en emuladores o celulares: presiona **Run (▶)**.
3. Para generar el archivo `.apk` instalable:
   - Ve al menú superior: **Build > Build Bundle(s) / APK(s) > Build APK(s)** (o **Build > Generate Signed Bundle / APK...** para firmar el APK de producción).
   - Al terminar, haz clic en **locate** en la notificación inferior para obtener `app-debug.apk` o `app-release.apk`.
