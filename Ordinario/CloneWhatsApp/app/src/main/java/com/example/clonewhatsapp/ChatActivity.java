package com.example.clonewhatsapp;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * Fases 5, 6, 7, 8, 10, 11 y 12:
 * Conversaciones 1-a-1 y grupales, envío de texto e imágenes, búsqueda y eliminación de mensajes,
 * actualización en tiempo real, estados de lectura e apertura directa desde notificaciones push.
 */
public class ChatActivity extends AppCompatActivity implements MessageAdapter.OnMessageLongClickListener {

    private RecyclerView rvMessages;
    private EditText etMessage, etSearchMessages;
    private Button btnSend, btnAttachImage, btnToggleSearch;
    private TextView tvChatUser, tvStatusIndicator;

    private MessageAdapter adapter;
    private final List<Message> messageList = new ArrayList<>();
    private final OkHttpClient client = new OkHttpClient();
    private final Gson gson = new Gson();

    private String conversacionId = null;
    private String currentUserId = null;
    private String currentUserName = "";
    private String recipientId = null;
    private String recipientName = null;
    private boolean isGroup = false;
    private String currentSearchQuery = "";

    private final Handler realtimeHandler = new Handler(Looper.getMainLooper());
    private Runnable realtimeRunnable;

    private final ActivityResultLauncher<String> pickChatImageLauncher =
            registerForActivityResult(new ActivityResultContracts.GetContent(), this::uploadAndSendImage);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);

        rvMessages = findViewById(R.id.rvMessages);
        etMessage = findViewById(R.id.etMessage);
        etSearchMessages = findViewById(R.id.etSearchMessages);
        btnSend = findViewById(R.id.btnSend);
        btnAttachImage = findViewById(R.id.btnAttachImage);
        btnToggleSearch = findViewById(R.id.btnToggleSearch);
        tvChatUser = findViewById(R.id.tvChatUser);
        tvStatusIndicator = findViewById(R.id.tvStatusIndicator);

        SharedPreferences prefs = getSharedPreferences("AppSession", Context.MODE_PRIVATE);
        currentUserId = prefs.getString("user_id", null);
        currentUserName = prefs.getString("username", "Usuario");

        handleIncomingIntent(getIntent());

        rvMessages.setLayoutManager(new LinearLayoutManager(this));
        adapter = new MessageAdapter(messageList, currentUserId, isGroup, this);
        rvMessages.setAdapter(adapter);

        btnSend.setOnClickListener(v -> sendTextMessage());
        btnAttachImage.setOnClickListener(v -> pickChatImageLauncher.launch("image/*"));
        btnToggleSearch.setOnClickListener(v -> toggleMessageSearchBar());

        setupSearchMessages();
        setupTypingIndicator();
        initConversation();
    }

    @Override
    protected void onNewIntent(@NonNull Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIncomingIntent(intent);
        initConversation();
    }

    private void handleIncomingIntent(Intent intent) {
        if (intent == null) return;
        conversacionId = intent.getStringExtra("CONVERSACION_ID");
        recipientId = intent.getStringExtra("DESTINATARIO_ID");
        recipientName = intent.getStringExtra("DESTINATARIO_NAME");
        isGroup = intent.getBooleanExtra("IS_GROUP", false);

        if (recipientName != null && !recipientName.isEmpty()) {
            tvChatUser.setText(recipientName);
        } else if (isGroup) {
            tvChatUser.setText("Grupo");
        }
    }

    private void initConversation() {
        if (conversacionId != null && !conversacionId.isEmpty()) {
            fetchMessages();
            startRealtimeListener();
            return;
        }

        if (recipientId == null || recipientId.isEmpty()) {
            return;
        }

        // Fase 5 y Fase 12: Obtener o crear conversación 1-a-1 mediante RPC segura en Supabase
        JsonObject rpcPayload = new JsonObject();
        rpcPayload.addProperty("other_user_id", recipientId);

        RequestBody body = RequestBody.create(rpcPayload.toString(), MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/rest/v1/rpc/get_or_create_direct_conversation")
                .post(body)
                .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + getSavedJwtToken())
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                runOnUiThread(() -> Toast.makeText(ChatActivity.this, "Error abriendo conversación", Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful() && response.body() != null) {
                    String raw = response.body().string().replace("\"", "").trim();
                    conversacionId = raw;
                    runOnUiThread(() -> {
                        fetchMessages();
                        startRealtimeListener();
                    });
                }
            }
        });
    }

    private void fetchMessages() {
        if (conversacionId == null || conversacionId.isEmpty()) return;

        String url = SupabaseConfig.SUPABASE_URL + "/rest/v1/messages?conversacion_id=eq."
                + conversacionId + "&select=*&order=created_at.asc";

        Request request = new Request.Builder()
                .url(url)
                .get()
                .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + getSavedJwtToken())
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {}

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful() && response.body() != null) {
                    String json = response.body().string();
                    Type listType = new TypeToken<List<Message>>() {}.getType();
                    List<Message> fetchedMessages = gson.fromJson(json, listType);

                    runOnUiThread(() -> {
                        if (fetchedMessages != null) {
                            adapter.setMessages(fetchedMessages);
                            if (!currentSearchQuery.isEmpty()) {
                                adapter.filterMessages(currentSearchQuery);
                            } else if (!fetchedMessages.isEmpty()) {
                                rvMessages.scrollToPosition(fetchedMessages.size() - 1);
                            }
                            markReceivedMessagesAsRead(fetchedMessages);
                        }
                    });
                }
            }
        });
    }

    // Fase 8: Marcar mensajes recibidos como leídos
    private void markReceivedMessagesAsRead(List<Message> messages) {
        if (currentUserId == null || conversacionId == null) return;
        boolean hasUnread = false;
        for (Message m : messages) {
            if (m.getSenderId() != null && !m.getSenderId().equals(currentUserId) && !"read".equals(m.getStatus())) {
                hasUnread = true;
                break;
            }
        }
        if (!hasUnread) return;

        JsonObject payload = new JsonObject();
        payload.addProperty("status", "read");

        RequestBody body = RequestBody.create(payload.toString(), MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/rest/v1/messages?conversacion_id=eq."
                        + conversacionId + "&sender_id=neq." + currentUserId)
                .patch(body)
                .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + getSavedJwtToken())
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {}

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                response.close();
            }
        });
    }

    private void sendTextMessage() {
        String text = etMessage.getText().toString().trim();
        if (text.isEmpty() || conversacionId == null || currentUserId == null) return;

        JsonObject payload = new JsonObject();
        payload.addProperty("conversacion_id", conversacionId);
        payload.addProperty("sender_id", currentUserId);
        payload.addProperty("sender_name", currentUserName);
        payload.addProperty("content", text);
        payload.addProperty("message_type", "text");
        payload.addProperty("status", "sent");

        insertMessageToSupabase(payload, true);
    }

    // Fase 11: Subir imagen a Supabase Storage y enviarla como mensaje
    private void uploadAndSendImage(Uri imageUri) {
        if (imageUri == null || conversacionId == null || currentUserId == null) return;
        Toast.makeText(this, "Enviando imagen...", Toast.LENGTH_SHORT).show();

        try {
            byte[] bytes = readBytesFromUri(imageUri);
            String fileName = conversacionId + "/" + System.currentTimeMillis() + ".jpg";
            String uploadUrl = SupabaseConfig.SUPABASE_URL + "/storage/v1/object/chat-images/" + fileName;

            RequestBody body = RequestBody.create(bytes, MediaType.parse("image/jpeg"));
            Request request = new Request.Builder()
                    .url(uploadUrl)
                    .post(body)
                    .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                    .addHeader("Authorization", "Bearer " + getSavedJwtToken())
                    .build();

            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(@NonNull Call call, @NonNull IOException e) {
                    runOnUiThread(() -> Toast.makeText(ChatActivity.this, "Error subiendo imagen", Toast.LENGTH_SHORT).show());
                }

                @Override
                public void onResponse(@NonNull Call call, @NonNull Response response) {
                    if (response.isSuccessful()) {
                        String publicUrl = SupabaseConfig.SUPABASE_URL + "/storage/v1/object/public/chat-images/" + fileName;
                        JsonObject payload = new JsonObject();
                        payload.addProperty("conversacion_id", conversacionId);
                        payload.addProperty("sender_id", currentUserId);
                        payload.addProperty("sender_name", currentUserName);
                        payload.addProperty("content", "Imagen");
                        payload.addProperty("message_type", "image");
                        payload.addProperty("image_url", publicUrl);
                        payload.addProperty("status", "sent");

                        insertMessageToSupabase(payload, false);
                    } else {
                        runOnUiThread(() -> Toast.makeText(ChatActivity.this, "Error Storage HTTP: " + response.code(), Toast.LENGTH_SHORT).show());
                    }
                }
            });
        } catch (IOException e) {
            Toast.makeText(this, "Error al leer archivo de imagen", Toast.LENGTH_SHORT).show();
        }
    }

    private void insertMessageToSupabase(JsonObject payload, boolean clearEditText) {
        RequestBody body = RequestBody.create(payload.toString(), MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/rest/v1/messages")
                .post(body)
                .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + getSavedJwtToken())
                .addHeader("Prefer", "return=representation")
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                runOnUiThread(() -> Toast.makeText(ChatActivity.this, "Error al enviar mensaje", Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                if (response.isSuccessful()) {
                    runOnUiThread(() -> {
                        if (clearEditText) {
                            etMessage.setText("");
                        }
                        fetchMessages();
                    });
                } else {
                    runOnUiThread(() -> Toast.makeText(ChatActivity.this, "Error enviando (HTTP " + response.code() + ")", Toast.LENGTH_SHORT).show());
                }
            }
        });
    }

    // Fase 11: Eliminación de mensajes propios al mantener presionado
    @Override
    public void onMessageLongClick(Message message) {
        if (message.getId() == null) return;
        new AlertDialog.Builder(this)
                .setTitle("Eliminar mensaje")
                .setMessage("¿Deseas eliminar este mensaje para todos?")
                .setPositiveButton("Eliminar", (dialog, which) -> deleteMessage(message.getId()))
                .setNegativeButton("Cancelar", null)
                .show();
    }

    private void deleteMessage(String messageId) {
        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/rest/v1/messages?id=eq." + messageId)
                .delete()
                .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + getSavedJwtToken())
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {}

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                runOnUiThread(() -> {
                    if (response.isSuccessful()) {
                        Toast.makeText(ChatActivity.this, "Mensaje eliminado", Toast.LENGTH_SHORT).show();
                        fetchMessages();
                    }
                });
            }
        });
    }

    // Fase 11: Búsqueda de mensajes
    private void toggleMessageSearchBar() {
        if (etSearchMessages.getVisibility() == View.GONE) {
            etSearchMessages.setVisibility(View.VISIBLE);
            etSearchMessages.requestFocus();
        } else {
            etSearchMessages.setText("");
            etSearchMessages.setVisibility(View.GONE);
            currentSearchQuery = "";
            adapter.filterMessages("");
        }
    }

    private void setupSearchMessages() {
        etSearchMessages.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentSearchQuery = s.toString();
                adapter.filterMessages(currentSearchQuery);
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void startRealtimeListener() {
        if (realtimeRunnable != null) {
            realtimeHandler.removeCallbacks(realtimeRunnable);
        }
        realtimeRunnable = new Runnable() {
            @Override
            public void run() {
                fetchMessages();
                realtimeHandler.postDelayed(this, 2500);
            }
        };
        realtimeHandler.post(realtimeRunnable);
    }

    private void setupTypingIndicator() {
        etMessage.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (s.length() > 0) {
                    tvStatusIndicator.setText("Escribiendo...");
                } else {
                    tvStatusIndicator.setText("En línea");
                }
            }

            @Override
            public void afterTextChanged(Editable s) {}
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

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (realtimeRunnable != null) {
            realtimeHandler.removeCallbacks(realtimeRunnable);
        }
    }

    private String getSavedJwtToken() {
        SharedPreferences prefs = getSharedPreferences("AppSession", Context.MODE_PRIVATE);
        return prefs.getString("jwt_token", SupabaseConfig.SUPABASE_KEY);
    }
}
