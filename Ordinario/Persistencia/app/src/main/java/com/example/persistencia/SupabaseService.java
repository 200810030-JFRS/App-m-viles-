package com.example.persistencia;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.List;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class SupabaseService {

    private static final String SUPABASE_URL = "https://wctcwaudlnjeqharoszs.supabase.co";
    private static final String SUPABASE_KEY = "sb_publishable_4ZgwVhQAwmwSA8kl0kITmw_nMo1lVPF";
    private static final String TABLE_ENDPOINT = SUPABASE_URL + "/rest/v1/productos";

    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    private final OkHttpClient client = new OkHttpClient();
    private final Gson gson = new Gson();

    private Request.Builder baseRequest(String url) {
        return new Request.Builder()
                .url(url)
                .addHeader("apikey", SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + SUPABASE_KEY)
                .addHeader("Content-Type", "application/json");
    }

    // b) Consultar registros
    public List<Producto> obtenerProductos() throws IOException {
        Request request = baseRequest(TABLE_ENDPOINT + "?select=*&order=id.desc")
                .get()
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Error HTTP " + response.code() + ": " + response.message());
            }
            String json = response.body() != null ? response.body().string() : "[]";
            Type listType = new TypeToken<List<Producto>>() {}.getType();
            return gson.fromJson(json, listType);
        }
    }

    // a) Agregar registro
    public void agregarProducto(Producto producto) throws IOException {
        String json = gson.toJson(producto);
        RequestBody body = RequestBody.create(json, JSON);

        Request request = baseRequest(TABLE_ENDPOINT)
                .addHeader("Prefer", "return=minimal")
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Error al insertar (" + response.code() + "): " + response.message());
            }
        }
    }

    // c) Actualizar registro
    public void actualizarProducto(long id, Producto producto) throws IOException {
        String json = gson.toJson(producto);
        RequestBody body = RequestBody.create(json, JSON);

        Request request = baseRequest(TABLE_ENDPOINT + "?id=eq." + id)
                .addHeader("Prefer", "return=minimal")
                .patch(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Error al actualizar (" + response.code() + "): " + response.message());
            }
        }
    }

    // d) Eliminar registro
    public void eliminarProducto(long id) throws IOException {
        Request request = baseRequest(TABLE_ENDPOINT + "?id=eq." + id)
                .delete()
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Error al eliminar (" + response.code() + "): " + response.message());
            }
        }
    }
}
