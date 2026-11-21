package com.example.demointent;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class SaludoActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_saludo);

        TextView tvSaludo = findViewById(R.id.tvSaludo);
        Button btnRegresar = findViewById(R.id.btnRegresar1);

        // Recibir Extra desde MainActivity
        String nombreRecibido = getIntent().getStringExtra("EXTRA_NOMBRE");
        tvSaludo.setText("¡Hola, " + nombreRecibido + "!\nBienvenido a la Actividad de Saludo.");

        // Botón de regreso
        btnRegresar.setOnClickListener(v -> finish());
    }
}
