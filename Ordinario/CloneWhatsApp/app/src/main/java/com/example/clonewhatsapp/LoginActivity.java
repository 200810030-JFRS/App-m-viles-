package com.example.clonewhatsapp;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText etEmail, etPassword;
    private Button btnLogin;
    private TextView tvGoRegister, tvForgotPassword;
    private final OkHttpClient client = new OkHttpClient();
    private final Gson gson = new Gson();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        tvGoRegister = findViewById(R.id.tvGoRegister);
        tvForgotPassword = findViewById(R.id.tvForgotPassword);

        btnLogin.setOnClickListener(v -> loginUser());
        tvGoRegister.setOnClickListener(v -> startActivity(new Intent(this, RegisterActivity.class)));
        tvForgotPassword.setOnClickListener(v -> startActivity(new Intent(this, RecoverPasswordActivity.class)));
    }

    private void loginUser() {
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Completa correo y contraseña", Toast.LENGTH_SHORT).show();
            return;
        }

        JsonObject payload = new JsonObject();
        payload.addProperty("email", email);
        payload.addProperty("password", password);

        RequestBody body = RequestBody.create(payload.toString(), MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/auth/v1/token?grant_type=password")
                .post(body)
                .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                .addHeader("Content-Type", "application/json")
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                runOnUiThread(() -> Toast.makeText(LoginActivity.this, "Error de conexión", Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful() && response.body() != null) {
                    String json = response.body().string();
                    JsonObject obj = gson.fromJson(json, JsonObject.class);
                    String accessToken = obj.has("access_token") ? obj.get("access_token").getAsString() : "";
                    String userId = "";
                    if (obj.has("user") && obj.getAsJsonObject("user").has("id")) {
                        userId = obj.getAsJsonObject("user").get("id").getAsString();
                    }

                    SharedPreferences prefs = getSharedPreferences("AppSession", Context.MODE_PRIVATE);
                    prefs.edit()
                            .putString("jwt_token", accessToken)
                            .putString("user_id", userId)
                            .putString("user_email", email)
                            .apply();

                    // Fase 9: Registrar token FCM del dispositivo en Supabase
                    FcmTokenManager.syncToken(LoginActivity.this);

                    runOnUiThread(() -> {
                        Toast.makeText(LoginActivity.this, "Sesión iniciada", Toast.LENGTH_SHORT).show();
                        startActivity(new Intent(LoginActivity.this, ContactsActivity.class));
                        finish();
                    });
                } else {
                    runOnUiThread(() -> Toast.makeText(LoginActivity.this, "Credenciales incorrectas o correo sin confirmar", Toast.LENGTH_SHORT).show());
                }
            }
        });
    }
}
