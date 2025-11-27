// src/index.ts
import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import * as z from "zod";
import cors from "cors";

// URL de tu widget en Render
const WIDGET_URL = "https://widget-color-accessibility-checker.onrender.com";

// --- LÓGICA DE NEGOCIO (Real) ---

/**
 * Convierte un color hex a RGB
 */
function hexToRgb(hex: string) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

/**
 * Calcula la luminancia relativa según WCAG 2.0
 */
function getLuminance(r: number, g: number, b: number) {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calcula el ratio de contraste entre dos colores
 */
function getContrastRatio(fgHex: string, bgHex: string) {
    const fg = hexToRgb(fgHex);
    const bg = hexToRgb(bgHex);

    if (!fg || !bg) return 0;

    const lum1 = getLuminance(fg.r, fg.g, fg.b);
    const lum2 = getLuminance(bg.r, bg.g, bg.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
}

function analyzeContrast(foreground: string, background: string) {
    const ratio = getContrastRatio(foreground, background);
    const roundedRatio = Math.round(ratio * 100) / 100; // 2 decimales

    const passesAA = roundedRatio >= 4.5;
    const passesAAA = roundedRatio >= 7;

    return {
        contrastRatio: roundedRatio,
        passesAA,
        passesAAA,
        message: `El contraste entre ${foreground} y ${background} es ${roundedRatio}:1. ${passesAA ? "✅ Pasa AA." : "❌ No pasa AA."
            }`,
        widgetUrl: `${WIDGET_URL}?fg=${foreground.replace("#", "")}&bg=${background.replace(
            "#",
            ""
        )}`,
    };
}

function analyzeHtml(html: string) {
    // Simulación
    return {
        issues: [
            {
                description: "Ejemplo: posible contraste bajo en un elemento <p> con clase .text-muted",
                element: "p.text-muted",
            },
        ],
    };
}

function getWcagInfo() {
    return {
        info: "WCAG 2.1: AA requiere contraste mínimo 4.5:1 para texto normal (3:1 si es grande). AAA requiere 7:1 para texto normal.",
    };
}

// --- CONFIGURACIÓN MCP ---

const mcpServer = new McpServer({
    name: "color-accessibility-mcp",
    version: "1.0.0",
});

mcpServer.registerTool(
    "analyze_accessibility",
    {
        title: "Analizar contraste de color",
        description: "Analiza la accesibilidad (contraste) entre un color de texto y fondo.",
        inputSchema: {
            foreground: z.string().describe("Color de texto hex"),
            background: z.string().describe("Color de fondo hex"),
        },
        outputSchema: {
            contrastRatio: z.number(),
            passesAA: z.boolean(),
            passesAAA: z.boolean(),
            message: z.string(),
            widgetUrl: z.string(),
        },
    },
    async ({ foreground, background }) => {
        const output = analyzeContrast(foreground, background);
        return {
            structuredContent: output,
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
        };
    }
);

mcpServer.registerTool(
    "analyze_html_content",
    {
        title: "Analizar HTML",
        description: "Analiza un fragmento HTML para problemas de contraste.",
        inputSchema: { html: z.string() },
        outputSchema: {
            issues: z.array(z.object({ description: z.string(), element: z.string().optional() })),
        },
    },
    async ({ html }) => {
        const output = analyzeHtml(html);
        return {
            structuredContent: output,
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
        };
    }
);

mcpServer.registerTool(
    "get_wcag_info",
    {
        title: "Info WCAG",
        description: "Información sobre requisitos WCAG.",
        inputSchema: {},
        outputSchema: { info: z.string() },
    },
    async () => {
        const output = getWcagInfo();
        return {
            structuredContent: output,
            content: [{ type: "text", text: output.info }],
        };
    }
);

// --- SERVIDOR EXPRESS (REST + MCP) ---

const app = express();
app.use(express.json());
app.use(cors()); // Importante para GPT Actions

// 1. Endpoints REST para GPT Actions
app.post("/api/analyze", (req, res) => {
    const { foreground, background } = req.body;
    if (!foreground || !background) {
        return res.status(400).json({ error: "Missing foreground or background" });
    }
    res.json(analyzeContrast(foreground, background));
});

app.post("/api/analyze-html", (req, res) => {
    const { html } = req.body;
    if (!html) return res.status(400).json({ error: "Missing html" });
    res.json(analyzeHtml(html));
});

app.get("/api/wcag-info", (req, res) => {
    res.json(getWcagInfo());
});

// 2. Endpoint OpenAPI para configuración automática
app.get("/openapi.json", (req, res) => {
    const host = req.get("host");
    // Forzar HTTPS en Render/Producción para evitar problemas con ChatGPT
    const protocol = host?.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const openApiSpec = {
        openapi: "3.1.0",
        info: {
            title: "Color Accessibility Checker API",
            description: "API para verificar contraste de colores y accesibilidad WCAG.",
            version: "1.0.0",
        },
        servers: [
            {
                url: baseUrl,
            },
        ],
        paths: {
            "/api/analyze": {
                post: {
                    operationId: "analyzeContrast",
                    summary: "Analizar contraste de dos colores",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        foreground: { type: "string", description: "Color de texto (ej. #000000)" },
                                        background: { type: "string", description: "Color de fondo (ej. #FFFFFF)" },
                                    },
                                    required: ["foreground", "background"],
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "Resultado del análisis",
                            content: { "application/json": { schema: { type: "object" } } },
                        },
                    },
                },
            },
            "/api/analyze-html": {
                post: {
                    operationId: "analyzeHtml",
                    summary: "Analizar fragmento HTML",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        html: { type: "string", description: "Código HTML a analizar" },
                                    },
                                    required: ["html"],
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "Lista de problemas encontrados",
                            content: { "application/json": { schema: { type: "object" } } },
                        },
                    },
                },
            },
            "/api/wcag-info": {
                get: {
                    operationId: "getWcagInfo",
                    summary: "Obtener información WCAG",
                    responses: {
                        "200": {
                            description: "Información sobre niveles AA y AAA",
                            content: { "application/json": { schema: { type: "object" } } },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {},
        },
    };

    res.json(openApiSpec);
});

// 3. Endpoint MCP (Legacy/Desktop)
app.post("/mcp", async (req: Request, res: Response) => {
    try {
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true,
        });
        res.on("close", () => transport.close());
        await mcpServer.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error("Error en MCP:", error);
        if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/health", (_req, res) => {
    res.json({ status: "ok", name: "color-accessibility-mcp-rest" });
});

const PORT = parseInt(process.env.PORT || "3000", 10);
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📝 OpenAPI Spec available at http://localhost:${PORT}/openapi.json`);
});
