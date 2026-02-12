import { useState } from 'react';
import axios from 'axios';
import { useFuturisticSound } from '../hooks/useFuturisticSound';

export default function ScreenshotFramer() {
  const { playClick, playHover } = useFuturisticSound();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#3b82f6'); // Default blue
  const [textColor, setTextColor] = useState('#ffffff');
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFrame = async () => {
    if (!file) {
      setError('Please select a screenshot first.');
      return;
    }
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('screenshot', file);
    formData.append('platform', platform);
    formData.append('backgroundColor', backgroundColor);
    formData.append('caption', caption);
    formData.append('textColor', textColor);

    try {
      const response = await axios.post('http://localhost:3000/api/images/frame', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data.framedPath); 
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to frame screenshot');
      } else {
        setError('Failed to frame screenshot');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 border border-cyber-purple/50 bg-cyber-black/50 p-6 rounded-xl backdrop-blur-md shadow-glass">
      <h4 className="text-lg font-orbitron font-bold text-cyber-blue mb-4 drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]">FRAME EDITOR</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          
          {/* File Input */}
          <div>
            <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-blue mb-2">RAW SCREENSHOT</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => { playClick(); setFile(e.target.files ? e.target.files[0] : null); }}
              className="block w-full text-sm text-cyber-blue border border-cyber-purple/50 rounded bg-black/50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-orbitron file:bg-cyber-purple/20 file:text-cyber-purple hover:file:bg-cyber-purple/40 cursor-pointer"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-blue mb-2">TARGET SYSTEM</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as 'ios' | 'android')}
              className="cyber-input w-full"
            >
              <option value="ios">iOS (1242 x 2688)</option>
              <option value="android">Android (1080 x 1920)</option>
            </select>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-blue mb-2">CAPTION OVERLAY</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Track your progress daily!"
              className="cyber-input w-full"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-blue mb-2">BACKGROUND</label>
              <div className="flex items-center space-x-2 bg-black/50 p-2 rounded border border-cyber-blue/30">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer bg-transparent border-none"
                />
                <span className="text-xs font-tech text-gray-400">{backgroundColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-blue mb-2">TEXT COLOR</label>
              <div className="flex items-center space-x-2 bg-black/50 p-2 rounded border border-cyber-blue/30">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer bg-transparent border-none"
                />
                <span className="text-xs font-tech text-gray-400">{textColor}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => { playClick(); handleFrame(); }}
            onMouseEnter={playHover}
            disabled={loading || !file}
            className="w-full cyber-button mt-4"
          >
            {loading ? 'PROCESSING...' : 'GENERATE FRAME'}
          </button>
        </div>

        {/* Preview / Result */}
        <div className="flex items-center justify-center border border-cyber-blue/30 bg-black/80 rounded-lg p-4 min-h-[300px]">
           {result ? (
             <div className="text-center">
                <p className="text-cyber-green font-orbitron mb-4">FRAME GENERATED</p>
                <div className="border border-cyber-green p-1 inline-block">
                   {/* In a real app we would display the image here if we could serve it statically */}
                   <div className="w-32 h-56 bg-gray-800 flex items-center justify-center text-gray-500 font-tech text-xs">
                      [PREVIEW]
                   </div>
                </div>
                <p className="mt-2 text-xs font-tech text-gray-400 break-all">{result}</p>
             </div>
           ) : (
             <div className="text-center text-gray-500">
               <div className="w-16 h-16 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                 <span className="text-2xl">+</span>
               </div>
               <p className="font-tech text-sm">Awaiting Input</p>
             </div>
           )}
           {error && (
             <div className="text-cyber-pink font-tech text-sm mt-2">{error}</div>
           )}
        </div>
      </div>
    </div>
  );
}
