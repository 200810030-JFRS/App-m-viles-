package com.example.clonewhatsapp;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        SharedPreferences prefs = getSharedPreferences("AppSession", Context.MODE_PRIVATE);
        String jwtToken = prefs.getString("jwt_token", null);
        String userId = prefs.getString("user_id", null);

        Intent intent;
        if (jwtToken != null && !jwtToken.isEmpty() && userId != null && !userId.isEmpty()) {
            intent = new Intent(this, ContactsActivity.class);
        } else {
            intent = new Intent(this, LoginActivity.class);
        }
        startActivity(intent);
        finish();
    }
}
