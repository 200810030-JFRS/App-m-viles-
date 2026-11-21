package com.example.demointent;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class CalculadoraActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_calculadora);

        TextView tvInfoCalc = findViewById(R.id.tvInfoCalc);
        EditText etNum1 = findViewById(R.id.etNum1);
        EditText etNum2 = findViewById(R.id.etNum2);
        Button btnSumar = findViewById(R.id.btnSumar);
        TextView tvResultado = findViewById(R.id.tvResultadoCalc);
        Button btnRegresar = findViewById(R.id.btnRegresar2);

        // Recibir Extras
        String usuario = getIntent().getStringExtra("EXTRA_USUARIO");
        int bono = getIntent().getIntExtra("EXTRA_BONO", 0);

        tvInfoCalc.setText("Calculadora de: " + usuario + " (Bono extra: +" + bono + ")");

        btnSumar.setOnClickListener(v -> {
            String s1 = etNum1.getText().toString();
            String s2 = etNum2.getText().toString();
            int n1 = s1.isEmpty() ? 0 : Integer.parseInt(s1);
            int n2 = s2.isEmpty() ? 0 : Integer.parseInt(s2);
            int total = n1 + n2 + bono;
            tvResultado.setText("Resultado (+ bono): " + total);
        });

        // Botón de regreso
        btnRegresar.setOnClickListener(v -> finish());
    }
}
