package com.example.billar.audio;

import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;
import java.util.LinkedList;
import java.util.Queue;

public class SoundEffectsManager {
    private static final int SAMPLE_RATE = 22050;
    private static final int MAX_ACTIVE_TRACKS = 8;
    private boolean enabled = true;

    private final short[] cueHitSamples;
    private final short[] ballClickSamples;
    private final short[] cushionSamples;
    private final short[] pocketSamples;
    private final Queue<AudioTrack> trackPool = new LinkedList<>();

    public SoundEffectsManager() {
        cueHitSamples = synthesizeClick(280, 0.055f, 0.75f);
        ballClickSamples = synthesizeClick(1450, 0.035f, 0.85f);
        cushionSamples = synthesizeClick(140, 0.075f, 0.60f);
        pocketSamples = synthesizeDrop();
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void playCueHit(float power) {
        playSamples(cueHitSamples, Math.min(1f, Math.max(0.25f, power)));
    }

    public void playBallCollision(float impactSpeed) {
        float vol = Math.min(1f, impactSpeed / 750f);
        if (vol > 0.06f) playSamples(ballClickSamples, vol);
    }

    public void playCushionHit(float impactSpeed) {
        float vol = Math.min(0.85f, impactSpeed / 800f);
        if (vol > 0.06f) playSamples(cushionSamples, vol);
    }

    public void playPocketDrop() {
        playSamples(pocketSamples, 0.85f);
    }

    public void release() {
        while (!trackPool.isEmpty()) {
            AudioTrack old = trackPool.poll();
            if (old != null) {
                try {
                    old.release();
                } catch (Exception ignored) {
                }
            }
        }
    }

    private short[] synthesizeClick(double freq, float durationSec, float amp) {
        int count = (int) (SAMPLE_RATE * durationSec);
        short[] buf = new short[count];
        for (int i = 0; i < count; i++) {
            double t = (double) i / SAMPLE_RATE;
            double env = Math.exp(-t * 65.0);
            double wave = Math.sin(2.0 * Math.PI * freq * t) + 0.4 * Math.sin(2.0 * Math.PI * freq * 2.3 * t);
            buf[i] = (short) (wave * env * amp * 16000);
        }
        return buf;
    }

    private short[] synthesizeDrop() {
        int count = (int) (SAMPLE_RATE * 0.16f);
        short[] buf = new short[count];
        for (int i = 0; i < count; i++) {
            double t = (double) i / SAMPLE_RATE;
            double freq = 420.0 - t * 1400.0;
            double env = Math.exp(-t * 18.0);
            buf[i] = (short) (Math.sin(2.0 * Math.PI * Math.max(90, freq) * t) * env * 14000);
        }
        return buf;
    }

    private synchronized void playSamples(short[] samples, float volume) {
        if (!enabled || samples == null) return;
        try {
            while (trackPool.size() >= MAX_ACTIVE_TRACKS) {
                AudioTrack oldest = trackPool.poll();
                if (oldest != null) {
                    try {
                        oldest.release();
                    } catch (Exception ignored) {
                    }
                }
            }

            int byteSize = samples.length * 2;
            AudioTrack track = new AudioTrack.Builder()
                    .setAudioAttributes(new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_GAME)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build())
                    .setAudioFormat(new AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(SAMPLE_RATE)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build())
                    .setBufferSizeInBytes(byteSize)
                    .setTransferMode(AudioTrack.MODE_STATIC)
                    .build();
            track.write(samples, 0, samples.length);
            track.setVolume(volume);
            track.play();
            trackPool.offer(track);
        } catch (Exception ignored) {
        }
    }
}
