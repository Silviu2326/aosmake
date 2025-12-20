# Estrategias para Mejorar el Backend y Potenciar la "Inteligencia" de las IAs

Este documento describe una hoja de ruta técnica para transformar el backend actual (basado en llamadas directas a LLMs) en un sistema cognitivo avanzado capaz de razonar, recordar y actuar con mayor precisión, basado en un análisis profundo del código frontend y backend existente.

## 1. Arquitectura: Del "Chatbot" al "Agente Orquestador"

Actualmente, el `llmService.js` funciona como un pasarela simple: `Input -> LLM -> Output`. Para hacerlas "más listas", debemos cambiar a una arquitectura de **Agentes**.

### Concepto Clave: El Bucle de Razonamiento (Reasoning Loop)
En lugar de una sola llamada, el backend debe implementar un bucle "Pensar -> Actuar -> Observar".
1. **Pensar:** La IA analiza la petición y decide qué herramientas necesita.
2. **Actuar:** Ejecuta una herramienta (búsqueda, lectura de base de datos, ejecución de código).
3. **Observar:** Analiza el resultado de la herramienta.
4. **Repetir:** Refina su respuesta basándose en la observación.

**Implementación Sugerida:**
- Adoptar frameworks como **LangChain** o **LangGraph** (para Node.js) o implementar un patrón simple de "ReAct" (Reasoning + Acting) manualmente.
- Dividir `LLMService` en agentes especializados: *Planner* (Planificador), *Executor* (Ejecutor), *Critic* (Revisor).

## 2. Memoria y Contexto (RAG - Retrieval Augmented Generation)

### Análisis del Problema Frontend (`PreCrafterPanel.tsx`)
El frontend envía actualmente el objeto `context` completo (que contiene `executionResults` de todos los nodos anteriores) en cada petición a `/run-node`.
- **Riesgo:** A medida que el flujo crece, este JSON puede alcanzar megabytes, saturando la red y excediendo la ventana de contexto del LLM.
- **Redundancia:** El frontend realiza sustitución de variables localmente para logs, pero el backend vuelve a hacerlo.

### Solución: Contexto Gestionado en Backend
1.  **Persistencia de Ejecución:** En lugar de enviar todo el `context` desde el cliente, el frontend debe enviar un `runId`. El backend recuperará los outputs anteriores de la base de datos (`workflow_runs`).
2.  **RAG Contextual:**
    *   Implementar `pgvector`.
    *   Cuando el Nodo B pide datos del Nodo A, en lugar de inyectar todo el output de A, el backend buscará vectorialmente solo los fragmentos relevantes para el prompt del Nodo B.
    *   *Beneficio:* Permite flujos masivos sin romper el límite de tokens.

## 3. Mejora de la Calidad (Prompt Engineering Avanzado)

### Chain of Thought (Cadena de Pensamiento)
Forzar a la IA a explicar su razonamiento antes de dar el código final.
- **Prompt Actual:** "Genera una función que sume dos números."
- **Prompt Mejorado:** "Primero, analiza los posibles casos borde (nulos, strings). Segundo, escribe un plan paso a paso. Finalmente, genera el código."

### Self-Reflection (Auto-reflexión / Crítico)
Implementar un paso intermedio antes de devolver la respuesta al frontend.
1. **Agente Generador:** Crea el código.
2. **Agente Crítico:** Revisa el código buscando errores de seguridad, bugs lógicos o alucinaciones.
3. **Backend:** Si el Crítico encuentra errores, devuelve el feedback al Generador (sin que el usuario se entere) para que lo arregle.

## 4. Uso de Herramientas (Function Calling)

Darle "manos" a la IA. Los modelos modernos (Gemini Pro, GPT-4, Sonar) soportan *Function Calling*.
En lugar de pedirle a la IA que *imagine* una respuesta, permítele obtener datos reales.

