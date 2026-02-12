import { useState } from 'react';
import axios from 'axios';
import { api } from '../api/client';
import { useFuturisticSound } from '../hooks/useFuturisticSound';

export default function AppSubmission() {
  const { playClick, playHover, playSuccess, playError } = useFuturisticSound();
  const [platform, setPlatform] = useState('android');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  // Android Form State
  const [androidData, setAndroidData] = useState({
      packageName: '',
      track: 'internal',
      changes: '',
      serviceAccountJson: ''
  });
  const [androidFile, setAndroidFile] = useState<File | null>(null);

  // iOS Form State
  const [iosData, setIosData] = useState({
      appId: '',
      versionString: '',
      issuerId: '',
      keyId: '',
      privateKey: ''
  });
  const [iosFile, setIosFile] = useState<File | null>(null);

  const handleAndroidSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!androidFile) return;

      setLoading(true);
      setError('');
      setResult(null);

      const formData = new FormData();
      formData.append('buildFile', androidFile);
      formData.append('packageName', androidData.packageName);
      formData.append('track', androidData.track);
      formData.append('changes', androidData.changes);
      formData.append('serviceAccountJson', androidData.serviceAccountJson);

      try {
          const response = await api.submitAndroid(formData);
          setResult(response.data);
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

  const handleIOSSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!iosFile) return;

      setLoading(true);
      setError('');
      setResult(null);

      const formData = new FormData();
      formData.append('buildFile', iosFile);
      formData.append('issuerId', iosData.issuerId);
      formData.append('keyId', iosData.keyId);
      formData.append('privateKey', iosData.privateKey);

      try {
          const response = await api.submitIOS(formData);
          setResult(response.data);
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
      <h1 className="text-3xl font-orbitron font-bold text-cyber-pink drop-shadow-[0_0_10px_rgba(255,0,85,0.5)] mb-8 tracking-widest">DEPLOYMENT HUB // UPLINK</h1>

      <div className="mt-6 border-b border-cyber-pink/30">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => { playClick(); setPlatform('android'); }}
            onMouseEnter={playHover}
            className={`${
              platform === 'android'
                ? 'border-cyber-pink text-cyber-pink shadow-[0_4px_10px_-4px_rgba(255,0,85,0.5)]'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
            } whitespace-nowrap border-b-2 py-4 px-6 text-sm font-bold font-orbitron uppercase tracking-widest transition-all`}
          >
            Google Play
          </button>
          <button
            onClick={() => { playClick(); setPlatform('ios'); }}
            onMouseEnter={playHover}
            className={`${
              platform === 'ios'
                ? 'border-cyber-blue text-cyber-blue shadow-[0_4px_10px_-4px_rgba(0,243,255,0.5)]'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
            } whitespace-nowrap border-b-2 py-4 px-6 text-sm font-bold font-orbitron uppercase tracking-widest transition-all`}
          >
            App Store Connect
          </button>
        </nav>
      </div>

      <div className="mt-8 border border-cyber-pink/50 p-6 bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(255,0,85,0.15)] rounded-lg">
        {platform === 'android' ? (
          <form onSubmit={handleAndroidSubmit} className="space-y-6">
            <h3 className="text-lg font-bold text-cyber-pink font-orbitron tracking-wide mb-4">ANDROID PROTOCOL</h3>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-bold leading-6 text-cyber-pink font-orbitron tracking-wide">
                        PACKAGE NAME
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            required
                            value={androidData.packageName}
                            onChange={(e) => setAndroidData({...androidData, packageName: e.target.value})}
                            className="block w-full rounded border border-cyber-pink/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(255,0,85,0.1)] focus:border-cyber-pink focus:ring-0 sm:text-sm sm:leading-6 font-tech focus:shadow-[0_0_15px_rgba(255,0,85,0.3)] transition-all"
                            placeholder="com.example.app"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold leading-6 text-cyber-pink font-orbitron tracking-wide">
                        TRACK
                    </label>
                    <div className="mt-2">
                        <select
                            value={androidData.track}
                            onChange={(e) => setAndroidData({...androidData, track: e.target.value})}
                            className="block w-full rounded border border-cyber-pink/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(255,0,85,0.1)] focus:border-cyber-pink focus:ring-0 sm:text-sm sm:leading-6 font-tech"
                        >
                            <option value="internal">Internal Test</option>
                            <option value="alpha">Alpha</option>
                            <option value="beta">Beta</option>
                            <option value="production">Production</option>
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold leading-6 text-cyber-pink font-orbitron tracking-wide">
                    SERVICE ACCOUNT JSON
                </label>
                <div className="mt-2">
                    <textarea
                        rows={3}
                        required
                        value={androidData.serviceAccountJson}
                        onChange={(e) => setAndroidData({...androidData, serviceAccountJson: e.target.value})}
                        className="block w-full rounded border border-cyber-pink/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(255,0,85,0.1)] focus:border-cyber-pink focus:ring-0 sm:text-sm sm:leading-6 font-tech focus:shadow-[0_0_15px_rgba(255,0,85,0.3)] transition-all font-mono text-xs"
                        placeholder="{ 'type': 'service_account', ... }"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold leading-6 text-cyber-pink font-orbitron tracking-wide">
                    RELEASE NOTES
                </label>
                <div className="mt-2">
                    <textarea
                        rows={3}
                        value={androidData.changes}
                        onChange={(e) => setAndroidData({...androidData, changes: e.target.value})}
                        className="block w-full rounded border border-cyber-pink/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(255,0,85,0.1)] focus:border-cyber-pink focus:ring-0 sm:text-sm sm:leading-6 font-tech focus:shadow-[0_0_15px_rgba(255,0,85,0.3)] transition-all"
                        placeholder="What's new in this release..."
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold leading-6 text-cyber-pink font-orbitron tracking-wide">
                    BUILD ARTIFACT (.aab / .apk)
                </label>
                <div className="mt-2">
                    <input
                        type="file"
                        accept=".aab,.apk"
                        required
                        onChange={(e) => { playClick(); setAndroidFile(e.target.files ? e.target.files[0] : null); }}
                        className="block w-full text-sm text-cyber-blue border border-cyber-pink/50 rounded bg-black/50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-orbitron file:bg-cyber-pink/20 file:text-cyber-pink hover:file:bg-cyber-pink/40 cursor-pointer"
                    />
                </div>
            </div>

            <button
                type="submit"
                onClick={playClick}
                onMouseEnter={playHover}
                disabled={loading}
                className="flex w-full justify-center rounded border border-cyber-pink bg-cyber-pink/10 px-3 py-3 text-sm font-bold font-orbitron uppercase tracking-widest text-cyber-pink shadow-[0_0_10px_rgba(255,0,85,0.3)] hover:bg-cyber-pink hover:text-white hover:shadow-[0_0_20px_rgba(255,0,85,0.6)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {loading ? 'UPLOADING...' : 'INITIATE UPLOAD SEQUENCE'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleIOSSubmit} className="space-y-6">
             <h3 className="text-lg font-bold text-cyber-blue font-orbitron tracking-wide mb-4">iOS PROTOCOL</h3>

             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-bold leading-6 text-cyber-blue font-orbitron tracking-wide">
                        APP ID (Bundle ID)
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            required
                            value={iosData.appId}
                            onChange={(e) => setIosData({...iosData, appId: e.target.value})}
                            className="block w-full rounded border border-cyber-blue/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.1)] focus:border-cyber-blue focus:ring-0 sm:text-sm sm:leading-6 font-tech focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold leading-6 text-cyber-blue font-orbitron tracking-wide">
                        VERSION STRING
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            required
                            value={iosData.versionString}
                            onChange={(e) => setIosData({...iosData, versionString: e.target.value})}
                            className="block w-full rounded border border-cyber-blue/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.1)] focus:border-cyber-blue focus:ring-0 sm:text-sm sm:leading-6 font-tech focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all"
                            placeholder="1.0.0"
                        />
                    </div>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-bold leading-6 text-cyber-blue font-orbitron tracking-wide">
                        ISSUER ID
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            required
                            value={iosData.issuerId}
                            onChange={(e) => setIosData({...iosData, issuerId: e.target.value})}
                            className="block w-full rounded border border-cyber-blue/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.1)] focus:border-cyber-blue focus:ring-0 sm:text-sm sm:leading-6 font-tech focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold leading-6 text-cyber-blue font-orbitron tracking-wide">
                        KEY ID
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            required
                            value={iosData.keyId}
                            onChange={(e) => setIosData({...iosData, keyId: e.target.value})}
                            className="block w-full rounded border border-cyber-blue/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.1)] focus:border-cyber-blue focus:ring-0 sm:text-sm sm:leading-6 font-tech focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all"
                        />
                    </div>
                </div>
             </div>

             <div>
                <label className="block text-sm font-bold leading-6 text-cyber-blue font-orbitron tracking-wide">
                    PRIVATE KEY
                </label>
                <div className="mt-2">
                    <textarea
                        rows={3}
                        required
                        value={iosData.privateKey}
                        onChange={(e) => setIosData({...iosData, privateKey: e.target.value})}
                        className="block w-full rounded border border-cyber-blue/50 bg-black/50 py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.1)] focus:border-cyber-blue focus:ring-0 sm:text-sm sm:leading-6 font-tech focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all font-mono text-xs"
                        placeholder="-----BEGIN PRIVATE KEY-----..."
                    />
                </div>
            </div>

             <div>
                <label className="block text-sm font-bold leading-6 text-cyber-blue font-orbitron tracking-wide">
                    BUILD ARTIFACT (.ipa)
                </label>
                <div className="mt-2">
                    <input
                        type="file"
                        accept=".ipa"
                        required
                        onChange={(e) => { playClick(); setIosFile(e.target.files ? e.target.files[0] : null); }}
                        className="block w-full text-sm text-cyber-blue border border-cyber-blue/50 rounded bg-black/50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-orbitron file:bg-cyber-blue/20 file:text-cyber-blue hover:file:bg-cyber-blue/40 cursor-pointer"
                    />
                </div>
            </div>

            <button
                type="submit"
                onClick={playClick}
                onMouseEnter={playHover}
                disabled={loading}
                className="flex w-full justify-center rounded border border-cyber-blue bg-cyber-blue/10 px-3 py-3 text-sm font-bold font-orbitron uppercase tracking-widest text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.3)] hover:bg-cyber-blue hover:text-black hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {loading ? 'UPLOADING...' : 'INITIATE UPLOAD SEQUENCE'}
            </button>
          </form>
        )}

        {error && (
            <div className="mt-6 p-4 text-sm text-cyber-pink bg-cyber-pink/10 border border-cyber-pink rounded font-tech shadow-[0_0_10px_rgba(255,0,85,0.2)]">
                <span className="font-bold font-orbitron mr-2">UPLOAD FAILED:</span> {error}
            </div>
        )}

        {result && (
            <div className="mt-6 p-4 bg-cyber-green/10 border border-cyber-green rounded shadow-[0_0_15px_rgba(0,255,102,0.2)]">
                <h3 className="text-lg font-bold text-cyber-green font-orbitron mb-2">DEPLOYMENT SUCCESSFUL</h3>
                <pre className="mt-2 text-xs text-cyber-green/80 font-mono bg-black/50 p-2 rounded border border-cyber-green/30 overflow-auto max-h-40">
                    {JSON.stringify(result, null, 2)}
                </pre>
            </div>
        )}
      </div>
    </div>
  );
}