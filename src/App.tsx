import { useState } from 'react';
import './App.css';

// Types
interface AnalysisResult {
  passed: boolean;
  message: string;
  score: string;
  errors: number;
}

function App() {
  // State
  const [url, setUrl] = useState('https://tusitio.com');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handlers
  const handleAnalyze = () => {
    if (!url || !url.startsWith('http')) {
      alert('Por favor, introduce una URL válida que empiece por http:// o https://');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Simulation
    setTimeout(() => {
      setIsAnalyzing(false);
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

  return (
    <div className="widget-container">
      {/* Header */}
      <div className="header">
        <span className="emoji">🎨</span>
        <h1 className="title">Comprobador de Accesibilidad</h1>
      </div>

      {/* Description */}
      <p className="description">
        Revisa el contraste de colores de una web mediante análisis automático.
      </p>

      {/* URL Field */}
      <div className="field-group">
        <label className="label">URL del sitio</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://ejemplo.com"
          className="input"
        />
      </div>

      {/* Advanced Toggle */}
      <div
        className="advanced-toggle"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        <span>Opciones avanzadas</span>
        <span>{showAdvanced ? '▲' : '▼'}</span>
      </div>

      {/* Advanced Content */}
      {showAdvanced && (
        <div className="advanced-content">
          <div className="checkbox-row">
            <input type="checkbox" id="aaa" />
            <label htmlFor="aaa">Verificar cumplimiento WCAG AAA</label>
          </div>

          <div className="field-group">
            <label className="label">Agente de usuario</label>
            <div className="select-fake">
              <span>Desktop (Chrome)</span>
              <span className="chevron">▼</span>
            </div>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      <button
        className="primary-button"
        onClick={handleAnalyze}
        disabled={isAnalyzing}
      >
        {isAnalyzing && <span className="spinner">...</span>}
        {isAnalyzing ? 'Analizando...' : 'Analizar accesibilidad'}
      </button>

      {/* Results Area */}
      <div className="results-area">
        {analysisResult ? (
          <div className="results-content">
            <div className={`result-badge ${analysisResult.passed ? 'success' : 'error'}`}>
              <span className="icon">{analysisResult.passed ? '✅' : '🚨'}</span>
              <span className="text">{analysisResult.passed ? 'Análisis Exitoso' : 'Problemas de Accesibilidad'}</span>
            </div>

            <p className="result-message">
              {analysisResult.message}
            </p>

            <div className="metrics-row">
              <div className="metric-card">
                <span className="metric-label">Puntuación</span>
                <span className="metric-value">{analysisResult.score}</span>
              </div>

              <div className="metric-card">
                <span className="metric-label">Errores</span>
                <span className={`metric-value ${analysisResult.errors > 0 ? 'text-error' : 'text-success'}`}>
                  {analysisResult.errors}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Introduce una URL y pulsa "Analizar" para iniciar la revisión de contraste.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
