# Mejoras de Experiencia de Usuario (UX/UI) - AOS Studio

Este documento se centra exclusivamente en cambios visuales, botones y funcionalidades de interfaz para mejorar la usabilidad del **PreCrafter** y **Crafter**.

---

## 1. Interacción con el Grafo (Canvas)

El lienzo actual se vuelve caótico cuando hay muchos nodos.

*   **✨ Botón "Auto-Organizar" (Magic Layout):**
    *   **Qué:** Un botón flotante que, al pulsarlo, reordene automáticamente todos los nodos de forma jerárquica (izquierda a derecha), desenredando las líneas cruzadas.
    *   **Por qué:** Ahorra tiempo manual moviendo cajas para que el flujo "se vea bonito".

*   **🗺️ Minimapa de Navegación:**
    *   **Qué:** Un pequeño recuadro en la esquina inferior derecha que muestra la vista general de todo el flujo.
    *   **Por qué:** Permite saltar rápidamente de una punta a otra del flujo sin hacer scroll infinito.

*   **👀 "Data Peek" en Conexiones (Hover):**
    *   **Qué:** Al pasar el ratón por encima de una línea (flecha) que conecta dos nodos, mostrar un pequeño globo (tooltip) con una muestra de los datos que están pasando por ahí (ej. las primeras 3 líneas del JSON).
    *   **Por qué:** Elimina la necesidad de abrir el nodo anterior para recordar qué output generaba.

*   **📦 Agrupación Visual (Frames):**
    *   **Qué:** Permitir seleccionar varios nodos, clic derecho y "Agrupar". Esto crea un recuadro de color semitransparente alrededor de ellos con un título (ej. "Fase de Investigación").
    *   **Por qué:** Ayuda a organizar mentalmente partes complejas del flujo.

---

## 2. Editor de Prompts (Inspector Lateral)

La edición de texto es la tarea principal y actualmente es básica.

*   **⚡ Autocompletado de Variables (`{{`):**
    *   **Qué:** Cuando el usuario escriba `{{` dentro del área de texto del prompt, desplegar inmediatamente una lista flotante con las variables disponibles de los nodos anteriores (ej. `{{node_1.output}}`).
    *   **Por qué:** Evita errores de dedo y tener que memorizar IDs de nodos.

*   **🎨 Resaltado de Sintaxis (Syntax Highlighting):**
    *   **Qué:** Que el editor distinga colores para las variables `{{...}}` y para estructuras JSON, en lugar de ser todo texto blanco plano.
    *   **Por qué:** Mejora la legibilidad y ayuda a detectar errores de formato rápidamente.

*   **expandir/Contraer Bloques:**
    *   **Qué:** Botón para maximizar el editor de prompt a pantalla completa.
    *   **Por qué:** Escribir prompts largos en una barra lateral estrecha es incómodo.

---

## 3. Controles de Ejecución e Iteración

Hacer que probar y ajustar sea más rápido.

*   **▶️ Botón "Ejecutar Solo Este Nodo":**
    *   **Qué:** Un botón de "Play" pequeño en la cabecera de cada nodo individual.
    *   **Por qué:** Permite probar un cambio en un nodo específico sin tener que ejecutar todo el flujo desde el principio (siempre que tenga los inputs necesarios).

*   **⏱️ Indicador de Progreso Visual:**
    *   **Qué:** Cuando un nodo está "Pensando" (llamando a la IA), mostrar una barra de progreso o un borde animado que brilla, en lugar de solo un spinner estático. Si es posible, mostrar el texto apareciendo palabra por palabra (efecto streaming).
    *   **Por qué:** Reduce la ansiedad de "¿se ha colgado esto?" en esperas largas.

*   **comparar Historial (A/B Testing rápido):**
    *   **Qué:** En el panel de resultados del nodo, un selector tipo dropdown "Ejecución Anterior vs Actual" que muestre los cambios resaltados en rojo/verde.
    *   **Por qué:** Facilita ver si el cambio que hiciste en el prompt mejoró o empeoró el resultado.

---

## 4. Mejoras Específicas para el Crafter (Emails)

*   **📧 Vista Previa Realista (HTML Render):**
    *   **Qué:** Añadir una pestaña "Preview" que renderice el email tal cual se vería en Gmail o Outlook (con formato, negritas, firma), en lugar de ver el código JSON o texto plano.
    *   **Por qué:** Los copywriters necesitan ver el resultado visual final.

*   **📱 Toggle Desktop/Mobile:**
    *   **Qué:** Botones para cambiar el ancho de la vista previa del email y ver cómo se ve en un móvil vs monitor.
    *   **Por qué:** Asegurar que los asuntos o líneas no se cortan en pantallas pequeñas.

*   **📝 Edición Directa (Click-to-Edit):**
    *   **Qué:** Permitir hacer clic directamente en el texto del email generado en la vista previa para hacer correcciones manuales rápidas de última hora, y que eso actualice el JSON por detrás.
    *   **Por qué:** A veces es más rápido corregir una errata a mano que re-ejecutar el prompt.

---

## 5. Biblioteca y Recursos

*   **📚 Librería de Snippets:**
    *   **Qué:** Un panel lateral con "Fragmentos de Prompt" guardados (ej. "Instrucción para tono formal", "Estructura de JSON estricta") que se pueden arrastrar y soltar dentro del editor.
    *   **Por qué:** Evita reescribir las mismas instrucciones de sistema una y otra vez.
