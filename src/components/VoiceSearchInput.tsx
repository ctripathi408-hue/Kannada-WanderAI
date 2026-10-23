import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Search, 
  Sparkles, 
  AlertCircle, 
  X, 
  Globe, 
  Check, 
  Volume2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type VoiceLanguage = 'en-IN' | 'kn-IN' | 'hi-IN';

export interface LanguageOption {
  code: VoiceLanguage;
  name: string;
  nativeName: string;
  flag: string;
  samplePhrase: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en-IN',
    name: 'English',
    nativeName: 'English (India)',
    flag: '🇮🇳',
    samplePhrase: 'e.g. "5 days heritage trip to Hampi and Mysuru with vegetarian food"'
  },
  {
    code: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ (Karnataka)',
    flag: '💛❤️',
    samplePhrase: 'ಉದಾ: "ಮೈಸೂರು ಮತ್ತು ಕೂರ್ಗ್ ೩ ದಿನಗಳ ಪ್ರವಾಸ ಯೋಜನೆ"'
  },
  {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी (India)',
    flag: '🇮🇳',
    samplePhrase: 'उदा: "हम्पी और गोकर्ण की ५ दिन की ट्रिप प्लान करें"'
  }
];

interface VoiceSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputId?: string;
  showSubmitButton?: boolean;
  submitButtonText?: string;
  onLanguageChange?: (lang: VoiceLanguage | null) => void;
  selectedLanguage?: VoiceLanguage | null;
  onLiveTranscript?: (transcript: string) => void;
  onVoiceEnd?: (finalTranscript: string, lang: VoiceLanguage) => void;
  variant?: 'hero' | 'compact';
}

