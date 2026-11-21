package com.ejemplo.sensoresapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.widget.Button;
import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import com.google.android.material.navigation.NavigationView;

public class MainActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener {

    private DrawerLayout drawerLayout;
    private ActionBarDrawerToggle toggle;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        drawerLayout = findViewById(R.id.drawer_layout);
        NavigationView navigationView = findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);

        toggle = new ActionBarDrawerToggle(
                this, drawerLayout, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawerLayout.addDrawerListener(toggle);
        toggle.syncState();

        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Inicio - NavDrawer");
        }

        Button btnAbrirMenu = findViewById(R.id.btnAbrirMenu);
        btnAbrirMenu.setOnClickListener(v -> drawerLayout.openDrawer(GravityCompat.START));
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (toggle.onOptionsItemSelected(item)) {
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public boolean onNavigationItemSelected(@NonNull MenuItem item) {
        int id = item.getItemId();

        if (id == R.id.nav_acelerometro) {
            startActivity(new Intent(this, AcelerometroActivity.class));
        } else if (id == R.id.nav_podometro) {
            startActivity(new Intent(this, PodometroActivity.class));
        } else if (id == R.id.nav_giroscopio) {
            startActivity(new Intent(this, GiroscopioActivity.class));
        } else if (id == R.id.nav_camara) {
            startActivity(new Intent(this, CamaraActivity.class));
        } else if (id == R.id.nav_gps) {
            startActivity(new Intent(this, GpsActivity.class));
        } else if (id == R.id.nav_magnetometro) {
            startActivity(new Intent(this, MagnetometroActivity.class));
        }

        drawerLayout.closeDrawer(GravityCompat.START);
        return true;
    }
}
