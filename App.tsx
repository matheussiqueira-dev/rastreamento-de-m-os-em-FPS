
import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameContainer from './components/GameContainer';
import HandTracker from './components/HandTracker';
import HUD from './components/HUD';
import CinematicGenerator from './components/CinematicGenerator';
import { HandState, MovementGesture, CombatGesture, GameState, GameStatus } from './types';

const App: React.FC = () => {
  const [handState, setHandState] = useState<HandState>({
    movement: MovementGesture.STOP,
    combat: CombatGesture.IDLE,
    leftHandPresent: false,
    rightHandPresent: false,
  });

  // Added isGameOver to initial state to satisfy GameState interface
  const [gameState, setGameState] = useState<GameState>({
    ammo: 10,
    score: 0,
    health: 100,
    status: GameStatus.MENU,
    isReloading: false,
    lastDamageTime: 0,
    isGameOver: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [isCinematicOpen, setIsCinematicOpen] = useState(false);
  const stepCount = useRef(0);

  const HAPTIC_PATTERNS = {
    FIRE: [45],
    RELOAD: [50, 80, 50, 150, 100],
    DAMAGE_CRITICAL: [200, 100, 200, 100, 300],
    WALK_CONCRETE: [15],
    WALK_METAL: [10, 25, 10],
  };

  const triggerHaptic = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const handleHandUpdate = useCallback((newState: HandState) => {
    setHandState(newState);
  }, []);

  const handleScoreUpdate = useCallback((points: number) => {
    setGameState(prev => ({ ...prev, score: prev.score + points }));
  }, []);

  const handleShoot = useCallback(() => {
    setGameState(prev => {
      if (prev.ammo > 0 && !prev.isReloading) {
        triggerHaptic(HAPTIC_PATTERNS.FIRE);
        return { ...prev, ammo: prev.ammo - 1 };
      }
      return prev;
    });
  }, []);

  const handleReload = useCallback(() => {
    if (gameState.isReloading || gameState.ammo === 10) return;
    
    setGameState(prev => ({ ...prev, isReloading: true }));
    triggerHaptic(HAPTIC_PATTERNS.RELOAD);
    
    setTimeout(() => {
      setGameState(prev => ({ ...prev, ammo: 10, isReloading: false }));
    }, 1500);
  }, [gameState.isReloading, gameState.ammo]);

  const handleTakeDamage = useCallback((amount: number) => {
    setGameState(prev => {
      if (prev.health <= 0 || prev.status !== GameStatus.PLAYING) return prev;
      triggerHaptic(HAPTIC_PATTERNS.DAMAGE_CRITICAL);
      const newHealth = Math.max(0, prev.health - amount);
      const isDead = newHealth <= 0;
      return { 
        ...prev, 
        health: newHealth, 
        lastDamageTime: Date.now(),
        status: isDead ? GameStatus.GAMEOVER : prev.status,
        isGameOver: isDead
      };
    });
  }, []);

  // Update startGame to reset isGameOver to false
  const startGame = () => {
    setGameState(prev => ({ ...prev, status: GameStatus.PLAYING, health: 100, ammo: 10, score: 0, isGameOver: false }));
  };

  useEffect(() => {
    if (handState.combat === CombatGesture.RELOAD && gameState.status === GameStatus.PLAYING) {
      handleReload();
    }
  }, [handState.combat, handleReload, gameState.status]);

  useEffect(() => {
    let interval: number;
    if (handState.movement !== MovementGesture.STOP && gameState.status === GameStatus.PLAYING && !isCinematicOpen) {
      interval = window.setInterval(() => {
        stepCount.current++;
        const stepCycle = stepCount.current % 16;
        const isOnMetal = stepCycle > 12;
        triggerHaptic(isOnMetal ? HAPTIC_PATTERNS.WALK_METAL : HAPTIC_PATTERNS.WALK_CONCRETE);
      }, 450);
    }
    return () => clearInterval(interval);
  }, [handState.movement, gameState.status, isCinematicOpen]);

  const isGameOver = gameState.status === GameStatus.GAMEOVER;
  const isMenu = gameState.status === GameStatus.MENU;
  const isPlaying = gameState.status === GameStatus.PLAYING;

  return (
    <div className="relative w-full h-screen bg-neutral-900 overflow-hidden font-sans">
      {/* Mundo do Jogo 3D - Fixed type error by passing the updated gameState directly */}
      <GameContainer 
        handState={handState} 
        gameState={gameState}
        onShoot={handleShoot}
        onScore={handleScoreUpdate}
        onTakeDamage={handleTakeDamage}
      />

      {/* Botão Gerador Cinemático */}
      {isPlaying && (
        <button 
          onClick={() => setIsCinematicOpen(true)}
          className="absolute top-4 right-4 z-[60] bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg transition-all border border-white/20 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
          GERAR CINEMÁTICA
        </button>
      )}

      {/* Modal Cinemático */}
      {isCinematicOpen && <CinematicGenerator onClose={() => setIsCinematicOpen(false)} />}

      {/* Overlay de Rastreamento de Mão */}
      <div className="absolute bottom-4 right-4 w-64 h-48 border-2 border-white/20 rounded-lg overflow-hidden bg-black/50 shadow-2xl z-50">
        <HandTracker onUpdate={handleHandUpdate} onError={setError} />
      </div>

      {/* Erro de Câmera */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-[110] p-6 text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Erro de Hardware</h2>
            <p className="text-white/80 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white font-bold rounded uppercase hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Menu Inicial */}
      {isMenu && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-2xl z-[100] animate-in fade-in zoom-in duration-700">
           <div className="text-center max-w-2xl px-8">
             <div className="mb-2 text-cyan-400 font-bold tracking-[0.5em] uppercase text-xs">Simulação Neural Ativa</div>
             <h1 className="text-8xl font-black text-white italic tracking-tighter mb-8 leading-none">GESTURE<br/><span className="text-cyan-500">STRIKE</span></h1>
             
             <div className="grid grid-cols-2 gap-8 mb-12 text-left">
                <div className="border-l-2 border-white/20 pl-4">
                  <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-widest">Movimentação (✋)</h3>
                  <p className="text-white/40 text-xs leading-relaxed">Posicione sua mão esquerda para navegar. Feche o punho (👊) para parar.</p>
                </div>
                <div className="border-l-2 border-white/20 pl-4">
                  <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-widest">Combate (👉)</h3>
                  <p className="text-white/40 text-xs leading-relaxed">Use a mão direita para mirar. Dobre o indicador para disparar.</p>
                </div>
             </div>

             <button 
              onClick={startGame}
              className="group relative px-12 py-5 bg-white text-black font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all transform hover:scale-105 active:scale-95"
             >
               <span className="relative z-10">Iniciar Link Neural</span>
               <div className="absolute inset-0 bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
             </button>
           </div>
        </div>
      )}

      {/* Tela de Game Over */}
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-[100] animate-in fade-in duration-500">
           <div className="text-center">
             <h1 className="text-8xl font-black text-red-600 italic tracking-tighter mb-4 animate-pulse">DESATIVADO</h1>
             <p className="text-white/40 mb-8 uppercase tracking-[0.3em]">Pontuação Final: {gameState.score}</p>
             <button 
              onClick={startGame}
              className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
             >
               Reiniciar Sistema
             </button>
           </div>
        </div>
      )}

      {/* Visualização de Zonas */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none flex">
          <div className={`w-1/2 h-full border-r border-white/5 flex items-center justify-center transition-colors duration-500 ${handState.leftHandPresent ? 'bg-blue-500/[0.02]' : ''}`}>
             <span className="text-white/5 uppercase tracking-[1em] font-black text-2xl rotate-90">Navegação</span>
          </div>
          <div className={`w-1/2 h-full flex items-center justify-center transition-colors duration-500 ${handState.rightHandPresent ? 'bg-red-500/[0.02]' : ''}`}>
             <span className="text-white/5 uppercase tracking-[1em] font-black text-2xl -rotate-90">Armamento</span>
          </div>
        </div>
      )}

      {/* HUD e Elementos Visuais */}
      {isPlaying && <HUD gameState={gameState} handState={handState} />}
      
      {isPlaying && Date.now() - gameState.lastDamageTime < 300 && (
        <div className="absolute inset-0 pointer-events-none bg-red-600/20 z-40 animate-pulse border-[20px] border-red-900/40" />
      )}

      {/* Rodapé de Créditos */}
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-black/40 backdrop-blur-sm px-3 py-1 border border-white/10 rounded text-[10px] font-bold text-white/40 tracking-widest uppercase">
          Matheus Siqueira // Protótipo v1.0
        </div>
      </div>
    </div>
  );
};

export default App;