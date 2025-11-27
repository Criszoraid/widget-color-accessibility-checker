# Color Accessibility Checker - MCP Server (HTTP)

Un servidor MCP (Model Context Protocol) HTTP que expone herramientas de verificación de accesibilidad de color para usar en ChatGPT Desktop de forma remota.

## 🚀 Características

- **`analyze_accessibility`**: Analiza la accesibilidad de color de una URL
- **`analyze_html_content`**: Analiza contenido HTML pegado directamente
- **`get_wcag_info`**: Obtiene información sobre las pautas WCAG (AA/AAA)
- **HTTP + SSE**: Servidor remoto accesible vía URL

## 📋 Requisitos

- Node.js 18+
- ChatGPT Desktop App (macOS/Windows)
- Cuenta en Render (para deployment)

## 🛠️ Instalación Local

1. **Instalar dependencias**:
\`\`\`bash
cd mcp-server
npm install
\`\`\`

2. **Compilar el servidor**:
\`\`\`bash
npm run build
\`\`\`

3. **Ejecutar localmente**:
\`\`\`bash
npm start
\`\`\`

El servidor estará disponible en `http://localhost:3000`

## 🌐 Desplegar en Render

### Opción 1: Deploy desde GitHub (Recomendado)

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: `color-accessibility-mcp`
   - **Root Directory**: `mcp-server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Click **"Create Web Service"**

Tu servidor estará disponible en: `https://color-accessibility-mcp.onrender.com`

### Opción 2: Deploy Manual

\`\`\`bash
# Desde el directorio mcp-server
git push render main
\`\`\`

## ⚙️ Configuración en ChatGPT Desktop

### Configuración con URL Remota

1. Abre el archivo de configuración:

**macOS**:
\`\`\`bash
code ~/Library/Application\\ Support/Claude/claude_desktop_config.json
\`\`\`

**Windows**:
\`\`\`
%APPDATA%\\Claude\\claude_desktop_config.json
\`\`\`

2. Añade la configuración del servidor MCP:
\`\`\`json
{
  "mcpServers": {
    "color-accessibility-checker": {
      "url": "https://TU-APP.onrender.com/sse"
    }
  }
}
\`\`\`

> **Importante**: Reemplaza `TU-APP.onrender.com` con tu URL real de Render.

3. **Reinicia ChatGPT Desktop**

## 📖 Uso

Una vez configurado, puedes usar las herramientas desde ChatGPT:

### Ejemplo 1: Analizar una URL
\`\`\`
Analiza la accesibilidad de https://google.com
\`\`\`

### Ejemplo 2: Analizar HTML directamente
\`\`\`
Analiza este HTML:
<div style="color: #333; background: #fff">
  <h1>Título</h1>
  <p>Contenido</p>
</div>
\`\`\`

### Ejemplo 3: Información WCAG
\`\`\`
Dame información sobre WCAG nivel AAA
\`\`\`

## 🔧 Desarrollo

### Ejecutar en modo desarrollo
\`\`\`bash
npm run dev
\`\`\`

### Compilar
\`\`\`bash
npm run build
\`\`\`

### Endpoints HTTP

- **Health Check**: `GET /health`
- **SSE Connection**: `GET /sse`
- **Message Endpoint**: `POST /message`

### Estructura del proyecto
\`\`\`
mcp-server/
├── src/
│   └── index.ts       # Servidor HTTP con SSE
├── dist/              # Código compilado
├── Procfile           # Configuración Render
├── package.json
└── tsconfig.json
\`\`\`

## 🧪 Testing

### Test local
\`\`\`bash
# Iniciar servidor
npm start

# En otra terminal, verificar health check
curl http://localhost:3000/health
\`\`\`

### Test remoto
\`\`\`bash
curl https://TU-APP.onrender.com/health
\`\`\`

## 📝 Herramientas Disponibles

### analyze_accessibility
Analiza la accesibilidad de color de una URL.

**Parámetros**:
- `url` (string): URL del sitio web a analizar

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
- `level` (string): "AA" o "AAA"

**Retorna**:
- Requisitos de contraste
- Descripción del nivel

## 🐛 Troubleshooting

### El servidor no aparece en ChatGPT
1. Verifica que la URL en `claude_desktop_config.json` sea correcta
2. Asegúrate de que el servidor esté desplegado y funcionando
3. Verifica el health check: `curl https://TU-APP.onrender.com/health`
4. Reinicia ChatGPT Desktop completamente

### Error al conectar
1. Verifica que Render no haya pausado el servicio (free tier)
2. Revisa los logs en Render Dashboard
3. Asegúrate de que el endpoint SSE sea `/sse`

### Render Free Tier
- Los servicios gratuitos se pausan después de 15 minutos de inactividad
- La primera petición después de la pausa puede tardar 30-60 segundos

## 📄 Licencia

MIT

## 👤 Autor

[Criszoraid](https://github.com/Criszoraid)

## 🔗 Enlaces

- **Repositorio**: [https://github.com/Criszoraid/color-accessibility-checker](https://github.com/Criszoraid/color-accessibility-checker)
- **Web App**: [Deploy en Render](https://github.com/Criszoraid/color-accessibility-checker#readme)
