
import React from 'react';
import { GameState, HandState, MovementGesture, CombatGesture } from '../types';

interface HUDProps {
  gameState: GameState;
  handState: HandState;
}

const HUD: React.FC<HUDProps> = ({ gameState, handState }) => {
  const isLowHealth = gameState.health < 30;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 font-mono">
      {/* Barra Superior */}
      <div className="flex justify-between items-start">
        <div className="bg-black/60 border-l-4 border-cyan-500 p-4 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <div className="text-[10px] text-cyan-400 uppercase tracking-widest mb-1">Logs de Combate // Link Ativo</div>
          <div className="text-4xl font-black text-white italic">PONTOS: {gameState.score.toLocaleString()}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-4">
             <div className={`p-4 backdrop-blur-md border-b-4 transition-all duration-300 ${handState.leftHandPresent ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-black/40 border-transparent'}`}>
               <div className="text-[10px] text-blue-300 uppercase">Matriz de Movimento</div>
               <div className="text-xl font-bold tracking-tighter">{handState.movement}</div>
             </div>
             <div className={`p-4 backdrop-blur-md border-b-4 transition-all duration-300 ${handState.rightHandPresent ? 'bg-red-900/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-black/40 border-transparent'}`}>
               <div className="text-[10px] text-red-300 uppercase">Sistema de Armas</div>
               <div className="text-xl font-bold tracking-tighter">{handState.combat}</div>
             </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior */}
      <div className="flex justify-between items-end">
        <div className="flex gap-4 items-end">
           <div className={`bg-black/60 border-t-4 p-6 backdrop-blur-md min-w-[250px] transition-colors duration-300 ${isLowHealth ? 'border-red-600 animate-pulse' : 'border-green-500'}`}>
             <div className="flex justify-between items-center mb-2">
               <div className={`text-xs uppercase ${isLowHealth ? 'text-red-400' : 'text-green-400'}`}>Sinais Vitais {isLowHealth && '// CRÍTICO'}</div>
               <div className="text-xl font-black text-white">{gameState.health}%</div>
             </div>
             <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
               <div 
                 className={`h-full transition-all duration-500 ${isLowHealth ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'bg-green-500'}`} 
                 style={{ width: `${gameState.health}%` }} 
               />
             </div>
           </div>
        </div>

        <div className="bg-black/60 border-r-4 border-red-500 p-6 backdrop-blur-md text-right min-w-[250px]">
          <div className="text-xs text-red-400 uppercase mb-2 font-bold tracking-widest">Módulos de Munição</div>
          <div className="flex justify-end gap-1.5 mb-3">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2.5 h-8 rounded-sm transition-all duration-300 ${i < gameState.ammo ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] scale-y-100' : 'bg-white/5 scale-y-50'}`} 
              />
            ))}
          </div>
          <div className="text-4xl font-black text-white italic tracking-tighter">
            {gameState.isReloading ? (
              <span className="animate-pulse text-yellow-400 uppercase text-2xl">Ciclando...</span>
            ) : (
              `${gameState.ammo} / 10`
            )}
          </div>
        </div>
      </div>

      {/* Info de Haptic / IA Overlay */}
      <div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col gap-1 text-[8px] text-white/20 uppercase tracking-[0.2em]">
        <div>Link Neural: Estável</div>
        <div>Haptics: Online</div>
        <div>Ambiente: Simulado</div>
        <div>Nível de Ameaça: Crescente</div>
      </div>
    </div>
  );
};

export default HUD;
