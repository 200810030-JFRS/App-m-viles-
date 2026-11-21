package com.example.billar.view;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.DashPathEffect;
import android.graphics.Paint;
import android.graphics.RectF;
import android.os.Handler;
import android.os.Looper;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;
import com.example.billar.audio.SoundEffectsManager;
import com.example.billar.engine.PoolAIController;
import com.example.billar.engine.PoolPhysicsEngine;
import com.example.billar.engine.PoolRulesManager;
import com.example.billar.model.Ball;
import com.example.billar.model.Pocket;
import java.util.ArrayList;
import java.util.List;

public class PoolTableView extends View {
    public interface GameUIListener {
        void onStateUpdated(PoolRulesManager rules, List<Ball> balls);
        void onMatchFinished(int winnerPlayer, String message);
        void onPullPowerChanged(float power);
    }

    private final List<Ball> balls = new ArrayList<>();
    private final PoolPhysicsEngine physics = new PoolPhysicsEngine();
    private final PoolAIController ai = new PoolAIController();
    private PoolRulesManager rules;
    private SoundEffectsManager sound;
    private GameUIListener uiListener;

    private int gameMode = PoolRulesManager.MODE_CPU;
    private int aiDifficulty = 1;
    private int feltColor = Color.parseColor("#0E6B3B");
    private String p1Name = "Jugador 1";
    private String p2Name = "CPU";

    private final RectF outerWoodRect = new RectF();
    private final RectF feltRect = new RectF();
    private float ballRadius = 15f;
    private float headStringX = 0f;
    private boolean tableInitialized = false;

    private float aimAngle = 0f;
    private float pullPower = 0f;
    private float cueSpinX = 0f;
    private float cueSpinY = 0f;

    private boolean isMoving = false;
    private boolean draggingCueBall = false;
    private boolean pullingBackOnTable = false;
    private float touchStartX, touchStartY;

    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint aimPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Handler handler = new Handler(Looper.getMainLooper());

    public PoolTableView(Context context, AttributeSet attrs) {
        super(context, attrs);
        aimPaint.setColor(Color.argb(185, 255, 255, 255));
        aimPaint.setStrokeWidth(2.5f);
        aimPaint.setPathEffect(new DashPathEffect(new float[]{12f, 10f}, 0f));

        physics.setListener(new PoolPhysicsEngine.PhysicsEventListener() {
            @Override
            public void onBallCollision(float impactSpeed) {
                if (sound != null) sound.playBallCollision(impactSpeed);
            }

            @Override
            public void onCushionHit(float impactSpeed) {
                if (sound != null) sound.playCushionHit(impactSpeed);
            }

            @Override
            public void onBallPocketed(Ball ball, Pocket pocket) {
                if (sound != null) sound.playPocketDrop();
                if (rules != null) rules.recordBallPocketed(ball);
            }

            @Override
            public void onFirstContact(Ball targetBall) {
                if (rules != null) rules.recordFirstContact(targetBall);
            }
        });
    }

    public void initMatch(int mode, int difficulty, int feltTheme, String player1, String player2,
                          SoundEffectsManager soundMgr, GameUIListener listener) {
        this.gameMode = mode;
        this.aiDifficulty = difficulty;
        this.p1Name = player1;
        this.p2Name = player2;
        this.sound = soundMgr;
        this.uiListener = listener;

        if (feltTheme == 1) feltColor = Color.parseColor("#154C79");
        else if (feltTheme == 2) feltColor = Color.parseColor("#7F1D1D");
        else feltColor = Color.parseColor("#0E6B3B");

        rules = new PoolRulesManager(gameMode);
        if (tableInitialized) rackBalls();
    }

    public void setCueSpin(float sx, float sy) {
        this.cueSpinX = sx;
        this.cueSpinY = sy;
    }

    public float getCueSpinX() { return cueSpinX; }
    public float getCueSpinY() { return cueSpinY; }

    public void setExternalPullPower(float p) {
        if (!canHumanAct()) return;
        this.pullPower = p;
        invalidate();
    }

    public void shootWithPower(float power) {
        if (!canHumanAct() || power < 0.06f) {
            this.pullPower = 0f;
            invalidate();
            return;
        }
        executeShot(aimAngle, power);
    }

