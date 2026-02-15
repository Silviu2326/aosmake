# 💰 Análisis de Costos - PreCrafterPanel en Railway

## 📋 Resumen del Flujo

Basado en el análisis del archivo `src/pages/PreCrafterPanel.tsx` y el backend en `backend/src/controllers/workflowController.js` y `backend/src/services/llmService.js`.

### Arquitectura del Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO POR LEAD (100 leads/día)              │
└─────────────────────────────────────────────────────────────────┘

Lead Input (CSV/DB)
       │
       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Nodo 1-19     │────▶│   Nodo 20       │────▶│   Output        │
│  LLM (Gemini)   │     │ (Perplexity)    │     │  (Resultado)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
      19 llamadas              1 llamada

Total por Lead: 20 llamadas a APIs
├── 19 llamadas a Gemini (gemini-3-pro-preview)
└── 1 llamada a Perplexity (sonar)
```

---

## 🔢 Cálculo de Llamadas API

### Volumen Mensual

| Métrica | Valor |
|---------|-------|
| Leads por día | 100 |
| Días por mes | 30 |
| **Leads por mes** | **3,000** |
| Llamadas por lead | 20 |
| **Llamadas totales/mes** | **60,000** |

### Desglose por API

| API | Llamadas/Lead | Llamadas/Día | Llamadas/Mes |
|-----|---------------|--------------|--------------|
| Gemini | 19 | 1,900 | 57,000 |
| Perplexity | 1 | 100 | 3,000 |

---

## 💵 Precios de las APIs (2025)

### Google Gemini

| Modelo | Input (por 1M tokens) | Output (por 1M tokens) |
|--------|----------------------|------------------------|
| gemini-3-pro-preview | $3.50 | $10.50 |
| gemini-2.5-pro | $1.25 | $10.00 |
| gemini-2.0-flash | $0.10 | $0.40 |

> **Nota**: El código usa `gemini-3-pro-preview` por defecto

### Perplexity Sonar

| Modelo | Costo por 1K requests | Input (por 1M tokens) | Output (por 1M tokens) |
|--------|----------------------|----------------------|------------------------|
| sonar | $5.00 | $1.00 | $1.00 |
| sonar-pro | $5.00 | $3.00 | $15.00 |
| sonar-reasoning | $5.00 | $1.00 | $5.00 |

> **Nota**: El código usa `sonar` por defecto

---

## 📊 Estimación de Costos Mensuales

### Escenario 1: Flujo Estándar (1 Worker)

**Supuestos:**
- Promedio de tokens por llamada Gemini: ~4,000 input + ~2,000 output
- Promedio de tokens por llamada Perplexity: ~3,000 input + ~1,500 output

| API | Llamadas/Mes | Input Tokens | Output Tokens | Costo Input | Costo Output | **Costo Total** |
|-----|--------------|--------------|---------------|-------------|--------------|-----------------|
| Gemini | 57,000 | 228M | 114M | $798 | $1,197 | **$1,995** |
| Perplexity | 3,000 | 9M | 4.5M | $9 + $15* | $4.5 | **$28.50** |

> *Base fee: $5 por cada 1,000 requests = $15

### 💰 **TOTAL MENSUAL ESTIMADO: ~$2,023.50 USD**

---

### Escenario 2: Workers Paralelos (Múltiples Workers)

Si ejecutas **N workers simultáneos**, los costos se multiplican linealmente:

| Workers | Costo Mensual (USD) | Leads Procesados/Día | Leads Procesados/Mes |
|---------|---------------------|----------------------|----------------------|
| 1 | ~$2,024 | 100 | 3,000 |
| 2 | ~$4,048 | 200 | 6,000 |
| 3 | ~$6,072 | 300 | 9,000 |
| 5 | ~$10,120 | 500 | 15,000 |
| 10 | ~$20,240 | 1,000 | 30,000 |

> ⚠️ **IMPORTANTE**: Los workers paralelos NO reducen el costo por lead. Solo aceleran el procesamiento.

---

### Escenario 3: Optimización de Modelos

Si cambias a modelos más económicos:

| Configuración | Gemini Model | Perplexity Model | Costo Mensual |
|---------------|--------------|------------------|---------------|
| **Premium** (actual) | gemini-3-pro-preview | sonar | ~$2,024 |
| **Balanceado** | gemini-2.5-pro | sonar | ~$1,427 |
| **Económico** | gemini-2.0-flash | sonar | ~$315 |

---

## 🔧 Optimizaciones Recomendadas

### 1. Reducir Número de Llamadas Gemini

Si puedes consolidar los 19 nodos Gemini en menos llamadas:

```javascript
// Ejemplo: Consolidar 5 nodos en 1
// En lugar de 5 llamadas separadas, usa 1 llamada con schema complejo
```

| Nodos Consolidados | Llamadas/Lead | Ahorro Mensual |
|-------------------|---------------|----------------|
| 19 → 15 | 16 | ~$400 |
| 19 → 10 | 11 | ~$950 |
| 19 → 5 | 6 | ~$1,500 |

### 2. Usar Modelos Más Económicos

Modifica el código en `workflowController.js`:

```javascript
// Cambiar modelo por defecto
// Antes:
model = 'gemini-3-pro-preview';

