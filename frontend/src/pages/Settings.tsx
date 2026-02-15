import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useFuturisticSound } from '../hooks/useFuturisticSound';
import { CheckCircleIcon, ExclamationCircleIcon, BoltIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const { playClick, playSuccess, playError } = useFuturisticSound();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [config, setConfig] = useState({
    aiProvider: 'ollama',
    ollama: {
      baseUrl: 'http://localhost:11434',
      model: 'llama3.2:1b',
    },
    openai: {
      apiKey: '',
      model: 'gpt-4o',
    },
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await api.getConfig();
      setConfig(response.data);
    } catch (error) {
      console.error('Failed to load config:', error);
      setStatus({ type: 'error', message: 'Failed to load system configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    playClick();
    
    try {
      await api.saveConfig(config);
      setStatus({ type: 'success', message: 'System configuration updated successfully' });
      playSuccess();
    } catch (error) {
      console.error('Failed to save config:', error);
      setStatus({ type: 'error', message: 'Failed to update system configuration' });
      playError();
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setStatus(null);
    playClick();

    // We'll simulate a test by asking for a very short completion
    try {
      await api.saveConfig(config); // Save first to ensure backend has latest
      const response = await api.generateReleaseNotes({ input: 'Test connection', tone: 'concise' });
      if (response.data) {
        setStatus({ type: 'success', message: 'Connection established successfully! AI is online.' });
        playSuccess();
      }
    } catch (error: any) {
      console.error('Test failed:', error);
      const msg = error.response?.data?.error || error.message || 'Connection failed';
      setStatus({ type: 'error', message: `Connection failed: ${msg}` });
      playError();
    } finally {
      setTesting(false);
    }
  };

  const handleChange = (section: string, field: string, value: string) => {
    if (section === 'root') {
      setConfig(prev => ({ ...prev, [field]: value }));
    } else {
      setConfig(prev => {
        const sectionData = prev[section as keyof typeof prev];
        if (typeof sectionData === 'object' && sectionData !== null) {
          return {
            ...prev,
            [section]: {
              ...sectionData,
              [field]: value
            }
          };
        }
        return prev;
      });
    }
  };

  if (loading) {
    return <div className="text-cyber-blue font-orbitron animate-pulse">Initializing System Core...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-purple drop-shadow-neon-blue">
          System Core Configuration
        </h1>
        <p className="mt-2 text-gray-400 font-rajdhani text-lg">
          Manage AI neural links and system parameters.
        </p>
      </div>

      <div className="bg-cyber-dark/50 backdrop-blur-md border border-cyber-blue/20 rounded-lg p-6 shadow-lg shadow-cyber-blue/5">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* AI Provider Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-orbitron text-cyber-blue border-b border-cyber-blue/20 pb-2">
              Neural Network Provider
            </h2>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="aiProvider"
                  value="ollama"
                  checked={config.aiProvider === 'ollama'}
                  onChange={(e) => handleChange('root', 'aiProvider', e.target.value)}
                  className="form-radio text-cyber-blue bg-black/50 border-cyber-blue/50 focus:ring-cyber-blue focus:ring-offset-0"
                />
                <span className="font-rajdhani text-lg group-hover:text-cyber-blue transition-colors">Ollama (Local)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="aiProvider"
                  value="openai"
                  checked={config.aiProvider === 'openai'}
                  onChange={(e) => handleChange('root', 'aiProvider', e.target.value)}
                  className="form-radio text-cyber-purple bg-black/50 border-cyber-purple/50 focus:ring-cyber-purple focus:ring-offset-0"
                />
                <span className="font-rajdhani text-lg group-hover:text-cyber-purple transition-colors">OpenAI (Cloud)</span>
              </label>
            </div>
          </div>

          {/* Ollama Settings */}
          {config.aiProvider === 'ollama' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-cyber-blue font-rajdhani uppercase tracking-wider mb-2">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={config.ollama.baseUrl}
                    onChange={(e) => handleChange('ollama', 'baseUrl', e.target.value)}
                    className="block w-full rounded-md border-0 bg-black/50 py-2.5 px-4 text-white shadow-sm ring-1 ring-inset ring-cyber-blue/30 focus:ring-2 focus:ring-inset focus:ring-cyber-blue sm:text-sm sm:leading-6 font-mono"
                    placeholder="http://localhost:11434"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyber-blue font-rajdhani uppercase tracking-wider mb-2">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={config.ollama.model}
                    onChange={(e) => handleChange('ollama', 'model', e.target.value)}
                    className="block w-full rounded-md border-0 bg-black/50 py-2.5 px-4 text-white shadow-sm ring-1 ring-inset ring-cyber-blue/30 focus:ring-2 focus:ring-inset focus:ring-cyber-blue sm:text-sm sm:leading-6 font-mono"
                    placeholder="llama3.2:1b"
                  />
                </div>
              </div>
            </div>
          )}

          {/* OpenAI Settings */}
          {config.aiProvider === 'openai' && (
            <div className="space-y-4 animate-fadeIn">
               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-cyber-purple font-rajdhani uppercase tracking-wider mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={config.openai.apiKey}
                    onChange={(e) => handleChange('openai', 'apiKey', e.target.value)}
                    className="block w-full rounded-md border-0 bg-black/50 py-2.5 px-4 text-white shadow-sm ring-1 ring-inset ring-cyber-purple/30 focus:ring-2 focus:ring-inset focus:ring-cyber-purple sm:text-sm sm:leading-6 font-mono"
                    placeholder="sk-..."
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-cyber-purple font-rajdhani uppercase tracking-wider mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={config.openai.model}
                    onChange={(e) => handleChange('openai', 'model', e.target.value)}
                    className="block w-full rounded-md border-0 bg-black/50 py-2.5 px-4 text-white shadow-sm ring-1 ring-inset ring-cyber-purple/30 focus:ring-2 focus:ring-inset focus:ring-cyber-purple sm:text-sm sm:leading-6 font-mono"
                    placeholder="gpt-4o"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status Message */}
          {status && (
            <div className={`p-4 rounded-md flex items-center gap-3 ${status.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-500/30' : 'bg-red-900/20 text-red-400 border border-red-500/30'}`}>
              {status.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationCircleIcon className="h-5 w-5" />}
              <span className="font-rajdhani font-semibold">{status.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-cyber-blue/20">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || saving}
              className="flex items-center gap-2 px-6 py-3 rounded border border-yellow-500/50 text-yellow-500 font-orbitron hover:bg-yellow-500/10 transition-colors disabled:opacity-50"
            >
              {testing ? (
                <span className="animate-pulse">Testing Link...</span>
              ) : (
                <>
                  <BoltIcon className="h-5 w-5" />
                  Test Connection
                </>
              )}
            </button>

            <button
              type="submit"
              disabled={saving || testing}
              className="relative overflow-hidden group bg-cyber-blue/10 hover:bg-cyber-blue/20 text-cyber-blue font-orbitron font-bold py-3 px-8 rounded border border-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2">
                {saving ? 'UPDATING CORE...' : 'UPDATE CONFIGURATION'}
              </span>
              <div className="absolute inset-0 h-full w-full scale-0 rounded transition-all duration-300 group-hover:scale-100 group-hover:bg-cyber-blue/10" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
