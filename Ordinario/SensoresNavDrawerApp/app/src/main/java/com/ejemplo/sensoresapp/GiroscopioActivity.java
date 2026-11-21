package com.ejemplo.sensoresapp;

import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import java.util.Locale;

public class GiroscopioActivity extends AppCompatActivity implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor giroscopio;
    private TextView tvValores;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sensor_generico);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Giroscopio");
        }

        TextView tvTitulo = findViewById(R.id.tvTituloSensor);
        TextView tvDesc = findViewById(R.id.tvDescripcionSensor);
        tvValores = findViewById(R.id.tvValoresSensor);

        tvTitulo.setText("Giroscopio");
        tvDesc.setText("Mide la velocidad de rotación del dispositivo en rad/s (ejes X, Y, Z)");

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        if (sensorManager != null) {
            giroscopio = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE);
        }

        if (giroscopio == null) {
            tvValores.setText("Este dispositivo no cuenta con giroscopio.");
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (giroscopio != null) {
            sensorManager.registerListener(this, giroscopio, SensorManager.SENSOR_DELAY_NORMAL);
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
                "Rotación X: %.3f rad/s\n\nRotación Y: %.3f rad/s\n\nRotación Z: %.3f rad/s", x, y, z));
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
