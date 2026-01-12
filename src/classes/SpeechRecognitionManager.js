/**
 * SpeechRecognitionManager - Gerencia a transcrição de fala do usuário
 * Utiliza a WebSpeech API para capturar e transcrever áudio
 */

export class SpeechRecognitionManager {
  constructor() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('WebSpeech API não suportada neste navegador');
      this.isSupported = false;
      return;
    }

    this.isSupported = true;
    this.recognition = new SpeechRecognition();
    this.isListening = false;

    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'pt-BR';

    this.onListeningStart = null;
    this.onListeningStop = null;
    this.onCommand = null;
    this.audioContext = null;
    this.recentVolumes = [];
    this.isAudioSetup = false;

    this.setupEventListeners();
  }

  async setupAudioAnalysis() {
    if (this.isAudioSetup) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(stream);
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      this.isAudioSetup = true;
      
      const updateVolume = () => {
        if (!this.isListening) {
             requestAnimationFrame(updateVolume);
             return;
        }

        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalizedVolume = Math.max(0.1, Math.min(1.5, (average - 25) / 50)); 
        
        this.recentVolumes.push({ val: normalizedVolume, time: Date.now() });
        
        const now = Date.now();
        this.recentVolumes = this.recentVolumes.filter(v => now - v.time < 2000);
        
        requestAnimationFrame(updateVolume);
      };
      
      updateVolume();
      
    } catch (err) {
      console.error('Erro ao acessar microfone para análise de volume:', err);
    }
  }

  getPeakVolume() {
      if (!this.recentVolumes || this.recentVolumes.length === 0) return 0.5;
      return this.recentVolumes.reduce((max, curr) => Math.max(max, curr.val), 0);
  }

  setupEventListeners() {
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('🎤 Ouvindo...');
      if (this.onListeningStart) {
        this.onListeningStart();
      }
    };

    this.recognition.onresult = (event) => {
      let transcript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        transcript += transcriptSegment;
      }

      if (transcript.trim()) {
        console.log('📝 Transcrito:', transcript);
        if (this.onCommand) {
            const intensity = this.getPeakVolume();
            this.onCommand(transcript.trim(), intensity);
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error('❌ Erro no reconhecimento de voz:', event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('🎤 Parou de ouvir');
      if (this.onListeningStop) {
        this.onListeningStop();
      }
      
      this.start();
    };
  }

  start() {
    if (!this.isSupported) {
      console.error('WebSpeech API não suportada');
      return;
    }

    if (!this.isListening) {
      try {
        this.recognition.start();
        this.setupAudioAnalysis();
      } catch (e) {
      }
    }
  }

  stop() {
    if (this.isListening) {
      this.recognition.stop();
    }
  }


  toggle() {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  setLanguage(lang) {
    this.recognition.lang = lang;
  }


  getIsSupported() {
    return this.isSupported;
  }


  getIsListening() {
    return this.isListening;
  }
}