// Después (opción económica):
model = 'gemini-2.0-flash';
```

### 3. Implementar Caché de Respuestas

```javascript
// En llmService.js - Agregar caché Redis/Memory
const cache = new Map();

async generate({ model, systemPrompt, userPrompt, ... }) {
    const cacheKey = hash({ model, systemPrompt, userPrompt });
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }
    // ... llamada API
    cache.set(cacheKey, result);
    return result;
}
```

### 4. Procesamiento Batch

Actualmente el código procesa leads individualmente (línea 855-918 en PreCrafterPanel.tsx). Podrías modificarlo para procesar múltiples leads por llamada API.

---

## 📈 Proyección de Costos a Escala

### Tabla de Costos por Volumen (1 Worker)

| Leads/Día | Leads/Mes | Llamadas API/Mes | Costo Mensual (USD) | Costo por Lead |
|-----------|-----------|------------------|---------------------|----------------|
| 50 | 1,500 | 30,000 | ~$1,012 | $0.67 |
| 100 | 3,000 | 60,000 | ~$2,024 | $0.67 |
| 200 | 6,000 | 120,000 | ~$4,048 | $0.67 |
| 500 | 15,000 | 300,000 | ~$10,120 | $0.67 |
| 1,000 | 30,000 | 600,000 | ~$20,240 | $0.67 |

---

## ⚡ Consideraciones sobre Workers en Railway

### Configuración Recomendada

```yaml
# railway.yaml
services:
  backend:
    workers:
      # Workers paralelos para procesamiento
      - name: worker-1
        command: node src/workers/processLeads.js --batch=1
      - name: worker-2
        command: node src/workers/processLeads.js --batch=2
      # ... etc
```

### Límites de Railway

| Plan | Workers Simultáneos | Memoria/Worker | CPU/Worker |
|------|---------------------|----------------|------------|
| Starter | 2 | 512 MB | 1 vCPU |
| Pro | 10 | 2 GB | 2 vCPUs |
| Enterprise | Ilimitado | Custom | Custom |

### Impacto en Costos Railway

| Plan | Costo Railway/Mes | + Costo APIs | Total Estimado |
|------|-------------------|--------------|----------------|
| Starter ($5/mes) | $5 | + APIs | $5 + APIs |
| Pro ($20/mes/worker) | $200 (10 workers) | + APIs | $200 + APIs |

> 💡 **Recomendación**: Railway cobra por worker, no por volumen de procesamiento. Para minimizar costos de infraestructura, usa menos workers con mayor throughput cada uno.

---

## 🎯 Conclusiones

### Para 100 leads/día (3,000/mes):

| Métrica | Valor |
|---------|-------|
| **Costo API Mensual** | ~$2,024 USD |
| **Costo por Lead** | ~$0.67 USD |
| **Costo Railway** | $5-20 USD |
| **TOTAL ESTIMADO** | **~$2,030 USD/mes** |

### Recomendaciones Finales

1. **Optimiza el flujo**: Reduce las 19 llamadas Gemini si es posible
2. **Usa gemini-2.0-flash** para tareas simples (10x más barato)
3. **Implementa caché** para evitar llamadas redundantes
4. **Monitorea uso** con los audit logs ya implementados en `workflowController.js`

---

## 🔗 Referencias del Código

### Puntos Clave en el Código

| Archivo | Línea | Descripción |
|---------|-------|-------------|
| `PreCrafterPanel.tsx` | 607-659 | Ejecución de nodos LLM |
| `PreCrafterPanel.tsx` | 855-918 | Procesamiento batch de CSV |
| `workflowController.js` | 115-705 | Endpoint `/api/workflows/run-node` |
| `workflowController.js` | 138-143 | Selección de modelo (Gemini/Perplexity) |
| `llmService.js` | 14-25 | Router de modelos |
| `llmService.js` | 27-141 | Implementación Perplexity |
| `llmService.js` | 143-318 | Implementación Gemini |

### Variables de Entorno Necesarias

```bash
# Backend (.env)
GEMINI_API_KEY=your_gemini_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
```

---

*Documento generado el: 15 de Febrero de 2026*
*Basado en el análisis del código del proyecto AOS Studio*
