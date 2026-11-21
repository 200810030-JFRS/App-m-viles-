package com.example.billar;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.RadioGroup;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.example.billar.engine.PoolRulesManager;
import com.google.android.material.chip.ChipGroup;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;

public class MainActivity extends AppCompatActivity {
    public static final String EXTRA_MODE = "extra_mode";
    public static final String EXTRA_DIFFICULTY = "extra_difficulty";
    public static final String EXTRA_FELT = "extra_felt";

    private TextView tvStatPlayed, tvStatWins, tvStatStreak;
    private RadioGroup rgGameMode;
    private LinearLayout layoutDifficulty;
    private ChipGroup cgDifficulty, cgFeltColor;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        tvStatPlayed = findViewById(R.id.tvStatPlayed);
        tvStatWins = findViewById(R.id.tvStatWins);
        tvStatStreak = findViewById(R.id.tvStatStreak);
        rgGameMode = findViewById(R.id.rgGameMode);
        layoutDifficulty = findViewById(R.id.layoutDifficulty);
        cgDifficulty = findViewById(R.id.cgDifficulty);
        cgFeltColor = findViewById(R.id.cgFeltColor);

        rgGameMode.setOnCheckedChangeListener((group, checkedId) ->
                layoutDifficulty.setVisibility(checkedId == R.id.rbModeCpu ? View.VISIBLE : View.GONE));

        findViewById(R.id.btnPlay).setOnClickListener(v -> launchGame());
        findViewById(R.id.btnRules).setOnClickListener(v -> showRulesDialog());
    }

    @Override
    protected void onResume() {
        super.onResume();
        SharedPreferences prefs = getSharedPreferences("billar_stats", MODE_PRIVATE);
        tvStatPlayed.setText(String.valueOf(prefs.getInt("played", 0)));
        tvStatWins.setText(String.valueOf(prefs.getInt("wins", 0)));
        tvStatStreak.setText(String.valueOf(prefs.getInt("streak", 0)));
    }

    private void launchGame() {
        int mode = PoolRulesManager.MODE_CPU;
        int checkedMode = rgGameMode.getCheckedRadioButtonId();
        if (checkedMode == R.id.rbMode2P) mode = PoolRulesManager.MODE_2P;
        else if (checkedMode == R.id.rbModePractice) mode = PoolRulesManager.MODE_PRACTICE;

        int diff = 1;
        int checkedDiff = cgDifficulty.getCheckedChipId();
        if (checkedDiff == R.id.chipDiffEasy) diff = 0;
        else if (checkedDiff == R.id.chipDiffHard) diff = 2;

        int felt = 0;
        int checkedFelt = cgFeltColor.getCheckedChipId();
        if (checkedFelt == R.id.chipFeltBlue) felt = 1;
        else if (checkedFelt == R.id.chipFeltRed) felt = 2;

        Intent intent = new Intent(this, GameActivity.class);
        intent.putExtra(EXTRA_MODE, mode);
        intent.putExtra(EXTRA_DIFFICULTY, diff);
        intent.putExtra(EXTRA_FELT, felt);
        startActivity(intent);
    }

    private void showRulesDialog() {
        new MaterialAlertDialogBuilder(this)
                .setTitle(R.string.rules_title)
                .setMessage(R.string.rules_body)
                .setPositiveButton(R.string.btn_close, null)
                .show();
    }
}
