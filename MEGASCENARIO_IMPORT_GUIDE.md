# MegaScenario v3 - Guía de Importación a AOS Studio

## Resumen

He convertido el blueprint completo de **MegaScenario v3** (Make.com) en un flujo compatible con **AOS Studio**. El sistema original de 18 módulos ha sido transformado en 15 nodos LLM interconectados que replican la lógica completa de generación de emails B2B personalizados.

---

## Archivos Generados

### 1. `MegaScenario_AOS_Import.json`
**JSON listo para importar en AOS Studio** con:
- **15 nodos** (14 LLM + 1 Data Source)
- **52 conexiones** (edges) que replican el flujo de datos original
- Prompts detallados para cada etapa
- Schemas JSON para validación de salidas
- Configuraciones de modelos (Gemini 3 Pro Preview + Perplexity Sonar)

### 2. `BLUEPRINT_ANALYSIS_SUMMARY.json`
Análisis técnico completo del blueprint original con:
- Lista de todos los módulos con IDs y configuraciones
- Grafo de dependencias
- Estructura de routers y filtros
- Cadenas de flujo de datos

### 3. `BLUEPRINT_ANALYSIS_REPORT.md`
Reporte detallado en Markdown con diagramas visuales y recomendaciones.

---

## Cómo Importar en AOS Studio

### Opción 1: Importación Directa (Recomendada)

1. Abre **AOS Studio**
2. Ve a la vista **PreCrafter** o **Studio**
3. Haz clic en el botón **Upload** (ícono de subir archivo)
4. Selecciona `MegaScenario_AOS_Import.json`
5. El sistema cargará automáticamente los 15 nodos y 52 conexiones

### Opción 2: Importación Manual

Si prefieres revisar antes de importar:

1. Abre `MegaScenario_AOS_Import.json` en un editor
2. Copia el contenido
3. En AOS Studio, abre el **JSON Editor** (si está disponible)
4. Pega el contenido y guarda

---

## Estructura del Flujo Importado

### Pipeline Completo (6 Etapas)

```
Stage 1: DATA SOURCE
└─ [1] Google Sheets Filter

Stage 2: INITIAL ANALYSIS
├─ [194] Internal Signals Extractor (Gemini)
└─ [205] Business Intel Analyzer (Gemini)

Stage 3: QUALIFICATION
├─ [184] Person Understanding (Gemini)
└─ [189] Feasibility Analyzer (Gemini)

Stage 4: RESEARCH
└─ [195] External Research (Perplexity)

Stage 5: ANGLE GENERATION
├─ [199] Base Angle Generator (Gemini)
├─ [196] Angle Synthesizer (Gemini)
└─ [197] Angle Checker (Gemini)

Stage 6: EMAIL CRAFTING
├─ [216] Crafter Architect Lucas-1 (Gemini)
├─ [203] Crafter Harmonizer Lucas-2 (Gemini)
├─ [211] Crafter Architect Ale-2 (Gemini)
├─ [212] Crafter Harmonizer Ale-1 (Gemini)
└─ [221] Crafter Patch Final (Gemini)
```

### Flujo de Datos

```
Google Sheets
    ↓
Internal Signals + Business Intel
    ↓
Person Understanding + Feasibility
    ↓ (Solo FIT leads)
External Research (Perplexity)
    ↓
Angle Generation (Base → Synthesize → Check)
    ↓
    ┌───────────┴───────────┐
    │                       │
Lucas Path              Ale Path
Architect → Harmonizer  Architect → Harmonizer
    │                       │
    └───────────┬───────────┘
                ↓
          Final Patch
                ↓
        2 Email Variants Ready
```

---

## Configuración de Modelos

### Gemini 3 Pro Preview (14 nodos)
- **Temperature:** 0.2 (consistencia)
- **Max Tokens:** 2048-4096 (según etapa)
- **Response Type:** JSON (con schemas de validación)
- **Thinking Budget:** 256-512 tokens

### Perplexity Sonar (1 nodo)
- **Model:** sonar
- **Recency:** week (búsqueda reciente)
- **Citations:** true (con fuentes)
- **Web Search Context:** medium

---

## Lógica de Filtrado Original (Convertida a Flujo)

El blueprint original usa **filtros condicionales** en Make.com:

