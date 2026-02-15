# 🚂 Análisis de Costos - Railway (Infraestructura)

## 📋 Resumen del Flujo Actual

**Datos reales del usuario:**
- 100 leads/día
- 20 llamadas API por lead (19 Gemini + 1 Perplexity)
- **10 minutos por lead** (incluyendo tiempos de espera entre llamadas)
- = **1,000 minutos de procesamiento/día**
- = **16.67 horas de CPU/día**
- = **500 horas de CPU/mes**

---

## 🔧 Requisitos de Recursos

### Cálculo Real de Consumo

| Métrica | Valor |
|---------|-------|
| Leads por día | 100 |
| Tiempo por lead | 10 minutos |
| Tiempo total diario | 1,000 minutos = 16.67 horas |
| Días al mes | 30 |
| **Tiempo total mensual** | **500 horas de CPU** |

### Procesamiento Concurrente

Como las llamadas son secuenciales (una tras otra dentro de cada lead), necesitas:

```
16.67 horas/día de procesamiento
÷ 24 horas/día
= 0.69 workers constantes

→ 1 worker es suficiente para mantener el ritmo
```

---

## 💳 Costos Railway - Recálculo

### Precios Railway
- **vCPU**: $1.67/hora ($0.000463/seg)
- **Memoria (RAM)**: $0.83/GB/hora ($0.000231/GB/seg)

### Escenario: 1 Worker (Configuración Mínima)

```
Worker: 1 vCPU + 1 GB RAM
Tiempo de uso: 500 horas/mes

Costo vCPU:  500h × $1.67 = $835
Costo RAM:   500h × $0.83 = $415
─────────────────────────────────
TOTAL:                    $1,250/mes
```

### Escenario: Optimizado (2 vCPU + 2 GB)

```
Con 2 vCPU procesas ~2x más rápido (si hay paralelismo)
Pero como el flujo es secuencial por lead, no hay mucho paralelismo

Costo vCPU:  500h × 2 × $1.67 = $1,670
Costo RAM:   500h × 2 × $0.83 = $830
─────────────────────────────────────
TOTAL:                          $2,500/mes
```

---

## 📊 Comparativa de Planes Railway

### Plan Hobby - $5/mes

| Recurso | Límite | Tu Necesidad |
|---------|--------|--------------|
| vCPU max | 48 | 1-2 suficiente |
| RAM max | 48 GB | 1-2 GB |
| Replicas | 6 | 1 |
| **Costo real** | - | **~$1,250/mes** |

| Concepto | Importe |
|----------|---------|
| Cuota base | $5 |
| Créditos | $5 |
| Uso real | ~$1,250 |
| **Extra a pagar** | **~$1,245** |

> ❌ **Hobby NO sirve** - pagarías $1,250/mes

---

### Plan Pro - $20/mes

| Recurso | Límite | Tu Necesidad |
|---------|--------|--------------|
| vCPU max | 1,000 | 1-2 |
| RAM max | 1 TB | 1-2 GB |
| Replicas | 50 | 1 |
| **Costo real** | - | **~$1,250/mes** |

| Concepto | Importe |
|----------|---------|
| Cuota base | $20 |
| Créditos | $20 |
| Uso real | ~$1,250 |
| **Extra a pagar** | **~$1,230** |

> ❌ **Pro tampoco alcanza** - igual pagas ~$1,250/mes

---

## 💰 Costo Real: ~$1,250 USD/mes

| Configuración | vCPU | RAM | Horas/mes | Costo |
|--------------|------|-----|-----------|-------|
| Mínima | 1 | 1 GB | 500 | **$1,250** |
| Media | 2 | 2 GB | 500 | **$2,500** |
| Alta | 4 | 4 GB | 500 | **$5,000** |

---

## 🚨 ¿Es Railway la Opción Correcta?

### Honestamente: **NO**

Para 500 horas de CPU/mes, Railway es **carísimo**. Hay alternativas mucho más baratas:

| Opción | Costo Estimado/mes | Notas |
|--------|-------------------|-------|
| **Railway** | ~$1,250 | Muy caro para este volumen |
| **VPS (DigitalOcean/Linode)** | $20-40 | 4 vCPU, 8 GB RAM, uso 24/7 |
| **Hetzner Cloud** | €15-25 (~$16-27) | 4 vCPU, 8 GB RAM, muy barato |
| **AWS EC2 (t3.medium)** | ~$30-40 | Con Reserved Instances |
| **Vercel Pro** | $20 | Tiene límites de tiempo de ejecución |
| **GitHub Actions** | $0-21 | 2,000-3,000 minutos gratis, luego $0.008/min |

---

## 🎯 Alternativas Recomendadas

### Opción 1: VPS en Hetzner (★ RECOMENDADA)

```
Servidor: CPX21 (4 vCPU, 8 GB RAM)
Costo: €17.51/mes (~$19 USD/mes)
Rendimiento: Procesa los 100 leads fácilmente
```

