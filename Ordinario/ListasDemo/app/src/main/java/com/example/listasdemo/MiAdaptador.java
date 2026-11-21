package com.example.listasdemo;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class MiAdaptador extends RecyclerView.Adapter<MiAdaptador.MiViewHolder> {

    private List<String> listaDatos;

    public MiAdaptador(List<String> listaDatos) {
        this.listaDatos = listaDatos;
    }

    @NonNull
    @Override
    public MiViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_lista, parent, false);
        return new MiViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull MiViewHolder holder, int position) {
        String texto = listaDatos.get(position);
        holder.tvElemento.setText(texto);
    }

    @Override
    public int getItemCount() {
        return listaDatos.size();
    }

    public static class MiViewHolder extends RecyclerView.ViewHolder {
        TextView tvElemento;

        public MiViewHolder(@NonNull View itemView) {
            super(itemView);
            tvElemento = itemView.findViewById(R.id.tvElemento);
        }
    }
}
