import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface CinematicGeneratorProps {
  onClose: () => void;
}

const DEFAULT_PROMPT =
  'Crie uma cena cinematográfica suave com deslocamento de câmera, luz volumétrica e sensação de tensão tática.';

const joinKeyToUri = (uri: string, apiKey: string) =>
  `${uri}${uri.includes('?') ? '&' : '?'}key=${encodeURIComponent(apiKey)}`;

const CinematicGenerator: React.FC<CinematicGeneratorProps> = ({ onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY ?? '');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (generatedVideoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(generatedVideoUrl);
      }
    };
  }, [generatedVideoUrl]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const requestApiKeyFromBridge = async () => {
    if (!window.aistudio) return false;
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) await window.aistudio.openSelectKey();
    return true;
  };

  const startGeneration = async () => {
    if (!selectedImage) {
      setError('Selecione uma imagem antes de iniciar.');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGeneratedVideoUrl((previous) => {
      if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
      return null;
    });

    try {
      let effectiveApiKey = apiKey.trim();
      if (!effectiveApiKey) {
        const bridgeHandled = await requestApiKeyFromBridge();
        if (!bridgeHandled) {
          throw new Error('Informe uma API Key Gemini válida para gerar vídeo.');
        }
        effectiveApiKey = apiKey.trim();
      }

      const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
      const [meta, base64Data] = selectedImage.split(',');
      const mimeType = meta?.split(';')[0]?.split(':')[1] || 'image/png';

      setStatus('Enviando quadro de referência...');
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt.trim() || DEFAULT_PROMPT,
        image: {
          imageBytes: base64Data,
          mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio,
        },
      });

      const progressMessages = [
        'Analisando composição da cena...',
        'Aplicando dinâmica temporal...',
        'Refinando continuidade visual...',
        'Renderizando sequência final...',
      ];

      let messageIndex = 0;
      while (!operation.done) {
        setStatus(progressMessages[messageIndex % progressMessages.length]);
        messageIndex += 1;
        await new Promise((resolve) => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) {
        throw new Error('A API concluiu sem retornar URL de vídeo.');
      }

      setStatus('Fazendo download seguro da sequência...');
      const response = await fetch(joinKeyToUri(downloadLink, effectiveApiKey));
      if (!response.ok) throw new Error('Falha no download do vídeo gerado.');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setGeneratedVideoUrl(objectUrl);
      setStatus('Sequência renderizada com sucesso.');
    } catch (generationError: any) {
      setError(generationError?.message || 'Erro inesperado ao gerar sequência.');
      setStatus('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="overlay-root" role="dialog" aria-modal="true" aria-label="Gerador cinematográfico">
      <div className="overlay-card cinematic-modal">
        <header className="overlay-header">
          <div>
            <p>Cinematic Engine</p>
            <h2>Gerador de Sequência</h2>
          </div>
          <button type="button" onClick={onClose} className="ghost-btn">
            Fechar
          </button>
        </header>

        <div className="cinematic-grid">
          <section className="cinematic-controls">
            <label className="field-label">API Key Gemini</label>
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Cole sua API Key"
              className="field-input"
            />

            <label className="field-label">Prompt</label>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="field-input field-area"
              maxLength={340}
            />

            <label className="field-label">Aspect Ratio</label>
            <div className="ratio-grid">
              <button
                type="button"
                className={aspectRatio === '16:9' ? 'pill-btn selected' : 'pill-btn'}
                onClick={() => setAspectRatio('16:9')}
              >
                Paisagem 16:9
              </button>
              <button
                type="button"
                className={aspectRatio === '9:16' ? 'pill-btn selected' : 'pill-btn'}
                onClick={() => setAspectRatio('9:16')}
              >
                Retrato 9:16
              </button>
            </div>

            <button type="button" onClick={() => fileInputRef.current?.click()} className="secondary-btn">
              {selectedImage ? 'Trocar Imagem' : 'Selecionar Imagem'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />

            <button
              type="button"
              className="primary-btn"
              onClick={startGeneration}
              disabled={isGenerating || !selectedImage}
            >
              {isGenerating ? 'Gerando...' : 'Gerar Vídeo'}
            </button>

            {status ? <p className="status-message">{status}</p> : null}
            {error ? <p className="error-message">{error}</p> : null}
          </section>

          <section className="cinematic-preview">
            {generatedVideoUrl ? (
              <video src={generatedVideoUrl} controls autoPlay loop className="preview-video" />
            ) : selectedImage ? (
              <img src={selectedImage} alt="Prévia" className="preview-image" />
            ) : (
              <p>Selecione uma imagem para iniciar.</p>
            )}
            {generatedVideoUrl ? (
              <a href={generatedVideoUrl} download="gesturestrike-cinematic.mp4" className="secondary-btn">
                Download MP4
              </a>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CinematicGenerator;
