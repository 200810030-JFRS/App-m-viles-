package com.example.billar.view;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Shader;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;

public class PowerMeterView extends View {
    public interface PowerListener {
        void onPowerChanged(float power);
        void onPowerReleased(float power);
    }

    private float power = 0f;
    private boolean enabled = true;
    private PowerListener listener;
    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final RectF trackRect = new RectF();
    private final RectF fillRect = new RectF();

    public PowerMeterView(Context c, AttributeSet attrs) {
        super(c, attrs);
    }

    public void setPowerListener(PowerListener listener) {
        this.listener = listener;
    }

    public void setPower(float p) {
        this.power = Math.max(0f, Math.min(1f, p));
        invalidate();
    }

    public void setInputEnabled(boolean enabled) {
        this.enabled = enabled;
        setAlpha(enabled ? 1.0f : 0.4f);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        float w = getWidth();
        float h = getHeight();
        float pad = 6f;

        trackRect.set(pad, pad, w - pad, h - pad);
        paint.setShader(null);
        paint.setColor(Color.parseColor("#15202B"));
        canvas.drawRoundRect(trackRect, 14f, 14f, paint);

        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(2f);
        paint.setColor(Color.parseColor("#33475B"));
        canvas.drawRoundRect(trackRect, 14f, 14f, paint);
        paint.setStyle(Paint.Style.FILL);

        if (power > 0.01f) {
            float fillHeight = (trackRect.height() - 8f) * power;
            fillRect.set(trackRect.left + 4f, trackRect.top + 4f, trackRect.right - 4f, trackRect.top + 4f + fillHeight);
            paint.setShader(new LinearGradient(0, trackRect.top, 0, trackRect.bottom,
                    new int[]{Color.parseColor("#10B981"), Color.parseColor("#F59E0B"), Color.parseColor("#EF4444")},
                    null, Shader.TileMode.CLAMP));
            canvas.drawRoundRect(fillRect, 10f, 10f, paint);
            paint.setShader(null);
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (!enabled) return false;
        float ratio = (event.getY() - 10f) / Math.max(1f, getHeight() - 20f);
        ratio = Math.max(0f, Math.min(1f, ratio));

        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
            case MotionEvent.ACTION_MOVE:
                power = ratio;
                if (listener != null) listener.onPowerChanged(power);
                invalidate();
                return true;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL:
                float finalPower = power;
                power = 0f;
                invalidate();
                if (listener != null) listener.onPowerReleased(finalPower);
                return true;
        }
        return super.onTouchEvent(event);
    }
}
