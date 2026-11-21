package com.example.clonewhatsapp;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * Fase 11: Creación de conversaciones grupales y asignación de múltiples participantes
 */
public class CreateGroupActivity extends AppCompatActivity {

    private EditText etGroupName;
    private RecyclerView rvSelectMembers;
    private Button btnCreateGroup;

    private SelectableContactAdapter adapter;
    private final OkHttpClient client = new OkHttpClient();
    private final Gson gson = new Gson();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_group);

        etGroupName = findViewById(R.id.etGroupName);
        rvSelectMembers = findViewById(R.id.rvSelectMembers);
        btnCreateGroup = findViewById(R.id.btnCreateGroup);

        rvSelectMembers.setLayoutManager(new LinearLayoutManager(this));
        adapter = new SelectableContactAdapter(new ArrayList<>());
        rvSelectMembers.setAdapter(adapter);

        btnCreateGroup.setOnClickListener(v -> createGroup());
        loadContacts();
    }

    private void loadContacts() {
        String currentUserId = getSavedUserId();
        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/rest/v1/profiles?select=*")
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
                    Type listType = new TypeToken<List<Profile>>() {}.getType();
                    List<Profile> all = gson.fromJson(response.body().string(), listType);
                    List<Profile> others = new ArrayList<>();
                    if (all != null) {
                        for (Profile p : all) {
                            if (currentUserId == null || !currentUserId.equals(p.getId())) {
                                others.add(p);
                            }
                        }
                    }
                    runOnUiThread(() -> adapter.updateList(others));
                }
            }
        });
    }

    private void createGroup() {
        String groupName = etGroupName.getText().toString().trim();
        Set<String> selectedIds = adapter.getSelectedUserIds();

        if (groupName.isEmpty()) {
            Toast.makeText(this, "Escribe un nombre para el grupo", Toast.LENGTH_SHORT).show();
            return;
        }
        if (selectedIds.isEmpty()) {
            Toast.makeText(this, "Selecciona al menos un participante", Toast.LENGTH_SHORT).show();
            return;
        }

        String currentUserId = getSavedUserId();
        String jwtToken = getSavedJwtToken();

        JsonObject convPayload = new JsonObject();
        convPayload.addProperty("is_group", true);
        convPayload.addProperty("name", groupName);
        if (currentUserId != null) {
            convPayload.addProperty("created_by", currentUserId);
        }

        RequestBody body = RequestBody.create(convPayload.toString(), MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/rest/v1/conversaciones")
                .post(body)
                .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + jwtToken)
                .addHeader("Prefer", "return=representation")
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                runOnUiThread(() -> Toast.makeText(CreateGroupActivity.this, "Error creando grupo", Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful() && response.body() != null) {
                    Type listType = new TypeToken<List<Conversation>>() {}.getType();
                    List<Conversation> created = gson.fromJson(response.body().string(), listType);
                    if (created != null && !created.isEmpty()) {
                        addMembersToGroup(created.get(0).getId(), currentUserId, selectedIds);
                    }
                } else {
                    runOnUiThread(() -> Toast.makeText(CreateGroupActivity.this, "Error HTTP: " + response.code(), Toast.LENGTH_SHORT).show());
                }
            }
        });
    }

    private void addMembersToGroup(String convId, String creatorId, Set<String> memberIds) {
        JsonArray membersArray = new JsonArray();

        if (creatorId != null) {
            JsonObject creatorObj = new JsonObject();
            creatorObj.addProperty("conversacion_id", convId);
            creatorObj.addProperty("user_id", creatorId);
            membersArray.add(creatorObj);
        }

        for (String uid : memberIds) {
            JsonObject memberObj = new JsonObject();
            memberObj.addProperty("conversacion_id", convId);
            memberObj.addProperty("user_id", uid);
            membersArray.add(memberObj);
        }

        RequestBody body = RequestBody.create(membersArray.toString(), MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/rest/v1/conversaciones_members")
                .post(body)
                .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + getSavedJwtToken())
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {}

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                runOnUiThread(() -> {
                    Toast.makeText(CreateGroupActivity.this, "Grupo creado correctamente", Toast.LENGTH_SHORT).show();
                    finish();
                });
            }
        });
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
