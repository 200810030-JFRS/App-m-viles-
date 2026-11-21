package com.ejemplo.sensoresapp;

import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import java.util.Locale;

public class AcelerometroActivity extends AppCompatActivity implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor acelerometro;
    private TextView tvValores;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sensor_generico);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Acelerómetro");
        }

        TextView tvTitulo = findViewById(R.id.tvTituloSensor);
        TextView tvDesc = findViewById(R.id.tvDescripcionSensor);
        tvValores = findViewById(R.id.tvValoresSensor);

        tvTitulo.setText("Acelerómetro");
        tvDesc.setText("Mide la aceleración aplicada al dispositivo en m/s² (ejes X, Y, Z)");

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        if (sensorManager != null) {
            acelerometro = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        }

        if (acelerometro == null) {
            tvValores.setText("Este dispositivo no cuenta con acelerómetro.");
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (acelerometro != null) {
            sensorManager.registerListener(this, acelerometro, SensorManager.SENSOR_DELAY_NORMAL);
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
        float x = event.values[0];
        float y = event.values[1];
        float z = event.values[2];
        tvValores.setText(String.format(Locale.getDefault(),
                "Eje X: %.2f m/s²\n\nEje Y: %.2f m/s²\n\nEje Z: %.2f m/s²", x, y, z));
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
