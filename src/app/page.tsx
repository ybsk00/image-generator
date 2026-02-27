'use client';

import { useState } from 'react';
import styles from './page.module.css';
import {
  Image as ImageIcon,
  Layers,
  Sparkles,
  Wand2,
  Zap,
  Download
} from 'lucide-react';

const ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'];
const RESOLUTIONS = ['512px', '1K', '2K', '4K'];

export default function Home() {
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [resolution, setResolution] = useState('1K');
  const [searchGrounding, setSearchGrounding] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGeneratePrompt = async () => {
    if (!prompt.trim()) return;
    setIsGeneratingPrompt(true);
    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPrompt(data.prompt);
    } catch (error) {
      console.error(error);
      alert('Failed to enhance prompt: ' + String(error));
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio, resolution })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGeneratedImage(data.image);
    } catch (error) {
      console.error(error);
      alert('Failed to generate image: ' + String(error));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `NanoBanana2_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>N</div>
          <h1 className={styles.title}>
            Nano Banana <span className={styles.titleAccent}>2</span>
          </h1>
        </div>
        <button className={styles.accountBtn}>Switch Account</button>
      </header>

      {/* Main Content */}
      <main className={styles.mainLayout}>
        {/* Sidebar Controls */}
        <aside className={styles.sidebar}>

          {/* Prompt Generator Section */}
          <div className={styles.pannel}>
            <div className={styles.promptArea}>
              <textarea
                className={styles.promptInput}
                placeholder="Describe the image you want to create... (e.g., A cybernetic banana in neon city)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button
                className={styles.enhanceBtn}
                onClick={handleGeneratePrompt}
                disabled={isGeneratingPrompt || !prompt.trim()}
              >
                {isGeneratingPrompt ? <Sparkles className={`${styles.spinner}`} size={16} /> : <Wand2 size={16} />}
                {isGeneratingPrompt ? 'Enhancing...' : 'Auto Enhance Prompt'}
              </button>
            </div>
          </div>

          {/* Reference Images */}
          <div className={styles.pannel}>
            <h2 className={styles.pannelTitle}>Reference Images (Optional)</h2>
            <div className={styles.uploaderGrid}>
              <div className={styles.uploadBox}>
                <div className={styles.uploadIconWrap}>
                  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='3' y1='9' x2='21' y2='9'%3E%3C/line%3E%3Cline x1='9' y1='21' x2='9' y2='9'%3E%3C/line%3E%3C/svg%3E" alt="Structure" width="24" />
                </div>
                <div>
                  <div className={styles.uploadTitle}>Structure</div>
                  <div className={styles.uploadDesc}>Composition source</div>
                </div>
              </div>

              <div className={styles.uploadBox}>
                <div className={styles.uploadIconWrap}>
                  <Layers size={24} color="var(--text-secondary)" />
                </div>
                <div>
                  <div className={styles.uploadTitle}>Style</div>
                  <div className={styles.uploadDesc}>Vibe/Concept source</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className={styles.pannelHelpText} style={{ flex: 1 }}>
                Use this to edit an image or keep the composition/pose.
              </div>
              <div className={styles.pannelHelpText} style={{ flex: 1 }}>
                Use this to copy the art style, color, or cinematic feel.
              </div>
            </div>
          </div>

          {/* Aspect Ratio & Resolution */}
          <div className={styles.pannel}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 className={styles.pannelTitle}>Aspect Ratio</h2>
              <div className={styles.grid3}>
                {ASPECT_RATIOS.map(ratio => (
                  <button
                    key={ratio}
                    className={`${styles.optionBtn} ${aspectRatio === ratio ? styles.optionBtnActive : ''}`}
                    onClick={() => setAspectRatio(ratio)}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <h2 className={styles.pannelTitle}>Resolution</h2>
              <div className={styles.grid2}>
                {RESOLUTIONS.map(res => (
                  <button
                    key={res}
                    className={`${styles.optionBtn} ${resolution === res ? styles.optionBtnActive : ''}`}
                    onClick={() => setResolution(res)}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.toggleRow} style={{ marginTop: '8px' }}>
              <div>
                <div className={styles.toggleLabel}>Google Search Grounding</div>
                <div className={styles.pannelHelpText} style={{ marginTop: '4px' }}>
                  Use real-time information and images from Google Search to enhance generation.
                </div>
              </div>
              <div
                className={`${styles.toggleSwitch} ${searchGrounding ? styles.on : ''}`}
                onClick={() => setSearchGrounding(!searchGrounding)}
              >
                <div className={styles.toggleKnob} />
              </div>
            </div>
          </div>

          <button
            className={styles.generateBtn}
            onClick={handleGenerateImage}
            disabled={isGeneratingImage}
          >
            {isGeneratingImage ? <Sparkles className={styles.spinner} size={20} /> : <Zap size={20} />}
            {isGeneratingImage ? 'Generating...' : 'Generate'}
          </button>
        </aside>

        {/* Preview Area */}
        <section className={styles.contentArea}>
          <div className={styles.previewContainer}>
            {isGeneratingImage ? (
              <>
                <Sparkles className={styles.spinner} size={48} color="var(--accent-yellow)" />
                <div className={styles.placeholderTitle}>Creating your vision...</div>
                <div className={styles.placeholderDesc}>Hang tight! Nano Banana 2 is generating your high-fidelity image using gemini-3.1-flash-image-preview.</div>
              </>
            ) : generatedImage ? (
              <div className={styles.imageResultWrapper}>
                <img src={generatedImage} alt="Generated result" className={styles.imageResult} />
                <button className={styles.downloadBtn} onClick={handleDownload} title="Download Image">
                  <Download size={20} />
                  Download
                </button>
              </div>
            ) : (
              <>
                <div className={styles.placeholderIcon}>
                  <ImageIcon size={32} />
                </div>
                <div>
                  <div className={styles.placeholderTitle}>Ready to Create</div>
                  <div className={styles.placeholderDesc} style={{ marginTop: '8px', margin: '0 auto' }}>
                    Enter a prompt and optionally upload references (Structure or Style) to generate high-fidelity visuals.
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
