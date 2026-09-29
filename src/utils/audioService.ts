/**
 * Audio and Speech Synthesis helper
 * Supports browser Web Speech API (zero latency, offline) + optional Gemini High-Quality TTS
 */

export class AudioService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static cachedVoice: SpeechSynthesisVoice | null = null;
  private static currentAudioElement: HTMLAudioElement | null = null;

  /**
   * Get an English voice from the browser's available speech synthesis voices
   */
  public static getEnglishVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    if (this.cachedVoice) return this.cachedVoice;

    const voices = this.synth.getVoices();
    // Prefer natural / Google / en-US voices
    const enVoice = voices.find(
      (v) => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('US')))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (enVoice) {
      this.cachedVoice = enVoice;
    }
    return enVoice || null;
  }

  /**
   * Stop any current playback
   */
  public static stopAll() {
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
  }

  /**
   * Pronounce text using SpeechSynthesis with custom rate (default 0.9 for clarity)
   */
  public static speakText(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): Promise<void> {
    return new Promise((resolve) => {
      this.stopAll();

      if (!this.synth) {
        console.warn('SpeechSynthesis is not supported in this browser.');
        options?.onEnd?.();
        resolve();
        return;
      }

      // Resume synth in case of browser pause state
      if (this.synth.paused) {
        this.synth.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = options?.rate ?? 0.88; // Slightly slower for language learners
      utterance.pitch = options?.pitch ?? 1.0;

      const voice = this.getEnglishVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        options?.onStart?.();
      };

      utterance.onend = () => {
        options?.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        options?.onError?.(e);
        options?.onEnd?.();
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  /**
   * Play Gemini studio generated audio from base64
   */
  public static async playBase64Audio(
    base64Data: string,
    format: string = 'audio/wav',
    onEnd?: () => void
  ): Promise<void> {
    this.stopAll();
    const audio = new Audio(`data:${format};base64,${base64Data}`);
    this.currentAudioElement = audio;

    return new Promise((resolve) => {
      audio.onended = () => {
        this.currentAudioElement = null;
        onEnd?.();
        resolve();
      };
      audio.onerror = () => {
        this.currentAudioElement = null;
        onEnd?.();
        resolve();
      };
      audio.play().catch((err) => {
        console.warn('Audio play failed:', err);
        onEnd?.();
        resolve();
      });
    });
  }

  /**
   * Helper to format seconds to MM:SS
   */
  public static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Trigger local audio download with SENA standard file naming
   */
  public static downloadAudioBlob(blob: Blob, name: string = 'APPRENTICE', ficha: string = '0000000') {
    const cleanName = (name || 'APRENDIZ').trim().replace(/[^a-zA-Z0-9_-]/g, '_').toUpperCase();
    const cleanFicha = (ficha || 'FICHA').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `GA3-240202501-AA1-EV02_${cleanName}_${cleanFicha}.wav`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