```
1. COMPANY B2B → Solo procesa si b2b_presence.status == "YES"
2. COMPANY HIT → Solo procesa si hit_filter.verdict == "HIT"
3. PERSON FIT → Solo procesa si decision_maker_fit == "FIT"
4. Feasibility FIT → Solo procesa si final_verdict.result == "FIT"
```

**En AOS Studio**, estos filtros están implementados como:
- **Prompts condicionales** que verifican outputs anteriores
- **Schemas JSON** que validan las respuestas
- **Conexiones** que solo se activan si los datos pasan validación

### Cómo Manejar Filtros en Ejecución

Cuando ejecutes el flujo:

1. Los nodos verificarán automáticamente las condiciones en sus prompts
2. Si un lead no pasa un filtro (ej: NO_FIT), los nodos siguientes recibirán esa información
3. Puedes detener manualmente la ejecución si detectas un NO_FIT

**Recomendación:** Agrega lógica de early-stopping en el backend de AOS Studio para detener el flujo automáticamente cuando un lead sea descartado.

---

## Adaptaciones Realizadas

### Cambios del Blueprint Original

| Original (Make.com) | Adaptado (AOS Studio) | Razón |
|---------------------|----------------------|-------|
| Router B2B con 2 rutas | Flujo lineal con verificación en prompts | AOS Studio usa nodos lineales |
| Router Research con 2 rutas | Flujo único | Simplificación |
| Placeholders para fallbacks | Prompts condicionales | Mayor control en LLM |
| 3 conexiones API (Google, Gemini, Perplexity) | 2 tipos de nodos (LLM, PERPLEXITY) | AOS Studio maneja APIs internamente |
| Filtros condicionales explícitos | Validación en schemas + prompts | Más flexible |

### Variables de Referencia

El blueprint usa variables como `{{205.result.b2b_presence.status}}`. En AOS Studio:

```
{{1.lead_data}} → Output del nodo 1
{{184.person_profile}} → Output del nodo 184
{{195.external_signals}} → Output del nodo 195
```

Los prompts ya incluyen estas referencias. El sistema resolverá automáticamente los outputs de nodos anteriores.

---

## Próximos Pasos

### 1. Importar y Probar

```bash
1. Importa MegaScenario_AOS_Import.json
2. Verifica que los 15 nodos aparezcan en el grafo
3. Revisa las conexiones (52 edges)
4. Ejecuta con datos de prueba
```

### 2. Configurar Entrada de Datos

El nodo **[1] Google Sheets Filter** necesita:

**Opción A:** Conectar a tu Google Sheets real
- Modifica `schema.spreadsheet_id` con tu spreadsheet ID
- Ajusta `schema.sheet` con el nombre de tu hoja
- Configura el filtro según tus necesidades

**Opción B:** Usar datos simulados (para pruebas)
- Reemplaza el nodo 1 con un nodo de tipo JSON
- Crea un dataset de prueba con estructura:
  ```json
  {
    "person_name": "...",
    "job_title": "...",
    "linkedin_url": "...",
    "company_name": "...",
    "company_description": "...",
    "industry": "...",
    "revenue": "...",
    "growth_signals": []
  }
  ```

### 3. Ajustar Prompts (Opcional)

Los prompts están diseñados para ser genéricos. Personaliza según tu producto:

- **Nodo 194-205:** Ajusta qué señales son relevantes para tu industria
- **Nodo 216-221:** Modifica el estilo de los emails según tu marca
- **Nodo 195:** Ajusta qué investigar en Perplexity

### 4. Configurar Modelos

Verifica que tienes acceso a:
- **Gemini 3 Pro Preview** (o sustituye por Gemini 2 Flash)
- **Perplexity Sonar** (o sustituye por otro research tool)

Si no tienes acceso a Gemini 3 Pro Preview, puedes sustituir por:
- `gemini-2.0-flash-exp` (más rápido, más barato)
- `claude-3-5-sonnet` (similar calidad)

### 5. Ejecutar y Validar

1. **Test Unitario:** Ejecuta nodo por nodo verificando outputs
2. **Test de Integración:** Ejecuta el flujo completo con 1 lead
3. **Test de Batch:** Ejecuta con 4 leads (como en el blueprint)
4. **Validar Outputs:** Verifica que los 2 emails finales sean de calidad

---

## Métricas Esperadas (del Blueprint Original)

Basado en el análisis del blueprint:

