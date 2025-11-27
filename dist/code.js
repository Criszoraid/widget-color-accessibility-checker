"use strict";
const { widget } = figma;
const { AutoLayout, Text: WidgetText, Input, Checkbox, useSyncedState, useEffect } = widget;
// Componente principal del Widget
const ColorAccessibilityCheckerWidget = () => {
    // Estados para la URL, el estado de análisis, los resultados y el menú avanzado
    const [url, setUrl] = useSyncedState('url', 'https://tusitio.com');
    const [isAnalyzing, setIsAnalyzing] = useSyncedState('isAnalyzing', false);
    const [analysisResult, setAnalysisResult] = useSyncedState('result', null);
    const [showAdvanced, setShowAdvanced] = useSyncedState('showAdvanced', false);
    // Función simulada de análisis
    const handleAnalyze = () => {
        if (!url || !url.startsWith('http')) {
            // Nota: En Figma, usaríamos notificaciones o un error de estado en lugar de 'alert'.
            console.error('Por favor, introduce una URL válida que empiece por http:// o https://');
            return;
        }
        setIsAnalyzing(true);
        setAnalysisResult(null);
        // Simulación de una llamada API de 2.5 segundos
        setTimeout(() => {
            setIsAnalyzing(false);
            // Simulación de un resultado aleatorio
            const passed = Math.random() > 0.3;
            setAnalysisResult({
                passed: passed,
                message: passed
                    ? '¡Éxito! El contraste de color general cumple con las pautas WCAG AA.'
                    : 'Se encontraron problemas de contraste. Consulta el informe detallado para las correcciones.',
                score: passed ? '9.5/10' : '6.8/10',
                errors: passed ? 0 : 7,
            });
        }, 2500);
    };
    // Componente de Botón (simula el estilo shadcn/ui negro)
    const PrimaryButton = ({ children, onClick, disabled, icon }) => (widget.h(AutoLayout, { direction: "horizontal", horizontalPadding: 16, verticalPadding: 10, spacing: 8, cornerRadius: 6, fill: disabled ? '#4B5563' : '#000000', opacity: disabled ? 0.7 : 1, onClick: disabled ? null : onClick, height: 40, width: "fill-parent", key: "primary-button", hoverStyle: { fill: disabled ? '#4B5563' : '#1F2937' }, cursor: disabled ? 'default' : 'pointer' },
        isAnalyzing && (
        // Simulación de spinner de carga (Figma no tiene un componente spinner nativo)
        widget.h(WidgetText, { fill: "#FFFFFF", fontSize: 14, fontWeight: "medium" }, "...")),
        widget.h(WidgetText, { fill: "#FFFFFF", fontSize: 14, fontWeight: "medium", textAlignment: "center", width: "fill-parent" }, children)));
    // Componente de Insignia de Resultado (Badge)
    const ResultBadge = ({ text, color }) => (widget.h(AutoLayout, { direction: "horizontal", horizontalPadding: 12, verticalPadding: 8, spacing: 8, cornerRadius: 8, fill: color, key: "result-badge" },
        widget.h(WidgetText, { fill: "#FFFFFF", fontSize: 16 }, color === '#10B981' ? '✅' : '🚨'),
        widget.h(WidgetText, { fill: "#FFFFFF", fontSize: 14, fontWeight: "bold" }, text)));
    // Renderizado principal
    return (widget.h(AutoLayout, { direction: "vertical", spacing: 16, padding: 24, cornerRadius: 12, fill: "#FFFFFF" // Fondo blanco, simulando la Card de shadcn/ui
        , stroke: "#E5E7EB" // Borde gris claro
        , width: 320 },
        widget.h(AutoLayout, { direction: "horizontal", spacing: 12, key: "header", verticalAlignItems: "center" },
            widget.h(WidgetText, { fontSize: 32, key: "emoji" }, "\uD83C\uDFA8"),
            widget.h(WidgetText, { fontSize: 18, fontWeight: "bold", textTruncation: "ending", key: "title" }, "Comprobador de Accesibilidad")),
        widget.h(WidgetText, { fontSize: 12, fill: "#6B7280", key: "description" }, "Revisa el contraste de colores de una web mediante an\u00E1lisis autom\u00E1tico."),
        widget.h(AutoLayout, { direction: "vertical", spacing: 8, width: "fill-parent", key: "url-field" },
            widget.h(WidgetText, { fontSize: 12, fontWeight: "medium", fill: "#374151", key: "label" }, "URL del sitio"),
            widget.h(Input, { value: url, onTextEdit: setUrl, placeholder: "https://ejemplo.com", fontSize: 14, fill: "#F3F4F6" // Fondo de input gris claro
                , cornerRadius: 6, padding: { horizontal: 12, vertical: 8 }, stroke: "#D1D5DB" // Borde sutil
                , key: "url-input" })),
        widget.h(AutoLayout, { direction: "horizontal", horizontalPadding: 8, verticalPadding: 6, spacing: "auto" // Espacio automático para justificar
            , width: "fill-parent", cornerRadius: 6, onClick: () => setShowAdvanced(!showAdvanced), hoverStyle: { fill: '#F3F4F6' }, cursor: "pointer", key: "advanced-toggle" },
            widget.h(WidgetText, { fontSize: 12, fill: "#6B7280", fontWeight: "medium" }, "Opciones avanzadas"),
            widget.h(WidgetText, { fontSize: 12, fill: "#6B7280", key: "chevron" }, showAdvanced ? '▲' : '▼')),
        showAdvanced && (widget.h(AutoLayout, { direction: "vertical", spacing: 12, padding: 12, cornerRadius: 6, fill: "#F9FAFB", stroke: "#E5E7EB", width: "fill-parent", key: "advanced-content" },
            widget.h(AutoLayout, { direction: "horizontal", spacing: 8, verticalAlignItems: "center" },
                widget.h(Checkbox, { key: "checkbox-aaa" }),
                widget.h(WidgetText, { fontSize: 12, fill: "#374151" }, "Verificar cumplimiento WCAG AAA")),
            widget.h(AutoLayout, { direction: "vertical", spacing: 4, width: "fill-parent" },
                widget.h(WidgetText, { fontSize: 12, fill: "#374151" }, "Agente de usuario"),
                widget.h(AutoLayout, { direction: "horizontal", horizontalPadding: 12, verticalPadding: 8, cornerRadius: 6, fill: "#FFFFFF", stroke: "#D1D5DB", spacing: "auto", key: "user-agent-select" },
                    widget.h(WidgetText, { fontSize: 12, fill: "#374151" }, "Desktop (Chrome)"),
                    widget.h(WidgetText, { fontSize: 10, fill: "#6B7280" }, "\u25BC"))))),
        widget.h(PrimaryButton, { onClick: handleAnalyze, disabled: isAnalyzing }, isAnalyzing ? 'Analizando...' : 'Analizar accesibilidad'),
        widget.h(AutoLayout, { direction: "vertical", spacing: 12, paddingTop: 8, width: "fill-parent", key: "results-area" }, analysisResult ? (widget.h(AutoLayout, { direction: "vertical", spacing: 12, width: "fill-parent" },
            analysisResult.passed ? (widget.h(ResultBadge, { text: "An\u00E1lisis Exitoso", color: "#10B981" // Verde (bg-green-600)
             })) : (widget.h(ResultBadge, { text: "Problemas de Accesibilidad", color: "#EF4444" // Rojo (bg-red-600)
             })),
            widget.h(WidgetText, { fontSize: 12, fill: "#374151", key: "result-message" }, analysisResult.message),
            widget.h(AutoLayout, { direction: "horizontal", spacing: 12, width: "fill-parent" },
                widget.h(AutoLayout, { direction: "vertical", padding: 12, cornerRadius: 6, fill: "#F9FAFB", spacing: 4, width: "fill-parent" },
                    widget.h(WidgetText, { fontSize: 10, fill: "#6B7280", textAlignment: "center", width: "fill-parent" }, "Puntuaci\u00F3n"),
                    widget.h(WidgetText, { fontSize: 20, fontWeight: "bold", fill: "#1F2937", textAlignment: "center", width: "fill-parent" }, analysisResult.score)),
                widget.h(AutoLayout, { direction: "vertical", padding: 12, cornerRadius: 6, fill: "#F9FAFB", spacing: 4, width: "fill-parent" },
                    widget.h(WidgetText, { fontSize: 10, fill: "#6B7280", textAlignment: "center", width: "fill-parent" }, "Errores"),
                    widget.h(WidgetText, { fontSize: 20, fontWeight: "bold", fill: analysisResult.errors > 0 ? '#EF4444' : '#10B981', textAlignment: "center", width: "fill-parent" }, analysisResult.errors))))) : (widget.h(AutoLayout, { direction: "vertical", padding: 16, cornerRadius: 6, stroke: "#D1D5DB", strokeDashPattern: [4, 4], fill: "#F9FAFB", width: "fill-parent" },
            widget.h(WidgetText, { fontSize: 12, fill: "#6B7280", textAlignment: "center" }, "Introduce una URL y pulsa \"Analizar\" para iniciar la revisi\u00F3n de contraste."))))));
};
widget.register(ColorAccessibilityCheckerWidget);
