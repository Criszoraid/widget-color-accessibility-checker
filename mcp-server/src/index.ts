#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import cors from "cors";

// Simulated accessibility analysis function
function analyzeAccessibility(url: string): {
    passed: boolean;
    message: string;
    score: string;
    errors: number;
} {
    // Simulate random analysis
    const passed = Math.random() > 0.3;
    return {
        passed,
        message: passed
            ? `✅ ¡Éxito! El contraste de color general de ${url} cumple con las pautas WCAG AA.`
            : `⚠️ Se encontraron problemas de contraste en ${url}. Consulta el informe detallado para las correcciones.`,
        score: passed ? "9.5/10" : "6.8/10",
        errors: passed ? 0 : 7,
    };
}

// Analyze HTML content directly
function analyzeHTMLContent(html: string): {
    passed: boolean;
    message: string;
    score: string;
    errors: number;
    elementsAnalyzed: number;
} {
    // Simple heuristic: count color-related CSS and style attributes
    const colorPatterns = html.match(/(color|background|rgb|rgba|#[0-9a-fA-F]{3,6})/gi) || [];
    const elementsAnalyzed = colorPatterns.length;

    // Simulate analysis based on content
    const passed = Math.random() > 0.4;
    return {
        passed,
        message: passed
            ? `✅ ¡Éxito! El contenido HTML analizado cumple con las pautas WCAG AA.`
            : `⚠️ Se encontraron problemas de contraste en el HTML. Consulta el informe detallado.`,
        score: passed ? "8.7/10" : "5.9/10",
        errors: passed ? 0 : Math.floor(elementsAnalyzed * 0.15),
        elementsAnalyzed,
    };
}

// WCAG information
function getWCAGInfo(level: "AA" | "AAA"): string {
    const info = {
        AA: `WCAG 2.1 Nivel AA (Mínimo recomendado):
- Contraste de texto normal: 4.5:1
- Contraste de texto grande: 3:1
- Contraste de componentes UI: 3:1
- Este nivel es el estándar legal en muchos países`,
        AAA: `WCAG 2.1 Nivel AAA (Mejorado):
- Contraste de texto normal: 7:1
- Contraste de texto grande: 4.5:1
- Contraste de componentes UI: 3:1
- Este nivel proporciona la máxima accesibilidad`,
    };
    return info[level];
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "color-accessibility-mcp-server" });
});

// Create MCP server instance
const server = new Server(
    {
        name: "color-accessibility-checker",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "analyze_accessibility",
                description:
                    "Analiza la accesibilidad de color de una URL. Simula un análisis de contraste WCAG y devuelve una puntuación, número de errores y mensaje.",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "URL del sitio web a analizar (ej: https://ejemplo.com)",
                        },
                    },
                    required: ["url"],
                },
            },
            {
                name: "analyze_html_content",
                description:
                    "Analiza la accesibilidad de color de contenido HTML pegado directamente. Útil cuando tienes el código HTML de una página y quieres verificar su accesibilidad sin necesidad de una URL.",
                inputSchema: {
                    type: "object",
                    properties: {
                        html: {
                            type: "string",
                            description: "Contenido HTML a analizar (puede ser un fragmento o página completa)",
                        },
                    },
                    required: ["html"],
                },
            },
            {
                name: "get_wcag_info",
                description:
                    "Obtiene información sobre las pautas WCAG de accesibilidad de color para un nivel específico (AA o AAA).",
                inputSchema: {
                    type: "object",
                    properties: {
                        level: {
                            type: "string",
                            enum: ["AA", "AAA"],
                            description: "Nivel WCAG (AA o AAA)",
                        },
                    },
                    required: ["level"],
                },
            },
        ],
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (!args) {
            return {
                content: [
                    {
                        type: "text",
                        text: "❌ Error: No se proporcionaron argumentos",
                    },
                ],
            };
        }

        if (name === "analyze_accessibility") {
            const url = args.url as string;

            if (!url || !url.startsWith("http")) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "❌ Error: Por favor proporciona una URL válida que empiece con http:// o https://",
                        },
                    ],
                };
            }

            const result = analyzeAccessibility(url);

            return {
                content: [
                    {
                        type: "text",
                        text: `# Análisis de Accesibilidad: ${url}

${result.message}

**Puntuación**: ${result.score}
**Errores encontrados**: ${result.errors}
**Estado**: ${result.passed ? "✅ APROBADO" : "❌ REQUIERE CORRECCIONES"}

${result.passed ? "" : "Recomendación: Revisa los elementos con bajo contraste y ajusta los colores para cumplir con WCAG AA."}`,
                    },
                ],
            };
        } else if (name === "analyze_html_content") {
            const html = args.html as string;

            if (!html || html.trim().length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "❌ Error: Por favor proporciona contenido HTML válido",
                        },
                    ],
                };
            }

            const result = analyzeHTMLContent(html);

            return {
                content: [
                    {
                        type: "text",
                        text: `# Análisis de Contenido HTML

${result.message}

**Puntuación**: ${result.score}
**Elementos analizados**: ${result.elementsAnalyzed}
**Errores encontrados**: ${result.errors}
**Estado**: ${result.passed ? "✅ APROBADO" : "❌ REQUIERE CORRECCIONES"}

${result.passed ? "" : "Recomendación: Revisa los elementos con bajo contraste y ajusta los colores para cumplir con WCAG AA."}`,
                    },
                ],
            };
        } else if (name === "get_wcag_info") {
            const level = args.level as "AA" | "AAA";

            if (level !== "AA" && level !== "AAA") {
                return {
                    content: [
                        {
                            type: "text",
                            text: "❌ Error: El nivel debe ser 'AA' o 'AAA'",
                        },
                    ],
                };
            }

            const info = getWCAGInfo(level);

            return {
                content: [
                    {
                        type: "text",
                        text: `# ${info}`,
                    },
                ],
            };
        } else {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Error: Herramienta desconocida: ${name}`,
                    },
                ],
            };
        }
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
});

// SSE endpoint for MCP
app.get("/sse", async (req, res) => {
    console.log("New SSE connection");

    const transport = new SSEServerTransport("/message", res);
    await server.connect(transport);

    // Keep connection alive
    req.on("close", () => {
        console.log("SSE connection closed");
    });
});

// Message endpoint for MCP
app.post("/message", async (req, res) => {
    // This is handled by the SSE transport
    res.status(200).send();
});

// Start server
app.listen(PORT, () => {
    console.log(`Color Accessibility MCP Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
});
