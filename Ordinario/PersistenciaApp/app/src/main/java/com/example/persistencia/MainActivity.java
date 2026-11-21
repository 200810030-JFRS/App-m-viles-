package com.example.persistencia;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class MainActivity extends AppCompatActivity {

    private TextView tvEstadoConexion, tvListaProductos;
    private EditText etProducto, etDescripcion, etPrecio;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        tvEstadoConexion = findViewById(R.id.tvEstadoConexion);
        tvListaProductos = findViewById(R.id.tvListaProductos);
        etProducto = findViewById(R.id.etProducto);
        etDescripcion = findViewById(R.id.etDescripcion);
        etPrecio = findViewById(R.id.etPrecio);

        Button btnProbarConexion = findViewById(R.id.btnProbarConexion);
        Button btnGuardarProducto = findViewById(R.id.btnGuardarProducto);
        Button btnCargarProductos = findViewById(R.id.btnCargarProductos);

        btnProbarConexion.setOnClickListener(v -> comprobarConexion());
        btnGuardarProducto.setOnClickListener(v -> guardarProducto());
        btnCargarProductos.setOnClickListener(v -> obtenerProductos());
    }

    private void comprobarConexion() {
        tvEstadoConexion.setText("Estado: Probando conexión...");
        new Thread(() -> {
            try {
                URL url = new URL(SupabaseConfig.SUPABASE_URL + "/rest/v1/productos?select=*&limit=1");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("apikey", SupabaseConfig.SUPABASE_ANON_KEY);
                conn.setRequestProperty("Authorization", "Bearer " + SupabaseConfig.SUPABASE_ANON_KEY);

                int code = conn.getResponseCode();
                runOnUiThread(() -> {
                    if (code >= 200 && code < 300) {
                        tvEstadoConexion.setText("Estado: ¡Conectado exitosamente a Supabase! (HTTP " + code + ")");
                    } else {
                        tvEstadoConexion.setText("Estado: Error de conexión (HTTP " + code + "). Verifica URL, Key o RLS.");
                    }
                });
            } catch (Exception e) {
                runOnUiThread(() -> tvEstadoConexion.setText("Estado: Falló la conexión -> " + e.getMessage()));
            }
        }).start();
    }

    private void guardarProducto() {
        String prod = etProducto.getText().toString().trim();
        String desc = etDescripcion.getText().toString().trim();
        String precStr = etPrecio.getText().toString().trim();

        if (prod.isEmpty() || desc.isEmpty() || precStr.isEmpty()) {
            Toast.makeText(this, "Completa todos los campos", Toast.LENGTH_SHORT).show();
            return;
        }

        double precio = Double.parseDouble(precStr);

        new Thread(() -> {
            try {
                URL url = new URL(SupabaseConfig.SUPABASE_URL + "/rest/v1/productos");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("apikey", SupabaseConfig.SUPABASE_ANON_KEY);
                conn.setRequestProperty("Authorization", "Bearer " + SupabaseConfig.SUPABASE_ANON_KEY);
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Prefer", "return=minimal");
                conn.setDoOutput(true);

                JSONObject json = new JSONObject();
                json.put("producto", prod);
                json.put("descripcion", desc);
                json.put("precio", precio);

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(json.toString().getBytes(StandardCharsets.UTF_8));
                }

                int code = conn.getResponseCode();
                runOnUiThread(() -> {
                    if (code >= 200 && code < 300) {
                        Toast.makeText(this, "Producto guardado en Supabase", Toast.LENGTH_SHORT).show();
                        etProducto.setText("");
                        etDescripcion.setText("");
                        etPrecio.setText("");
                        obtenerProductos();
                    } else {
                        Toast.makeText(this, "Error al guardar (HTTP " + code + ")", Toast.LENGTH_LONG).show();
                    }
                });
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show());
            }
        }).start();
    }

    private void obtenerProductos() {
        new Thread(() -> {
            try {
                URL url = new URL(SupabaseConfig.SUPABASE_URL + "/rest/v1/productos?select=*");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("apikey", SupabaseConfig.SUPABASE_ANON_KEY);
                conn.setRequestProperty("Authorization", "Bearer " + SupabaseConfig.SUPABASE_ANON_KEY);

                int code = conn.getResponseCode();
                if (code >= 200 && code < 300) {
                    BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) sb.append(line);
                    br.close();

                    JSONArray arr = new JSONArray(sb.toString());
                    StringBuilder resultado = new StringBuilder();
                    for (int i = 0; i < arr.length(); i++) {
                        JSONObject item = arr.getJSONObject(i);
                        resultado.append("• ")
                                .append(item.optString("producto"))
                                .append(" - $")
                                .append(item.optDouble("precio"))
                                .append("\n   ")
                                .append(item.optString("descripcion"))
                                .append("\n\n");
                    }
                    String textoFinal = resultado.length() > 0 ? resultado.toString() : "Sin productos registrados.";
                    runOnUiThread(() -> tvListaProductos.setText(textoFinal));
                } else {
                    runOnUiThread(() -> tvListaProductos.setText("Error al consultar tabla (HTTP " + code + ")"));
                }
            } catch (Exception e) {
                runOnUiThread(() -> tvListaProductos.setText("Error: " + e.getMessage()));
            }
        }).start();
    }
}