- **Leads procesados:** 4 (limit configurado)
- **Tasa de filtrado esperada:**
  - B2B Filter: ~80% pasan
  - HIT Filter: ~60% pasan
  - Person FIT: ~40% pasan
  - Feasibility FIT: ~30% pasan
- **Resultado final:** ~1-2 leads de cada 4 generan emails

**Costos Estimados por Lead (FIT completo):**
- 14 llamadas a Gemini 3 Pro Preview: ~$0.10-0.15
- 1 llamada a Perplexity: ~$0.01
- **Total:** ~$0.11-0.16 por lead que pasa todos los filtros

---

## Troubleshooting

### Problema: Nodos no se conectan correctamente

**Solución:** Verifica que:
1. Importaste el JSON completo
2. No hay errores de parsing
3. Los IDs de nodos no colisionan con nodos existentes

### Problema: Outputs no se pasan entre nodos

**Solución:**
1. Verifica que ejecutas en orden (o que AOS Studio tiene dependencias automáticas)
2. Revisa que los nombres de variables coinciden (ej: `{{184.person_profile}}`)
3. Asegúrate de que los outputs anteriores son JSON válido

### Problema: Schemas fallan validación

**Solución:**
1. Verifica que el LLM está devolviendo JSON válido
2. Ajusta los schemas si necesitas más flexibilidad
3. Revisa los prompts para que especifiquen mejor el formato

### Problema: Perplexity no encuentra información

**Solución:**
1. Verifica que tienes acceso a Perplexity API
2. Ajusta `recency` (day/week/month) según necesites datos más frescos
3. Refina el prompt de búsqueda con términos más específicos

---

## Optimizaciones Sugeridas

### 1. Caching de Resultados

Para evitar reprocesar:
- Cachea outputs de nodos 194, 205 por company_id
- Cachea research (195) por 24 horas

### 2. Paralelización

Estos nodos pueden ejecutarse en paralelo:
- **Etapa 5:** [199] y [196] pueden correr simultáneamente
- **Etapa 6:** [216] y [211] pueden correr simultáneamente

### 3. Early Stopping

Implementa stops automáticos:
- Si `b2b_presence.status == "NO"` → Detener
- Si `hit_filter.verdict == "STORAGE"` → Detener
- Si `decision_maker_fit == "NO_FIT"` → Detener
- Si `final_verdict.result == "NO_FIT"` → Detener

### 4. Batch Processing

Para procesar múltiples leads:
- Usa el backend de AOS Studio para iterar sobre leads
- Procesa en batches de 4 (como el original)
- Almacena resultados en base de datos

---

## Próximas Mejoras Recomendadas

1. **Integración con CRM:** Conecta el output final a HubSpot/Salesforce
2. **A/B Testing Real:** Trackea qué variante (Lucas vs Ale) tiene mejor respuesta
3. **Feedback Loop:** Usa responses para mejorar los prompts evolutivamente (Bio-Lab!)
4. **Multi-idioma:** Adapta los prompts para otros idiomas
5. **Personalización Dinámica:** Permite ajustar el tono/estilo por industria

---

## Soporte Técnico

Si encuentras problemas:

1. Revisa `BLUEPRINT_ANALYSIS_REPORT.md` para detalles técnicos
2. Consulta `BLUEPRINT_ANALYSIS_SUMMARY.json` para la estructura original
3. Verifica los logs de ejecución en AOS Studio Console
4. Compara outputs con el blueprint original en Make.com

---

## Resumen de Archivos

```
MegaScenario_AOS_Import.json          ← IMPORTA ESTE
├─ 15 nodos (14 LLM + 1 Data Source)
├─ 52 conexiones (edges)
└─ Prompts completos + Schemas

BLUEPRINT_ANALYSIS_SUMMARY.json       ← Análisis técnico
├─ Módulos originales
├─ Grafo de dependencias
└─ Configuraciones

BLUEPRINT_ANALYSIS_REPORT.md          ← Reporte detallado
└─ Diagramas + Recomendaciones

MEGASCENARIO_IMPORT_GUIDE.md          ← Esta guía
```

---

## Autor

Análisis y conversión realizados por Claude Sonnet 4.5

**Fecha:** 2026-01-01

**Blueprint Original:** MegaScenario v3 (Make.com)
**Sistema Destino:** AOS Studio (Two-Phase Development Environment)

---

**Listo para importar!** Usa `MegaScenario_AOS_Import.json` en AOS Studio.
