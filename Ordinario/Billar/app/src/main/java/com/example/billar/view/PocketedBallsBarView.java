package com.example.billar.view;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.view.View;
import com.example.billar.model.Ball;
import java.util.ArrayList;
import java.util.List;

public class PocketedBallsBarView extends View {
    private final List<Integer> ballNumbers = new ArrayList<>();
    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

    public PocketedBallsBarView(Context c, AttributeSet attrs) {
        super(c, attrs);
    }

    public void setPocketedNumbers(List<Integer> nums) {
        ballNumbers.clear();
        ballNumbers.addAll(nums);
        invalidate();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        float r = Math.min(getHeight() * 0.42f, 11f);
        float x = r + 3f;
        float cy = getHeight() / 2f;

        for (int num : ballNumbers) {
            paint.setColor(Ball.getOfficialColor(num));
            canvas.drawCircle(x, cy, r, paint);
            if (num >= 9) {
                paint.setColor(Color.WHITE);
                canvas.drawCircle(x, cy, r * 0.45f, paint);
            }
            x += r * 2.25f;
        }
    }
}
