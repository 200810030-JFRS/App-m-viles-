package com.example.billar;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.example.billar.audio.SoundEffectsManager;
import com.example.billar.engine.PoolRulesManager;
import com.example.billar.model.Ball;
import com.example.billar.view.CueSpinView;
import com.example.billar.view.PocketedBallsBarView;
import com.example.billar.view.PoolTableView;
import com.example.billar.view.PowerMeterView;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import java.util.ArrayList;
import java.util.List;

public class GameActivity extends AppCompatActivity implements PoolTableView.GameUIListener {
    private PoolTableView poolTableView;
    private PowerMeterView powerMeterView;
    private LinearLayout panelPlayer1, panelPlayer2;
    private TextView tvP1Name, tvP2Name, tvP1Group, tvP2Group, tvGameStatus;
    private PocketedBallsBarView p1PocketedView, p2PocketedView;
    private SoundEffectsManager soundManager;
    private int gameMode;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);

        poolTableView = findViewById(R.id.poolTableView);
        powerMeterView = findViewById(R.id.powerMeterView);
        panelPlayer1 = findViewById(R.id.panelPlayer1);
        panelPlayer2 = findViewById(R.id.panelPlayer2);
        tvP1Name = findViewById(R.id.tvP1Name);
        tvP2Name = findViewById(R.id.tvP2Name);
        tvP1Group = findViewById(R.id.tvP1Group);
        tvP2Group = findViewById(R.id.tvP2Group);
        tvGameStatus = findViewById(R.id.tvGameStatus);
        p1PocketedView = findViewById(R.id.p1PocketedView);
        p2PocketedView = findViewById(R.id.p2PocketedView);

        gameMode = getIntent().getIntExtra(MainActivity.EXTRA_MODE, PoolRulesManager.MODE_CPU);
        int difficulty = getIntent().getIntExtra(MainActivity.EXTRA_DIFFICULTY, 1);
        int felt = getIntent().getIntExtra(MainActivity.EXTRA_FELT, 0);

        String p1 = getString(R.string.player_1);
        String p2 = (gameMode == PoolRulesManager.MODE_CPU) ? getString(R.string.player_cpu)
                : (gameMode == PoolRulesManager.MODE_2P ? getString(R.string.player_2) : "Práctica");

        tvP1Name.setText(p1);
        tvP2Name.setText(p2);

        soundManager = new SoundEffectsManager();
        poolTableView.initMatch(gameMode, difficulty, felt, p1, p2, soundManager, this);

        powerMeterView.setPowerListener(new PowerMeterView.PowerListener() {
            @Override
            public void onPowerChanged(float power) {
                poolTableView.setExternalPullPower(power);
            }

            @Override
            public void onPowerReleased(float power) {
                poolTableView.shootWithPower(power);
            }
        });

        findViewById(R.id.btnSpin).setOnClickListener(v -> showSpinDialog());
        MaterialButton btnSound = findViewById(R.id.btnSound);
        btnSound.setOnClickListener(v -> {
            boolean next = !soundManager.isEnabled();
            soundManager.setEnabled(next);
            btnSound.setText(next ? "🔊" : "🔇");
        });
        findViewById(R.id.btnRestart).setOnClickListener(v -> poolTableView.rackBalls());
        findViewById(R.id.btnMenu).setOnClickListener(v -> finish());
    }

    @Override
    protected void onDestroy() {
        if (soundManager != null) {
            soundManager.release();
        }
        super.onDestroy();
    }

    private void showSpinDialog() {
        View view = LayoutInflater.from(this).inflate(R.layout.dialog_spin, null);
        CueSpinView spinView = view.findViewById(R.id.cueSpinView);
        TextView tvLabel = view.findViewById(R.id.tvSpinLabel);
        spinView.setSpin(poolTableView.getCueSpinX(), poolTableView.getCueSpinY());

        spinView.setSpinListener((sx, sy) -> {
            poolTableView.setCueSpin(sx, sy);
            String vert = sy > 0.25f ? "Corrido (Arriba)" : (sy < -0.25f ? "Retroceso (Abajo)" : "Centro");
            String horiz = sx > 0.25f ? " + Efecto Der." : (sx < -0.25f ? " + Efecto Izq." : "");
            tvLabel.setText(vert + horiz);
        });

        view.findViewById(R.id.btnResetSpin).setOnClickListener(v -> {
            spinView.setSpin(0f, 0f);
            poolTableView.setCueSpin(0f, 0f);
            tvLabel.setText("Golpe centrado (Sin efecto)");
        });

        new MaterialAlertDialogBuilder(this)
                .setView(view)
                .setPositiveButton(R.string.btn_close, null)
                .show();
    }

    @Override
    public void onStateUpdated(PoolRulesManager rules, List<Ball> balls) {
        tvGameStatus.setText(rules.getStatusMessage());

        boolean p1Turn = rules.getCurrentPlayer() == 1;
        panelPlayer1.setBackgroundResource(p1Turn ? R.drawable.bg_active_turn : R.drawable.bg_inactive_turn);
        panelPlayer2.setBackgroundResource(!p1Turn ? R.drawable.bg_active_turn : R.drawable.bg_inactive_turn);

        boolean humanTurn = !(gameMode == PoolRulesManager.MODE_CPU && !p1Turn);
        powerMeterView.setInputEnabled(humanTurn && !rules.isGameOver());

        tvP1Group.setText(getGroupText(rules.getP1Group()));
        tvP2Group.setText(getGroupText(rules.getP2Group()));

        List<Integer> p1Balls = new ArrayList<>();
        List<Integer> p2Balls = new ArrayList<>();
        for (Ball b : balls) {
            if (!b.pocketed || b.number == 0 || b.number == 8) continue;
            if (rules.getP1Group() == PoolRulesManager.GROUP_SOLIDS && b.type == Ball.TYPE_SOLID) p1Balls.add(b.number);
            else if (rules.getP1Group() == PoolRulesManager.GROUP_STRIPES && b.type == Ball.TYPE_STRIPE) p1Balls.add(b.number);
            else if (rules.getP2Group() == PoolRulesManager.GROUP_SOLIDS && b.type == Ball.TYPE_SOLID) p2Balls.add(b.number);
            else if (rules.getP2Group() == PoolRulesManager.GROUP_STRIPES && b.type == Ball.TYPE_STRIPE) p2Balls.add(b.number);
        }
        p1PocketedView.setPocketedNumbers(p1Balls);
        p2PocketedView.setPocketedNumbers(p2Balls);
    }

    private String getGroupText(int group) {
        if (group == PoolRulesManager.GROUP_SOLIDS) return getString(R.string.group_solids);
        if (group == PoolRulesManager.GROUP_STRIPES) return getString(R.string.group_stripes);
        return getString(R.string.group_open);
    }

    @Override
    public void onMatchFinished(int winnerPlayer, String message) {
        SharedPreferences prefs = getSharedPreferences("billar_stats", MODE_PRIVATE);
        int played = prefs.getInt("played", 0) + 1;
        int wins = prefs.getInt("wins", 0) + (winnerPlayer == 1 ? 1 : 0);
        int streak = (winnerPlayer == 1) ? prefs.getInt("streak", 0) + 1 : 0;
        prefs.edit().putInt("played", played).putInt("wins", wins).putInt("streak", streak).apply();

        new MaterialAlertDialogBuilder(this)
                .setTitle("Fin de la Partida")
                .setMessage(message)
                .setCancelable(false)
                .setPositiveButton("Jugar de nuevo", (d, w) -> poolTableView.rackBalls())
                .setNegativeButton("Menú principal", (d, w) -> finish())
                .show();
    }

    @Override
    public void onPullPowerChanged(float power) {
        powerMeterView.setPower(power);
    }
}
