package com.example.fragmentado;

import android.os.Bundle;
import android.widget.Button;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button btn1 = findViewById(R.id.btnFragmento1);
        Button btn2 = findViewById(R.id.btnFragmento2);
        Button btn3 = findViewById(R.id.btnFragmento3);

        if (savedInstanceState == null) {
            cargarFragmento(new PrimerFragment());
        }

        btn1.setOnClickListener(v -> cargarFragmento(new PrimerFragment()));
        btn2.setOnClickListener(v -> cargarFragmento(new SegundoFragment()));
        btn3.setOnClickListener(v -> cargarFragmento(new TercerFragment()));
    }

    private void cargarFragmento(Fragment fragmento) {
        FragmentManager fm = getSupportFragmentManager();
        FragmentTransaction ft = fm.beginTransaction();
        ft.replace(R.id.contenedorFragmentos, fragmento);
        ft.commit();
    }
}
