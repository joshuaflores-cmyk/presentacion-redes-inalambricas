# Vulnerabilidades en los servicios y seguridad en redes inalámbricas

Presentación web interactiva estilo cinematográfico controlada por scroll, con video de fondo generado mediante **Gemini Omni 1.2 Flash** convertido a secuencia de frames (`WebP`) y diagramas animados interactivos para cada sección.

**Integrantes:** Joshua Flores · Rogelio Miranda

---

## Estructura de la presentación (Portada + 11 scrolls)

- **Portada (inicio, sin scroll):** Título e integrantes.
- **Scroll 1 — `01` Introducción:** Conectividad Wi-Fi, alcance por radiofrecuencia y tríada CIA.
- **Scroll 2 — `02` ¿Qué son las vulnerabilidades en los servicios de red?:** Definición, origen técnico/humano y consecuencias.
- **Scroll 3 — `03` Vulnerabilidades de acceso y configuración:** Contraseñas débiles, configuraciones incorrectas y falta de control de acceso *(con simulador interactivo)*.
- **Scroll 4 — `04` Vulnerabilidades en sistemas y datos:** Equipos desactualizados y falta de cifrado *(con simulador Sin cifrar vs. WPA3 + HTTPS)*.
- **Scroll 5 — `05` Seguridad en redes inalámbricas:** Estándar IEEE 802.11 y enfoque integral NIST.
- **Scroll 6 — `06` Amenazas de acceso e intercepción en Wi-Fi:** Redes abiertas, Rogue AP, Man-in-the-Middle y Packet Sniffing *(con mapa interactivo)*.
- **Scroll 7 — `07` Ataques de interrupción y acceso forzado:** Deauthentication (PMF), Fuerza bruta y Denegación de servicio (DoS) *(con monitor cinético en vivo)*.
- **Scroll 8 — `08` Protocolos de seguridad inalámbrica:** Evolución interactiva de WEP → WPA → WPA2 → WPA3.
- **Scroll 9 — `09` Medidas de prevención y protección:** Firewall, segmentación VLAN, detección de intrusos y capacitación.
- **Scroll 10 — `10` Importancia en empresas y organizaciones:** Impacto corporativo/educativo y ciclo de resiliencia.
- **Scroll 11 — Conclusión:** Cierre y síntesis final.

---

## Controles durante la exposición

- **Desplazamiento / Scroll:** Avanza o retrocede suavemente las diapositivas y el video de fondo frame a frame.
- **`↓` / `↑` / `Espacio` / `RePág` / `AvPág`:** Cambia de diapositiva.
- **`F`:** Activar o salir del modo **Pantalla completa**.
- **`M`:** Abrir el **Índice rápido** de diapositivas.
- **`P`:** Pausar o reanudar animaciones decorativas.

---

## Cómo ejecutar localmente

### Opción 1: Abrir directamente
Haz doble clic en `index.html` y ábrelo en Google Chrome o Microsoft Edge.

### Opción 2: Servidor local (recomendado)
```bash
npm start
```
Luego abre `http://127.0.0.1:4173` en tu navegador.

---

## Cómo subir a GitHub y publicar en GitHub Pages

Repositorio: https://github.com/joshuaflores-cmyk/presentacion-redes-inalambricas

Para publicarlo como sitio web en vivo gratis con **GitHub Pages**:
- Ve a **Settings → Pages** en el repositorio de GitHub.
- En **Source**, elige **Deploy from a branch**, selecciona la rama `main` y la carpeta `/ (root)`.
- Guarda y en ~1 minuto estará disponible en: `https://joshuaflores-cmyk.github.io/presentacion-redes-inalambricas/`

---

## Estructura del proyecto

```text
presentacion-redes-inalambricas/
├── index.html                  # Estructura principal y diagramas SVG animados
├── css/
│   └── styles.css              # Diseño oscuro cinematográfico y animaciones CSS
├── js/
│   ├── app.js                  # Motor de scroll-scrubbing de frames y navegación
│   └── diagrams.js             # Simuladores interactivos y telemetría Canvas
├── assets/
│   ├── video/
│   │   └── background_omni.mp4 # Video generado con Gemini Omni 1.2 Flash
│   ├── frames/                 # Secuencia de frames WebP extraídos del video
│   └── images/                 # Ilustraciones 3D de apoyo para diapositivas
├── scripts/
│   ├── serve.mjs               # Servidor local sin dependencias externas
│   └── generate_omni_video.mjs # Script reproducible para regenerar el video con OmniFlash
├── .gitignore
├── .nojekyll                   # Despliegue limpio en GitHub Pages
└── README.md
```
