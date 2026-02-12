import React, { useState } from 'react';
import axios from 'axios';
import { api } from '../api/client';
import { useFuturisticSound } from '../hooks/useFuturisticSound';

interface ProcessedImageResult {
  outputDir: string;
  files: string[];
}

export default function ImageProcessor() {
  const { playClick, playHover } = useFuturisticSound();
  const [file, setFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState('both');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('platform', platform);

    try {
      const response = await api.processImages(formData);
      setResult(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message);
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-tech text-cyber-blue">
      <h1 className="text-3xl font-orbitron font-bold text-cyber-purple drop-shadow-[0_0_10px_rgba(188,19,254,0.5)] mb-8 tracking-widest">SPRITE LAB // IMAGE PROCESSOR</h1>
      
      <div className="mt-8 max-w-xl border border-cyber-purple/50 p-6 bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(188,19,254,0.2)] rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="file" className="block text-sm font-bold leading-6 text-cyber-purple font-orbitron tracking-wide">
              SOURCE IMAGE (BASE ICON)
            </label>
            <div className="mt-2">
              <input
                type="file"
                name="file"
                id="file"
                accept="image/*"
                onChange={(e) => { playClick(); setFile(e.target.files ? e.target.files[0] : null); }}
                className="block w-full text-sm text-cyber-blue border border-cyber-purple/50 rounded bg-black/50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-orbitron file:bg-cyber-purple/20 file:text-cyber-purple hover:file:bg-cyber-purple/40 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label htmlFor="platform" className="block text-sm font-bold leading-6 text-cyber-purple font-orbitron tracking-wide">
              TARGET SYSTEM
            </label>
            <div className="mt-2">
              <select
                id="platform"
                name="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="block w-full rounded border border-cyber-purple/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(188,19,254,0.1)] focus:border-cyber-purple focus:ring-0 sm:text-sm sm:leading-6 font-tech"
              >
                <option value="both">All Systems (Android & iOS)</option>
                <option value="android">Android Only</option>
                <option value="ios">iOS Only</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            onClick={playClick}
            onMouseEnter={playHover}
            disabled={loading || !file}
            className="flex w-full justify-center rounded border border-cyber-purple bg-cyber-purple/10 px-3 py-3 text-sm font-bold font-orbitron uppercase tracking-widest text-cyber-purple shadow-[0_0_10px_rgba(188,19,254,0.3)] hover:bg-cyber-purple hover:text-white hover:shadow-[0_0_20px_rgba(188,19,254,0.6)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'PROCESSING ASSETS...' : 'INITIATE PROCESSING'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 text-sm text-cyber-pink bg-cyber-pink/10 border border-cyber-pink rounded font-tech">
            ERROR: {error}
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-cyber-green/10 border border-cyber-green rounded shadow-[0_0_15px_rgba(0,255,102,0.2)]">
            <h3 className="text-lg font-bold text-cyber-green font-orbitron mb-2">OPERATION SUCCESSFUL</h3>
            <p className="mt-2 text-sm text-cyber-green/80 font-tech">Output Directory: {result.outputDir}</p>
            <ul className="mt-2 text-sm text-cyber-green/60 list-disc list-inside font-tech">
              {result.files.slice(0, 5).map((f: string, i: number) => (
                 <li key={i}>{f.split('/').pop()}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
