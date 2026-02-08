# 📄 Documentación de Páginas - AOS Studio

Este documento describe todas las páginas disponibles en la aplicación AOS Studio, sus funcionalidades principales y los componentes que las componen.

---

## 🎯 Resumen de Rutas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Redirect | Redirección automática a `/leads` |
| `/leads` | LeadsPage | Lista principal de leads con tabla y filtros |
| `/leads/:id` | LeadDetailPage | Ficha detallada de un lead específico |
| `/import` | ImportPage | Wizard de importación de leads desde CSV |
| `/flows` | FlowsPage | Biblioteca de flujos de automatización |
| `/runs` | RunsPage | Monitor de ejecuciones de flujos |
| `/sandbox` | SandboxPage | Laboratorio de pruebas tipo Make/n8n |
| `/precrafter` | PreCrafterPanel | Panel del sistema PreCrafter |
| `/dashboard` | DashboardPage | Panel de control del pipeline |
| `/settings` | SettingsPage | Configuración de API keys |

---

## 📋 1. LeadsPage (`/leads`)

**Descripción:** Página estrella de la aplicación. Gestión completa de leads con tabla, filtros y acciones masivas.

### Funcionalidades Principales:
- **Tabla de Leads:** Visualización de todos los leads con información clave
- **Filtros Avanzados:** Búsqueda y filtrado por múltiples criterios
- **Selección Masiva:** Seleccionar múltiples leads para acciones en batch
- **Acciones Rápidas:** 
  - Importar CSV
  - Añadir lead manual
  - Ejecutar flujos sobre seleccionados
  - Verificar emails (AnyMail Finder)
  - Exportar datos

### Componentes Utilizados:
- `LeadTable` - Tabla principal de visualización
- `LeadFilters` - Barra de filtros y búsqueda
- `BulkActionBar` - Barra de acciones masivas
- `Button` - Botones de acción

---

## 🔍 2. LeadDetailPage (`/leads/:id`)

**Descripción:** "Ficha clínica" del lead. Vista detallada de toda la información de un lead específico.

### Funcionalidades Principales:
- **Información de Identidad:** Nombre, cargo, email (con estado de validación), LinkedIn, fuente
- **Información de Empresa:** Nombre, LinkedIn company, web, país, tamaño, industria
- **Timeline de Actividad:** Historial de acciones realizadas sobre el lead
- **Gestión de Tags:** Sistema de etiquetado
- **Acciones Rápidas:**
  - Verificar email
  - Ejecutar flujo puntual
  - Editar información
  - Eliminar lead

### Layout:
```
┌─────────────────────────────┬─────────────────┐
│  Lead Header                │ Identity Card   │
├─────────────────────────────┤                 │
│  Activity Timeline          ├─────────────────┤
│                             │ Company Card    │
│                             ├─────────────────┤
│                             │ Tags Section    │
└─────────────────────────────┴─────────────────┘
```

### Componentes Utilizados:
- `LeadHeader` - Cabecera con acciones principales
- `IdentityCard` - Tarjeta de identidad del contacto
- `CompanyCard` - Información de la empresa
- `ActivityTimeline` - Línea temporal de actividades
- `TagsSection` - Gestión de etiquetas

---

## 📥 3. ImportPage (`/import`)

**Descripción:** Sistema de importación masiva de leads desde archivos CSV.

### Funcionalidades Principales:
- **Wizard de Importación:** Proceso guiado paso a paso
- **Subida de CSV:** Arrastrar y solitar archivos
- **Mapeo de Columnas:** Asignar columnas CSV a campos del sistema
- **Normalización:** Limpieza automática de nombres, dominios, teléfonos
- **Detección de Duplicados:** Identificación y resolución de leads duplicados
- **Resumen de Importación:** Estadísticas del proceso

### Pasos del Wizard:
1. Subir archivo CSV
2. Mapear columnas
3. Configurar normalización
4. Revisar duplicados
5. Confirmar importación

### Componentes Utilizados:
- `ImportWizard` - Contenedor principal del wizard
- `FileUploader` - Componente de subida de archivos
- `ColumnMapper` - Interfaz de mapeo de columnas
- `NormalizationOptions` - Opciones de normalización
- `DuplicateResolver` - Resolución de duplicados
- `ImportSummary` - Resumen final

---

## 🌊 4. FlowsPage (`/flows`)

**Descripción:** Biblioteca de flujos de automatización (similar a Make/n8n pero orientado a outbound).