export const VoiceSearchInput: React.FC<VoiceSearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  className = '',
  inputId = 'trip-search-input',
  showSubmitButton = true,
  submitButtonText = 'Plan Trip',
  onLanguageChange,
  selectedLanguage: externalLanguage,
  onLiveTranscript,
  onVoiceEnd,
  variant = 'hero'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [currentLang, setCurrentLang] = useState<VoiceLanguage | null>(externalLanguage ?? null);
  const pendingListenOnLangSelectRef = useRef(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [unsupportedWarning, setUnsupportedWarning] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  
  const recognitionRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const interimTranscriptRef = useRef('');
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onVoiceEndRef = useRef(onVoiceEnd);
  const spokeInSessionRef = useRef(false);

  useEffect(() => {
    onVoiceEndRef.current = onVoiceEnd;
  }, [onVoiceEnd]);

  // Keep refs up to date
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Check browser support on mount
  useEffect(() => {
    const supported = typeof window !== 'undefined' &&
      Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    setIsSpeechSupported(supported);
  }, []);

  // Sync external language if controlled
  useEffect(() => {
    if (externalLanguage !== undefined) {
      setCurrentLang(externalLanguage);
    }
  }, [externalLanguage]);

  // Click outside to close language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const handleLanguageSelect = (lang: VoiceLanguage) => {
    setCurrentLang(lang);
    setIsLangDropdownOpen(false);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }

    if (pendingListenOnLangSelectRef.current) {
      pendingListenOnLangSelectRef.current = false;
      setTimeout(() => {
        startListening(lang);
      }, 50);
    } else if (isListening && recognitionRef.current) {
      // If currently listening, restart recognition with new language
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  };

  const startListening = (langOverride?: VoiceLanguage) => {
    setMicError(null);
    setUnsupportedWarning(null);

    const activeLanguage = langOverride || currentLang || 'en-IN';

    // Check Web Speech API browser compatibility
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setUnsupportedWarning(
        "Voice speech recognition isn't supported in this browser. We recommend Google Chrome, Microsoft Edge, or Safari. You can still type your trip request directly or select one of the quick suggestions below."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = activeLanguage;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
        interimTranscriptRef.current = '';
        spokeInSessionRef.current = false;
      };

      recognition.onresult = (event: any) => {
        let liveInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const transcriptText = item[0].transcript;

          if (item.isFinal) {
            finalChunk += transcriptText;
          } else {
            liveInterim += transcriptText;
          }
        }

        interimTranscriptRef.current = liveInterim;

        if (liveInterim || finalChunk) {
          spokeInSessionRef.current = true;
        }

        if (liveInterim) {
          setInterimTranscript(liveInterim);
          if (onLiveTranscript) {
            onLiveTranscript(liveInterim);
          }
        }

        if (finalChunk) {
          const currentVal = valueRef.current;
          const updatedValue = currentVal ? `${currentVal.trim()} ${finalChunk.trim()}` : finalChunk.trim();
          onChangeRef.current(updatedValue);
          setInterimTranscript('');
          interimTranscriptRef.current = '';
          if (onLiveTranscript) {
            onLiveTranscript('');
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError('Microphone permission was denied. Please allow microphone access in your browser settings to use voice search.');
        } else if (event.error === 'no-speech') {
          // Timeout with no speech detected
          setMicError('No speech was detected. Tap the microphone button and speak clearly into your device.');
        } else if (event.error === 'network') {
          setMicError('Network issue encountered during speech recognition. Please check your internet connection.');
        } else {
          setMicError(`Voice recognition encountered an issue (${event.error}). You can continue by typing your request.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Commit any lingering interim transcript before resetting
        let finalRecordedValue = valueRef.current;
        if (interimTranscriptRef.current) {
          const currentVal = valueRef.current;
          finalRecordedValue = currentVal ? `${currentVal.trim()} ${interimTranscriptRef.current.trim()}` : interimTranscriptRef.current.trim();
          onChangeRef.current(finalRecordedValue);
          setInterimTranscript('');
          interimTranscriptRef.current = '';
        }

        if (spokeInSessionRef.current && onVoiceEndRef.current && finalRecordedValue?.trim()) {
          onVoiceEndRef.current(finalRecordedValue.trim(), currentLang || 'en-IN');
        }
        spokeInSessionRef.current = false;
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to initialize speech recognition:', err);
      setMicError('Could not start microphone. Please check permissions or type your trip request.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    let finalRecordedValue = valueRef.current;
    if (interimTranscriptRef.current) {
      const currentVal = valueRef.current;
      finalRecordedValue = currentVal ? `${currentVal.trim()} ${interimTranscriptRef.current.trim()}` : interimTranscriptRef.current.trim();
      onChangeRef.current(finalRecordedValue);
      setInterimTranscript('');
      interimTranscriptRef.current = '';
    }

    if (spokeInSessionRef.current && onVoiceEndRef.current && finalRecordedValue?.trim()) {
      onVoiceEndRef.current(finalRecordedValue.trim(), currentLang || 'en-IN');
    }
    spokeInSessionRef.current = false;
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      return;
    }

    if (!currentLang) {
      // Tap mic before choosing a language: open dropdown first and listen after selection
      setIsLangDropdownOpen(true);
      pendingListenOnLangSelectRef.current = true;
      return;
    }

    startListening(currentLang);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSubmit) {
        onSubmit(value);
      }
    }
  };

  const currentLangObj = currentLang
    ? SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || null
    : null;

  const defaultPlaceholder = currentLang === 'kn-IN'
    ? 'ಉದಾ: 5 ದಿನಗಳ ಹಂಪಿ ಮತ್ತು ಕೂರ್ಗ್ ಪ್ರವಾಸ, ಸಸ್ಯಹಾರಿ ಊಟ...'
    : currentLang === 'hi-IN'
    ? 'उदा: 5 दिन की हम्पी और कूर्ग यात्रा, शुद्ध शाकाहारी खाना...'
    : currentLang === 'en-IN'
    ? 'e.g. 5 days in Hampi and Coorg with temple visits, coffee estates and vegetarian food...'
    : 'Search or tap mic to speak: e.g. "Hampi ge 2 days, budget kammi"...';

  return (
    <div className={`w-full relative z-50 ${className}`} style={{ zIndex: 50 }}>
      {/* Unsupported Browser Friendly Banner */}
      <AnimatePresence>
        {unsupportedWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/90 border border-amber-200/90 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 shadow-lg backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <span className="font-bold block text-sm">Browser Speech Recognition Notice</span>
                  <p className="leading-relaxed text-amber-800 dark:text-amber-300">
                    {unsupportedWarning}
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[11px] text-amber-900 dark:text-amber-200">
                      Tap a suggestion to test planning:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onChange('5 days heritage trip to Hampi and Mysuru with vegetarian food');
                        setUnsupportedWarning(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-100/90 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-[11px] font-medium text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700 transition-colors cursor-pointer"
                    >
                      🇮🇳 English: Hampi &amp; Mysuru
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChange('ಮೈಸೂರು ಮತ್ತು ಕೂರ್ಗ್ ೩ ದಿನಗಳ ಪ್ರವಾಸ ಯೋಜನೆ');
                        setUnsupportedWarning(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-100/90 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-[11px] font-medium text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700 transition-colors cursor-pointer"
                    >
                      💛❤️ ಕನ್ನಡ: ಮೈಸೂರು ಮತ್ತು ಕೂರ್ಗ್
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChange('हम्पी और गोकर्ण की ५ दिन की ट्रिप प्लान करें');
                        setUnsupportedWarning(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-100/90 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-[11px] font-medium text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700 transition-colors cursor-pointer"
                    >
                      🇮🇳 हिन्दी: हम्पी और गोकर्ण
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUnsupportedWarning(null)}
                className="p-1 text-amber-700 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-100 rounded-lg hover:bg-amber-100/60 dark:hover:bg-amber-900/60 transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Microphone Permission / Error Alert */}
      <AnimatePresence>
        {micError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between gap-3 shadow-md backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <MicOff className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{micError}</span>
            </div>
            <button
              type="button"
              onClick={() => setMicError(null)}
              className="p-1 text-rose-700 dark:text-rose-400 hover:text-rose-950 dark:hover:text-white rounded-lg hover:bg-rose-100/60 dark:hover:bg-rose-900/60 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss microphone error"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Search Box with Language Selector and Microphone Button */}
      <div
        className={`relative flex items-center rounded-2xl transition-all duration-300 ${
          variant === 'hero'
            ? 'p-2 sm:p-2.5 bg-white/95 dark:bg-slate-900/95 border-2 border-emerald-500/40 dark:border-emerald-500/40 shadow-2xl shadow-emerald-950/20 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/20'
            : 'p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20'
        } ${isListening ? 'ring-4 ring-rose-500/30 border-rose-500 dark:border-rose-500 animate-pulse' : ''}`}
      >
        {/* Left Search Icon */}
        <div className="pl-3 pr-2 text-slate-400 dark:text-slate-500 shrink-0 flex items-center">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>

        {/* Search Input Box */}
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          className={`flex-1 min-w-0 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden font-medium ${
            variant === 'hero' ? 'text-sm sm:text-base py-2.5 px-2' : 'text-xs sm:text-sm py-2 px-2'
          }`}
          aria-label="Trip Search and Voice Request Input"
        />

        {/* Clear Button if text exists */}
        {value && !isListening && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-1 cursor-pointer"
            aria-label="Clear input text"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Language Selector Dropdown */}
        <div className="relative shrink-0 z-[100]" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-2xs pointer-events-auto"
            title={currentLangObj ? `Voice language: ${currentLangObj.name}` : 'Select language'}
            aria-label={currentLangObj ? `Voice language selected: ${currentLangObj.name}. Click to change.` : 'Select language'}
            aria-expanded={isLangDropdownOpen}
          >
            {currentLangObj ? (
              <>
                <span className="text-sm leading-none">{currentLangObj.flag}</span>
                <span className="hidden sm:inline font-heading">{currentLangObj.name}</span>
                <span className="sm:hidden font-heading text-[11px]">{currentLang?.split('-')[0].toUpperCase()}</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="font-heading">Select language</span>
              </>
            )}
          </button>

          {/* Language Menu */}
          <AnimatePresence>
            {isLangDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-2 z-[100] pointer-events-auto space-y-1"
                style={{ zIndex: 100 }}
              >
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  Voice Input Language
                </div>

                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = Boolean(currentLang && lang.code === currentLang);
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`w-full pointer-events-auto flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{lang.flag}</span>
                        <div>
                          <span className="block font-heading leading-tight">{lang.nativeName}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{lang.name} ({lang.code})</span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Microphone Button with Pulsing Wave Animation */}
        <div className="relative shrink-0 ml-1.5">
          {/* Pulsing Ripple Rings while recording */}
          {isListening && (
            <>
              <span className="absolute -inset-1 rounded-2xl bg-rose-500/40 animate-ping pointer-events-none" />
              <span className="absolute -inset-2 rounded-2xl bg-rose-500/20 animate-pulse pointer-events-none" />
            </>
          )}

          <button
            type="button"
            onClick={handleMicClick}
            className={`relative flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer shadow-md ${
              variant === 'hero' ? 'w-11 h-11 sm:w-12 sm:h-12' : 'w-9 h-9 sm:w-10 sm:h-10'
            } ${
              isListening
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-500/50 scale-105 ring-2 ring-white/80'
                : 'bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white hover:scale-105 active:scale-95'
            }`}
            title={isListening ? 'Stop voice recording' : (currentLangObj ? `Speak in ${currentLangObj.nativeName}` : 'Select a language to speak')}
            aria-label={isListening ? 'Stop voice recording' : (currentLangObj ? `Listen with Web Speech API in ${currentLangObj.name}` : 'Select language and listen')}
          >
            {isListening ? (
              <div className="flex items-center justify-center gap-0.5">
                {/* Animated Voice Equalizer Wave Bars */}
                <span className="w-1 h-3.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-3 bg-white rounded-full animate-bounce" />
              </div>
            ) : (
              <Mic className={variant === 'hero' ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-4 h-4 sm:w-5 sm:h-5'} />
            )}
          </button>
        </div>

        {/* Submit / Plan Button (optional in hero) */}
        {showSubmitButton && onSubmit && (
          <button
            type="button"
            onClick={() => onSubmit(value)}
            disabled={!value.trim()}
            className="ml-2 hidden sm:flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs sm:text-sm font-heading font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{submitButtonText}</span>
          </button>
        )}
      </div>

      {/* Live Transcript & Recording Status Strip */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mt-2.5 p-3.5 rounded-2xl bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-xl border border-rose-500/40 shadow-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-rose-300 uppercase tracking-wider text-[11px]">
                  Listening in {currentLangObj ? currentLangObj.nativeName : 'selected language'}:
                </span>
                <span className="text-slate-100 font-medium italic">
                  {interimTranscript ? `"${interimTranscript}"` : 'Speak your trip idea... (e.g. 5 days in Hampi and Coorg)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="text-[10px] text-slate-400 hidden xs:inline">Tap mic to stop</span>
              <button
                type="button"
                onClick={stopListening}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] transition-colors cursor-pointer"
              >
                Done
              </button>
              {onSubmit && (value || interimTranscript) && (
                <button
                  type="button"
                  onClick={() => {
                    const text = (value ? `${value} ${interimTranscript}` : interimTranscript).trim();
                    stopListening();
                    onSubmit(text);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Use &amp; Plan</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Quick Suggestions Hint */}
      {!isListening && variant === 'hero' && (
        <div className="mt-2.5 flex flex-wrap items-center justify-between text-[11px] text-slate-300/80 px-2 gap-2">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Voice Search supported in English, ಕನ್ನಡ, and हिन्दी</span>
          </div>
          {currentLangObj ? (
            <button
              type="button"
              onClick={() => {
                const cleanText = currentLangObj.samplePhrase
                  .replace(/^(e\.g\.\s*|ಉದಾ:\s*|उदा:\s*)/i, '')
                  .replace(/^"|"$/g, '');
                onChange(cleanText);
              }}
              className="hidden sm:inline text-slate-300 hover:text-white underline decoration-dotted transition-colors cursor-pointer text-left"
              title="Click to use this sample trip request"
            >
              {currentLangObj.samplePhrase}
            </button>
          ) : (
            <span className="hidden sm:inline text-slate-400">
              Tap mic to choose language &amp; speak
            </span>
          )}
        </div>
      )}
    </div>
  );
};
