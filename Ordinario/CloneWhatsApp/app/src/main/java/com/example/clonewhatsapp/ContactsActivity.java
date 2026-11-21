package com.example.clonewhatsapp;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.widget.Button;
import android.widget.SearchView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class ContactsActivity extends AppCompatActivity
        implements ContactAdapter.OnContactClickListener, GroupAdapter.OnGroupClickListener {

    private RecyclerView rvContacts, rvGroups;
    private SearchView searchView;
    private Button btnProfile, btnNewGroup, btnLogout;

    private ContactAdapter contactAdapter;
    private GroupAdapter groupAdapter;

    private List<Profile> profileList = new ArrayList<>();
    private List<Conversation> groupList = new ArrayList<>();

    private final OkHttpClient client = new OkHttpClient();
    private final Gson gson = new Gson();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_contacts);

        searchView = findViewById(R.id.searchView);
        rvContacts = findViewById(R.id.rvContacts);
        rvGroups = findViewById(R.id.rvGroups);
        btnProfile = findViewById(R.id.btnProfile);
        btnNewGroup = findViewById(R.id.btnNewGroup);
        btnLogout = findViewById(R.id.btnLogout);

        rvContacts.setLayoutManager(new LinearLayoutManager(this));
        contactAdapter = new ContactAdapter(profileList, this);
        rvContacts.setAdapter(contactAdapter);

        rvGroups.setLayoutManager(new LinearLayoutManager(this));
        groupAdapter = new GroupAdapter(groupList, this);
        rvGroups.setAdapter(groupAdapter);

        btnProfile.setOnClickListener(v -> startActivity(new Intent(this, ProfileActivity.class)));
        btnNewGroup.setOnClickListener(v -> startActivity(new Intent(this, CreateGroupActivity.class)));
        btnLogout.setOnClickListener(v -> {
            getSharedPreferences("AppSession", Context.MODE_PRIVATE).edit().clear().apply();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        requestNotificationPermissionIfNeeded();
        FcmTokenManager.syncToken(this);

        setupSearchView();
        fetchUsers();
        fetchGroups();
    }

    @Override
    protected void onResume() {
        super.onResume();
        fetchUsers();
        fetchGroups();
    }

    private void requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }
    }

    private void fetchUsers() {
        String currentUserId = getSavedUserId();
        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/rest/v1/profiles?select=*")
                .get()
                .addHeader("apikey", SupabaseConfig.SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + getSavedJwtToken())
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                runOnUiThread(() -> Toast.makeText(ContactsActivity.this, "Error de red al obtener usuarios", Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful() && response.body() != null) {
                    String jsonResponse = response.body().string();
                    Type listType = new TypeToken<List<Profile>>() {}.getType();
                    List<Profile> fetchedProfiles = gson.fromJson(jsonResponse, listType);

                    List<Profile> filtered = new ArrayList<>();
                    if (fetchedProfiles != null) {
                        for (Profile p : fetchedProfiles) {
                            if (currentUserId == null || !currentUserId.equals(p.getId())) {
                                filtered.add(p);
                            } else {
                                getSharedPreferences("AppSession", Context.MODE_PRIVATE)
                                        .edit().putString("username", p.getUsername()).apply();
                            }
                        }
                    }

                    runOnUiThread(() -> {
                        profileList = filtered;
                        contactAdapter.updateList(profileList);
                    });
                }
            }
        });
    }

    // Fase 11: Consultar conversaciones grupales del usuario
    private void fetchGroups() {
        Request request = new Request.Builder()
                .url(SupabaseConfig.SUPABASE_URL + "/rest/v1/conversaciones?is_group=eq.true&select=*")
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
                    Type listType = new TypeToken<List<Conversation>>() {}.getType();
                    List<Conversation> fetchedGroups = gson.fromJson(response.body().string(), listType);
                    runOnUiThread(() -> {
                        groupList = fetchedGroups != null ? fetchedGroups : new ArrayList<>();
                        groupAdapter.updateList(groupList);
                    });
                }
            }
        });
    }

    private void setupSearchView() {
        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                contactAdapter.filter(query);
                return false;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                contactAdapter.filter(newText);
                return false;
            }
        });
    }

    @Override
    public void onContactClick(Profile profile) {
        Intent intent = new Intent(this, ChatActivity.class);
        intent.putExtra("DESTINATARIO_ID", profile.getId());
        intent.putExtra("DESTINATARIO_NAME", profile.getUsername());
        intent.putExtra("IS_GROUP", false);
        startActivity(intent);
    }

    @Override
    public void onGroupClick(Conversation group) {
        Intent intent = new Intent(this, ChatActivity.class);
        intent.putExtra("CONVERSACION_ID", group.getId());
        intent.putExtra("DESTINATARIO_NAME", group.getName());
        intent.putExtra("IS_GROUP", true);
        startActivity(intent);
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
