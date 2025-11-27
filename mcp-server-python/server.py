from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
import math
import json
from typing import Any, Dict, List

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WIDGET_URL = "https://widget-color-accessibility-checker.onrender.com"

# --- Helper Functions for WCAG ---

def hex_to_rgb(hex_color: str):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c*2 for c in hex_color])
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_luminance(r, g, b):
    a = [x / 255.0 for x in [r, g, b]]
    a = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in a]
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722

def get_contrast_ratio(fg_hex, bg_hex):
    try:
        fg = hex_to_rgb(fg_hex)
        bg = hex_to_rgb(bg_hex)
    except:
        return 0.0
    
    lum1 = get_luminance(*fg)
    lum2 = get_luminance(*bg)
    
    brightest = max(lum1, lum2)
    darkest = min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)

# --- Tool Implementations ---

def analyze_accessibility_tool(foreground: str, background: str) -> Dict[str, Any]:
    ratio = get_contrast_ratio(foreground, background)
    rounded_ratio = round(ratio, 2)
    passes_aa = rounded_ratio >= 4.5
    passes_aaa = rounded_ratio >= 7.0
    
    message = f"El contraste entre {foreground} y {background} es {rounded_ratio}:1. "
    message += "✅ Pasa AA." if passes_aa else "❌ No pasa AA."

    clean_fg = foreground.replace('#', '')
    clean_bg = background.replace('#', '')
    widget_url_params = f"{WIDGET_URL}?fg={clean_fg}&bg={clean_bg}"
    
    return {
        "content": [
            {
                "type": "text",
                "text": json.dumps({
                    "contrastRatio": rounded_ratio,
                    "passesAA": passes_aa,
                    "passesAAA": passes_aaa,
                    "message": message,
                    "widgetUrl": widget_url_params
                }, indent=2)
            },
            {
                "type": "resource",
                "resource": {
                    "uri": "widget://color-accessibility",
                    "mimeType": "text/html+skybridge",
                    "text": f'<iframe src="{widget_url_params}" width="100%" height="600px" frameborder="0"></iframe>'
                }
            }
        ]
    }

def search_tool(query: str, max_results: int = 5) -> Dict[str, Any]:
    try:
        results = DDGS().text(query, max_results=max_results)
        return {
            "content": [{
                "type": "text",
                "text": json.dumps(results, indent=2)
            }]
        }
    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"Error searching: {str(e)}"
            }]
        }

async def fetch_tool(url: str) -> Dict[str, Any]:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    try:
        async with httpx.AsyncClient(follow_redirects=True, headers=headers) as client:
            response = await client.get(url, timeout=30.0)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            for script in soup(["script", "style", "nav", "footer"]):
                script.decompose()
                
            text = soup.get_text()
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            return {
                "content": [{
                    "type": "text",
                    "text": text[:10000]
                }]
            }
            
    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"Error fetching URL {url}: {str(e)}"
            }]
        }

# --- REST API Endpoints ---

@app.get("/health")
async def health():
    return {"status": "ok", "name": "color-accessibility-mcp-python"}

@app.get("/api/wcag-info")
async def wcag_info():
    return {
        "info": "WCAG 2.1: AA requiere contraste mínimo 4.5:1 para texto normal (3:1 si es grande). AAA requiere 7:1 para texto normal."
    }

@app.post("/api/analyze")
async def api_analyze(request: Request):
    data = await request.json()
    foreground = data.get("foreground")
    background = data.get("background")
    
    if not foreground or not background:
        return JSONResponse({"error": "Missing foreground or background"}, status_code=400)
    
    result = analyze_accessibility_tool(foreground, background)
    # Extract just the data from content for REST API
    text_content = result["content"][0]["text"]
    return JSONResponse(json.loads(text_content))

@app.post("/api/search")
async def api_search(request: Request):
    data = await request.json()
    query = data.get("query")
    max_results = data.get("max_results", 5)
    
    if not query:
        return JSONResponse({"error": "Missing query"}, status_code=400)
    
    result = search_tool(query, max_results)
    text_content = result["content"][0]["text"]
    return JSONResponse(json.loads(text_content))

@app.post("/api/fetch")
async def api_fetch(request: Request):
    data = await request.json()
    url = data.get("url")
    
    if not url:
        return JSONResponse({"error": "Missing url"}, status_code=400)
    
    result = await fetch_tool(url)
    return JSONResponse({"text": result["content"][0]["text"]})

@app.get("/openapi.json")
async def openapi_spec(request: Request):
    host = request.headers.get("host")
    protocol = "https" if "localhost" not in host else "http"
    base_url = f"{protocol}://{host}"
    
    return {
        "openapi": "3.1.0",
        "info": {
            "title": "Color Accessibility & Research API",
            "description": "API para verificar contraste de colores WCAG y realizar investigación web.",
            "version": "1.0.0"
        },
        "servers": [{"url": base_url}],
        "paths": {
            "/api/analyze": {
                "post": {
                    "operationId": "analyzeContrast",
                    "summary": "Analizar contraste de dos colores",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "foreground": {"type": "string", "description": "Color de texto (ej. #000000)"},
                                        "background": {"type": "string", "description": "Color de fondo (ej. #FFFFFF)"}
                                    },
                                    "required": ["foreground", "background"]
                                }
                            }
                        }
                    },
                    "responses": {"200": {"description": "Resultado del análisis"}}
                }
            },
            "/api/search": {
                "post": {
                    "operationId": "searchWeb",
                    "summary": "Buscar en internet",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "query": {"type": "string", "description": "Consulta de búsqueda"},
                                        "max_results": {"type": "integer", "description": "Máximo de resultados", "default": 5}
                                    },
                                    "required": ["query"]
                                }
                            }
                        }
                    },
                    "responses": {"200": {"description": "Resultados de búsqueda"}}
                }
            },
            "/api/fetch": {
                "post": {
                    "operationId": "fetchUrl",
                    "summary": "Obtener contenido de URL",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "url": {"type": "string", "description": "URL a descargar"}
                                    },
                                    "required": ["url"]
                                }
                            }
                        }
                    },
                    "responses": {"200": {"description": "Contenido de la página"}}
                }
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

