// =========================================================================
// FASE 10: SUPABASE EDGE FUNCTION - NOTIFICACIONES PUSH VÍA FCM HTTP v1
// =========================================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FIREBASE_PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID")!;
const FIREBASE_CLIENT_EMAIL = Deno.env.get("FIREBASE_CLIENT_EMAIL")!;
const FIREBASE_PRIVATE_KEY = (Deno.env.get("FIREBASE_PRIVATE_KEY") || "").replace(/\\n/g, "\n");
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") || "";

function base64UrlEncode(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getFirebaseAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: FIREBASE_CLIENT_EMAIL,
    sub: FIREBASE_CLIENT_EMAIL,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  const unsignedJwt = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;

  const pemContents = FIREBASE_PRIVATE_KEY
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedJwt)
  );

  const signedJwt = `${unsignedJwt}.${base64UrlEncode(new Uint8Array(signature))}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  });

  const tokenJson = await tokenRes.json();
  if (!tokenJson.access_token) {
    throw new Error(`Error obteniendo Access Token de Google: ${JSON.stringify(tokenJson)}`);
  }
  return tokenJson.access_token;
}

serve(async (req) => {
  try {
    // 1. Validar mecanismo seguro (Webhook Secret)
    if (WEBHOOK_SECRET) {
      const incomingSecret = req.headers.get("x-webhook-secret");
      if (incomingSecret !== WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
      }
    }

    const body = await req.json();
    const record = body.record;
    if (!record || !record.conversacion_id || !record.sender_id) {
      return new Response(JSON.stringify({ message: "Payload sin registro de mensaje válido" }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 2. Obtener nombre del remitente e información de la conversación
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", record.sender_id)
      .single();

    const { data: convInfo } = await supabase
      .from("conversaciones")
      .select("is_group, name")
      .eq("id", record.conversacion_id)
      .single();

    const senderName = senderProfile?.username || record.sender_name || "Nuevo mensaje";
    const notificationTitle = convInfo?.is_group && convInfo?.name
      ? `${convInfo.name} (${senderName})`
      : senderName;
    const notificationBody = record.message_type === "image" ? "📷 Envió una imagen" : record.content;

    // 3. Identificar destinatarios en conversaciones_members (excluyendo al remitente)
    const { data: members } = await supabase
      .from("conversaciones_members")
      .select("user_id")
      .eq("conversacion_id", record.conversacion_id)
      .neq("user_id", record.sender_id);

    if (!members || members.length === 0) {
      return new Response(JSON.stringify({ message: "Sin destinatarios" }), { status: 200 });
    }

    const recipientIds = members.map((m) => m.user_id);

    // 4. Recuperar tokens FCM de los destinatarios
    const { data: devices } = await supabase
      .from("devices")
      .select("fcm_token")
      .in("user_id", recipientIds);

    if (!devices || devices.length === 0) {
      return new Response(JSON.stringify({ message: "Destinatarios sin tokens FCM registrados" }), { status: 200 });
    }

    // 5. Enviar notificación mediante FCM HTTP v1
    const accessToken = await getFirebaseAccessToken();
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;

    const results = [];
    for (const dev of devices) {
      const fcmPayload = {
        message: {
          token: dev.fcm_token,
          notification: {
            title: notificationTitle,
            body: notificationBody,
          },
          data: {
            conversacion_id: String(record.conversacion_id),
            sender_id: String(record.sender_id),
            sender_name: String(notificationTitle),
            is_group: String(Boolean(convInfo?.is_group)),
          },
          android: {
            priority: "high",
            notification: {
              channel_id: "clonewhatsapp_messages",
            },
          },
        },
      };

      const res = await fetch(fcmUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fcmPayload),
      });
      results.push(await res.json());
    }

    return new Response(JSON.stringify({ sent: results.length, results }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