- **Herramientas útiles para este proyecto:**
  - `read_file(path)`: Para que la IA vea el contexto real de otros archivos antes de sugerir cambios.
  - `run_linter(code)`: Para verificar sintaxis antes de responder.
  - `search_web(query)`: (Ya usas Perplexity, pero integrarlo como herramienta granular es mejor).

## 5. Análisis de Rutas Actuales y Plan de Mejora Específico

A continuación se detalla el uso actual de la IA en los controladores (`workflowController.js`) y rutas (`workflowRoutes.js`) existentes, junto con la estrategia concreta de mejora para cada caso.

### A. Ruta: `POST /api/workflows/run-node`
Es el corazón de la ejecución de flujos.
*   **Uso Actual:** El frontend orquesta la ejecución nodo a nodo. Si hay variantes, el frontend hace múltiples llamadas `fetch` y usa `Promise.all`.
*   **Mejora 1: "Self-Healing" JSON:**
    *   Si el modelo devuelve un JSON inválido (común en `PreCrafterPanel`), el backend debe atrapar el error, re-alimentar el output erróneo al modelo con la instrucción "Corrige el JSON", y reintentar automáticamente hasta 3 veces antes de fallar.
*   **Mejora 2: Orquestación de Variantes en Backend:**
    *   Crear un endpoint `/run-batch` o modificar `/run-node` para aceptar múltiples configuraciones.
    *   El backend ejecutará las variantes en paralelo (server-side) y devolverá todos los resultados juntos. Esto reduce la latencia de red y simplifica la lógica del frontend en `PreCrafterPanel.tsx`.

### B. Ruta: `POST /api/workflows/chat`
Es el asistente lateral en el estudio.
*   **Uso Actual:** Recibe el mensaje y un volcado del contexto actual.
*   **Mejora (Agentic RAG):**
    *   Dotar al chat de herramientas (`tools`). Si el usuario pregunta "¿Por qué falló el nodo 3?", el agente debe tener una herramienta `inspect_node_logs(nodeId)` que consulte la DB, en lugar de depender solo de lo que el frontend le pasa.
    *   Permitirle leer la documentación del proyecto (archivos `.md`) mediante búsqueda vectorial para responder preguntas sobre la arquitectura del sistema.

### C. Ruta: `POST /api/workflows/generate-variations`
Ayuda al usuario a mejorar sus prompts.
*   **Uso Actual (`Inspector.tsx`):** Envía instrucciones y espera N variaciones.
*   **Mejora (Arquitectura Generador-Crítico):**
    *   Implementar un pipeline donde un modelo "Creativo" genera 10 opciones y un modelo "Crítico" (más riguroso) las evalúa y filtra, devolviendo solo las 3 mejores que cumplan estrictamente con el schema JSON del nodo original.

## 6. Evaluación y Observabilidad (LLMOps)

No se puede mejorar lo que no se mide.
- **Traceabilidad:** Guardar cada prompt enviado y cada respuesta recibida junto con metadatos (latencia, tokens, modelo usado).
- **Feedback Loop:** Agregar botones de "Me gusta/No me gusta" en el frontend. Si una respuesta es mala, guardarla para testear por qué falló.
- **Golden Datasets:** Crear un conjunto de 50 preguntas/tareas "tipo" y ejecutar tests automáticos cada vez que cambies el prompt del sistema para asegurar que la IA no se ha vuelto "más tonta" en otras áreas.

## Resumen de Pasos Inmediatos para AOS Studio

1.  **Integrar `pgvector`:** Aprovechar la dependencia `pg` existente para dotar al sistema de memoria semántica y aligerar la carga de datos del frontend.
2.  **Refactorizar `LLMService`:** Soportar un modo "Agente" con capacidad de reintento automático (Self-Healing) para JSONs malformados.
3.  **Centralizar la Sustitución de Variables:** Mover la lógica de `{{...}}` completamente al backend y optimizar la inyección de contexto.