### Funcionalidades Principales:
- **Lista de Flujos:** Visualización de todos los flujos creados
- **Estados:** active, draft, paused, archived
- **Metadatos:** Versión, última ejecución, tasa de éxito
- **Acciones:** Editar, testear, duplicar, archivar
- **Filtros:** Por estado y búsqueda por nombre

### Información por Flujo:
- Nombre y objetivo
- Versión actual
- Estado (activo/borrador/pausado/archivado)
- Dueño
- Última ejecución
- Tasa de éxito

### Componentes Utilizados:
- `FlowGrid` - Grid de tarjetas de flujos
- `FlowCard` - Tarjeta individual de flujo
- `FlowFilters` - Filtros de búsqueda
- `FlowStatusBadge` - Indicador de estado

---

## ▶️ 5. RunsPage (`/runs`)

**Descripción:** Monitor de ejecuciones de flujos. Trazabilidad completa de las acciones masivas.

### Funcionalidades Principales:
- **Cola de Ejecuciones:** Lista de ejecuciones por lead o batch
- **Estadísticas:** Total, exitosas, fallidas, en ejecución
- **Filtrado:** Por estado (all, success, failed, running)
- **Detalle de Ejecución:** Logs por step
- **Refresh:** Actualización en tiempo real

### Estados de Ejecución:
- ✅ **Success** - Ejecución completada correctamente
- ❌ **Failed** - Ejecución con errores
- 🔄 **Running** - En ejecución actualmente
- ⏸️ **Cancelled** - Ejecución cancelada

### Componentes Utilizados:
- `RunsTable` - Tabla de ejecuciones
- `RunDetailPanel` - Panel de detalle lateral
- `RunStatusBadge` - Indicador de estado
- `RunsHeader` - Cabecera con estadísticas

---

## 🧪 6. SandboxPage (`/sandbox`)

**Descripción:** Laboratorio de pruebas tipo Make/n8n. Espacio para testear flujos sin afectar datos reales.

### Funcionalidades Principales:
- **Selección de Flujo:** Elegir flujo a testear
- **Modos de Input:**
  - Lead de ejemplo desde base de datos
  - JSON manual personalizado
  - CSV pequeño
- **Visualización del Flujo:** Diagrama del flujo seleccionado
- **Ejecución Paso a Paso:** Ver input/output de cada nodo
- **Simulación:** Ejecución simulada con resultados

### Layout:
```
┌──────────────────────────────────────┬─────────────────┐
│                                      │  Input Panel    │
│   Flow Visualization                 │  (Lead/JSON)    │
│   (React Flow Diagram)               ├─────────────────┤
│                                      │  Output Panel   │
│                                      │  (Step Logs)    │
└──────────────────────────────────────┴─────────────────┘
```

### Componentes Utilizados:
- `SandboxHeader` - Cabecera con selector de flujo
- `FlowVisualization` - Diagrama del flujo (React Flow)
- `InputPanel` - Panel de entrada de datos
- `OutputPanel` - Panel de resultados

---

## 🎨 7. TwoPhaseStudio (`/precrafter`)

**Descripción:** Panel del sistema PreCrafter con arquitectura de tres fases.

### Arquitectura de 3 Columnas:
```
┌────────────────┬────────────────┬────────────────┐
│  PreCrafter    │     Spec       │    Crafter     │
│    Panel       │    Panel       │    Panel       │
│                │                │                │
│  (4 cols)      │  (4 cols)      │  (4 cols)      │
│                │                │                │
│  Blue Theme    │  Purple Theme  │  Green Theme   │
└────────────────┴────────────────┴────────────────┘
        ↕                    ↕              ↕
   Emisor datos      Contract Bridge    Receptor
```

### Funcionalidades:
- **PreCrafterPanel:** Fase inicial de procesamiento
- **SpecPanel:** Especificaciones y contratos
- **CrafterPanel:** Fase final de creación
- **RunConsole:** Consola de ejecución colapsable

### Componentes Utilizados:
- `PreCrafterPanel` - Panel izquierdo
- `SpecPanel` - Panel central
- `CrafterPanel` - Panel derecho
- `RunConsole` - Consola inferior

---

## 📊 8. DashboardPage (`/dashboard`)

**Descripción:** Panel de control completo del pipeline de procesamiento de leads.

