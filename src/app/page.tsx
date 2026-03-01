'use client';

import { useState } from 'react';
import styles from './page.module.css';
import {
  Image as ImageIcon,
  Layers,
  Sparkles,
  Wand2,
  Zap,
  Download,
  MessageSquarePlus,
  X,
  Upload
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

  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [ideaDescription, setIdeaDescription] = useState('');
  const [isGeneratingFromIdea, setIsGeneratingFromIdea] = useState(false);

  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceType, setReferenceType] = useState<'subject' | 'style' | 'none'>('none');

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result as string);
      if (referenceType === 'none') {
        setReferenceType('subject');
      }
    };
    reader.readAsDataURL(file);
  };

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

  const handleGenerateFromIdea = async () => {
    if (!ideaDescription.trim()) return;
    setIsGeneratingFromIdea(true);
    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: ideaDescription })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPrompt(data.prompt);
      setIsPromptModalOpen(false);
      setIdeaDescription('');
    } catch (error) {
      console.error(error);
      alert('Failed to generate prompt: ' + String(error));
    } finally {
      setIsGeneratingFromIdea(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio, resolution, referenceImage, referenceType })
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
              <div className={styles.actionRow}>
                <button
                  className={`${styles.enhanceBtn} ${styles.outlineBtn}`}
                  onClick={() => setIsPromptModalOpen(true)}
                >
                  <MessageSquarePlus size={16} />
                  프롬프트 생성
                </button>
                <button
                  className={styles.enhanceBtn}
                  onClick={handleGeneratePrompt}
                  disabled={isGeneratingPrompt || !prompt.trim()}
                >
                  {isGeneratingPrompt ? <Sparkles className={`${styles.spinner}`} size={16} /> : <Wand2 size={16} />}
                  {isGeneratingPrompt ? 'Enhancing...' : 'Auto Enhance'}
                </button>
              </div>
            </div>
          </div>

          {/* Reference Images */}
          <div className={styles.pannel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className={styles.pannelTitle}>Reference Images (Optional)</h2>
              <label className={styles.pannelHelpText} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '16px', border: '1px solid var(--border-light)', color: 'white' }}>
                <Upload size={14} />
                <span>Upload Image</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
            {referenceImage ? (
              <div style={{ marginTop: '12px', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '12px', position: 'relative', backgroundColor: 'var(--bg-secondary)' }}>
                <button
                  onClick={() => { setReferenceImage(null); setReferenceType('none'); }}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', color: 'white' }}
                  title="Remove image"
                >
                  <X size={16} />
                </button>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <img src={referenceImage} alt="Reference" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <div className={styles.uploadTitle}>Reference Type</div>
                    <div className={styles.grid2}>
                      <button
                        className={`${styles.optionBtn} ${referenceType === 'subject' ? styles.optionBtnActive : ''}`}
                        onClick={() => setReferenceType('subject')}
                      >
                        인물/상품 유지 (Subject)
                      </button>
                      <button
                        className={`${styles.optionBtn} ${referenceType === 'style' ? styles.optionBtnActive : ''}`}
                        onClick={() => setReferenceType('style')}
                      >
                        스타일 유지 (Style)
                      </button>
                    </div>
                    <div className={styles.pannelHelpText} style={{ marginTop: '4px' }}>
                      {referenceType === 'subject' ? 'The generated image will feature the exact person/product from the uploaded image.' : 'The generated image will follow the colors and artistic style of the uploaded image.'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.uploaderGrid} style={{ marginTop: '12px' }}>
                  <div className={styles.uploadBox}>
                    <div className={styles.uploadIconWrap}>
                      <ImageIcon size={24} color="var(--text-secondary)" />
                    </div>
                    <div>
                      <div className={styles.uploadTitle}>Subject</div>
                      <div className={styles.uploadDesc}>Keep character/product</div>
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
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <div className={styles.pannelHelpText} style={{ flex: 1 }}>
                    Use an image to strictly maintain the identity of a subject.
                  </div>
                  <div className={styles.pannelHelpText} style={{ flex: 1 }}>
                    Use an image to copy the art style, color, or cinematic feel.
                  </div>
                </div>
              </>
            )}
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
      {/* Prompt Generation Modal */}
      {isPromptModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>프롬프트 생성</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setIsPromptModalOpen(false)}
                disabled={isGeneratingFromIdea}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalDesc}>
                생성하고 싶은 이미지를 자유롭게 적어주세요. (예: 피부과에 들어갈 히어로섹션 이미지, 고급스러운 분위기, 여자 모델)
              </p>
              <textarea
                className={styles.modalInput}
                placeholder="이미지를 구체적으로 묘사해보세요..."
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsPromptModalOpen(false)}
                disabled={isGeneratingFromIdea}
              >
                취소
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleGenerateFromIdea}
                disabled={isGeneratingFromIdea || !ideaDescription.trim()}
              >
                {isGeneratingFromIdea ? <Sparkles className={styles.spinner} size={16} /> : <Wand2 size={16} />}
                {isGeneratingFromIdea ? '생성 중...' : '생성하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
