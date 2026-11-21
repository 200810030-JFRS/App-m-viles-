package com.example.billar.model;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;

public class Pocket {
    public final float x;
    public final float y;
    public final float radius;
    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

    public Pocket(float x, float y, float radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    public void draw(Canvas canvas) {
        paint.setColor(Color.parseColor("#3E2723"));
        canvas.drawCircle(x, y, radius * 1.15f, paint);

        paint.setColor(Color.parseColor("#090D12"));
        canvas.drawCircle(x, y, radius, paint);

        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(2.5f);
        paint.setColor(Color.argb(90, 255, 255, 255));
        canvas.drawCircle(x, y, radius * 0.96f, paint);
        paint.setStyle(Paint.Style.FILL);
    }
}
