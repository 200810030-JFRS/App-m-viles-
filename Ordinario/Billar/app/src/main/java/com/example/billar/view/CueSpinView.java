package com.example.billar.view;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;

public class CueSpinView extends View {
    public interface SpinListener {
        void onSpinChanged(float spinX, float spinY);
    }

    private float spinX = 0f;
    private float spinY = 0f;
    private SpinListener listener;
    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

    public CueSpinView(Context c, AttributeSet attrs) {
        super(c, attrs);
    }

    public void setSpinListener(SpinListener listener) {
        this.listener = listener;
    }

    public void setSpin(float sx, float sy) {
        this.spinX = sx;
        this.spinY = sy;
        invalidate();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        float cx = getWidth() / 2f;
        float cy = getHeight() / 2f;
        float r = Math.min(cx, cy) - 10f;

        paint.setColor(Color.parseColor("#F8FAFC"));
        canvas.drawCircle(cx, cy, r, paint);

        paint.setColor(Color.parseColor("#CBD5E1"));
        paint.setStrokeWidth(2f);
        canvas.drawLine(cx - r * 0.75f, cy, cx + r * 0.75f, cy, paint);
        canvas.drawLine(cx, cy - r * 0.75f, cx, cy + r * 0.75f, paint);

        float dotX = cx + spinX * r * 0.72f;
        float dotY = cy - spinY * r * 0.72f;
        paint.setColor(Color.parseColor("#EF4444"));
        canvas.drawCircle(dotX, dotY, 13f, paint);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        float cx = getWidth() / 2f;
        float cy = getHeight() / 2f;
        float r = Math.max(1f, (Math.min(cx, cy) - 10f) * 0.72f);

        float nx = (event.getX() - cx) / r;
        float ny = -(event.getY() - cy) / r;
        float mag = (float) Math.hypot(nx, ny);
        if (mag > 1f) {
            nx /= mag;
            ny /= mag;
        }
        spinX = nx;
        spinY = ny;
        if (listener != null) listener.onSpinChanged(spinX, spinY);
        invalidate();
        return true;
    }
}
