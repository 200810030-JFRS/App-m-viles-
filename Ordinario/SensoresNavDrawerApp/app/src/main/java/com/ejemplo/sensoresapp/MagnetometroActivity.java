package com.ejemplo.sensoresapp;

import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import java.util.Locale;

public class MagnetometroActivity extends AppCompatActivity implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor magnetometro;
    private TextView tvValores;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sensor_generico);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Magnetómetro");
        }

        TextView tvTitulo = findViewById(R.id.tvTituloSensor);
        TextView tvDesc = findViewById(R.id.tvDescripcionSensor);
        tvValores = findViewById(R.id.tvValoresSensor);

        tvTitulo.setText("Magnetómetro");
        tvDesc.setText("Mide el campo magnético ambiental en microteslas (µT)");

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        if (sensorManager != null) {
            magnetometro = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
        }

        if (magnetometro == null) {
            tvValores.setText("Este dispositivo no cuenta con magnetómetro.");
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (magnetometro != null) {
            sensorManager.registerListener(this, magnetometro, SensorManager.SENSOR_DELAY_NORMAL);
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
        double magnitud = Math.sqrt(x * x + y * y + z * z);

        tvValores.setText(String.format(Locale.getDefault(),
                "Campo X: %.2f µT\n\nCampo Y: %.2f µT\n\nCampo Z: %.2f µT\n\nIntensidad Total: %.2f µT",
                x, y, z, magnitud));
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
