# Example Docs App - DocGen

Este es un ejemplo de documentación estructurada para usar con el **FrontendDocsOrchestrator**.

## Estructura

```
example-docs-app/
├── README.md           (este archivo)
├── globals/
│   ├── tokens.md       (design tokens, colores, tipografía, spacing)
│   ├── routing.md      (rutas, stack tecnológico, navegación)
│   └── models.md       (tipos TypeScript, estado, validaciones)
└── pages/
    ├── generator.md    (página principal - input de idea)
    ├── preview.md      (visualización de docs generados)
    └── history.md      (historial de generaciones)
```

## Cómo usar con el agente

### Opción 1: Pasar la carpeta completa

```typescript
const orchestrator = new FrontendDocsOrchestrator(client, outputDir, options);
await orchestrator.execute('E:/gemini-cli-1/example-docs-app');
```

El orquestador:
1. Detecta que es una carpeta
2. Busca MDs en `globals/` y `pages/`
3. Genera `docs.manifest.json`
4. Procesa todo automáticamente

### Opción 2: Pasar un MD individual

```typescript
await orchestrator.execute('E:/gemini-cli-1/example-docs-app/pages/generator.md');
```

## Qué genera el agente

A partir de esta documentación, el agente:

1. **Ingesta** los MDs y extrae especificaciones
2. **Planifica** la arquitectura UI (componentes, layouts)
3. **Genera** design tokens y sistema de diseño
4. **Construye** la cola de implementación por páginas
5. **Implementa** el código React + Tailwind
6. **Valida** con QA (lint, typecheck, build)
7. **Revisa** visualmente la implementación
8. **Refina** según los errores encontrados

## Descripción de la app de ejemplo

**DocGen** es una aplicación simple que:

- Recibe una idea de aplicación en un textarea
- Genera documentación automática (globals + pages)
- Permite ver, copiar y descargar los MDs generados
- Guarda historial en localStorage

### Páginas

| Página | Ruta | Función |
|--------|------|---------|
| GeneratorPage | `/` | Input de idea, opciones, botón generar |
| PreviewPage | `/preview` | Ver docs generados, copiar, descargar ZIP |
| HistoryPage | `/history` | Lista de generaciones anteriores |

### Stack tecnológico

- React 18
- react-router-dom v6
- Tailwind CSS 3
- Vite 5
- TypeScript 5

## Formato de los MDs

### Globals

- **tokens.md**: Paleta de colores, tipografía, spacing, shadows, breakpoints
- **routing.md**: Rutas, estructura de archivos, navegación
- **models.md**: Interfaces TypeScript, estado global, validaciones

### Pages

Cada página incluye:
- Ruta y rol
- Layout ASCII
- **Requirements Checklist** (MUST/SHOULD/COULD)
- Componentes con props TypeScript
- Estados de la página
- Tabla de interacciones
- Data flow
- Accessibility
- Responsive behavior

## Personalización

Para crear tu propia documentación:

1. Copia esta estructura
2. Modifica `globals/` según tu diseño
3. Crea un MD por cada página en `pages/`
4. Usa el formato MUST/SHOULD/COULD para priorizar features
5. Define componentes con interfaces TypeScript
6. Incluye layouts ASCII para visualizar estructura
