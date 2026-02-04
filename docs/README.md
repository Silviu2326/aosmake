# AOS Studio - Documentacion

Documentacion estructurada del sistema AOS Studio (Agentic Outbound System).

## Estructura

```
docs/
├── README.md           (este archivo)
├── globals/
│   ├── tokens.md       (design tokens, colores, tipografia, spacing)
│   ├── routing.md      (rutas, stack tecnologico, navegacion)
│   └── models.md       (tipos TypeScript, estado, validaciones)
└── pages/
    ├── leads.md               (1. lista principal de leads)
    ├── lead-detail.md         (2. ficha detallada de lead)
    ├── lead-import.md         (3. importacion de leads CSV/fuentes)
    ├── flows.md               (4. flujos - flow library)
    ├── runs.md                (5. ejecutor de flujos - runs/queue)
    └── sandbox.md             (6. pagina de pruebas tipo Make/n8n)
```

## Descripcion de la Aplicacion

**AOS Studio** es una plataforma de automatizacion de outbound sales que permite:

- Gestionar leads con verificacion de email y enriquecimiento
- Disenar flujos de procesamiento con nodos visuales
- Ejecutar workflows con LLMs (GPT-4, Claude, etc.)
- Importar leads desde CSV con deteccion de duplicados
- Probar flujos en un sandbox antes de ejecutar en produccion

## Paginas Principales

| Pagina | Ruta | Funcion |
|--------|------|---------|
| Leads | `/leads` | Lista principal con filtros y acciones masivas |
| Lead Detail | `/leads/:id` | Ficha clinica del lead |
| Import | `/import` | Wizard de importacion CSV |
| Flows | `/flows` | Biblioteca de flujos (Flow Library) |
| Runs | `/runs` | Cola de ejecuciones y logs |
| Sandbox | `/sandbox` | Laboratorio de pruebas de flujos |

## Stack Tecnologico

- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- React Flow (editor de nodos)
- Lucide React (iconos)

## Formato de los MDs

### Globals

- **tokens.md**: Paleta de colores, tipografia, spacing, shadows, breakpoints
- **routing.md**: Rutas, estructura de archivos, navegacion
- **models.md**: Interfaces TypeScript, estado global, validaciones

### Pages

Cada pagina incluye:
- Ruta y rol
- Layout ASCII
- **Requirements Checklist** (MUST/SHOULD/COULD)
- Componentes con props TypeScript
- Estados de la pagina
- Tabla de interacciones
- Data flow
- Accessibility
- Responsive behavior