    private boolean canHumanAct() {
        if (rules == null || isMoving || rules.isGameOver()) return false;
        return !(gameMode == PoolRulesManager.MODE_CPU && rules.getCurrentPlayer() == 2);
    }

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        float margin = 14f;
        float availW = w - margin * 2f;
        float availH = h - margin * 2f;

        float tableW = availW;
        float tableH = tableW * 0.5f;
        if (tableH > availH) {
            tableH = availH;
            tableW = tableH * 2.0f;
        }

        float left = (w - tableW) * 0.5f;
        float top = (h - tableH) * 0.5f;
        outerWoodRect.set(left, top, left + tableW, top + tableH);

        float rail = tableH * 0.088f;
        feltRect.set(left + rail, top + rail, left + tableW - rail, top + tableH - rail);

        ballRadius = feltRect.height() / 24.5f;
        headStringX = feltRect.left + feltRect.width() * 0.25f;
        physics.configureTable(feltRect, ballRadius * 1.62f);

        tableInitialized = true;
        rackBalls();
    }

    public void rackBalls() {
        handler.removeCallbacksAndMessages(null);
        balls.clear();
        rules = new PoolRulesManager(gameMode);
        isMoving = false;
        pullPower = 0f;

        Ball cue = new Ball(0, ballRadius);
        cue.x = headStringX;
        cue.y = feltRect.centerY();
        balls.add(cue);

        int[] rackOrder = {1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15};
        float apexX = feltRect.left + feltRect.width() * 0.73f;
        float apexY = feltRect.centerY();
        float dx = ballRadius * 1.76f;
        float dy = ballRadius * 2.04f;

        int idx = 0;
        for (int row = 0; row < 5; row++) {
            float colX = apexX + row * dx;
            float startY = apexY - (row * dy) * 0.5f;
            for (int col = 0; col <= row; col++) {
                Ball b = new Ball(rackOrder[idx++], ballRadius);
                b.x = colX;
                b.y = startY + col * dy;
                balls.add(b);
            }
        }

        aimAngle = 0f;
        notifyUI();
        invalidate();
    }

    @Override
    protected void onDetachedFromWindow() {
        handler.removeCallbacksAndMessages(null);
        super.onDetachedFromWindow();
    }

    private void executeShot(float angle, float power) {
        Ball cue = balls.get(0);
        if (cue.pocketed) {
            cue.resetState();
            cue.x = headStringX;
            cue.y = feltRect.centerY();
        }

        float maxSpeed = feltRect.width() * 1.75f;
        float speed = maxSpeed * (0.14f + power * 0.86f);
        cue.vx = (float) Math.cos(angle) * speed;
        cue.vy = (float) Math.sin(angle) * speed;
        cue.spinX = cueSpinX;
        cue.spinY = cueSpinY;
        cue.spinApplied = false;

        pullPower = 0f;
        isMoving = true;
        physics.resetShotTracking();
        if (rules != null) rules.onShotStarted();
        if (sound != null) sound.playCueHit(power);

        cueSpinX = 0f;
        cueSpinY = 0f;
        postInvalidateOnAnimation();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        if (!tableInitialized) return;

        paint.setColor(Color.parseColor("#4E2A14"));
        canvas.drawRoundRect(outerWoodRect, 26f, 26f, paint);

        paint.setColor(feltColor);
        canvas.drawRect(feltRect, paint);

        paint.setColor(Color.argb(55, 255, 255, 255));
        paint.setStrokeWidth(2f);
        canvas.drawLine(headStringX, feltRect.top, headStringX, feltRect.bottom, paint);
        canvas.drawCircle(feltRect.left + feltRect.width() * 0.73f, feltRect.centerY(), 4f, paint);

        for (Pocket p : physics.getPockets()) {
            p.draw(canvas);
        }

        for (Ball b : balls) {
            b.draw(canvas);
        }

        Ball cue = balls.get(0);
        if (!isMoving && !cue.pocketed && rules != null && !rules.isGameOver()) {
            if (rules.isBallInHand() && canHumanAct()) {
                paint.setStyle(Paint.Style.STROKE);
                paint.setStrokeWidth(3f);
                paint.setColor(Color.parseColor("#F59E0B"));
                canvas.drawCircle(cue.x, cue.y, ballRadius * 1.55f, paint);
                paint.setStyle(Paint.Style.FILL);
            }
            drawAimAndCue(canvas, cue);
        }

        if (isMoving) {
            boolean stillMoving = physics.update(balls, 1f / 60f);
            if (!stillMoving) {
                isMoving = false;
                onTurnSettled();
            }
            postInvalidateOnAnimation();
        }
    }

    private void drawAimAndCue(Canvas canvas, Ball cue) {
        float dirX = (float) Math.cos(aimAngle);
        float dirY = (float) Math.sin(aimAngle);

        float maxDist = feltRect.width() * 1.2f;
        float hitDist = maxDist;
        Ball hitBall = null;

        for (Ball b : balls) {
            if (b == cue || b.pocketed) continue;
            float toBX = b.x - cue.x;
            float toBY = b.y - cue.y;
            float proj = toBX * dirX + toBY * dirY;
            if (proj <= 0f) continue;
            float perpSq = (toBX * toBX + toBY * toBY) - proj * proj;
            float sumR = cue.radius + b.radius;
            if (perpSq < sumR * sumR) {
                float d = proj - (float) Math.sqrt(sumR * sumR - perpSq);
                if (d >= 0f && d < hitDist) {
                    hitDist = d;
                    hitBall = b;
                }
            }
        }

        if (dirX > 0.001f) hitDist = Math.min(hitDist, (feltRect.right - cue.radius - cue.x) / dirX);
        if (dirX < -0.001f) hitDist = Math.min(hitDist, (feltRect.left + cue.radius - cue.x) / dirX);
        if (dirY > 0.001f) hitDist = Math.min(hitDist, (feltRect.bottom - cue.radius - cue.y) / dirY);
        if (dirY < -0.001f) hitDist = Math.min(hitDist, (feltRect.top + cue.radius - cue.y) / dirY);

        float ghostX = cue.x + dirX * hitDist;
        float ghostY = cue.y + dirY * hitDist;

        canvas.drawLine(cue.x, cue.y, ghostX, ghostY, aimPaint);

        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(2f);
        paint.setColor(Color.argb(190, 255, 255, 255));
        canvas.drawCircle(ghostX, ghostY, cue.radius, paint);
        paint.setStyle(Paint.Style.FILL);

        if (hitBall != null) {
            float tdx = hitBall.x - ghostX;
            float tdy = hitBall.y - ghostY;
            float tlen = (float) Math.hypot(tdx, tdy);
            if (tlen > 0.1f) {
                paint.setColor(Color.parseColor("#10B981"));
                paint.setStrokeWidth(3f);
                canvas.drawLine(hitBall.x, hitBall.y,
                        hitBall.x + (tdx / tlen) * ballRadius * 4.5f,
                        hitBall.y + (tdy / tlen) * ballRadius * 4.5f, paint);
            }
        }

        float pullback = ballRadius * 1.4f + pullPower * ballRadius * 5.5f;
        float cueLength = feltRect.width() * 0.44f;
        float startX = cue.x - dirX * pullback;
        float startY = cue.y - dirY * pullback;
        float endX = cue.x - dirX * (pullback + cueLength);
        float endY = cue.y - dirY * (pullback + cueLength);

        paint.setStrokeCap(Paint.Cap.ROUND);
        paint.setStrokeWidth(ballRadius * 0.58f);
        paint.setColor(Color.parseColor("#3B1D0E"));
        canvas.drawLine(startX, startY, endX, endY, paint);

        paint.setStrokeWidth(ballRadius * 0.36f);
        paint.setColor(Color.parseColor("#E6C280"));
        canvas.drawLine(startX, startY,
                cue.x - dirX * (pullback + cueLength * 0.55f),
                cue.y - dirY * (pullback + cueLength * 0.55f), paint);

        paint.setColor(Color.parseColor("#38BDF8"));
        canvas.drawCircle(startX, startY, ballRadius * 0.22f, paint);
    }

    private void onTurnSettled() {
        rules.evaluateTurn(balls, p1Name, p2Name);

        Ball cue = balls.get(0);
        if (cue.pocketed) {
            cue.resetState();
            cue.x = headStringX;
            cue.y = feltRect.centerY();
            while (overlapsAnyBall(cue.x, cue.y, cue)) {
                cue.y += ballRadius * 2.2f;
                if (cue.y > feltRect.bottom - ballRadius * 2f) {
                    cue.y = feltRect.top + ballRadius * 2f;
                }
            }
        }

        notifyUI();
        invalidate();

        if (rules.isGameOver()) {
            if (uiListener != null) {
                uiListener.onMatchFinished(rules.getWinnerPlayer(), rules.getStatusMessage());
            }
            return;
        }

        if (gameMode == PoolRulesManager.MODE_CPU && rules.getCurrentPlayer() == 2) {
            handler.postDelayed(this::performCPUTurn, 700);
        }
    }

    private void performCPUTurn() {
        if (rules == null || rules.isGameOver() || rules.getCurrentPlayer() != 2) return;
        PoolAIController.ShotPlan plan = ai.computeShot(balls, physics.getPockets(), rules, aiDifficulty);
        aimAngle = plan.angleRad;
        invalidate();
        handler.postDelayed(() -> executeShot(plan.angleRad, plan.power), 550);
    }

    private boolean overlapsAnyBall(float x, float y, Ball ignore) {
        for (Ball b : balls) {
            if (b == ignore || b.pocketed) continue;
            if (Math.hypot(b.x - x, b.y - y) < (b.radius + ignore.radius) * 1.05f) return true;
        }
        return false;
    }

    private void notifyUI() {
        if (uiListener != null && rules != null) {
            uiListener.onStateUpdated(rules, balls);
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (!canHumanAct()) return false;
        Ball cue = balls.get(0);
        float tx = event.getX();
        float ty = event.getY();

        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                touchStartX = tx;
                touchStartY = ty;
                if (rules.isBallInHand() && Math.hypot(tx - cue.x, ty - cue.y) < ballRadius * 2.8f) {
                    draggingCueBall = true;
                } else {
                    float dirX = (float) Math.cos(aimAngle);
                    float dirY = (float) Math.sin(aimAngle);
                    float behindX = cue.x - dirX * ballRadius * 3f;
                    float behindY = cue.y - dirY * ballRadius * 3f;
                    if (Math.hypot(tx - behindX, ty - behindY) < ballRadius * 4.5f) {
                        pullingBackOnTable = true;
                    } else {
                        aimAngle = (float) Math.atan2(ty - cue.y, tx - cue.x);
                    }
                }
                invalidate();
                return true;

            case MotionEvent.ACTION_MOVE:
                if (draggingCueBall) {
                    float maxX = rules.isBreakShot() ? headStringX : (feltRect.right - ballRadius);
                    float nx = Math.max(feltRect.left + ballRadius, Math.min(maxX, tx));
                    float ny = Math.max(feltRect.top + ballRadius, Math.min(feltRect.bottom - ballRadius, ty));
                    if (!overlapsAnyBall(nx, ny, cue)) {
                        cue.x = nx;
                        cue.y = ny;
                    }
                } else if (pullingBackOnTable) {
                    float dx = tx - touchStartX;
                    float dy = ty - touchStartY;
                    float backProj = -(dx * (float) Math.cos(aimAngle) + dy * (float) Math.sin(aimAngle));
                    pullPower = Math.max(0f, Math.min(1f, backProj / (ballRadius * 7f)));
                    if (uiListener != null) uiListener.onPullPowerChanged(pullPower);
                } else {
                    aimAngle = (float) Math.atan2(ty - cue.y, tx - cue.x);
                }
                invalidate();
                return true;

            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL:
                if (pullingBackOnTable) {
                    pullingBackOnTable = false;
                    float p = pullPower;
                    pullPower = 0f;
                    if (uiListener != null) uiListener.onPullPowerChanged(0f);
                    if (p >= 0.08f) executeShot(aimAngle, p);
                }
                draggingCueBall = false;
                invalidate();
                return true;
        }
        return super.onTouchEvent(event);
    }
}
