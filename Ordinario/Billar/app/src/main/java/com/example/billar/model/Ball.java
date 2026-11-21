package com.example.billar.model;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RadialGradient;
import android.graphics.RectF;
import android.graphics.Shader;

public class Ball {
    public static final int TYPE_CUE = 0;
    public static final int TYPE_SOLID = 1;
    public static final int TYPE_EIGHT = 2;
    public static final int TYPE_STRIPE = 3;

    public final int number;
    public final int type;
    public final int baseColor;

    public float x;
    public float y;
    public float vx;
    public float vy;
    public float radius;

    public float spinX;
    public float spinY;
    public boolean spinApplied;

    public boolean pocketed;
    public float pocketScale = 1.0f;
    public float pocketTargetX;
    public float pocketTargetY;

    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final RectF stripeRect = new RectF();
    private final Path clipPath = new Path();

    public Ball(int number, float radius) {
        this.number = number;
        this.radius = radius;
        if (number == 0) {
            this.type = TYPE_CUE;
        } else if (number == 8) {
            this.type = TYPE_EIGHT;
        } else if (number >= 1 && number <= 7) {
            this.type = TYPE_SOLID;
        } else {
            this.type = TYPE_STRIPE;
        }
        this.baseColor = getOfficialColor(number);

        textPaint.setColor(Color.parseColor("#111827"));
        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setFakeBoldText(true);
    }

    public static int getOfficialColor(int num) {
        switch (num) {
            case 0: return Color.parseColor("#F8FAFC");
            case 1: case 9: return Color.parseColor("#FACC15");
            case 2: case 10: return Color.parseColor("#2563EB");
            case 3: case 11: return Color.parseColor("#DC2626");
            case 4: case 12: return Color.parseColor("#7C3AED");
            case 5: case 13: return Color.parseColor("#F97316");
            case 6: case 14: return Color.parseColor("#16A34A");
            case 7: case 15: return Color.parseColor("#881337");
            case 8: default: return Color.parseColor("#111827");
        }
    }

    public void resetState() {
        vx = 0f;
        vy = 0f;
        spinX = 0f;
        spinY = 0f;
        spinApplied = false;
        pocketed = false;
        pocketScale = 1.0f;
    }

    public float speed() {
        return (float) Math.hypot(vx, vy);
    }

    public void draw(Canvas canvas) {
        if (pocketed && pocketScale <= 0.05f) return;

        canvas.save();
        canvas.translate(x, y);
        if (pocketed) {
            canvas.scale(pocketScale, pocketScale);
        }

        paint.setShader(null);
        paint.setColor(Color.argb(85, 0, 0, 0));
        canvas.drawCircle(radius * 0.18f, radius * 0.22f, radius, paint);

        if (type == TYPE_STRIPE) {
            paint.setColor(Color.parseColor("#F8FAFC"));
            canvas.drawCircle(0, 0, radius, paint);

            canvas.save();
            clipPath.reset();
            clipPath.addCircle(0, 0, radius, Path.Direction.CW);
            canvas.clipPath(clipPath);
            paint.setColor(baseColor);
            stripeRect.set(-radius, -radius * 0.56f, radius, radius * 0.56f);
            canvas.drawRect(stripeRect, paint);
            canvas.restore();
        } else {
            paint.setColor(baseColor);
            canvas.drawCircle(0, 0, radius, paint);
        }

        RadialGradient shade = new RadialGradient(
                -radius * 0.32f, -radius * 0.35f, radius * 1.45f,
                new int[]{Color.argb(55, 255, 255, 255), Color.TRANSPARENT, Color.argb(95, 0, 0, 0)},
                new float[]{0f, 0.55f, 1f},
                Shader.TileMode.CLAMP
        );
        paint.setShader(shade);
        canvas.drawCircle(0, 0, radius, paint);
        paint.setShader(null);

        if (number > 0) {
            paint.setColor(Color.parseColor("#F8FAFC"));
            canvas.drawCircle(0, 0, radius * 0.46f, paint);

            textPaint.setTextSize(radius * 0.62f);
            Paint.FontMetrics fm = textPaint.getFontMetrics();
            float textY = -(fm.ascent + fm.descent) / 2f;
            canvas.drawText(String.valueOf(number), 0, textY, textPaint);
        }

        paint.setColor(Color.argb(115, 255, 255, 255));
        canvas.drawCircle(-radius * 0.32f, -radius * 0.34f, radius * 0.17f, paint);

        canvas.restore();
    }
}
