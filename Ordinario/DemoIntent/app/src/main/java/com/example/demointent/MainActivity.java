package com.example.demointent;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private EditText etDatoGlobal;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etDatoGlobal = findViewById(R.id.etDatoGlobal);
        Button btn1 = findViewById(R.id.btnActividad1);
        Button btn2 = findViewById(R.id.btnActividad2);
        Button btn3 = findViewById(R.id.btnActividad3);

        // Botón 1: Lanza SaludoActivity enviando el nombre como Extra
        btn1.setOnClickListener(v -> {
            String nombre = etDatoGlobal.getText().toString().trim();
            if (nombre.isEmpty()) nombre = "Estudiante";

            Intent intent = new Intent(this, SaludoActivity.class);
            intent.putExtra("EXTRA_NOMBRE", nombre);
            startActivity(intent);
        });

        // Botón 2: Lanza CalculadoraActivity enviando un valor base como Extra
        btn2.setOnClickListener(v -> {
            String usuario = etDatoGlobal.getText().toString().trim();
            if (usuario.isEmpty()) usuario = "Usuario";

            Intent intent = new Intent(this, CalculadoraActivity.class);
            intent.putExtra("EXTRA_USUARIO", usuario);
            intent.putExtra("EXTRA_BONO", 10);
            startActivity(intent);
        });

        // Botón 3: Lanza ContadorActivity enviando un valor inicial como Extra
        btn3.setOnClickListener(v -> {
            String titulo = etDatoGlobal.getText().toString().trim();
            if (titulo.isEmpty()) titulo = "Contador General";

            Intent intent = new Intent(this, ContadorActivity.class);
            intent.putExtra("EXTRA_TITULO", titulo);
            intent.putExtra("EXTRA_INICIO", 5);
            startActivity(intent);
        });
    }
}
