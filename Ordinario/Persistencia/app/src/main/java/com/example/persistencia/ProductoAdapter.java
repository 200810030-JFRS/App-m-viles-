package com.example.persistencia;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class ProductoAdapter extends RecyclerView.Adapter<ProductoAdapter.ProductoViewHolder> {

    public interface OnProductoActionListener {
        void onEditar(Producto producto);
        void onEliminar(Producto producto);
    }

    private final List<Producto> lista;
    private final OnProductoActionListener listener;

    public ProductoAdapter(List<Producto> lista, OnProductoActionListener listener) {
        this.lista = lista;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ProductoViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_producto, parent, false);
        return new ProductoViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ProductoViewHolder holder, int position) {
        Producto p = lista.get(position);
        holder.tvNombrePrecio.setText(p.getProducto() + " - $" + p.getPrecio());
        holder.tvDescripcion.setText(p.getDescripcion() != null ? p.getDescripcion() : "");

        holder.btnEditar.setOnClickListener(v -> listener.onEditar(p));
        holder.btnEliminar.setOnClickListener(v -> listener.onEliminar(p));
    }

    @Override
    public int getItemCount() {
        return lista.size();
    }

    static class ProductoViewHolder extends RecyclerView.ViewHolder {
        TextView tvNombrePrecio, tvDescripcion;
        Button btnEditar, btnEliminar;

        public ProductoViewHolder(@NonNull View itemView) {
            super(itemView);
            tvNombrePrecio = itemView.findViewById(R.id.tvNombrePrecio);
            tvDescripcion = itemView.findViewById(R.id.tvDescripcion);
            btnEditar = itemView.findViewById(R.id.btnEditar);
            btnEliminar = itemView.findViewById(R.id.btnEliminar);
        }
    }
}
