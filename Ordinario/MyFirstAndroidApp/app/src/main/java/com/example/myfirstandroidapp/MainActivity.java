package com.example.myfirstandroidapp;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private int clics = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        TextView tvMensaje = findViewById(R.id.tvMensaje);
        Button btnSaludar = findViewById(R.id.btnSaludar);

        btnSaludar.setOnClickListener(v -> {
            clics++;
            tvMensaje.setText("¡Hola Android! Has presionado el botón " + clics + " veces.");
        });
    }
}
