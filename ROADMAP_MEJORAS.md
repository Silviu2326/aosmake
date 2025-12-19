# Roadmap de Mejoras: AOS Studio (PreCrafter & Crafter)

Este documento recoge propuestas de mejora para elevar el nivel del sistema AOS Studio, enfocándose en la usabilidad, la potencia del motor de flujos y la capacidad de depuración.

---

## 1. Experiencia de Usuario (UX/UI) y Visualización

### 🎨 Canvas y Grafo
-   **Auto-Layout (Dagres/Elk):** Implementar un botón para organizar automáticamente los nodos. A medida que el flujo crece, mantener el orden manualmente es tedioso.
-   **Minimapa:** Añadir un minimapa en la esquina inferior para navegar rápidamente por flujos grandes.
-   **Agrupación de Nodos (Sub-flows):** Permitir seleccionar varios nodos y "agruparlos" en un nodo contenedor para simplificar visualmente la lógica compleja (ej. agrupar todo el "Signal Harvesting" en un solo bloque visual).
-   **Visualización de Datos en Edges:** Al pasar el ratón sobre una línea de conexión (edge), mostrar un tooltip con una previsualización de los datos que están viajando por ella.

### 📝 Edición de Prompts
-   **Editor de Código Real (Monaco Editor):** Reemplazar los `textarea` del Inspector por una instancia de Monaco Editor (como VS Code) para tener resaltado de sintaxis (JSON, Markdown), numeración de líneas y mejor legibilidad.
-   **Variables Autocomplete:** Al escribir `{{` dentro de un prompt, desplegar un menú contextual con las variables disponibles de los nodos anteriores.

---

## 2. Funcionalidades del Motor (Core Engine)

### 🧠 Nodos Lógicos y de Control
-   **Nodo "Switch" (If/Else):** Actualmente el flujo es lineal. Un nodo *Router* que evalúe una condición (ej. `feasibility_report.status === 'DROP'`) y active una rama u otra permitiría detener procesos costosos automáticamente.
-   **Nodo "Code" (JavaScript/Python):** Un nodo seguro (Sandbox) para ejecutar scripts simples de transformación de datos sin gastar tokens de LLM (ej. formatear fechas, calcular sumas, limpiar strings).

### 🔌 Conectividad
-   **Nodo "HTTP Request":** Permitir hacer llamadas a APIs externas (ej. Clay, Apollo, Google Search) directamente desde el flujo para enriquecer datos en tiempo real.
-   **Nodo "Scraper":** Un nodo simple que reciba una URL y devuelva el texto plano (`document.body.innerText`) para que el LLM lo analice.

---

## 3. Gestión de Datos y Producción (Batching)

### 🏭 Modo Factoría (Batch Processing)
-   **Subida de CSV/Excel:** Permitir subir un CSV con 100 leads al nodo inicial (`node-lead-input`).
-   **Cola de Ejecución:** El sistema debería iterar el flujo por cada fila del CSV automáticamente.
-   **Vista de Tabla de Resultados:** En lugar de ver nodo por nodo, una vista de "Resultados" donde cada fila es un lead y las columnas son los outputs clave (`why_now`, `angle`, `email_body`).

### 💾 Persistencia
-   **Historial de Ejecuciones:** Guardar no solo el diseño del flujo, sino los resultados de ejecuciones pasadas para poder consultarlos más tarde ("¿Qué email generamos para Coca-Cola la semana pasada?").

---

## 4. Observabilidad y Debugging

### 🕵️‍♂️ Inspector Avanzado
-   **Diff View:** Ver visualmente la diferencia entre el input y el output de un nodo (izquierda/derecha).
-   **Calculadora de Costes:** Mostrar una estimación de tokens consumidos y coste en USD por nodo y por ejecución total del flujo.
-   **Time Travel:** Poder hacer clic en un nodo ya ejecutado y "reproducir" solo desde ahí cambiando el prompt, sin tener que re-ejecutar todo el flujo anterior.

### 🚦 Validación
-   **Validación de Schema en Tiempo Real:** Si un nodo LLM devuelve un JSON que no cumple con el esquema definido en el Inspector, marcar el nodo en rojo visualmente y mostrar el error de validación específico (ej. "Falta el campo 'confidence'").

---

## 5. Mejoras Específicas para el Crafter (Email)

-   **Previsualización HTML/Rich Text:** El nodo final del Crafter debería renderizar el email tal como se vería en un cliente de correo (Gmail/Outlook), no solo el JSON o texto plano.
-   **Checklist de Calidad (Spam Score):** Un nodo utilitario que analice el email generado y le asigne una puntuación de probabilidad de spam (basado en palabras prohibidas, longitud, cantidad de enlaces).
-   **Botón "Enviar Prueba":** Integración con un proveedor de email (SendGrid o SMTP simple) para enviarse a uno mismo el email generado con un clic.

---

## 6. Arquitectura Técnica

-   **Backend Streaming:** Cambiar la ejecución de nodos para usar Server-Sent Events (SSE) o WebSockets. Esto permitiría ver cómo el LLM escribe la respuesta token a token en el frontend, mejorando la sensación de velocidad.
-   **Base de Datos Real:** Migrar de guardar en archivos JSON (`store.json`) a una base de datos ligera como SQLite o PostgreSQL para manejar colas de leads y ejecuciones masivas de forma robusta.
