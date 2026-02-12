import { useState } from 'react';
import axios from 'axios';
import { CheckIcon, CpuChipIcon } from '@heroicons/react/24/solid';
import { api } from '../api/client';
import LiveLogConsole from '../components/LiveLogConsole';
import ScreenshotFramer from '../components/ScreenshotFramer';
import MetadataTranslator from '../components/MetadataTranslator';
import { useFuturisticSound } from '../hooks/useFuturisticSound';

const steps = [
  { id: 1, name: 'Phase 1: App Details', description: 'Initialize Mission' },
  { id: 2, name: 'Phase 2: Metadata', description: 'Neural Processing' },
  { id: 3, name: 'Phase 3: Assets', description: 'Visual Assets' },
  { id: 4, name: 'Phase 4: Deployment', description: 'Final Launch' },
];

interface ProcessedAssets {
  files: string[];
}

interface SubmissionResult {
  result?: {
    versionCode?: string | number;
    track?: string;
  };
  output?: string;
}

export default function Wizard() {
  const { playClick, playHover, playSuccess, playError } = useFuturisticSound();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State
  const [appInfo, setAppInfo] = useState({
    name: '',
    features: '',
    keywords: '',
    language: 'en',
  });

  const [metadata, setMetadata] = useState<{
    title: string;
    short_description: string;
    full_description: string;
    keywords: string;
    packageName?: string;
  } | null>(null);
  
  const [assets, setAssets] = useState<{ icon: File | null; processed: ProcessedAssets | null }>({
    icon: null,
    processed: null,
  });

  const [submission, setSubmission] = useState<{
    platform: 'android' | 'ios';
    track: string;
    buildFile: File | null;
    packageName: string;
    // Android Creds
    serviceAccount: string;
    // iOS Creds
    issuerId: string;
    keyId: string;
    privateKey: string;
    changes: string;
  }>({
    platform: 'android',
    track: 'internal',
    buildFile: null,
    packageName: '',
    serviceAccount: '',
    issuerId: '',
    keyId: '',
    privateKey: '',
    changes: '',
  });

  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  // Handlers
  const handleNext = () => {
    if (currentStep < steps.length) {
      playSuccess();
      setCurrentStep((prev) => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      playClick();
      setCurrentStep((prev) => prev - 1);
      setError('');
      setShowLogs(false);
      setSubmissionResult(null);
    }
  };
  // Just validation mostly

  // Step 2 Actions
  const generateMetadata = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.generateMetadata({
        appName: appInfo.name,
        features: appInfo.features.split(',').map(s => s.trim()),
        keywords: appInfo.keywords.split(',').map(s => s.trim()),
        language: appInfo.language
      });
      setMetadata(response.data.metadata);
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

  // Step 3 Actions
  const processImages = async () => {
    if (!assets.icon) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', assets.icon);
    formData.append('platform', 'both');

    try {
      const response = await api.processImages(formData);
      setAssets(prev => ({ ...prev, processed: response.data }));
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

  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [notesTone, setNotesTone] = useState('excited');

  // Step 4 Actions
  const generateReleaseNotes = async () => {
    if (!submission.changes.trim()) {
        setError('Please enter some bullet points first.');
        return;
    }
    setGeneratingNotes(true);
    setError('');
    
    try {
        const response = await api.generateReleaseNotes({
            input: submission.changes,
            tone: notesTone
        });
        setSubmission({...submission, changes: response.data.releaseNotes});
    } catch (err: unknown) {
        console.error(err);
        setError('Failed to generate release notes.');
    } finally {
        setGeneratingNotes(false);
    }
  };

  const submitApp = async () => {
    if (!submission.buildFile) return;
    setLoading(true);
    setShowLogs(true);
    setError('');
    setSubmissionResult(null);
    
    const formData = new FormData();
    formData.append('buildFile', submission.buildFile);
    
    try {
       let response;
       if (submission.platform === 'android') {
           formData.append('packageName', submission.packageName || metadata?.packageName || 'com.example.app');
           formData.append('track', submission.track);
           formData.append('changes', submission.changes);
           formData.append('serviceAccountJson', submission.serviceAccount);
           response = await api.submitAndroid(formData);
       } else {
           // iOS
           formData.append('issuerId', submission.issuerId);
           formData.append('keyId', submission.keyId);
           formData.append('privateKey', submission.privateKey);
           response = await api.submitIOS(formData);
       }
       setSubmissionResult(response.data as SubmissionResult);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-tech text-cyber-blue">
      {/* Stepper */}
      <nav aria-label="Progress">
        <ol role="list" className="divide-y divide-cyber-blue/30 rounded-lg border border-cyber-blue/50 md:flex md:divide-y-0 bg-black/60 backdrop-blur-md shadow-[0_0_20px_rgba(0,243,255,0.2)] overflow-hidden">
          {steps.map((step, stepIdx) => (
            <li key={step.name} className="relative md:flex md:flex-1">
              {step.id < currentStep ? (
                <a href="#" className="group flex w-full items-center bg-cyber-blue/10 hover:bg-cyber-blue/20 transition-colors">
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cyber-blue group-hover:bg-cyber-blue/80 ring-2 ring-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                      <CheckIcon className="h-6 w-6 text-black" aria-hidden="true" />
                    </span>
                    <span className="ml-4 text-sm font-medium text-cyber-blue font-orbitron">{step.name}</span>
                  </span>
                </a>
              ) : step.id === currentStep ? (
                <a href="#" className="flex items-center px-6 py-4 text-sm font-medium bg-cyber-blue/20 border-b-2 md:border-b-0 md:border-l-2 border-cyber-blue" aria-current="step">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-cyber-blue bg-black shadow-[0_0_15px_rgba(0,243,255,0.6)] animate-pulse">
                    <span className="text-cyber-blue font-orbitron">{step.id}</span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-white font-orbitron drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{step.name}</span>
                </a>
              ) : (
                <a href="#" className="group flex items-center">
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-700 bg-transparent group-hover:border-cyber-purple transition-colors">
                      <span className="text-gray-500 group-hover:text-cyber-purple font-orbitron">{step.id}</span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-300 font-orbitron">{step.name}</span>
                  </span>
                </a>
              )}

              {stepIdx !== steps.length - 1 ? (
                <>
                  <div className="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
                    <svg
                      className="h-full w-full text-gray-800"
                      viewBox="0 0 22 80"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 -2L20 40L0 82"
                        vectorEffect="non-scaling-stroke"
                        stroke="currentColor"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </nav>

      {/* Content */}
      <div className="mt-8 cyber-card relative overflow-hidden min-h-[500px]">
        {/* Animated grid background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        
        <div className="px-6 py-8 relative z-10">
          {/* Step 1: App Details */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-cyber-blue/30 pb-4">
                <h3 className="text-2xl font-orbitron leading-6 text-white drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">Phase 1: App Details</h3>
                <p className="mt-2 text-sm text-cyber-blue/70 font-tech">Initialize mission parameters and core application data.</p>
              </div>
              <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-blue tracking-wider">APP IDENTITY</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={appInfo.name}
                      onChange={(e) => setAppInfo({...appInfo, name: e.target.value})}
                      className="block w-full rounded bg-black/50 border border-cyber-blue/50 text-white shadow-[0_0_10px_rgba(0,243,255,0.1)] focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all font-tech placeholder-gray-600 sm:text-sm sm:leading-6 py-3 px-4"
                      placeholder="ENTER_APP_NAME"
                    />
                  </div>
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-blue tracking-wider">CORE FEATURES</label>
                  <div className="mt-2">
                    <textarea
                      rows={4}
                      value={appInfo.features}
                      onChange={(e) => setAppInfo({...appInfo, features: e.target.value})}
                      className="block w-full rounded bg-black/50 border border-cyber-blue/50 text-white shadow-[0_0_10px_rgba(0,243,255,0.1)] focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all font-tech placeholder-gray-600 sm:text-sm sm:leading-6 py-3 px-4"
                      placeholder="e.g. Offline mode, Dark theme, Real-time sync"
                    />
                  </div>
                </div>
                <div className="sm:col-span-6">
                   <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-blue tracking-wider">SEARCH KEYWORDS</label>
                   <div className="mt-2">
                      <input
                        type="text"
                        value={appInfo.keywords}
                        onChange={(e) => setAppInfo({...appInfo, keywords: e.target.value})}
                        className="block w-full rounded bg-black/50 border border-cyber-blue/50 text-white shadow-[0_0_10px_rgba(0,243,255,0.1)] focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all font-tech placeholder-gray-600 sm:text-sm sm:leading-6 py-3 px-4"
                      />
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Metadata */}
          {currentStep === 2 && (
             <div className="space-y-8 animate-fade-in">
                <div className="border-b border-cyber-purple/30 pb-4">
                  <h3 className="text-2xl font-orbitron leading-6 text-cyber-purple drop-shadow-[0_0_10px_rgba(188,19,254,0.5)]">Phase 2: AI Neural Link</h3>
                  <p className="mt-2 text-sm text-cyber-purple/70 font-tech">Generate ASO-optimized metadata using local neural networks.</p>
                </div>
                
                {!metadata ? (
                   <div className="text-center py-16 border border-dashed border-cyber-purple/50 rounded-lg bg-black/30 backdrop-blur-sm">
                      <CpuChipIcon className="mx-auto h-16 w-16 text-cyber-purple animate-pulse drop-shadow-[0_0_15px_rgba(188,19,254,0.8)]" />
                      <button
                        type="button"
                        onClick={() => { playClick(); generateMetadata(); }}
                        onMouseEnter={playHover}
                        disabled={loading}
                        className="mt-6 cyber-button bg-cyber-purple/20 border-cyber-purple text-cyber-purple hover:bg-cyber-purple/30"
                      >
                        {loading ? 'INITIALIZING NEURAL LINK...' : 'INITIATE AI GENERATION'}
                      </button>
                   </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-purple">TITLE</label>
                            <input 
                              type="text" 
                              value={metadata.title} 
                              onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                              className="mt-2 block w-full rounded bg-black/50 border border-cyber-purple/50 text-white shadow-[0_0_10px_rgba(188,19,254,0.1)] focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple focus:shadow-[0_0_15px_rgba(188,19,254,0.3)] transition-all font-tech sm:text-sm sm:leading-6 py-2 px-3"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-purple">SHORT DESCRIPTION</label>
                            <input 
                              type="text" 
                              value={metadata.short_description} 
                              onChange={(e) => setMetadata({...metadata, short_description: e.target.value})}
                              className="mt-2 block w-full rounded bg-black/50 border border-cyber-purple/50 text-white shadow-[0_0_10px_rgba(188,19,254,0.1)] focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple focus:shadow-[0_0_15px_rgba(188,19,254,0.3)] transition-all font-tech sm:text-sm sm:leading-6 py-2 px-3"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-purple">FULL DESCRIPTION</label>
                            <textarea 
                              rows={8}
                              value={metadata.full_description} 
                              onChange={(e) => setMetadata({...metadata, full_description: e.target.value})}
                              className="mt-2 block w-full rounded bg-black/50 border border-cyber-purple/50 text-white shadow-[0_0_10px_rgba(188,19,254,0.1)] focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple focus:shadow-[0_0_15px_rgba(188,19,254,0.3)] transition-all font-tech sm:text-sm sm:leading-6 py-2 px-3"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button 
                                onClick={() => { playClick(); generateMetadata(); }}
                                onMouseEnter={playHover}
                                className="text-sm font-orbitron text-cyber-pink hover:text-pink-400 drop-shadow-[0_0_5px_rgba(255,0,85,0.5)] tracking-widest uppercase"
                            >
                                Re-Initialize
                            </button>
                        </div>
                        
                        {/* Translator Integration */}
                        <div className="border-t border-cyber-purple/30 pt-6 mt-6">
                            <MetadataTranslator originalMetadata={metadata} />
                        </div>
                    </div>
                )}
             </div>
          )}

          {/* Step 3: Assets */}
          {currentStep === 3 && (
             <div className="space-y-8 animate-fade-in">
                <div className="border-b border-cyber-blue/30 pb-4">
                  <h3 className="text-2xl font-orbitron leading-6 text-cyber-blue drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">Phase 3: Visual Assets</h3>
                  <p className="mt-2 text-sm text-cyber-blue/70 font-tech">Upload high-res icon (1024x1024) for automated resizing.</p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-blue">SOURCE ICON</label>
                        <div className="mt-2 flex justify-center border border-dashed border-cyber-blue/50 rounded-lg bg-black/30 px-6 py-10 hover:border-cyber-blue hover:bg-cyber-blue/5 transition-all group">
                            <div className="text-center">
                                <div className="mt-4 flex text-sm leading-6 text-gray-400 font-tech">
                                    <label htmlFor="file-upload" className="relative cursor-pointer font-bold text-cyber-blue hover:text-white transition-colors focus-within:outline-none">
                                    <span>SELECT SOURCE</span>
                                    <input 
                                      id="file-upload" 
                                      name="file-upload" 
                                      type="file" 
                                      className="sr-only" 
                                      onChange={(e) => {
                                          playClick();
                                          setAssets({...assets, icon: e.target.files ? e.target.files[0] : null})
                                      }} 
                                    />
                                    </label>
                                    <p className="pl-1">OR DRAG</p>
                                </div>
                                <p className="text-xs leading-5 text-gray-500 font-tech mt-2">PNG, JPG, GIF UP TO 10MB</p>
                                {assets.icon && <p className="mt-2 text-sm text-cyber-green font-bold drop-shadow-[0_0_5px_rgba(10,255,0,0.5)]">ACQUIRED: {assets.icon.name}</p>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                         {!assets.processed ? (
                             <button
                                type="button"
                                onClick={() => { playClick(); processImages(); }}
                                onMouseEnter={playHover}
                                disabled={!assets.icon || loading}
                                className="cyber-button w-full sm:w-auto"
                             >
                                {loading ? 'PROCESSING...' : 'INITIATE PROCESSING'}
                             </button>
                         ) : (
                            <div className="text-center p-6 border border-cyber-green/50 rounded-lg bg-black/50 shadow-[0_0_15px_rgba(10,255,0,0.2)] w-full">
                                <CheckIcon className="h-12 w-12 text-cyber-green mx-auto animate-bounce" />
                                <p className="mt-2 text-sm font-bold text-cyber-green font-orbitron">ASSETS GENERATED!</p>
                                <p className="text-xs text-gray-400 font-tech">{assets.processed.files.length} FILES CREATED</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="border-t border-cyber-purple/30 pt-6 mt-6">
                    <h4 className="text-lg font-orbitron text-cyber-blue mb-4 drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]">Holographic Framer</h4>
                    <p className="text-sm text-cyber-green font-tech mb-4">Generate device-framed visuals for public display.</p>
                    <ScreenshotFramer />
                </div>
             </div>
          )}

          {/* Step 4: Submission */}
          {currentStep === 4 && (
             <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-xl font-orbitron leading-6 text-cyber-blue drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">Phase 4: Deployment Sequence</h3>
                  <p className="mt-2 text-sm text-cyber-green font-tech">Select target system and initiate upload.</p>
                </div>

                <div className="space-y-4">
                     {/* Platform Selector */}
                     <div>
                        <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-purple">Target System</label>
                        <select
                          value={submission.platform}
                          onChange={(e) => setSubmission({...submission, platform: e.target.value as 'android' | 'ios'})}
                          className="mt-2 block w-full rounded border border-cyber-blue/50 bg-black/50 backdrop-blur-sm py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.2)] focus:border-cyber-pink focus:ring-0 focus:shadow-[0_0_15px_rgba(255,0,85,0.4)] transition-all font-tech sm:text-sm sm:leading-6"
                        >
                            <option value="android">Android (Google Play)</option>
                            <option value="ios">iOS (App Store Connect)</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-purple">Binary Payload ({submission.platform === 'android' ? '.aab' : '.ipa'})</label>
                        <input
                            type="file"
                            accept={submission.platform === 'android' ? ".aab" : ".ipa"}
                            onChange={(e) => setSubmission({...submission, buildFile: e.target.files?.[0] || null})}
                            className="mt-2 block w-full text-sm text-cyber-green font-tech file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-cyber-blue/50 file:text-sm file:font-orbitron file:bg-black/50 file:text-cyber-blue hover:file:bg-cyber-blue/20 file:cursor-pointer cursor-pointer"
                        />
                     </div>

                     {submission.platform === 'android' ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-purple">Package Identity</label>
                                <input
                                    type="text"
                                    value={submission.packageName}
                                    onChange={(e) => setSubmission({...submission, packageName: e.target.value})}
                                    placeholder="com.example.app"
                                    className="mt-2 block w-full rounded border border-cyber-blue/50 bg-black/50 backdrop-blur-sm py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.2)] focus:border-cyber-pink focus:ring-0 focus:shadow-[0_0_15px_rgba(255,0,85,0.4)] transition-all font-tech placeholder-gray-700 sm:text-sm sm:leading-6"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-purple">Deployment Track</label>
                                <select
                                    value={submission.track}
                                    onChange={(e) => setSubmission({...submission, track: e.target.value})}
                                    className="mt-2 block w-full rounded border border-cyber-blue/50 bg-black/50 backdrop-blur-sm py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.2)] focus:border-cyber-pink focus:ring-0 focus:shadow-[0_0_15px_rgba(255,0,85,0.4)] transition-all font-tech sm:text-sm sm:leading-6"
                                >
                                    <option value="internal">Internal</option>
                                    <option value="alpha">Alpha</option>
                                    <option value="beta">Beta</option>
                                    <option value="production">Production</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-purple">Service Credentials (JSON)</label>
                                <textarea
                                    rows={3}
                                    value={submission.serviceAccount}
                                    onChange={(e) => setSubmission({...submission, serviceAccount: e.target.value})}
                                    className="mt-2 block w-full rounded border border-cyber-blue/50 bg-black/50 backdrop-blur-sm py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.2)] focus:border-cyber-pink focus:ring-0 focus:shadow-[0_0_15px_rgba(255,0,85,0.4)] transition-all font-mono text-xs placeholder-gray-700"
                                    placeholder='{"type": "service_account"...}'
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-purple">Release Changelog</label>
                                    <div className="flex items-center space-x-2">
                                        <select
                                            value={notesTone}
                                            onChange={(e) => setNotesTone(e.target.value)}
                                            className="block rounded border border-cyber-blue/50 bg-black/50 py-1 pl-2 pr-8 text-xs font-orbitron text-cyber-blue focus:border-cyber-pink focus:outline-none focus:ring-0 sm:text-sm"
                                        >
                                            <option value="excited">Excited</option>
                                            <option value="professional">Professional</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => { playClick(); generateReleaseNotes(); }}
                                            onMouseEnter={playHover}
                                            disabled={generatingNotes}
                                            className="text-xs font-orbitron text-cyber-blue hover:text-cyber-pink disabled:opacity-50 border border-cyber-blue px-2 py-1 bg-black/50 hover:bg-cyber-blue/20 transition-all"
                                        >
                                            {generatingNotes ? 'PROCESSING...' : 'AI ENHANCE'}
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    rows={4}
                                    value={submission.changes}
                                    onChange={(e) => setSubmission({...submission, changes: e.target.value})}
                                    className="mt-2 block w-full rounded border border-cyber-blue/50 bg-black/50 backdrop-blur-sm py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.2)] focus:border-cyber-pink focus:ring-0 focus:shadow-[0_0_15px_rgba(255,0,85,0.4)] transition-all font-tech placeholder-gray-700 sm:text-sm sm:leading-6"
                                    placeholder="What's new in this release?"
                                />
                            </div>
                        </>
                     ) : (
                        <>
                             {/* iOS Fields */}
                             <div>
                                <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-purple">Issuer ID</label>
                                <input
                                    type="text"
                                    value={submission.issuerId}
                                    onChange={(e) => setSubmission({...submission, issuerId: e.target.value})}
                                    className="mt-2 block w-full rounded border border-cyber-blue/50 bg-black/50 backdrop-blur-sm py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.2)] focus:border-cyber-pink focus:ring-0 focus:shadow-[0_0_15px_rgba(255,0,85,0.4)] transition-all font-tech placeholder-gray-700 sm:text-sm sm:leading-6"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-purple">Key ID</label>
                                <input
                                    type="text"
                                    value={submission.keyId}
                                    onChange={(e) => setSubmission({...submission, keyId: e.target.value})}
                                    className="mt-2 block w-full rounded border border-cyber-blue/50 bg-black/50 backdrop-blur-sm py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.2)] focus:border-cyber-pink focus:ring-0 focus:shadow-[0_0_15px_rgba(255,0,85,0.4)] transition-all font-tech placeholder-gray-700 sm:text-sm sm:leading-6"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-bold font-orbitron leading-6 text-cyber-purple">Private Key (.p8 content)</label>
                                <textarea
                                    rows={3}
                                    value={submission.privateKey}
                                    onChange={(e) => setSubmission({...submission, privateKey: e.target.value})}
                                    className="mt-2 block w-full rounded border border-cyber-blue/50 bg-black/50 backdrop-blur-sm py-2 text-cyber-blue shadow-[0_0_10px_rgba(0,243,255,0.2)] focus:border-cyber-pink focus:ring-0 focus:shadow-[0_0_15px_rgba(255,0,85,0.4)] transition-all font-mono text-xs placeholder-gray-700"
                                    placeholder='-----BEGIN PRIVATE KEY-----...'
                                />
                            </div>
                        </>
                     )}

                     {submissionResult && (
                         <div className="rounded-lg border border-cyber-green bg-black/80 p-4 shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                             <div className="flex">
                                 <div className="flex-shrink-0">
                                     <CheckIcon className="h-6 w-6 text-cyber-green animate-pulse" aria-hidden="true" />
                                 </div>
                                 <div className="ml-3">
                                     <h3 className="text-sm font-orbitron text-cyber-green tracking-wider">SUBMISSION SUCCESSFUL</h3>
                                     <div className="mt-2 text-xs font-tech text-green-400">
                                         {submissionResult.result?.versionCode && <p>VERSION CODE: {submissionResult.result.versionCode}</p>}
                                         {submissionResult.result?.track && <p>TRACK: {submissionResult.result.track}</p>}
                                         {submissionResult.output && <pre className="text-xs mt-2 overflow-auto max-h-40 scrollbar-thin scrollbar-thumb-cyber-green scrollbar-track-black">{submissionResult.output}</pre>}
                                     </div>
                                 </div>
                             </div>
                         </div>
                     )}
                </div>
             </div>
          )}

          {error && (
            <div className="mt-4 p-4 text-sm text-red-500 bg-red-900/20 border border-red-500/50 rounded-lg backdrop-blur-md font-tech">
                <span className="font-bold font-orbitron mr-2">ERROR:</span> {error}
            </div>
          )}
        </div>
        
      </div>
      
      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="cyber-button bg-gray-900 border-gray-600 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          PREVIOUS PHASE
        </button>
        
        {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="cyber-button"
            >
              NEXT PHASE
            </button>
        ) : (
            <button
              type="button"
              onClick={submitApp}
              disabled={loading || !submission.buildFile}
              className="cyber-button border-cyber-pink text-cyber-pink hover:bg-cyber-pink/20 shadow-[0_0_15px_rgba(255,0,85,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading ? 'INITIATING LAUNCH...' : 'DEPLOY SYSTEM'}
            </button>
        )}
      </div>
      
      {showLogs && <LiveLogConsole />}
      {submissionResult && (
          <div className="mt-6 bg-cyber-green/10 border border-cyber-green p-4 font-tech text-cyber-green shadow-[0_0_20px_rgba(0,255,102,0.2)] rounded-lg backdrop-blur-md">
              <h3 className="text-xl font-orbitron mb-2 tracking-widest text-center">MISSION ACCOMPLISHED</h3>
              <pre className="whitespace-pre-wrap text-xs opacity-80">{JSON.stringify(submissionResult, null, 2)}</pre>
          </div>
      )}
    </div>
  );
}
