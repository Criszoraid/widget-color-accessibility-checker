const { widget } = figma as any;
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
    const PrimaryButton = ({ children, onClick, disabled, icon }: any) => (
        <AutoLayout
            direction="horizontal"
            horizontalPadding={16}
            verticalPadding={10}
            spacing={8}
            cornerRadius={6}
            fill={disabled ? '#4B5563' : '#000000'} // Gris oscuro cuando está deshabilitado
            opacity={disabled ? 0.7 : 1}
            onClick={disabled ? null : onClick}
            height={40}
            width="fill-parent"
            key="primary-button"
            hoverStyle={{ fill: disabled ? '#4B5563' : '#1F2937' }} // Estilo hover más sutil
            cursor={disabled ? 'default' : 'pointer'}

        >
            {isAnalyzing && (
                // Simulación de spinner de carga (Figma no tiene un componente spinner nativo)
                <WidgetText fill="#FFFFFF" fontSize={14} fontWeight="medium">
                    ...
                </WidgetText>
            )}
            <WidgetText fill="#FFFFFF" fontSize={14} fontWeight="medium" textAlignment="center" width="fill-parent">
                {children}
            </WidgetText>
        </AutoLayout>
    );

    // Componente de Insignia de Resultado (Badge)
    const ResultBadge = ({ text, color }: any) => (
        <AutoLayout
            direction="horizontal"
            horizontalPadding={12}
            verticalPadding={8}
            spacing={8}
            cornerRadius={8}
            fill={color}
            key="result-badge"
        >
            {/* Usamos iconos de texto ya que lucide-react no está disponible directamente */}
            <WidgetText fill="#FFFFFF" fontSize={16}>{color === '#10B981' ? '✅' : '🚨'}</WidgetText>
            <WidgetText fill="#FFFFFF" fontSize={14} fontWeight="bold">{text}</WidgetText>
        </AutoLayout>
    );


    // Renderizado principal
    return (
        <AutoLayout
            direction="vertical"
            spacing={16}
            padding={24}
            cornerRadius={12}
            fill="#FFFFFF" // Fondo blanco, simulando la Card de shadcn/ui
            stroke="#E5E7EB" // Borde gris claro
            width={320} // Ancho fijo para simular un widget compacto
        >

            {/* Encabezado del Widget */}
            <AutoLayout direction="horizontal" spacing={12} key="header" verticalAlignItems="center">
                <WidgetText fontSize={32} key="emoji">🎨</WidgetText>
                <WidgetText fontSize={18} fontWeight="bold" textTruncation="ending" key="title">
                    Comprobador de Accesibilidad
                </WidgetText>
            </AutoLayout>

            {/* Descripción */}
            <WidgetText fontSize={12} fill="#6B7280" key="description">
                Revisa el contraste de colores de una web mediante análisis automático.
            </WidgetText>

            {/* Campo de URL */}
            <AutoLayout direction="vertical" spacing={8} width="fill-parent" key="url-field">
                <WidgetText fontSize={12} fontWeight="medium" fill="#374151" key="label">
                    URL del sitio
                </WidgetText>
                <Input
                    value={url}
                    onTextEdit={setUrl}
                    placeholder="https://ejemplo.com"
                    fontSize={14}
                    fill="#F3F4F6" // Fondo de input gris claro
                    cornerRadius={6}
                    padding={{ horizontal: 12, vertical: 8 }}
                    stroke="#D1D5DB" // Borde sutil
                    key="url-input"
                />
            </AutoLayout>

            {/* Opciones Avanzadas (Botón de Toggle) */}
            <AutoLayout
                direction="horizontal"
                horizontalPadding={8}
                verticalPadding={6}
                spacing="auto" // Espacio automático para justificar
                width="fill-parent"
                cornerRadius={6}
                onClick={() => setShowAdvanced(!showAdvanced)}
                hoverStyle={{ fill: '#F3F4F6' }}
                cursor="pointer"
                key="advanced-toggle"
            >
                <WidgetText fontSize={12} fill="#6B7280" fontWeight="medium">
                    Opciones avanzadas
                </WidgetText>
                <WidgetText fontSize={12} fill="#6B7280" key="chevron">
                    {showAdvanced ? '▲' : '▼'}
                </WidgetText>
            </AutoLayout>

            {/* Contenido de Opciones Avanzadas */}
            {showAdvanced && (
                <AutoLayout direction="vertical" spacing={12} padding={12} cornerRadius={6} fill="#F9FAFB" stroke="#E5E7EB" width="fill-parent" key="advanced-content">
                    <AutoLayout direction="horizontal" spacing={8} verticalAlignItems="center">
                        <Checkbox key="checkbox-aaa" />
                        <WidgetText fontSize={12} fill="#374151">
                            Verificar cumplimiento WCAG AAA
                        </WidgetText>
                    </AutoLayout>

                    <AutoLayout direction="vertical" spacing={4} width="fill-parent">
                        <WidgetText fontSize={12} fill="#374151">Agente de usuario</WidgetText>
                        {/* En Figma, un select simple es un Input o Text que simula el desplegable */}
                        <AutoLayout
                            direction="horizontal"
                            horizontalPadding={12}
                            verticalPadding={8}
                            cornerRadius={6}
                            fill="#FFFFFF"
                            stroke="#D1D5DB"
                            spacing="auto"
                            key="user-agent-select"
                        >
                            <WidgetText fontSize={12} fill="#374151">Desktop (Chrome)</WidgetText>
                            <WidgetText fontSize={10} fill="#6B7280">▼</WidgetText>
                        </AutoLayout>
                    </AutoLayout>
                </AutoLayout>
            )}

            {/* Botón de Analizar */}
            <PrimaryButton
                onClick={handleAnalyze}
                disabled={isAnalyzing}
            >
                {isAnalyzing ? 'Analizando...' : 'Analizar accesibilidad'}
            </PrimaryButton>

            {/* Área de Resultados/Instrucciones */}
            <AutoLayout direction="vertical" spacing={12} paddingTop={8} width="fill-parent" key="results-area">
                {analysisResult ? (
                    <AutoLayout direction="vertical" spacing={12} width="fill-parent">

                        {analysisResult.passed ? (
                            <ResultBadge
                                text="Análisis Exitoso"
                                color="#10B981" // Verde (bg-green-600)
                            />
                        ) : (
                            <ResultBadge
                                text="Problemas de Accesibilidad"
                                color="#EF4444" // Rojo (bg-red-600)
                            />
                        )}

                        <WidgetText fontSize={12} fill="#374151" key="result-message">
                            {analysisResult.message}
                        </WidgetText>

                        {/* Tarjetas de Métricas */}
                        <AutoLayout direction="horizontal" spacing={12} width="fill-parent">
                            {/* Tarjeta 1: Puntuación */}
                            <AutoLayout
                                direction="vertical"
                                padding={12}
                                cornerRadius={6}
                                fill="#F9FAFB"
                                spacing={4}
                                width="fill-parent"
                            >
                                <WidgetText fontSize={10} fill="#6B7280" textAlignment="center" width="fill-parent">Puntuación</WidgetText>
                                <WidgetText fontSize={20} fontWeight="bold" fill="#1F2937" textAlignment="center" width="fill-parent">
                                    {analysisResult.score}
                                </WidgetText>
                            </AutoLayout>

                            {/* Tarjeta 2: Errores */}
                            <AutoLayout
                                direction="vertical"
                                padding={12}
                                cornerRadius={6}
                                fill="#F9FAFB"
                                spacing={4}
                                width="fill-parent"
                            >
                                <WidgetText fontSize={10} fill="#6B7280" textAlignment="center" width="fill-parent">Errores</WidgetText>
                                <WidgetText fontSize={20} fontWeight="bold" fill={analysisResult.errors > 0 ? '#EF4444' : '#10B981'} textAlignment="center" width="fill-parent">
                                    {analysisResult.errors}
                                </WidgetText>
                            </AutoLayout>
                        </AutoLayout>
                    </AutoLayout>

                ) : (
                    <AutoLayout
                        direction="vertical"
                        padding={16}
                        cornerRadius={6}
                        stroke="#D1D5DB"
                        strokeDashPattern={[4, 4]}
                        fill="#F9FAFB"
                        width="fill-parent"
                    >
                        <WidgetText fontSize={12} fill="#6B7280" textAlignment="center">
                            Introduce una URL y pulsa "Analizar" para iniciar la revisión de contraste.
                        </WidgetText>
                    </AutoLayout>
                )}
            </AutoLayout>

        </AutoLayout>
    );
};

widget.register(ColorAccessibilityCheckerWidget);
