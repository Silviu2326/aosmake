# 🧬 Bio-Lab v5.0: Industrial Genetic Prompt Engineering
## Documentación Técnica y Funcional

El **Bio-Lab v5.0** es una plataforma de optimización de prompts de grado industrial. Introduce conceptos avanzados de algoritmos genéticos como **Test Suites multicapa**, **Operadores de Mutación explícitos** y **Selección Natural por Torneo** para garantizar la convergencia hacia soluciones robustas y eficientes.

---

## 1. Arquitectura del Motor (Genetic Engine v5)

El motor ha sido rediseñado para maximizar la calidad y minimizar el *drift* (degradación) evolutivo.

### A. Componentes Clave
1.  **Test Suite (Multi-Case):** Evaluación basada en múltiples escenarios de prueba, no solo uno.
2.  **Operadores de Mutación:** Instrucciones precisas de *cómo* mutar (ej: "Comprimir", "Añadir Ejemplos").
3.  **Fitness Multidimensional:** Calidad + Constraints + Coste + Estabilidad.
4.  **Selección Híbrida:** Elitismo (Top 1) + Torneo (Competencia aleatoria).

---

## 2. Flujo de Trabajo (The Loop)

### Fase 1: Configuración Avanzada
*   **Test Suite:** El usuario define N casos de prueba (`Input JSON`).
*   **Constraints:** Reglas de éxito ("Debe devolver 3 items").
*   **Mutation Operator:** Estrategia específica (General, Few-Shot, Compression, Anti-Hallucination).

### Fase 2: Ciclo Generacional
Para cada Generación (1...N):

1.  **Selección Natural:**
    *   **Elitismo:** El mejor individuo de la generación anterior pasa automáticamente (Inmortalidad del más apto).
    *   **Torneo:** Para los demás huecos, se eligen 3 candidatos al azar y gana el de mayor Fitness.

2.  **Reproducción (Breeding):**
    *   **Mutation:** Aplica el *Operator* seleccionado al padre.
    *   **Crossover:** Combina **Padre A** (Estructura) y **Padre B** (Tono/Ejemplos).

3.  **Hard Gate & Auto-Repair:**
    *   Si el hijo genera un JSON inválido, se invoca un **Repair Agent** (`gemini-2.0-flash-exp`).
    *   Si la reparación falla, el individuo es descartado inmediatamente.

4.  **Evaluación de Fitness (The Judge):**
    *   Se ejecuta el prompt hijo contra **TODOS** los casos del Test Suite.
    *   Un **Juez LLM** evalúa cada resultado.
    *   **Fórmula de Fitness:**
        ```javascript
        Fitness = (Quality * 0.6) + (HardPass * 40) - (CostPenalty)
        ```
        *Donde HardPass es binario (0 o 1) y penaliza brutalmente fallos de schema.*

### Fase 3: Resultado
*   Visualización de métricas detalladas (`Qual`, `Cost`) en el árbol genealógico.
*   Inyección automática de variantes exitosas en el nodo.

---

## 3. Estrategias y Operadores

### Estrategias de Cruce
| Estrategia | Descripción |
| :--- | :--- |
| **Mutation** | Evolución lineal de un solo padre. |
| **Crossover** | Hibridación de dos padres (Estructura A + Estilo B). |

### Operadores de Mutación
| Operador | Función Biológica |
| :--- | :--- |
| `General` | Optimización abierta basada en el objetivo. |
| `Add Examples` | Inyecta ejemplos *few-shot* para mejorar la precisión. |
| `Compress` | Reduce la verbosidad y el consumo de tokens. |
| `Anti-Hallucination` | Añade guardrails para exigir evidencia. |
| `Structural Fix` | Se enfoca puramente en corregir el formato JSON. |

---

## 4. Sistema de Auditoría (Visual & Logs)

### Árbol Genealógico Pro
*   **Chips de Métricas:** Cada nodo muestra `Qual` (Calidad) y `Cost` (Longitud).
*   **Iconos de Estado:**
    *   🏆 **Success:** Variante válida y puntuación alta.
    *   🔄 **Repaired:** Variante que nació rota pero fue salvada por el Auto-Repair.
    *   ⚠️ **Failed:** Variante descartada.

### Logs de Backend
Registros JSON completos en `backend/data/audit_logs/` para análisis forense, incluyendo el veredicto detallado del Juez para cada caso de prueba.

---

## 5. Resumen Técnico

*   **Ingeniero Genético:** `gemini-3-pro-preview` (Alta creatividad).
*   **Mecánico/Juez:** `gemini-2.0-flash-exp` (Alta velocidad/coste bajo).
*   **Validación:** JSON Parsing estricto + Schema Validation + LLM Judge.
