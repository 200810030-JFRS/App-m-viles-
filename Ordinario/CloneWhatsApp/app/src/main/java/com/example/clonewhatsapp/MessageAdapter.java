package com.example.clonewhatsapp;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;
import java.util.List;

/**
 * Fase 6, 8 y 11: Burbujas de texto e imágenes, estados de lectura, búsqueda y eliminación
 */
public class MessageAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    public interface OnMessageLongClickListener {
        void onMessageLongClick(Message message);
    }

    private static final int VIEW_TYPE_SENT = 1;
    private static final int VIEW_TYPE_RECEIVED = 2;

    private List<Message> messageList;
    private List<Message> fullMessageList;
    private final String currentUserId;
    private final boolean isGroup;
    private final OnMessageLongClickListener longClickListener;

    public MessageAdapter(List<Message> messageList, String currentUserId, boolean isGroup,
                          OnMessageLongClickListener longClickListener) {
        this.messageList = messageList;
        this.fullMessageList = new ArrayList<>(messageList);
        this.currentUserId = currentUserId;
        this.isGroup = isGroup;
        this.longClickListener = longClickListener;
    }

    @Override
    public int getItemViewType(int position) {
        Message message = messageList.get(position);
        if (message.getSenderId() != null && message.getSenderId().equals(currentUserId)) {
            return VIEW_TYPE_SENT;
        } else {
            return VIEW_TYPE_RECEIVED;
        }
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        if (viewType == VIEW_TYPE_SENT) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_message_sent, parent, false);
            return new SentViewHolder(view);
        } else {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_message_received, parent, false);
            return new ReceivedViewHolder(view);
        }
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        Message message = messageList.get(position);
        if (holder.getItemViewType() == VIEW_TYPE_SENT) {
            ((SentViewHolder) holder).bind(message);
            holder.itemView.setOnLongClickListener(v -> {
                if (longClickListener != null) {
                    longClickListener.onMessageLongClick(message);
                }
                return true;
            });
        } else {
            ((ReceivedViewHolder) holder).bind(message, isGroup);
        }
    }

    @Override
    public int getItemCount() {
        return messageList.size();
    }

    public void setMessages(List<Message> messages) {
        this.fullMessageList = messages != null ? new ArrayList<>(messages) : new ArrayList<>();
        this.messageList = new ArrayList<>(this.fullMessageList);
        notifyDataSetChanged();
    }

    // Fase 11: Búsqueda de mensajes dentro de la conversación
    public void filterMessages(String query) {
        if (query == null || query.trim().isEmpty()) {
            this.messageList = new ArrayList<>(fullMessageList);
        } else {
            List<Message> filtered = new ArrayList<>();
            String lower = query.toLowerCase();
            for (Message m : fullMessageList) {
                if (m.getContent() != null && m.getContent().toLowerCase().contains(lower)) {
                    filtered.add(m);
                }
            }
            this.messageList = filtered;
        }
        notifyDataSetChanged();
    }

    static class SentViewHolder extends RecyclerView.ViewHolder {
        TextView tvMessageBody, tvStatus;
        ImageView imgMessagePhoto;

        SentViewHolder(View itemView) {
            super(itemView);
            tvMessageBody = itemView.findViewById(R.id.tvMessageBody);
            tvStatus = itemView.findViewById(R.id.tvStatus);
            imgMessagePhoto = itemView.findViewById(R.id.imgMessagePhoto);
        }

        void bind(Message message) {
            if ("image".equals(message.getMessageType()) && message.getImageUrl() != null && !message.getImageUrl().isEmpty()) {
                imgMessagePhoto.setVisibility(View.VISIBLE);
                ImageLoader.load(message.getImageUrl(), imgMessagePhoto, android.R.drawable.ic_menu_gallery);
                tvMessageBody.setVisibility(View.GONE);
            } else {
                imgMessagePhoto.setVisibility(View.GONE);
                tvMessageBody.setVisibility(View.VISIBLE);
                tvMessageBody.setText(message.getContent());
            }

            String status = message.getStatus();
            if ("read".equals(status)) {
                tvStatus.setText("✓✓ Leído");
            } else if ("received".equals(status)) {
                tvStatus.setText("✓✓ Recibido");
            } else {
                tvStatus.setText("✓ Enviado");
            }
        }
    }

    static class ReceivedViewHolder extends RecyclerView.ViewHolder {
        TextView tvSenderName, tvMessageBody;
        ImageView imgMessagePhoto;

        ReceivedViewHolder(View itemView) {
            super(itemView);
            tvSenderName = itemView.findViewById(R.id.tvSenderName);
            tvMessageBody = itemView.findViewById(R.id.tvMessageBody);
            imgMessagePhoto = itemView.findViewById(R.id.imgMessagePhoto);
        }

        void bind(Message message, boolean isGroup) {
            if (isGroup && message.getSenderName() != null && !message.getSenderName().isEmpty()) {
                tvSenderName.setVisibility(View.VISIBLE);
                tvSenderName.setText(message.getSenderName());
            } else {
                tvSenderName.setVisibility(View.GONE);
            }

            if ("image".equals(message.getMessageType()) && message.getImageUrl() != null && !message.getImageUrl().isEmpty()) {
                imgMessagePhoto.setVisibility(View.VISIBLE);
                ImageLoader.load(message.getImageUrl(), imgMessagePhoto, android.R.drawable.ic_menu_gallery);
                tvMessageBody.setVisibility(View.GONE);
            } else {
                imgMessagePhoto.setVisibility(View.GONE);
                tvMessageBody.setVisibility(View.VISIBLE);
                tvMessageBody.setText(message.getContent());
            }
        }
    }
}
