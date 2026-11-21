package com.example.persistencia;

public class Producto {
    private Long id;
    private String producto;
    private String descripcion;
    private Double precio;

    public Producto() {}

    public Producto(String producto, String descripcion, Double precio) {
        this.producto = producto;
        this.descripcion = descripcion;
        this.precio = precio;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProducto() { return producto; }
    public void setProducto(String producto) { this.producto = producto; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
}
