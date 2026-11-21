package com.ejemplo.sensoresapp;

import android.Manifest;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class PodometroActivity extends AppCompatActivity implements SensorEventListener {

    private static final int PERMISSION_REQUEST_ACTIVITY = 100;
    private SensorManager sensorManager;
    private Sensor podometro;
    private TextView tvValores;
    private float pasosIniciales = -1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sensor_generico);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Podómetro");
        }

        TextView tvTitulo = findViewById(R.id.tvTituloSensor);
        TextView tvDesc = findViewById(R.id.tvDescripcionSensor);
        tvValores = findViewById(R.id.tvValoresSensor);

        tvTitulo.setText("Podómetro (Contador de Pasos)");
        tvDesc.setText("Camina con el dispositivo para detectar los pasos realizados");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACTIVITY_RECOGNITION)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.ACTIVITY_RECOGNITION},
                        PERMISSION_REQUEST_ACTIVITY);
            }
        }

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        if (sensorManager != null) {
            podometro = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        }

        if (podometro == null) {
            tvValores.setText("Sensor de podómetro no disponible en este dispositivo.");
        } else {
            tvValores.setText("Pasos en esta sesión: 0\nPasos totales desde reinicio: esperando...");
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (podometro != null) {
            sensorManager.registerListener(this, podometro, SensorManager.SENSOR_DELAY_UI);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        float totalPasos = event.values[0];
        if (pasosIniciales < 0) {
            pasosIniciales = totalPasos;
        }
        int pasosSesion = (int) (totalPasos - pasosIniciales);
        tvValores.setText("Pasos en esta sesión: " + pasosSesion +
                "\n\nPasos totales acumulados: " + (int) totalPasos);
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_ACTIVITY && grantResults.length > 0
                && grantResults[0] != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "Permiso de actividad física denegado", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
