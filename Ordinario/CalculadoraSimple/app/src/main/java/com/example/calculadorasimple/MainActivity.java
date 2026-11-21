package com.example.calculadorasimple;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        EditText etNumero1 = findViewById(R.id.etNumero1);
        EditText etNumero2 = findViewById(R.id.etNumero2);
        Button btnSumar = findViewById(R.id.btnSumar);
        Button btnRestar = findViewById(R.id.btnRestar);
        TextView tvResultado = findViewById(R.id.tvResultado);

        btnSumar.setOnClickListener(v -> {
            String s1 = etNumero1.getText().toString();
            String s2 = etNumero2.getText().toString();
            if (s1.isEmpty() || s2.isEmpty()) {
                Toast.makeText(this, "Ingresa ambos números", Toast.LENGTH_SHORT).show();
                return;
            }
            double res = Double.parseDouble(s1) + Double.parseDouble(s2);
            tvResultado.setText("Resultado: " + res);
        });

        btnRestar.setOnClickListener(v -> {
            String s1 = etNumero1.getText().toString();
            String s2 = etNumero2.getText().toString();
            if (s1.isEmpty() || s2.isEmpty()) {
                Toast.makeText(this, "Ingresa ambos números", Toast.LENGTH_SHORT).show();
                return;
            }
            double res = Double.parseDouble(s1) - Double.parseDouble(s2);
            tvResultado.setText("Resultado: " + res);
        });
    }
}
