import { useState } from 'react';
import axios from 'axios';
import { useFuturisticSound } from '../hooks/useFuturisticSound';

interface Metadata {
  title: string;
  short_description: string;
  full_description: string;
  keywords: string;
}

interface MetadataTranslatorProps {
  originalMetadata: Metadata;
}

const LANGUAGES = [
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'zh', name: 'Chinese (Simplified)' },
];

export default function MetadataTranslator({ originalMetadata }: MetadataTranslatorProps) {
  const { playClick, playHover } = useFuturisticSound();
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [translations, setTranslations] = useState<Record<string, Metadata> | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const toggleLang = (code: string) => {
    if (selectedLangs.includes(code)) {
      setSelectedLangs(selectedLangs.filter(l => l !== code));
    } else {
      setSelectedLangs([...selectedLangs, code]);
    }
  };

  const handleTranslate = async () => {
    if (selectedLangs.length === 0) return;
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/ai/translate-metadata', {
        metadata: originalMetadata,
        languages: selectedLangs
      });
      
      setTranslations(response.data.translations);
      if (selectedLangs.length > 0) {
        setActiveTab(selectedLangs[0]);
      }
    } catch (error) {
      console.error('Translation failed', error);
      alert('Failed to translate metadata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 border border-cyber-purple/50 bg-cyber-black/50 p-6 rounded-xl backdrop-blur-md shadow-glass">
      <h4 className="text-lg font-orbitron font-bold text-cyber-blue mb-4 drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]">UNIVERSAL TRANSLATOR</h4>
      <p className="text-sm text-cyber-blue/70 font-rajdhani mb-4">SELECT TARGET SECTORS FOR LOCALIZATION //</p>
      
      {/* Language Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {LANGUAGES.map((lang) => (
          <label key={lang.code} className={`flex items-center p-3 border cursor-pointer transition-all rounded ${selectedLangs.includes(lang.code) ? 'bg-cyber-purple/20 border-cyber-purple shadow-neon-purple' : 'bg-black/50 border-cyber-purple/30 hover:border-cyber-blue/50'}`}>
            <input
              type="checkbox"
              className="hidden"
              checked={selectedLangs.includes(lang.code)}
              onChange={() => { playClick(); toggleLang(lang.code); }}
            />
            <div className={`w-4 h-4 border ${selectedLangs.includes(lang.code) ? 'bg-cyber-purple border-cyber-purple' : 'border-cyber-purple/50'} mr-2 transition-all`}></div>
            <span className={`text-xs font-rajdhani font-bold ${selectedLangs.includes(lang.code) ? 'text-cyber-purple' : 'text-gray-400'}`}>{lang.name}</span>
          </label>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={() => { playClick(); handleTranslate(); }}
        onMouseEnter={playHover}
        disabled={loading || selectedLangs.length === 0}
        className="mb-6 cyber-button w-full sm:w-auto"
      >
        {loading ? 'TRANSLATING DATA...' : `TRANSLATE TO ${selectedLangs.length} REGION${selectedLangs.length !== 1 ? 'S' : ''}`}
      </button>

      {/* Results */}
      {translations && (
        <div className="bg-cyber-black/80 border border-cyber-blue/30 rounded-lg overflow-hidden shadow-glass">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-cyber-blue/30 bg-black/50 scrollbar-hide">
            {Object.keys(translations).map((langCode) => {
              const langName = LANGUAGES.find(l => l.code === langCode)?.name || langCode;
              return (
                <button
                  key={langCode}
                  onClick={() => { playClick(); setActiveTab(langCode); }}
                  className={`px-4 py-3 text-xs font-orbitron font-bold whitespace-nowrap transition-colors ${
                    activeTab === langCode
                      ? 'bg-cyber-blue/20 text-cyber-blue border-b-2 border-cyber-blue'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {langName}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab && translations[activeTab] && (
              <div className="space-y-4 font-tech text-sm">
                <div>
                  <span className="text-cyber-purple text-xs font-orbitron block mb-1">TITLE</span>
                  <div className="p-2 bg-black/50 border border-cyber-purple/30 rounded text-gray-300">
                    {translations[activeTab].title}
                  </div>
                </div>
                <div>
                  <span className="text-cyber-purple text-xs font-orbitron block mb-1">SHORT DESCRIPTION</span>
                  <div className="p-2 bg-black/50 border border-cyber-purple/30 rounded text-gray-300">
                    {translations[activeTab].short_description}
                  </div>
                </div>
                <div>
                  <span className="text-cyber-purple text-xs font-orbitron block mb-1">FULL DESCRIPTION</span>
                  <div className="p-2 bg-black/50 border border-cyber-purple/30 rounded text-gray-300 h-32 overflow-y-auto custom-scrollbar">
                    {translations[activeTab].full_description}
                  </div>
                </div>
                <div>
                  <span className="text-cyber-purple text-xs font-orbitron block mb-1">KEYWORDS</span>
                  <div className="p-2 bg-black/50 border border-cyber-purple/30 rounded text-gray-300">
                    {translations[activeTab].keywords}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
