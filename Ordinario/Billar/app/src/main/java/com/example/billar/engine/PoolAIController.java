package com.example.billar.engine;

import com.example.billar.model.Ball;
import com.example.billar.model.Pocket;
import java.util.List;
import java.util.Random;

public class PoolAIController {
    public static class ShotPlan {
        public float angleRad;
        public float power;
    }

    private final Random random = new Random();

    public ShotPlan computeShot(List<Ball> balls, List<Pocket> pockets, PoolRulesManager rules, int difficulty) {
        Ball cue = balls.get(0);
        ShotPlan best = null;
        float bestScore = -Float.MAX_VALUE;

        for (Ball target : balls) {
            if (!rules.isBallLegalTarget(target, balls)) continue;

            for (Pocket pocket : pockets) {
                float toPocketX = pocket.x - target.x;
                float toPocketY = pocket.y - target.y;
                float distToPocket = (float) Math.hypot(toPocketX, toPocketY);
                if (distToPocket < 1f) continue;

                float dirX = toPocketX / distToPocket;
                float dirY = toPocketY / distToPocket;

                float ghostX = target.x - dirX * (cue.radius + target.radius);
                float ghostY = target.y - dirY * (cue.radius + target.radius);

                float cueToGhostX = ghostX - cue.x;
                float cueToGhostY = ghostY - cue.y;
                float distCueToGhost = (float) Math.hypot(cueToGhostX, cueToGhostY);
                if (distCueToGhost < 1f) continue;

                float shotDirX = cueToGhostX / distCueToGhost;
                float shotDirY = cueToGhostY / distCueToGhost;

                float cutCos = shotDirX * dirX + shotDirY * dirY;
                if (cutCos <= 0.18f) continue;

                float score = cutCos * 120f - (distToPocket + distCueToGhost) * 0.08f;
                if (isPathBlocked(cue.x, cue.y, ghostX, ghostY, balls, cue, target)) score -= 90f;
                if (isPathBlocked(target.x, target.y, pocket.x, pocket.y, balls, cue, target)) score -= 110f;

                if (score > bestScore) {
                    bestScore = score;
                    best = new ShotPlan();
                    best.angleRad = (float) Math.atan2(shotDirY, shotDirX);
                    best.power = Math.min(0.92f, Math.max(0.38f, (distCueToGhost + distToPocket) / 950f + 0.30f));
                }
            }
        }

        if (best == null) {
            best = new ShotPlan();
            for (Ball target : balls) {
                if (rules.isBallLegalTarget(target, balls)) {
                    best.angleRad = (float) Math.atan2(target.y - cue.y, target.x - cue.x);
                    best.power = 0.65f;
                    break;
                }
            }
        }

        float maxErrorRad = (difficulty == 0) ? 0.095f : (difficulty == 1 ? 0.038f : 0.008f);
        best.angleRad += (random.nextFloat() * 2f - 1f) * maxErrorRad;
        return best;
    }

    private boolean isPathBlocked(float x1, float y1, float x2, float y2, List<Ball> balls, Ball ignoreA, Ball ignoreB) {
        float dx = x2 - x1;
        float dy = y2 - y1;
        float lenSq = dx * dx + dy * dy;
        if (lenSq == 0f) return false;

        for (Ball other : balls) {
            if (other.pocketed || other == ignoreA || other == ignoreB) continue;
            float t = ((other.x - x1) * dx + (other.y - y1) * dy) / lenSq;
            if (t > 0.05f && t < 0.95f) {
                float projX = x1 + t * dx;
                float projY = y1 + t * dy;
                if (Math.hypot(other.x - projX, other.y - projY) < other.radius * 2.05f) {
                    return true;
                }
            }
        }
        return false;
    }
}
