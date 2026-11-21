package com.example.clonewhatsapp;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.gson.JsonObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class RecoverPasswordActivity extends AppCompatActivity {

    private EditText etEmail;
    private Button btnRecover;
    private final OkHttpClient client = new OkHttpClient();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_recover_password);

        etEmail = findViewById(R.id.etEmail);
        btnRecover = findViewById(R.id.btnRecover);

        btnRecover.setOnClickListener(v -> sendRecoveryEmail());
    }

    private void sendRecoveryEmail() {
        String email = etEmail.getText().toString().trim();
        if (email.isEmpty()) {
            Toast.makeText(this, "Ingresa tu correo electrónico", Toast.LENGTH_SHORT).show();
            return;
        }

        JsonObject payload = new JsonObject();
        payload.addProperty("email", email);

        RequestBody body = RequestBody.create(payload.toString(), MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/auth/v1/recover")
                .post(body)
                .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                .addHeader("Content-Type", "application/json")
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                runOnUiThread(() -> Toast.makeText(RecoverPasswordActivity.this, "Error de red", Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                runOnUiThread(() -> {
                    Toast.makeText(RecoverPasswordActivity.this, "Correo de recuperación enviado", Toast.LENGTH_SHORT).show();
                    finish();
                });
            }
        });
    }
}
