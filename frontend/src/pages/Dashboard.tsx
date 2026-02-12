import { Link } from 'react-router-dom';
import { useFuturisticSound } from '../hooks/useFuturisticSound';

export default function Dashboard() {
  const { playClick, playHover } = useFuturisticSound();

  return (
    <div>
      <h1 className="text-5xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-white to-cyber-purple drop-shadow-[0_0_10px_rgba(0,243,255,0.8)] mb-2 tracking-tighter">
        COMMAND CENTER
      </h1>
      <p className="mt-2 text-xl leading-6 text-cyber-blue/70 font-rajdhani mb-8 tracking-wide">
        SELECT OPERATION MODULE //
      </p>
      
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Wizard Card */}
        <div className="cyber-card group">
          <div className="px-6 py-6 sm:p-8">
            <h3 className="text-xl font-orbitron font-bold text-cyber-blue group-hover:text-white transition-colors">MISSION WIZARD</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-400 font-rajdhani">
              <p>Launch guided submission sequence. Initialize new application deployment protocols.</p>
            </div>
            <div className="mt-6">
              <Link 
                to="/wizard" 
                onClick={playClick}
                onMouseEnter={playHover}
                className="cyber-button inline-flex"
              >
                INITIALIZE
              </Link>
            </div>
          </div>
        </div>

        {/* Image Processor Card */}
        <div className="cyber-card group">
          <div className="px-6 py-6 sm:p-8">
            <h3 className="text-xl font-orbitron font-bold text-cyber-purple group-hover:text-white transition-colors">SPRITE LAB</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-400 font-rajdhani">
              <p>Process visual assets. Resize and optimize holographic icons and screenshots.</p>
            </div>
            <div className="mt-6">
              <Link 
                to="/images" 
                onClick={playClick}
                onMouseEnter={playHover}
                className="cyber-button-secondary inline-flex"
              >
                ACCESS LAB
              </Link>
            </div>
          </div>
        </div>

        {/* Metadata Card */}
        <div className="cyber-card group">
          <div className="px-6 py-6 sm:p-8">
            <h3 className="text-xl font-orbitron font-bold text-cyber-green group-hover:text-white transition-colors">NEURAL LINK</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-400 font-rajdhani">
              <p>Generate ASO-optimized data using local neural networks (Ollama).</p>
            </div>
            <div className="mt-6">
              <Link 
                to="/metadata" 
                onClick={playClick}
                onMouseEnter={playHover}
                className="relative overflow-hidden bg-cyber-green/10 border border-cyber-green/50 text-cyber-green font-orbitron font-bold tracking-wider py-2 px-6 rounded transition-all duration-300 uppercase text-sm hover:bg-cyber-green hover:text-black hover:shadow-[0_0_10px_#0aff00] active:scale-95 inline-flex"
              >
                CONNECT
              </Link>
            </div>
          </div>
        </div>

        {/* Submission Card */}
        <div className="cyber-card group">
          <div className="px-6 py-6 sm:p-8">
            <h3 className="text-xl font-orbitron font-bold text-cyber-pink group-hover:text-white transition-colors">LAUNCH PAD</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-400 font-rajdhani">
              <p>Execute final deployment to Android and iOS sectors.</p>
            </div>
            <div className="mt-6">
              <Link 
                to="/submission" 
                onClick={playClick}
                onMouseEnter={playHover}
                className="relative overflow-hidden bg-cyber-pink/10 border border-cyber-pink/50 text-cyber-pink font-orbitron font-bold tracking-wider py-2 px-6 rounded transition-all duration-300 uppercase text-sm hover:bg-cyber-pink hover:text-white hover:shadow-neon-pink active:scale-95 inline-flex"
              >
                ENGAGE
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
