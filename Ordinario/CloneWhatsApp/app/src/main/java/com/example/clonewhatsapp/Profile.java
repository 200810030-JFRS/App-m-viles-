package com.example.clonewhatsapp;

public class Profile {
    private String id;
    private String username;
    private String avatar_url;
    private String last_seen;
    private boolean is_typing;

    public Profile(String id, String username, String avatar_url) {
        this.id = id;
        this.username = username;
        this.avatar_url = avatar_url;
    }

    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getAvatarUrl() { return avatar_url; }
    public String getLastSeen() { return last_seen; }
    public boolean isTyping() { return is_typing; }
}