**Ahorro**: ~$1,230/mes comparado con Railway

**Pros:**
- 10x más barato que Railway
- Servidor dedicado 24/7
- Sin límites de ejecución
- Puedes correr múltiples workers si quieres

**Contras:**
- Necesitas configurar el servidor (deploy manual)
- No tiene auto-scaling

---

### Opción 2: DigitalOcean Droplet

```
Droplet: General Purpose (4 GB RAM, 2 vCPU)
Costo: $42/mes (o $24/mes si pagas anual)
```

**Ahorro**: ~$1,200/mes

---

### Opción 3: GitHub Actions (★ Más Barato)

```
100 leads/día × 10 minutos = 1,000 minutos/día
30 días = 30,000 minutos/mes

GitHub Free: 2,000 minutos/mes
GitHub Pro: 3,000 minutos/mes ($4/mes)

Necesitas: GitHub Team ($4/usuario/mes) + minutos extra

Costo: 3,000 minutos incluidos + 27,000 extra
Extra: 27,000 × $0.008 = $216/mes
Total: ~$220/mes
```

**Ahorro**: ~$1,000/mes comparado con Railway

---

### Opción 4: Worker en Casa / Servidor Propio

Si tienes una computadora vieja o Raspberry Pi:
- **Costo**: $0 (solo electricidad ~$5-10/mes)
- **Requiere**: IP pública o túnel (Cloudflare Tunnel gratis)

---

## 📈 Comparativa Final

| Opción | Costo/mes | Dificultad | Recomendación |
|--------|-----------|------------|---------------|
| Railway Pro | ~$1,250 | Fácil | ❌ Muy caro |
| Hetzner CPX21 | ~$19 | Media | ✅ **Mejor opción** |
| DigitalOcean | ~$42 | Media | ✅ Buena opción |
| GitHub Actions | ~$220 | Media | ⚠️ Más caro, pero viable |
| AWS Lambda | ~$300+ | Alta | ❌ Caro para ejecuciones largas |
| Servidor propio | ~$10 | Alta | ✅ Si tienes hardware |

---

## 🎯 Mi Recomendación Final

### Para tu caso (100 leads/día × 10 min):

**Usa un VPS en Hetzner Cloud:**

```
Plan: CPX21 (4 vCPU, 8 GB RAM, 80 GB SSD)
Costo: $19/mes
Ubicación: US East (Ashburn) o Europa

Deploy:
1. Crear servidor Ubuntu 22.04
2. Instalar Node.js, PM2
3. Clonar tu repo
4. pm2 start app.js --name "lead-processor" -i 2
```

**Setup simple con Docker:**
```bash
# docker-compose.yml
version: '3'
services:
  backend:
    build: ./backend
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

---

## 🔧 Si Insistes en Usar Railway

Si aún quieres usar Railway por simplicidad, considera:

### Estrategia de Optimización

1. **Procesa leads en batches más grandes**
   - Actual: 1 lead cada 10 minutos
   - Optimizado: 2-3 leads en paralelo (si las APIs lo permiten)
   - Tiempo: De 16.67 horas a ~8-10 horas/día
   - **Costo Railway**: ~$600-800/mes (sigue siendo caro)

2. **Usa un worker más potente pero menos tiempo**
   - Más vCPU = procesamiento más rápido
   - Railway cobra por tiempo, no por velocidad
   - Si bajas de 10 a 5 minutos por lead: $625/mes

3. **Procesa solo en horas específicas**
   - Railway cobra por uso, no por tener el servicio 24/7
   - Si el worker solo está activo 12h/día: $625/mes

> Pero honestamente, aún optimizando, Railway sigue siendo 10x más caro que un VPS.

---

## ✅ Conclusión

| Pregunta | Respuesta |
|----------|-----------|
| **¿Hobby ($5) me alcanza?** | ❌ No - pagarías ~$1,250 |
| **¿Pro ($20) me alcanza?** | ❌ No - pagarías ~$1,250 |
| **¿Qué plan de Railway necesito?** | Ninguno - Railway no es rentable para este caso |
| **¿Alternativa recomendada?** | ✅ **Hetzner Cloud - $19/mes** |
| **¿Puedo seguir con Railway?** | Solo si facturas >$5,000/mes con estos leads |

### Presupuesto Realista:

| Opción | Costo Infraestructura | Costo APIs (Gemini+Perplexity) | Total |
|--------|----------------------|--------------------------------|-------|
| **Railway** | ~$1,250 | ~$2,000 | ~$3,250/mes ❌ |
| **Hetzner VPS** | ~$19 | ~$2,000 | ~$2,020/mes ✅ |

**Ahorro mensual usando Hetzner: ~$1,230**

---

*Nota: Railway es excelente para proyectos pequeños o con tráfico variable, pero para procesamiento batch intensivo de 500 horas/mes, un VPS tradicional es mucho más económico.*
