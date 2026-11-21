package com.example.persistencia;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends AppCompatActivity {

    private TextView tvEstado, tvFormTitulo;
    private EditText etProducto, etDescripcion, etPrecio;
    private Button btnGuardar, btnCancelar;
    private RecyclerView recyclerProductos;

    private final List<Producto> listaProductos = new ArrayList<>();
    private ProductoAdapter adapter;
    private final SupabaseService supabaseService = new SupabaseService();
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    private Producto productoEnEdicion = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        tvEstado = findViewById(R.id.tvEstado);
        tvFormTitulo = findViewById(R.id.tvFormTitulo);
        etProducto = findViewById(R.id.etProducto);
        etDescripcion = findViewById(R.id.etDescripcion);
        etPrecio = findViewById(R.id.etPrecio);
        btnGuardar = findViewById(R.id.btnGuardar);
        btnCancelar = findViewById(R.id.btnCancelar);
        recyclerProductos = findViewById(R.id.recyclerProductos);

        adapter = new ProductoAdapter(listaProductos, new ProductoAdapter.OnProductoActionListener() {
            @Override
            public void onEditar(Producto producto) {
                prepararEdicion(producto);
            }

            @Override
            public void onEliminar(Producto producto) {
                confirmarEliminacion(producto);
            }
        });

        recyclerProductos.setLayoutManager(new LinearLayoutManager(this));
        recyclerProductos.setAdapter(adapter);

        btnGuardar.setOnClickListener(v -> guardarOActualizar());
        btnCancelar.setOnClickListener(v -> cancelarEdicion());

        cargarProductos();
    }

    // b) Consultar registros
    private void cargarProductos() {
        tvEstado.setText("Conectando con Supabase...");
        executor.execute(() -> {
            try {
                List<Producto> resultado = supabaseService.obtenerProductos();
                runOnUiThread(() -> {
                    listaProductos.clear();
                    if (resultado != null) {
                        listaProductos.addAll(resultado);
                    }
                    adapter.notifyDataSetChanged();
                    tvEstado.setText("✅ Conectado a Supabase (" + listaProductos.size() + " productos)");
                });
            } catch (Exception e) {
                runOnUiThread(() -> tvEstado.setText("❌ Error: " + e.getMessage()));
            }
        });
    }

    // a) Agregar o c) Actualizar
    private void guardarOActualizar() {
        String nombre = etProducto.getText().toString().trim();
        String descripcion = etDescripcion.getText().toString().trim();
        String precioStr = etPrecio.getText().toString().trim();

        if (nombre.isEmpty() || precioStr.isEmpty()) {
            Toast.makeText(this, "Producto y precio son obligatorios", Toast.LENGTH_SHORT).show();
            return;
        }

        double precio;
        try {
            precio = Double.parseDouble(precioStr);
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Ingresa un precio válido", Toast.LENGTH_SHORT).show();
            return;
        }

        Producto datos = new Producto(nombre, descripcion, precio);

        executor.execute(() -> {
            try {
                if (productoEnEdicion == null) {
                    // a) Agregar
                    supabaseService.agregarProducto(datos);
                    runOnUiThread(() -> {
                        Toast.makeText(this, "Producto agregado", Toast.LENGTH_SHORT).show();
                        limpiarFormulario();
                        cargarProductos();
                    });
                } else {
                    // c) Actualizar
                    supabaseService.actualizarProducto(productoEnEdicion.getId(), datos);
                    runOnUiThread(() -> {
                        Toast.makeText(this, "Producto actualizado", Toast.LENGTH_SHORT).show();
                        cancelarEdicion();
                        cargarProductos();
                    });
                }
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show());
            }
        });
    }

    private void prepararEdicion(Producto producto) {
        productoEnEdicion = producto;
        tvFormTitulo.setText("c) Editar Producto #" + producto.getId());
        etProducto.setText(producto.getProducto());
        etDescripcion.setText(producto.getDescripcion());
        etPrecio.setText(String.valueOf(producto.getPrecio()));
        btnGuardar.setText("Actualizar Producto");
        btnCancelar.setVisibility(View.VISIBLE);
    }

    private void cancelarEdicion() {
        productoEnEdicion = null;
        limpiarFormulario();
    }

    private void limpiarFormulario() {
        tvFormTitulo.setText("a) Agregar Nuevo Producto");
        etProducto.setText("");
        etDescripcion.setText("");
        etPrecio.setText("");
        btnGuardar.setText("Guardar Producto");
        btnCancelar.setVisibility(View.GONE);
    }

    // d) Eliminar registro
    private void confirmarEliminacion(Producto producto) {
        new AlertDialog.Builder(this)
                .setTitle("Confirmar eliminación")
                .setMessage("¿Deseas eliminar "" + producto.getProducto() + ""?")
                .setPositiveButton("Eliminar", (dialog, which) -> {
                    executor.execute(() -> {
                        try {
                            supabaseService.eliminarProducto(producto.getId());
                            runOnUiThread(() -> {
                                Toast.makeText(this, "Producto eliminado", Toast.LENGTH_SHORT).show();
                                cargarProductos();
                            });
                        } catch (Exception e) {
                            runOnUiThread(() -> Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show());
                        }
                    });
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }
}
