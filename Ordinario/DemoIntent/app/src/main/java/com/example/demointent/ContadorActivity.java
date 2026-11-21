package com.example.demointent;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class ContadorActivity extends AppCompatActivity {

    private int cuenta;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_contador);

        TextView tvTitulo = findViewById(R.id.tvTituloContador);
        TextView tvNumero = findViewById(R.id.tvNumeroContador);
        Button btnIncrementar = findViewById(R.id.btnIncrementar);
        Button btnRegresar = findViewById(R.id.btnRegresar3);

        // Recibir Extras
        String titulo = getIntent().getStringExtra("EXTRA_TITULO");
        cuenta = getIntent().getIntExtra("EXTRA_INICIO", 0);

        tvTitulo.setText(titulo);
        tvNumero.setText(String.valueOf(cuenta));

        btnIncrementar.setOnClickListener(v -> {
            cuenta++;
            tvNumero.setText(String.valueOf(cuenta));
        });

        // Botón de regreso
        btnRegresar.setOnClickListener(v -> finish());
    }
}
