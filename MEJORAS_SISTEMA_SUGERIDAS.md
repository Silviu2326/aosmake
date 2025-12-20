# Propuesta de Mejoras: Sistema AOS (PreCrafter & Crafter)

Este documento detalla una serie de mejoras técnicas y funcionales sugeridas tras el análisis del código fuente actual y el roadmap existente. El objetivo es transformar el prototipo actual en un sistema de producción robusto, escalable y mantenible.

---

## 1. Arquitectura y Calidad de Código (Refactoring)

El código actual de `PreCrafterPanel` y `CrafterPanel` comparte más del 80% de su lógica (React Flow, ejecución de nodos, gestión de estado local). Esto es insostenible a largo plazo.

### 🔄 Unificación de Componentes (DRY)
*   **Componente `WorkflowEditor` Genérico:** Crear un componente base `WorkflowEditor` que acepte props de configuración (`mode: 'precrafter' | 'crafter'`, `nodeTypes`, `initialNodes`). Esto centralizará la lógica de React Flow, el manejo de conexiones y el CRUD de nodos.
*   **Hooks Personalizados:** Extraer la lógica de ejecución en hooks reutilizables:
    *   `useWorkflowExecution`: Para manejar la cola, estados de carga y llamadas al backend.
    *   `useWorkflowPersistence`: Para guardar/cargar, manejar versiones e historial.
    *   `useWorkflowValidation`: Para validar el grafo (ciclos, nodos desconectados).

### 🗃️ Gestión de Estado Global
*   **Migración a Zustand/Redux:** Actualmente, el estado de ejecución (`executionResults`) y dependencias vive dentro de los componentes. Al moverlo a un store global:
    *   Facilita la comunicación entre `PreCrafter`, `SpecPanel` y `Crafter`.
    *   Habilita la función de **"Time Travel"** (navegar por estados pasados de la ejecución).
    *   Permite persistir el estado de la sesión si el navegador se cierra.

### 🛡️ Tipado Estricto (TypeScript)
*   **Eliminar `any`:** Reemplazar los usos de `any` (especialmente en `executionResults` y payloads de API) por tipos compartidos (`SharedTypes`).
*   **Contratos Frontend-Backend:** Usar herramientas como `tRPC` o generar tipos automáticamente desde el backend para asegurar que si cambia la API, el frontend se entere en tiempo de compilación.

---

## 2. Integración Real (El "Puente" SpecPanel)

Actualmente, el `SpecPanel` es visualmente atractivo pero funcionalmente estático (mock). Debe convertirse en el cerebro de la integración.

### 🌉 SpecPanel Dinámico
*   **Data Binding Real:** El `SpecPanel` debe suscribirse al output del nodo final del PreCrafter. Cuando el PreCrafter termina, el SpecPanel debe validarlo automáticamente contra el esquema JSON definido.
*   **Auto-Generación de Contratos:** Permitir definir el contrato de salida en el SpecPanel y que esto genere automáticamente la validación para el PreCrafter y los inputs requeridos para el Crafter.
*   **Transformadores (Adapters):** Implementar la lógica real para la pestaña "Diff". Si el PreCrafter saca `v1` y el Crafter espera `v2`, permitir escribir una pequeña función de transformación en JS/TS en el panel.

---

## 3. Experiencia de Usuario (UX/UI) Avanzada

Ampliando el roadmap existente con detalles de implementación específicos.

### ⚡ Edición de Alta Velocidad
*   **Monaco Editor Integrado:** Reemplazar los `textarea` de prompts por `monaco-editor`. Esto da:
    *   Coloreado de sintaxis para JSON y Markdown.
    *   **Autocompletado de Variables:** Al escribir `{{`, mostrar una lista desplegable con los outputs de nodos anteriores (leído del estado global).
    *   Validación de JSON en tiempo real mientras se escribe.

### 🕵️‍♂️ Observabilidad y Debugging
*   **Visualización de Flujo de Datos:** Al hacer hover sobre una conexión (edge), mostrar un popover con el JSON exacto que pasó de un nodo a otro en la última ejecución.
*   **Diff de Ejecuciones:** Seleccionar dos ejecuciones del historial y ver visualmente qué nodos cambiaron su salida (útil para regression testing de prompts).

---

## 4. Motor de Ejecución y Backend

### 🚀 Robustez y Escalabilidad
*   **Colas de Trabajo (BullMQ/Redis):** Mover la ejecución de nodos pesados (LLM) a un worker en background. El frontend solo debería encolar el trabajo y escuchar actualizaciones.
*   **WebSockets / SSE:** Reemplazar el polling o espera activa de `fetch` por Server-Sent Events. Esto permite mostrar el texto generándose token a token (streaming), mejorando drásticamente la percepción de velocidad.
*   **Caching Inteligente:** Si se re-ejecuta un flujo pero los inputs de los primeros 3 nodos no han cambiado, recuperar sus resultados de caché (Redis) en lugar de volver a gastar dinero en la API del LLM.

### 🔒 Seguridad y Configuración
*   **Variables de Entorno:** Eliminar URLs hardcodeadas (`backendaos-production...`) y usar `.env`.
*   **Sandbox para Código:** Para el futuro nodo de "Código" (JS/Python), usar entornos aislados (como `vm2` o contenedores Docker efímeros) para evitar que código malicioso afecte al servidor.

---

## 5. Testing y Fiabilidad (QA)

Actualmente no hay tests visibles. Para un sistema de producción, esto es crítico.

### 🧪 Estrategia de Testing
*   **Unit Tests (Vitest/Jest):** Para las utilidades de lógica (`nodeUtils.ts`) y los transformadores de datos.
*   **Component Tests (React Testing Library):** Asegurar que los paneles renderizan y reaccionan bien a los cambios de estado.
*   **E2E Tests (Playwright/Cypress):** Simular un flujo completo: Crear nodos -> Conectar -> Ejecutar -> Verificar Output.
*   **Golden Datasets:** Crear un conjunto de inputs de prueba "sagrados". Cada vez que se modifica un prompt en el sistema, ejecutar automáticamente estos tests para asegurar que la calidad de los emails no se ha degradado (Regression Testing de Prompts).

---

## Resumen de Prioridades (Quick Wins)

1.  **Refactorizar `PreCrafter` y `Crafter`** para usar una base común y reducir deuda técnica.
2.  **Conectar `SpecPanel`** con datos reales del PreCrafter (eliminar mocks).
3.  **Implementar Variables de Entorno** para la API.
4.  **Añadir Autocompletado** de variables en los prompts (mejora inmediata de UX).
