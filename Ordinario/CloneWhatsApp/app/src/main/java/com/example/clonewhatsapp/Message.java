package com.example.clonewhatsapp;

public class Message {
    private String id;
    private String conversacion_id;
    private String sender_id;
    private String sender_name;
    private String content;
    private String message_type; // "text" o "image"
    private String image_url;
    private String created_at;
    private String status;

    public Message(String id, String conversacion_id, String sender_id, String content, String status) {
        this.id = id;
        this.conversacion_id = conversacion_id;
        this.sender_id = sender_id;
        this.content = content;
        this.message_type = "text";
        this.status = status;
    }

    public String getId() { return id; }
    public String getConversacionId() { return conversacion_id; }
    public String getSenderId() { return sender_id; }
    public String getSenderName() { return sender_name; }
    public String getContent() { return content; }
    public String getMessageType() { return message_type; }
    public String getImageUrl() { return image_url; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
