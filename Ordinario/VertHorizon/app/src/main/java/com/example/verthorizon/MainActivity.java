package com.example.verthorizon;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "CicloDeVida";
    private EditText etTexto;
    private TextView tvResultado;
    private Button btnMostrar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Log.d(TAG, "onCreate() ejecutado");
        Toast.makeText(this, "onCreate()", Toast.LENGTH_SHORT).show();

        etTexto = findViewById(R.id.etTexto);
        tvResultado = findViewById(R.id.tvResultado);
        btnMostrar = findViewById(R.id.btnMostrar);

        btnMostrar.setOnClickListener(v -> {
            String valor = etTexto.getText().toString();
            tvResultado.setText(valor);
        });

        if (savedInstanceState != null) {
            tvResultado.setText(savedInstanceState.getString("TEXTO_GUARDADO"));
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.d(TAG, "onPause() ejecutado");
        Toast.makeText(this, "onPause()", Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "onDestroy() ejecutado");
        Toast.makeText(this, "onDestroy()", Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putString("TEXTO_GUARDADO", tvResultado.getText().toString());
    }
}
