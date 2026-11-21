package com.example.clonewhatsapp;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.gson.JsonObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * Fase 9: Obtiene el token FCM de Firebase y lo registra en la tabla public.devices de Supabase
 */
public class FcmTokenManager {

    private static final String TAG = "FcmTokenManager";
    private static final OkHttpClient client = new OkHttpClient();

    public static void syncToken(Context context) {
        try {
            FirebaseMessaging.getInstance().getToken()
                    .addOnCompleteListener(task -> {
                        if (!task.isSuccessful() || task.getResult() == null) {
                            Log.w(TAG, "No se pudo obtener el token FCM", task.getException());
                            return;
                        }
                        String token = task.getResult();
                        saveAndUploadToken(context, token);
                    });
        } catch (Exception e) {
            Log.w(TAG, "Firebase aún no inicializado con google-services.json real", e);
        }
    }

    public static void saveAndUploadToken(Context context, String fcmToken) {
        if (fcmToken == null || fcmToken.isEmpty()) return;

        SharedPreferences prefs = context.getSharedPreferences("AppSession", Context.MODE_PRIVATE);
        prefs.edit().putString("fcm_token", fcmToken).apply();

        String userId = prefs.getString("user_id", null);
        String jwtToken = prefs.getString("jwt_token", null);

        if (userId == null || jwtToken == null) {
            return;
        }

        JsonObject payload = new JsonObject();
        payload.addProperty("user_id", userId);
        payload.addProperty("fcm_token", fcmToken);
        payload.addProperty("device_type", "android");

        RequestBody body = RequestBody.create(payload.toString(), MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/rest/v1/devices?on_conflict=user_id,fcm_token")
                .post(body)
                .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + jwtToken)
                .addHeader("Prefer", "resolution=merge-duplicates")
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                Log.e(TAG, "Error registrando token FCM en Supabase", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                Log.d(TAG, "Token FCM sincronizado con Supabase. HTTP: " + response.code());
                response.close();
            }
        });
    }
}
