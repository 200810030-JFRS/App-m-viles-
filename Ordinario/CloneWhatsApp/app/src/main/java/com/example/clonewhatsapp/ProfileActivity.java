package com.example.clonewhatsapp;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * Fase 4 y Fase 11: Gestión de nombre y fotografía de perfil con Supabase Storage
 */
public class ProfileActivity extends AppCompatActivity {

    private ImageView imgProfileAvatar;
    private EditText etProfileUsername;
    private Button btnChangePhoto, btnSaveProfile;

    private final OkHttpClient client = new OkHttpClient();
    private final Gson gson = new Gson();
    private String currentAvatarUrl = "";

    private final ActivityResultLauncher<String> pickImageLauncher =
            registerForActivityResult(new ActivityResultContracts.GetContent(), this::uploadAvatarImage);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        imgProfileAvatar = findViewById(R.id.imgProfileAvatar);
        etProfileUsername = findViewById(R.id.etProfileUsername);
        btnChangePhoto = findViewById(R.id.btnChangePhoto);
        btnSaveProfile = findViewById(R.id.btnSaveProfile);

        btnChangePhoto.setOnClickListener(v -> pickImageLauncher.launch("image/*"));
        btnSaveProfile.setOnClickListener(v -> saveProfileChanges());

        loadCurrentProfile();
    }

    private void loadCurrentProfile() {
        String userId = getSavedUserId();
        String jwtToken = getSavedJwtToken();
        if (userId == null || jwtToken == null) return;

        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/rest/v1/profiles?id=eq." + userId + "&select=*")
                .get()
                .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + jwtToken)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {}

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful() && response.body() != null) {
                    Type listType = new TypeToken<List<Profile>>() {}.getType();
                    List<Profile> list = gson.fromJson(response.body().string(), listType);
                    if (list != null && !list.isEmpty()) {
                        Profile me = list.get(0);
                        currentAvatarUrl = me.getAvatarUrl() != null ? me.getAvatarUrl() : "";
                        runOnUiThread(() -> {
                            etProfileUsername.setText(me.getUsername());
                            ImageLoader.load(currentAvatarUrl, imgProfileAvatar, android.R.drawable.ic_menu_camera);
                        });
                    }
                }
            }
        });
    }

    private void uploadAvatarImage(Uri imageUri) {
        if (imageUri == null) return;
        String userId = getSavedUserId();
        String jwtToken = getSavedJwtToken();
        if (userId == null || jwtToken == null) return;

        Toast.makeText(this, "Subiendo foto de perfil...", Toast.LENGTH_SHORT).show();

        try {
            byte[] imageBytes = readBytesFromUri(imageUri);
            String fileName = userId + "_" + System.currentTimeMillis() + ".jpg";
            String uploadUrl = SupabaseConfig.SUPABASE_URL + "/storage/v1/object/avatars/" + fileName;

            RequestBody body = RequestBody.create(imageBytes, MediaType.parse("image/jpeg"));
            Request request = new Request.Builder()
                    .url(uploadUrl)
                    .post(body)
                    .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                    .addHeader("Authorization", "Bearer " + jwtToken)
                    .addHeader("x-upsert", "true")
                    .build();

            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(@NonNull Call call, @NonNull IOException e) {
                    runOnUiThread(() -> Toast.makeText(ProfileActivity.this, "Error subiendo imagen", Toast.LENGTH_SHORT).show());
                }

                @Override
                public void onResponse(@NonNull Call call, @NonNull Response response) {
                    if (response.isSuccessful()) {
                        currentAvatarUrl = SupabaseConfig.SUPABASE_URL + "/storage/v1/object/public/avatars/" + fileName;
                        runOnUiThread(() -> {
                            ImageLoader.load(currentAvatarUrl, imgProfileAvatar, android.R.drawable.ic_menu_camera);
                            Toast.makeText(ProfileActivity.this, "Foto cargada. Presiona Guardar.", Toast.LENGTH_SHORT).show();
                        });
                    } else {
                        runOnUiThread(() -> Toast.makeText(ProfileActivity.this, "Error Storage HTTP: " + response.code(), Toast.LENGTH_SHORT).show());
                    }
                }
            });
        } catch (IOException e) {
            Toast.makeText(this, "No se pudo leer la imagen", Toast.LENGTH_SHORT).show();
        }
    }

    private void saveProfileChanges() {
        String newName = etProfileUsername.getText().toString().trim();
        if (newName.isEmpty()) {
            Toast.makeText(this, "Ingresa un nombre válido", Toast.LENGTH_SHORT).show();
            return;
        }

        String userId = getSavedUserId();
        String jwtToken = getSavedJwtToken();

        JsonObject payload = new JsonObject();
        payload.addProperty("username", newName);
        payload.addProperty("avatar_url", currentAvatarUrl);

        RequestBody body = RequestBody.create(payload.toString(), MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/rest/v1/profiles?id=eq." + userId)
                .patch(body)
                .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + jwtToken)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                runOnUiThread(() -> Toast.makeText(ProfileActivity.this, "Error al guardar perfil", Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                runOnUiThread(() -> {
                    if (response.isSuccessful()) {
                        getSharedPreferences("AppSession", Context.MODE_PRIVATE)
                                .edit().putString("username", newName).apply();
                        Toast.makeText(ProfileActivity.this, "Perfil actualizado", Toast.LENGTH_SHORT).show();
                        finish();
                    } else {
                        Toast.makeText(ProfileActivity.this, "Error HTTP: " + response.code(), Toast.LENGTH_SHORT).show();
                    }
                });
            }
        });
    }

    private byte[] readBytesFromUri(Uri uri) throws IOException {
        try (InputStream is = getContentResolver().openInputStream(uri);
             ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
            if (is == null) return new byte[0];
            byte[] data = new byte[4096];
            int nRead;
            while ((nRead = is.read(data, 0, data.length)) != -1) {
                buffer.write(data, 0, nRead);
            }
            return buffer.toByteArray();
        }
    }

    private String getSavedJwtToken() {
        SharedPreferences prefs = getSharedPreferences("AppSession", Context.MODE_PRIVATE);
        return prefs.getString("jwt_token", SupabaseConfig.SUPABASE_KEY);
    }

    private String getSavedUserId() {
        SharedPreferences prefs = getSharedPreferences("AppSession", Context.MODE_PRIVATE);
        return prefs.getString("user_id", null);
    }
}
