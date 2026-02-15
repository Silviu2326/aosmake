# ☁️ Análisis de Costos - Google Cloud Platform (GCP)

## 📋 Resumen del Flujo

**Datos reales:**
- 100 leads/día
- 20 llamadas API por lead
- **10 minutos por lead**
- = **1,000 minutos/día**
- = **16.67 horas/día**
- = **500 horas/mes** de procesamiento

---

## 🚀 Opciones en Google Cloud

### Opción disponibles:
1. **Cloud Run** - Serverless containers (paga por uso)
2. **Cloud Functions** - Functions as a Service (tiempo limitado)
3. **Compute Engine** - VMs tradicionales (similar a VPS)
4. **Cloud Batch** - Procesamiento batch nativo
5. **Cloud Workflows + Cloud Functions** - Orquestación serverless

---

## 1️⃣ Cloud Run (★ RECOMENDADO)

La opción más parecida a Railway pero más barata.

### Pricing Cloud Run

| Recurso | Precio |
|---------|--------|
| CPU | $0.00002400/vCPU-segundo |
| Memoria | $0.00000250/GB-segundo |
| Requests | $0.40/millón |
| Mínimo facturable | 100ms por request |

### Cálculo para tu caso

```
500 horas/mes = 1,800,000 segundos

Configuración: 1 vCPU + 1 GB RAM

Costo CPU:  1,800,000s × 1 vCPU × $0.00002400 = $43.20
Costo RAM:  1,800,000s × 1 GB × $0.00000250 = $4.50
Costo Requests: 60,000 requests × $0.40/1M = $0.024
─────────────────────────────────────────────────────
TOTAL:                                              $47.72/mes
```

### Con always-on (para evitar cold starts):

```
Cloud Run permite "Minimum instances" = 1

Pero si pones min instances = 1:
- 24 horas/día × 30 días = 720 horas
- Costo: ~$68/mes (sigue siendo barato)

Sin always-on (escala a 0):
- Solo pagas cuando procesas
- Costo: ~$48/mes
```

### Pros y Contras Cloud Run

| ✅ Pros | ❌ Contras |
|---------|------------|
| **Mucho más barato que Railway** (~$48 vs $1,250) | Límite de 60 minutos por request |
| Escalado automático | Cold starts si escala a 0 |
| Paga solo por uso | Necesitas containerizar tu app |
| Sin servidor que administrar |  |
| **26x más barato que Railway** |  |

---

## 2️⃣ Cloud Functions

### Limitaciones importantes:
- **HTTP functions**: Máximo 60 minutos de ejecución
- **Background functions**: Máximo 9 minutos de ejecución

Como tu flujo tarda 10 minutos por lead:
- ❌ HTTP function: Funciona (60 min > 10 min)
- ❌ Background: No funciona (9 min < 10 min)

### Pricing Cloud Functions

| Recurso | Precio |
|---------|--------|
| CPU | $0.0001/vCPU-segundo |
| Memoria | $0.0000025/GB-segundo |
| Invocaciones | $0.40/millón (primeros 2M gratis) |

### Cálculo (1 vCPU + 1 GB RAM):

```
CPU: 1,800,000s × $0.0001 = $180
RAM: 1,800,000s × $0.0000025 = $4.50
TOTAL: ~$184.50/mes
```

> Más caro que Cloud Run pero sigue siendo mucho más barato que Railway.

---

## 3️⃣ Compute Engine (VM)

La opción más similar a un VPS tradicional.

### Pricing (us-central1, e2-medium)

| Tipo de máquina | vCPU | RAM | Costo/mes (sustained use) |
|-----------------|------|-----|---------------------------|
| e2-small | 0.5 | 2 GB | ~$12.23 |
| e2-medium | 1 | 4 GB | ~$24.46 |
| e2-standard-2 | 2 | 8 GB | ~$48.92 |
| e2-standard-4 | 4 | 16 GB | ~$97.84 |

### Para tu caso:

```
Necesitas: Procesar 16.67 horas/día

Opción A: e2-medium (1 vCPU)
- Procesamiento: 16.67h/día de 24h disponibles
- Si tu código usa 1 vCPU al 70%: Perfecto
- Costo: ~$24.46/mes

Opción B: e2-small (0.5 vCPU) 
- Puede quedarse corto si el proceso es CPU-intensive
- Costo: ~$12.23/mes

Opción C: e2-standard-2 (2 vCPU)
- Puedes correr 2 workers en paralelo
- Procesas 100 leads en ~8 horas
- Costo: ~$48.92/mes
```

### Commitment (descuento por compromiso):

| Tipo | Descuento | e2-medium |
|------|-----------|-----------|
| On-demand | 0% | $24.46 |
| 1-year commit | ~37% | ~$15.40 |
| 3-year commit | ~55% | ~$11.00 |

---

## 4️⃣ Cloud Batch (★ IDEAL PARA TU CASO)

Servicio específicamente diseñado para procesamiento batch.

### Características:
- Diseñado exactamente para tu caso: procesar muchos jobs
- Cada lead = un job
- Escala automáticamente
- Paga solo por el tiempo de cómputo
- Sin servidor que administrar

### Pricing:

Igual que Compute Engine (usa VMs bajo el hood):
- e2-standard-1: ~$0.033174/hora

### Cálculo:

```
500 horas/mes × $0.033174/hora = $16.59/mes

Job manager (coordina los jobs): ~$5/mes
─────────────────────────────────────────────
TOTAL: ~$22/mes
```

### Cómo funciona:

