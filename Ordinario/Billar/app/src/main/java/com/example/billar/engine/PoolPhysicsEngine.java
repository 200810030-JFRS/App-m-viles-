package com.example.billar.engine;

import android.graphics.RectF;
import com.example.billar.model.Ball;
import com.example.billar.model.Pocket;
import java.util.ArrayList;
import java.util.List;

public class PoolPhysicsEngine {
    public interface PhysicsEventListener {
        void onBallCollision(float impactSpeed);
        void onCushionHit(float impactSpeed);
        void onBallPocketed(Ball ball, Pocket pocket);
        void onFirstContact(Ball targetBall);
    }

    private static final int SUB_STEPS = 8;
    private static final float FRICTION_PER_SEC = 0.985f;
    private static final float MIN_SPEED = 4.5f;
    private static final float RESTITUTION_BALL = 0.95f;
    private static final float RESTITUTION_CUSHION = 0.82f;

    private final RectF playBounds = new RectF();
    private final List<Pocket> pockets = new ArrayList<>();
    private PhysicsEventListener listener;
    private boolean firstContactRecorded = false;

    public void setListener(PhysicsEventListener listener) {
        this.listener = listener;
    }

    public void configureTable(RectF bounds, float pocketRadius) {
        playBounds.set(bounds);
        pockets.clear();
        float l = bounds.left;
        float r = bounds.right;
        float t = bounds.top;
        float b = bounds.bottom;
        float cx = bounds.centerX();
        float cornerOffset = pocketRadius * 0.22f;

        pockets.add(new Pocket(l + cornerOffset, t + cornerOffset, pocketRadius));
        pockets.add(new Pocket(cx, t - pocketRadius * 0.12f, pocketRadius * 0.94f));
        pockets.add(new Pocket(r - cornerOffset, t + cornerOffset, pocketRadius));
        pockets.add(new Pocket(l + cornerOffset, b - cornerOffset, pocketRadius));
        pockets.add(new Pocket(cx, b + pocketRadius * 0.12f, pocketRadius * 0.94f));
        pockets.add(new Pocket(r - cornerOffset, b - cornerOffset, pocketRadius));
    }

    public List<Pocket> getPockets() {
        return pockets;
    }

    public RectF getPlayBounds() {
        return playBounds;
    }

    public void resetShotTracking() {
        firstContactRecorded = false;
    }

    public boolean update(List<Ball> balls, float dt) {
        boolean anyMoving = false;
        float subDt = dt / SUB_STEPS;

        for (int step = 0; step < SUB_STEPS; step++) {
            for (Ball b : balls) {
                if (b.pocketed) {
                    if (b.pocketScale > 0.05f) {
                        b.x += (b.pocketTargetX - b.x) * 0.18f;
                        b.y += (b.pocketTargetY - b.y) * 0.18f;
                        b.pocketScale *= 0.88f;
                        anyMoving = true;
                    }
                    continue;
                }

                float spd = b.speed();
                if (spd > 0f) {
                    b.x += b.vx * subDt;
                    b.y += b.vy * subDt;

                    float damping = (float) Math.pow(FRICTION_PER_SEC, subDt * 60f);
                    b.vx *= damping;
                    b.vy *= damping;

                    if (b.speed() < MIN_SPEED) {
                        b.vx = 0f;
                        b.vy = 0f;
                    } else {
                        anyMoving = true;
                    }
                }

                for (Pocket p : pockets) {
                    float dx = p.x - b.x;
                    float dy = p.y - b.y;
                    float dist = (float) Math.hypot(dx, dy);
                    if (dist < p.radius * 0.92f) {
                        b.pocketed = true;
                        b.vx = 0f;
                        b.vy = 0f;
                        b.pocketTargetX = p.x;
                        b.pocketTargetY = p.y;
                        if (listener != null) listener.onBallPocketed(b, p);
                        break;
                    }
                }

                if (!b.pocketed) {
                    handleCushionCollision(b);
                }
            }

            int n = balls.size();
            for (int i = 0; i < n; i++) {
                Ball a = balls.get(i);
                if (a.pocketed) continue;
                for (int j = i + 1; j < n; j++) {
                    Ball b = balls.get(j);
                    if (b.pocketed) continue;
                    resolveBallPair(a, b);
                }
            }
        }
        return anyMoving;
    }