### Pestañas Disponibles:
| Pestaña | Descripción | Métricas Clave |
|---------|-------------|----------------|
| **Overview** | Resumen general del pipeline | Métricas por paso |
| **Analytics** | Análisis visual con gráficos | DashboardCharts |
| **Master** | Tabla maestra de todos los leads | Todos los registros |
| **Verification** | Input para verificación | Leads pendientes de verificación |
| **CompScrap** | Input para Company Scrap | Leads listos para scraping |
| **Box1** | Input para Box1/FIT | Leados para análisis FIT |
| **Email Stock** | Stock de emails | Leads en stock de email |
| **Instantly** | Input para Instantly | Leads listos para envío |

### Métricas por Paso:
1. **Verificación:**
   - Input Pendiente
   - Enviados a Verificación
   - Verificados Ahora
   - Ratio de Verificación
   - Verificados con CompUrl

2. **Company Scrap:**
   - Input CompScrap Pendiente
   - Enviados a CompScrap
   - Scrappeados Ahora
   - Total con CompUrl
   - Ratio de Scrap

3. **Box1/FIT:**
   - Input Box1 Pendiente
   - Enviados a Box1
   - DROP / FIT / Almacenamiento
   - Ratio FIT & HIT

4. **Instantly:**
   - Input Instantly Pendiente
   - Enviados a Instantly
   - Ratio de Respuesta
   - Ratio Respuesta Positiva
   - Ratio de Conversión

### Funcionalidades:
- **Selector de Campañas:** Filtrar por campaña específica
- **Exportación:** Exportar datos a CSV
- **Configuración de Etapas:** Enlazar versiones del PreCrafter
- **Acciones Masivas:** Enviar leads al siguiente paso

### Componentes Utilizados:
- `DashboardFilters` - Filtros avanzados
- `DashboardLeadTable` - Tabla de leads
- `DashboardCharts` - Gráficos analíticos
- `DashboardPagination` - Paginación
- `DashboardBulkActions` - Acciones masivas
- `ExportModal` - Modal de exportación
- `StageConfigModal` - Configuración de etapas
- `CreateCampaignModal` - Creación de campañas
- `CompScrapImportModal` - Importación CompScrap

---

## ⚙️ 9. SettingsPage (`/settings`)

**Descripción:** Configuración de API keys y proveedores de servicios.

### Secciones:

#### Google Gemini API
- **Múltiples API Keys:** Sistema de balanceo de carga
- **Activar/Desactivar:** Control individual de keys
- **Visualización:** Mostrar/ocultar keys
- **Eliminar:** Gestión de keys obsoletas

#### Perplexity (Búsqueda web AI)
- Toggle de activación
- Input de API key
- Visualización segura

#### AnymailFinder (Búsqueda de emails)
- Toggle de activación
- Input de API key
- Visualización segura

### Features:
- **Balanceo de Carga:** Rotación automática de Gemini keys
- **Validación:** Verificación de keys al añadir
- **Seguridad:** Keys ocultas por defecto

### Componentes Utilizados:
- Inputs de configuración
- Toggle switches
- Botones de acción
- Iconos de estado

---

## 🧩 Componentes Globales

### Layout (`/components/layout`)
- **Layout.tsx** - Layout principal con sidebar y topbar
- **Sidebar.tsx** - Navegación lateral
- **Header.tsx** - Cabecera de página

### Componentes UI (`/components/ui`)
- **Button.tsx** - Botones estilizados
- **Card.tsx** - Tarjetas contenedoras
- **Modal.tsx** - Modales reutilizables
- **Table.tsx** - Tablas estilizadas
- **Badge.tsx** - Insignias de estado
- **Input.tsx** - Inputs de formulario

### Contextos (`/context`)
- **ChristmasContext.tsx** - Efectos navideños
- **ConsoleContext.tsx** - Gestión de consola

---

## 🗺️ Navegación y Estructura

```
AOS Studio
├── 📋 Leads (Lista principal)
│   └── 🔍 Lead Detail (Ficha individual)
├── 📥 Import (Wizard CSV)
├── 🌊 Flows (Biblioteca de flujos)
├── ▶️ Runs (Ejecuciones)
├── 🧪 Sandbox (Laboratorio)
├── 🎨 PreCrafter (Studio 3 fases)
├── 📊 Dashboard (Panel de control)
└── ⚙️ Settings (Configuración)
```

---

## 🔧 Tecnologías Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **React Router** - Navegación
- **Zustand** - State management
- **React Flow** - Diagramas de flujo
- **Lucide React** - Iconos
- **Tailwind CSS** - Estilos

---

*Documentación generada el: 2026-02-04*
