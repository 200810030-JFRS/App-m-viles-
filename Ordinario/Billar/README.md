# Billar 8-Ball Pro — Proyecto Android Studio (Java)

Proyecto listo para abrir, compilar y ejecutar en **Android Studio**, configurado con tus especificaciones exactas:
- **Nombre de la app:** `Billar`
- **Package name:** `com.example.billar`
- **Lenguaje:** `Java` (Java 17)
- **Minimum SDK:** `API 24 ("Nougat")`
- **Build configuration language:** `Kotlin DSL (build.gradle.kts)`

## Características incluidas
1. **Física 2D Realista (Sub-stepping 8x):**
   - Colisiones elásticas bola-bola con transferencia de momento y separación sin solapamiento.
   - Rebote en bandas con restitución realista y bocas de tronera redondeadas.
   - Efecto en la bola blanca (*Top-Spin* / corrido, *Back-Spin* / retroceso y efecto lateral en bandas).
2. **Modos de Juego:**
   - **1 Jugador vs CPU:** IA con 3 niveles de dificultad (*Fácil*, *Normal*, *Difícil*) que calcula tiros con bola fantasma y detecta obstáculos.
   - **2 Jugadores Local:** Juega por turnos contra un amigo en el mismo dispositivo.
   - **Práctica Libre:** Entrena tiros libres sin turnos ni penalizaciones.
3. **Reglamento Oficial de Bola 8:**
   - Triángulo inicial reglamentario, asignación automática de **Lisas (1-7)** y **Rayadas (9-15)**, detección de faltas (*Scratch*, bola contraria, sin tocar bola), **Bola en Mano** arrastrable y victoria/derrota con la **Bola 8**.
4. **Controles Táctiles y con Ratón (Emulador):**
   - Toca o arrastra sobre la mesa para apuntar con guía láser, **Bola Fantasma** y vectores de trayectoria.
   - Tira del taco hacia atrás sobre la mesa **o** usa la barra vertical de potencia en el lateral derecho y suelta para disparar.
   - Selector visual de **Efecto (Spin)** tocando el punto deseado sobre la bola blanca.
5. **Efectos de Sonido Procedurales:**
   - Síntesis de audio PCM en tiempo real (golpe de taco, choque entre bolas proporcional a la fuerza, rebote en banda y caída en tronera) sin archivos externos.

## Cómo abrir en Android Studio
1. Descomprime `Billar.zip` en tu carpeta de proyectos (por ejemplo `C:\Users\SOPORTE\AndroidStudioProjects\Billar`).
2. En Android Studio selecciona **File > Open** y elige la carpeta `Billar`.
3. Espera a que finalice **Gradle Sync** y presiona **Run (▶)**.