```yaml
# job-config.yaml
job:
  taskGroups:
    - taskSpec:
        runnables:
          - container:
              image: gcr.io/tu-proyecto/lead-processor
              commands: ["node", "process-lead.js"]
        computeResource:
          cpuMilli: 1000  # 1 vCPU
          memoryMib: 2048  # 2 GB
      taskCount: 100  # 100 tareas (1 por lead)
      parallelism: 5  # 5 workers simultáneos
```

Con 5 workers en paralelo:
- Procesas 100 leads en ~3.5 horas
- Costo: ~$20/mes

---

## 📊 Comparativa Google Cloud

| Opción | Costo/mes | Características | Recomendación |
|--------|-----------|-----------------|---------------|
| **Railway** | ~$1,250 | Fácil, serverless | ❌ Muy caro |
| **Cloud Run** | ~$48 | Serverless, containers | ✅ **Mejor opción serverless** |
| **Cloud Functions** | ~$184 | Simple, triggers | ⚠️ Más caro que Cloud Run |
| **Compute Engine (e2-medium)** | ~$24 | VM tradicional | ✅ **Más barata** |
| **Compute Engine (1-year commit)** | ~$15 | VM con descuento | ✅ **Más barata aún** |
| **Cloud Batch** | ~$20 | Diseñado para batch | ✅ **Ideal para tu caso** |
| **Hetzner** | ~$19 | VPS externo | ✅ Competitivo |

---

## 🎯 Mi Recomendación para GCP

### Si quieres lo más barato: Compute Engine + 1-year commit

```
Plan: e2-medium (1 vCPU, 4 GB RAM)
Tipo: 1-year committed use
Costo: ~$15.40/mes

Setup:
- VM Ubuntu 22.04
- Docker instalado
- PM2 para manejar el proceso
- Cron job o Cloud Scheduler para iniciar procesamiento
```

### Si quieres serverless sin preocupaciones: Cloud Run

```
Costo: ~$48/mes

Setup:
- Containeriza tu backend
- Deploy en Cloud Run
- Cloud Scheduler para ejecutar cada X tiempo
- Cloud Tasks para encolar los 100 leads
```

### Si quieres la mejor arquitectura: Cloud Batch

```
Costo: ~$20/mes

Setup:
- Cloud Storage para la cola de leads
- Cloud Batch para procesar
- Procesa 100 leads en paralelo en ~2-3 horas
- Apaga automáticamente cuando termina
```

---

## 🔧 Guía Rápida: Deploy en Cloud Run

### Paso 1: Containerizar tu backend

```dockerfile
# Dockerfile
FROM node:18-slim

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080
CMD ["node", "server.js"]
```

### Paso 2: Deploy

```bash
# Build y push
gcloud builds submit --tag gcr.io/PROJECT_ID/lead-processor

# Deploy a Cloud Run
gcloud run deploy lead-processor \
  --image gcr.io/PROJECT_ID/lead-processor \
  --memory 1Gi \
  --cpu 1 \
  --concurrency 1 \
  --timeout 600s \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars GEMINI_API_KEY=xxx,PERPLEXITY_API_KEY=xxx
```

### Paso 3: Programar ejecución (Cloud Scheduler)

```bash
# Crear job que corre cada hora
gcloud scheduler jobs create http process-leads \
  --schedule="0 */6 * * *" \
  --uri="https://lead-processor-xxxxx-uc.a.run.app/process" \
  --http-method=POST \
  --message-body='{"batch_size": 25}'
```

---

## 💰 Comparativa Final: Google Cloud vs Alternativas

| Opción | Costo Infra/mes | Costo Total (Infra + APIs) | Rating |
|--------|-----------------|---------------------------|--------|
| **Railway** | ~$1,250 | ~$3,250 | ⭐ (muy caro) |
| **Hetzner** | ~$19 | ~$2,019 | ⭐⭐⭐⭐⭐ |
| **GCP Cloud Batch** | ~$20 | ~$2,020 | ⭐⭐⭐⭐⭐ |
| **GCP Compute Engine** | ~$15 | ~$2,015 | ⭐⭐⭐⭐⭐ |
| **GCP Cloud Run** | ~$48 | ~$2,048 | ⭐⭐⭐⭐ |
| **AWS EC2** | ~$30 | ~$2,030 | ⭐⭐⭐⭐ |
| **Azure VM** | ~$25 | ~$2,025 | ⭐⭐⭐⭐ |

---

## ✅ Conclusión: ¿Usar Google Cloud?

### Sí, es una excelente opción

| Pregunta | Respuesta |
|----------|-----------|
| **¿Es más barato que Railway?** | ✅ Sí, **26x más barato** (~$48 vs $1,250) |
| **¿Es más barato que Hetzner?** | ⚠️ Similar (~$15-20 vs $19) |
| **¿Qué opción elijo en GCP?** | **Compute Engine** (más barato) o **Cloud Batch** (más elegante) |
| **¿Necesito administrar servidor?** | Solo con Compute Engine |
| **¿Hay opción serverless?** | ✅ Sí, Cloud Run (~$48/mes) |

### Mi recomendación final:

1. **Si quieres lo más barato**: GCP Compute Engine e2-medium con 1-year commit (~$15/mes)
2. **Si quieres serverless sin servers**: Cloud Run (~$48/mes)
3. **Si quieres la arquitectura perfecta**: Cloud Batch (~$20/mes)

Todas las opciones de GCP son **dramáticamente más baratas** que Railway para tu caso de uso.

---

*Precios basados en us-central1 a Febrero 2026. Revisa la calculadora de precios de GCP para actualizaciones.*
