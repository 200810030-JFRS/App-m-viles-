package com.example.clonewhatsapp;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class SelectableContactAdapter extends RecyclerView.Adapter<SelectableContactAdapter.ViewHolder> {

    private List<Profile> contacts;
    private final Set<String> selectedIds = new HashSet<>();

    public SelectableContactAdapter(List<Profile> contacts) {
        this.contacts = contacts;
    }

    public void updateList(List<Profile> newContacts) {
        this.contacts = newContacts;
        notifyDataSetChanged();
    }

    public Set<String> getSelectedUserIds() {
        return selectedIds;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_selectable_contact, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Profile profile = contacts.get(position);
        holder.tvUsername.setText(profile.getUsername());
        holder.cbSelect.setOnCheckedChangeListener(null);
        holder.cbSelect.setChecked(selectedIds.contains(profile.getId()));

        holder.cbSelect.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (isChecked) {
                selectedIds.add(profile.getId());
            } else {
                selectedIds.remove(profile.getId());
            }
        });

        holder.itemView.setOnClickListener(v -> holder.cbSelect.toggle());
    }

    @Override
    public int getItemCount() {
        return contacts.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvUsername;
        CheckBox cbSelect;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvUsername = itemView.findViewById(R.id.tvUsername);
            cbSelect = itemView.findViewById(R.id.cbSelect);
        }
    }
}
