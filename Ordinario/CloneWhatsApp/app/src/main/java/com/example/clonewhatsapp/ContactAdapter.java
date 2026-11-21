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

public class ContactAdapter extends RecyclerView.Adapter<ContactAdapter.ContactViewHolder> {

    public interface OnContactClickListener {
        void onContactClick(Profile profile);
    }

    private List<Profile> contactList;
    private List<Profile> fullContactList;
    private final OnContactClickListener listener;

    public ContactAdapter(List<Profile> contactList, OnContactClickListener listener) {
        this.contactList = contactList;
        this.fullContactList = new ArrayList<>(contactList);
        this.listener = listener;
    }

    public void updateList(List<Profile> newList) {
        this.contactList = newList != null ? newList : new ArrayList<>();
        this.fullContactList = new ArrayList<>(this.contactList);
        notifyDataSetChanged();
    }

    public void filter(String query) {
        List<Profile> filtered = new ArrayList<>();
        if (query == null || query.isEmpty()) {
            filtered.addAll(fullContactList);
        } else {
            for (Profile profile : fullContactList) {
                if (profile.getUsername() != null &&
                        profile.getUsername().toLowerCase().contains(query.toLowerCase())) {
                    filtered.add(profile);
                }
            }
        }
        this.contactList = filtered;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ContactViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_contact, parent, false);
        return new ContactViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ContactViewHolder holder, int position) {
        Profile profile = contactList.get(position);
        holder.tvUsername.setText(profile.getUsername());
        // Fase 11: Cargar fotografía de perfil desde Supabase Storage
        ImageLoader.load(profile.getAvatarUrl(), holder.imgAvatar, android.R.drawable.ic_menu_gallery);
        holder.itemView.setOnClickListener(v -> listener.onContactClick(profile));
    }

    @Override
    public int getItemCount() {
        return contactList.size();
    }

    static class ContactViewHolder extends RecyclerView.ViewHolder {
        ImageView imgAvatar;
        TextView tvUsername;

        ContactViewHolder(@NonNull View itemView) {
            super(itemView);
            imgAvatar = itemView.findViewById(R.id.imgAvatar);
            tvUsername = itemView.findViewById(R.id.tvUsername);
        }
    }
}
