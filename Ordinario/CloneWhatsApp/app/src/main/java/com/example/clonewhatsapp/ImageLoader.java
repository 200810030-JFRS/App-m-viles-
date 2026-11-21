package com.example.clonewhatsapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Handler;
import android.os.Looper;
import android.util.LruCache;
import android.widget.ImageView;

import androidx.annotation.NonNull;

import java.io.IOException;
import java.io.InputStream;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * Cargador de imágenes ligero con caché en memoria para avatares y fotos de chat (Fase 11)
 */
public class ImageLoader {

    private static final OkHttpClient client = new OkHttpClient();
    private static final Handler mainHandler = new Handler(Looper.getMainLooper());
    private static final LruCache<String, Bitmap> memoryCache = new LruCache<String, Bitmap>(16 * 1024 * 1024) {
        @Override
        protected int sizeOf(@NonNull String key, @NonNull Bitmap bitmap) {
            return bitmap.getByteCount();
        }
    };

    public static void load(String url, ImageView imageView, int placeholderResId) {
        imageView.setImageResource(placeholderResId);
        if (url == null || url.trim().isEmpty()) {
            return;
        }

        Bitmap cached = memoryCache.get(url);
        if (cached != null) {
            imageView.setImageBitmap(cached);
            return;
        }

        imageView.setTag(url);
        Request request = new Request.Builder().url(url).get().build();
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                // Mantener placeholder en caso de error
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) {
                if (response.isSuccessful() && response.body() != null) {
                    InputStream is = response.body().byteStream();
                    Bitmap bitmap = BitmapFactory.decodeStream(is);
                    if (bitmap != null) {
                        memoryCache.put(url, bitmap);
                        mainHandler.post(() -> {
                            Object tag = imageView.getTag();
                            if (url.equals(tag)) {
                                imageView.setImageBitmap(bitmap);
                            }
                        });
                    }
                }
            }
        });
    }
}
