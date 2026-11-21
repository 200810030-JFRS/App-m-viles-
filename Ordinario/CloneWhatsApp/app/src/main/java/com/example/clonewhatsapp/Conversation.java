package com.example.clonewhatsapp;

public class Conversation {
    private String id;
    private boolean is_group;
    private String name;
    private String created_at;

    public Conversation(String id, boolean is_group, String name) {
        this.id = id;
        this.is_group = is_group;
        this.name = name;
    }

    public String getId() { return id; }
    public boolean isGroup() { return is_group; }
    public String getName() { return name; }
}
