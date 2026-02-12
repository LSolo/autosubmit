import React, { useState } from 'react';
import axios from 'axios';
import { api } from '../api/client';
import { useFuturisticSound } from '../hooks/useFuturisticSound';

interface MetadataResult {
  title: string;
  shortDescription: string;
  fullDescription: string;
}

export default function MetadataGenerator() {
  const { playClick, playHover, playSuccess, playError } = useFuturisticSound();
  const [formData, setFormData] = useState({
    appName: '',
    features: '',
    keywords: '',
    language: 'en'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MetadataResult | null>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.generateMetadata({
        ...formData,
        features: formData.features.split(',').map(s => s.trim()),
        keywords: formData.keywords.split(',').map(s => s.trim())
      });
      setResult(response.data.metadata);
      playSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message);
      } else {
        setError((err as Error).message);
      }
      playError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-tech text-cyber-blue">
      <h1 className="text-3xl font-orbitron font-bold text-cyber-green drop-shadow-[0_0_10px_rgba(0,255,102,0.5)] mb-8 tracking-widest">NEURAL LINK // METADATA GENERATOR</h1>
      
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-cyber-green/50 p-6 bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(0,255,102,0.15)] rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="appName" className="block text-sm font-bold leading-6 text-cyber-green font-orbitron tracking-wide">
                APP IDENTITY
                </label>
                <div className="mt-2">
                <input
                    type="text"
                    name="appName"
                    id="appName"
                    required
                    value={formData.appName}
                    onChange={handleChange}
                    className="block w-full rounded border border-cyber-green/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,255,102,0.1)] focus:border-cyber-green focus:ring-0 sm:text-sm sm:leading-6 font-tech placeholder-gray-600 focus:shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all"
                />
                </div>
            </div>

            <div>
                <label htmlFor="features" className="block text-sm font-bold leading-6 text-cyber-green font-orbitron tracking-wide">
                CORE FUNCTIONS (comma separated)
                </label>
                <div className="mt-2">
                <textarea
                    name="features"
                    id="features"
                    rows={4}
                    required
                    value={formData.features}
                    onChange={handleChange}
                    className="block w-full rounded border border-cyber-green/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,255,102,0.1)] focus:border-cyber-green focus:ring-0 sm:text-sm sm:leading-6 font-tech placeholder-gray-600 focus:shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all"
                />
                </div>
            </div>

            <div>
                <label htmlFor="keywords" className="block text-sm font-bold leading-6 text-cyber-green font-orbitron tracking-wide">
                SEARCH VECTORS (comma separated)
                </label>
                <div className="mt-2">
                <input
                    type="text"
                    name="keywords"
                    id="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    className="block w-full rounded border border-cyber-green/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,255,102,0.1)] focus:border-cyber-green focus:ring-0 sm:text-sm sm:leading-6 font-tech placeholder-gray-600 focus:shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all"
                />
                </div>
            </div>

            <div>
                <label htmlFor="language" className="block text-sm font-bold leading-6 text-cyber-green font-orbitron tracking-wide">
                LANGUAGE PROTOCOL
                </label>
                <div className="mt-2">
                <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="block w-full rounded border border-cyber-green/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,255,102,0.1)] focus:border-cyber-green focus:ring-0 sm:text-sm sm:leading-6 font-tech"
                >
                    <option value="en">English (Global)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                </select>
                </div>
            </div>

            <button
                type="submit"
                onClick={playClick}
                onMouseEnter={playHover}
                disabled={loading}
                className="flex w-full justify-center rounded border border-cyber-green bg-cyber-green/10 px-3 py-3 text-sm font-bold font-orbitron uppercase tracking-widest text-cyber-green shadow-[0_0_10px_rgba(0,255,102,0.3)] hover:bg-cyber-green hover:text-black hover:shadow-[0_0_20px_rgba(0,255,102,0.6)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {loading ? 'NEURAL PROCESSING...' : 'GENERATE METADATA'}
            </button>
            </form>
        </div>

        <div className="space-y-6">
            {error && (
            <div className="p-4 text-sm text-cyber-pink bg-cyber-pink/10 border border-cyber-pink rounded font-tech shadow-[0_0_10px_rgba(255,0,85,0.2)]">
                <span className="font-bold font-orbitron mr-2">SYSTEM ERROR:</span> {error}
            </div>
            )}

            {result && (
            <div className="border border-cyber-green/50 p-6 bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(0,255,102,0.15)] rounded-lg animate-fade-in">
                <h2 className="text-xl font-bold leading-7 text-cyber-green font-orbitron mb-4 tracking-wide border-b border-cyber-green/30 pb-2">
                GENERATED OUTPUT
                </h2>
                <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-bold text-cyber-blue font-orbitron">Title</h3>
                    <p className="mt-1 text-sm text-gray-300 font-tech">{result.title}</p>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-cyber-blue font-orbitron">Short Description</h3>
                    <p className="mt-1 text-sm text-gray-300 font-tech">{result.shortDescription}</p>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-cyber-blue font-orbitron">Full Description</h3>
                    <p className="mt-1 text-sm text-gray-300 font-tech whitespace-pre-wrap">{result.fullDescription}</p>
                </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                            playClick();
                        }}
                        onMouseEnter={playHover}
                        className="text-xs text-cyber-green border border-cyber-green/50 px-3 py-1 rounded hover:bg-cyber-green/20 font-orbitron transition-all"
                    >
                        COPY DATA
                    </button>
                </div>
            </div>
            )}
            
            {!result && !error && (
                <div className="h-full flex items-center justify-center border border-cyber-blue/30 bg-black/40 rounded-lg p-10 text-center">
                    <div>
                        <div className="mx-auto h-12 w-12 text-cyber-blue/30 animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        </div>
                        <p className="mt-2 text-cyber-blue/50 font-orbitron text-sm">AWAITING INPUT PARAMETERS</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
