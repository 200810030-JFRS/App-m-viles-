package com.example.clonewhatsapp;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.TaskStackBuilder;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

/**
 * Fase 9 y Fase 10: Recepción de notificaciones push, canales de notificación y apertura directa del chat
 */
public class MyFirebaseMessagingService extends FirebaseMessagingService {

    public static final String CHANNEL_ID = "clonewhatsapp_messages";
    public static final String CHANNEL_NAME = "Mensajes de CloneWhatsApp";

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        FcmTokenManager.saveAndUploadToken(getApplicationContext(), token);
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        String title = "CloneWhatsApp";
        String body = "Tienes un nuevo mensaje";

        if (remoteMessage.getNotification() != null) {
            if (remoteMessage.getNotification().getTitle() != null) {
                title = remoteMessage.getNotification().getTitle();
            }
            if (remoteMessage.getNotification().getBody() != null) {
                body = remoteMessage.getNotification().getBody();
            }
        }

        Map<String, String> data = remoteMessage.getData();
        String conversacionId = data.get("conversacion_id");
        String senderId = data.get("sender_id");
        String senderName = data.get("sender_name") != null ? data.get("sender_name") : title;
        boolean isGroup = "true".equalsIgnoreCase(data.get("is_group"));

        showNotification(title, body, conversacionId, senderId, senderName, isGroup);
    }

    private void showNotification(String title, String body, String conversacionId,
                                  String senderId, String senderName, boolean isGroup) {
        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        // Fase 9: Crear canal de notificación para Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Notificaciones de mensajes nuevos en tiempo real");
            channel.enableVibration(true);
            notificationManager.createNotificationChannel(channel);
        }

        // Fase 10: Abrir la conversación exacta al pulsar la notificación
        Intent chatIntent = new Intent(this, ChatActivity.class);
        chatIntent.putExtra("CONVERSACION_ID", conversacionId);
        chatIntent.putExtra("DESTINATARIO_ID", senderId);
        chatIntent.putExtra("DESTINATARIO_NAME", senderName);
        chatIntent.putExtra("IS_GROUP", isGroup);
        chatIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        TaskStackBuilder stackBuilder = TaskStackBuilder.create(this);
        stackBuilder.addNextIntentWithParentStack(chatIntent);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent pendingIntent = stackBuilder.getPendingIntent(
                (int) System.currentTimeMillis(),
                flags
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(body)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent);

        notificationManager.notify((int) System.currentTimeMillis(), builder.build());
    }
}