    private void handleCushionCollision(Ball b) {
        for (Pocket p : pockets) {
            if (Math.hypot(p.x - b.x, p.y - b.y) < p.radius * 1.15f) {
                return;
            }
        }

        boolean hit = false;
        float impact = 0f;

        if (b.x - b.radius < playBounds.left) {
            b.x = playBounds.left + b.radius;
            impact = Math.abs(b.vx);
            b.vx = -b.vx * RESTITUTION_CUSHION;
            b.vy += b.spinX * impact * 0.16f;
            b.spinX *= 0.4f;
            hit = true;
        } else if (b.x + b.radius > playBounds.right) {
            b.x = playBounds.right - b.radius;
            impact = Math.abs(b.vx);
            b.vx = -b.vx * RESTITUTION_CUSHION;
            b.vy -= b.spinX * impact * 0.16f;
            b.spinX *= 0.4f;
            hit = true;
        }

        if (b.y - b.radius < playBounds.top) {
            b.y = playBounds.top + b.radius;
            impact = Math.max(impact, Math.abs(b.vy));
            b.vy = -b.vy * RESTITUTION_CUSHION;
            b.vx -= b.spinX * impact * 0.16f;
            b.spinX *= 0.4f;
            hit = true;
        } else if (b.y + b.radius > playBounds.bottom) {
            b.y = playBounds.bottom - b.radius;
            impact = Math.max(impact, Math.abs(b.vy));
            b.vy = -b.vy * RESTITUTION_CUSHION;
            b.vx += b.spinX * impact * 0.16f;
            b.spinX *= 0.4f;
            hit = true;
        }

        if (hit && impact > 25f && listener != null) {
            listener.onCushionHit(impact);
        }
    }

    private void resolveBallPair(Ball a, Ball b) {
        float dx = b.x - a.x;
        float dy = b.y - a.y;
        float dist = (float) Math.hypot(dx, dy);
        float minDist = a.radius + b.radius;

        if (dist >= minDist || dist == 0f) return;

        float nx = dx / dist;
        float ny = dy / dist;

        float overlap = (minDist - dist) * 0.5f;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        if (!firstContactRecorded) {
            if (a.number == 0 && b.number > 0) {
                firstContactRecorded = true;
                if (listener != null) listener.onFirstContact(b);
            } else if (b.number == 0 && a.number > 0) {
                firstContactRecorded = true;
                if (listener != null) listener.onFirstContact(a);
            }
        }

        float rvx = b.vx - a.vx;
        float rvy = b.vy - a.vy;
        float velAlongNormal = rvx * nx + rvy * ny;
        if (velAlongNormal > 0) return;

        float impulse = -(1f + RESTITUTION_BALL) * velAlongNormal * 0.5f;
        float ix = impulse * nx;
        float iy = impulse * ny;

        a.vx -= ix;
        a.vy -= iy;
        b.vx += ix;
        b.vy += iy;

        Ball cue = (a.number == 0) ? a : ((b.number == 0) ? b : null);
        if (cue != null && !cue.spinApplied && Math.abs(cue.spinY) > 0.05f) {
            cue.spinApplied = true;
            float spinImpulse = Math.abs(impulse) * cue.spinY * 0.55f;
            cue.vx += nx * spinImpulse;
            cue.vy += ny * spinImpulse;
        }

        float impactSpeed = Math.abs(velAlongNormal);
        if (impactSpeed > 18f && listener != null) {
            listener.onBallCollision(impactSpeed);
        }
    }
}
