# Color Accessibility Checker - MCP Server

Un servidor MCP (Model Context Protocol) que expone herramientas de verificación de accesibilidad de color para usar en ChatGPT Desktop.

## 🚀 Características

- **`analyze_accessibility`**: Analiza la accesibilidad de color de una URL
- **`analyze_html_content`**: Analiza contenido HTML pegado directamente
- **`get_wcag_info`**: Obtiene información sobre las pautas WCAG (AA/AAA)

## 📋 Requisitos

- Node.js 18+
- ChatGPT Desktop App (macOS/Windows)

## 🛠️ Instalación

1. **Instalar dependencias**:
\`\`\`bash
cd mcp-server
npm install
\`\`\`

2. **Compilar el servidor**:
\`\`\`bash
npm run build
\`\`\`

## ⚙️ Configuración en ChatGPT Desktop

### macOS

1. Abre el archivo de configuración:
\`\`\`bash
code ~/Library/Application\\ Support/Claude/claude_desktop_config.json
\`\`\`

2. Añade la configuración del servidor MCP:
\`\`\`json
{
  "mcpServers": {
    "color-accessibility-checker": {
      "command": "node",
      "args": [
        "/Users/TU_USUARIO/Desktop/ColorAccessibilityChecker/mcp-server/dist/index.js"
      ]
    }
  }
}
\`\`\`

> **Importante**: Reemplaza `/Users/TU_USUARIO/` con tu ruta real.

### Windows

1. Abre el archivo de configuración:
\`\`\`
%APPDATA%\\Claude\\claude_desktop_config.json
\`\`\`

2. Añade la configuración (usa rutas de Windows):
\`\`\`json
{
  "mcpServers": {
    "color-accessibility-checker": {
      "command": "node",
      "args": [
        "C:\\\\Users\\\\TU_USUARIO\\\\Desktop\\\\ColorAccessibilityChecker\\\\mcp-server\\\\dist\\\\index.js"
      ]
    }
  }
}
\`\`\`

3. **Reinicia ChatGPT Desktop**

## 📖 Uso

Una vez configurado, puedes usar las herramientas desde ChatGPT:

### Ejemplo 1: Analizar una URL
\`\`\`
Analiza la accesibilidad de https://google.com
\`\`\`

ChatGPT usará la herramienta `analyze_accessibility` y te mostrará:
- Puntuación de accesibilidad
- Número de errores
- Estado (aprobado/requiere correcciones)

### Ejemplo 2: Analizar HTML directamente
\`\`\`
Analiza este HTML:
<div style="color: #333; background: #fff">
  <h1>Título</h1>
  <p>Contenido</p>
</div>
\`\`\`

ChatGPT usará `analyze_html_content` para analizar el fragmento HTML.

### Ejemplo 3: Información WCAG
\`\`\`
Dame información sobre WCAG nivel AAA
\`\`\`

ChatGPT usará `get_wcag_info` para mostrar los requisitos de contraste.

## 🔧 Desarrollo

### Ejecutar en modo desarrollo
\`\`\`bash
npm run dev
\`\`\`

### Compilar
\`\`\`bash
npm run build
\`\`\`

### Estructura del proyecto
\`\`\`
mcp-server/
├── src/
│   └── index.ts       # Implementación del servidor MCP
├── dist/              # Código compilado
├── package.json
└── tsconfig.json
\`\`\`

## 🧪 Testing

Para probar el servidor sin ChatGPT, puedes usar el MCP Inspector:

\`\`\`bash
npx @modelcontextprotocol/inspector node dist/index.js
\`\`\`

## 📝 Herramientas Disponibles

### analyze_accessibility
Analiza la accesibilidad de color de una URL.

**Parámetros**:
- \`url\` (string): URL del sitio web a analizar

**Retorna**:
- Puntuación (0-10)
- Número de errores
- Mensaje de estado
- Recomendaciones

### analyze_html_content
Analiza la accesibilidad de color de contenido HTML pegado directamente.

**Parámetros**:
- `html` (string): Contenido HTML a analizar (fragmento o página completa)

**Retorna**:
- Puntuación (0-10)
- Elementos analizados
- Número de errores
- Mensaje de estado
- Recomendaciones

### get_wcag_info
Obtiene información sobre las pautas WCAG.

**Parámetros**:
- \`level\` (string): "AA" o "AAA"

**Retorna**:
- Requisitos de contraste
- Descripción del nivel

## 🐛 Troubleshooting

### El servidor no aparece en ChatGPT
1. Verifica que la ruta en \`claude_desktop_config.json\` sea correcta
2. Asegúrate de haber compilado el código (\`npm run build\`)
3. Reinicia ChatGPT Desktop completamente

### Error al ejecutar
1. Verifica que Node.js esté instalado: \`node --version\`
2. Reinstala dependencias: \`npm install\`
3. Recompila: \`npm run build\`

## 📄 Licencia

MIT

## 👤 Autor

[Criszoraid](https://github.com/Criszoraid)
