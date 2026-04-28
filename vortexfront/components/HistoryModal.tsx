"use client";

import React, { useEffect } from 'react';
import { ChangeLogEntry } from '../types';

interface HistoryModalProps {
  onClose: () => void;
  history: ChangeLogEntry[];
  onOpenCard?: (cardId: string) => void;
}

// Función auxiliar para parsear fechas de forma legible
const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const secondsPast = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (secondsPast < 60) return 'Hace unos segundos';
    if (secondsPast < 3600) return `Hace ${Math.floor(secondsPast / 60)} min`;
    if (secondsPast <= 86400) return `Hace ${Math.floor(secondsPast / 3600)} horas`;
    
    return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Asignación inteligente de iconos y colores según la descripción de la acción
const getEventIconAndColor = (description: string) => {
    const descLower = description.toLowerCase();
    if (descLower.includes('moved') || descLower.includes('movido')) return { icon: 'fa-solid fa-arrows-up-down-left-right', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
    if (descLower.includes('deleted') || descLower.includes('eliminad')) return { icon: 'fa-solid fa-trash-can', color: 'text-red-400 bg-red-400/10 border-red-400/20' };
    if (descLower.includes('created') || descLower.includes('nuevo')) return { icon: 'fa-solid fa-plus', color: 'text-green-400 bg-green-400/10 border-green-400/20' };
    if (descLower.includes('edited') || descLower.includes('editad')) return { icon: 'fa-solid fa-pen-nib', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' };
    return { icon: 'fa-solid fa-bolt', color: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20' }; // Default
};

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, history, onOpenCard }) => {
  
  // Bloquear el scroll del fondo cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  },[]);

  const handleModalContentClick = (e: React.MouseEvent) => { e.stopPropagation(); };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-[6px] animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-[#2a2a2e] rounded-2xl w-full max-w-2xl h-[85vh] sm:h-[80vh] flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden transform scale-100 transition-all duration-300"
        onClick={handleModalContentClick}
      >
        {/* ENCABEZADO PREMIUM */}
        <header className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-neutral-200 dark:border-[#2a2a2e] bg-gray-50 dark:bg-[#161618] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <i className="fa-solid fa-clock-rotate-left text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-[19px] font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-tight">Auditoría del Proyecto</h2>
              <p className="text-[12px] text-neutral-500 font-medium tracking-wide mt-0.5">Historial cronológico de eventos ({history.length})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all active:scale-95"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </header>

        {/* CUERPO DE LA LÍNEA DE TIEMPO (TIMELINE) */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 custom-scrollbar bg-gray-50/30 dark:bg-[#121214]">
          
          {history.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-neutral-500 opacity-60">
                <i className="fa-solid fa-wind text-4xl mb-4"></i>
                <p className="font-semibold text-sm tracking-widest uppercase">Sin registros recientes</p>
             </div>
          ) : (
            <div className="relative pl-4 sm:pl-6 border-l-[2px] border-neutral-200 dark:border-[#2a2a2e] space-y-8 pb-10">
              {history.map((log, index) => {
                const styleObj = getEventIconAndColor(log.description);
                return (
                  <div key={log.id || index} className="relative group animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    
                    {/* El Nodo / Punto de la línea de tiempo */}
                    <div className="absolute -left-[22px] sm:-left-[31px] top-1">
                        <img 
                            src={log.user.avatar} 
                            alt={log.user.name} 
                            className="w-10 h-10 rounded-full border-[3px] border-white dark:border-[#121214] object-cover shadow-sm group-hover:scale-110 transition-transform duration-300 z-10 relative" 
                            onError={(e) => { e.currentTarget.src = "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" }}
                        />
                    </div>

                    {/* Tarjeta de Contenido (Regla 60/40 Aurea aplicada en padding y layout) */}
                    <div className="ml-8 sm:ml-10 bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-[#2a2a2e] rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200">
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-[14px] text-neutral-900 dark:text-neutral-100">{log.user.name}</span>
                                    {log.type === 'automatic' && (
                                        <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Bot / Webhook</span>
                                    )}
                                </div>
                                <span className="text-[11px] text-neutral-500 font-medium tracking-wide">
                                    <i className="fa-regular fa-clock mr-1.5"></i>
                                    {formatTimeAgo(log.timestamp)}
                                </span>
                            </div>

                            {/* Badge Visual del tipo de acción */}
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${styleObj.color} self-start sm:self-auto`}>
                                <i className={`${styleObj.icon} text-[10px]`}></i>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{log.description.substring(0,25)}</span>
                            </div>
                        </div>

                        {/* Detalles de la acción */}
                        <div className="bg-gray-50 dark:bg-[#121213] rounded-lg p-3 border border-neutral-100 dark:border-[#232327]">
                            <p className="text-[13px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                {log.details || "No hay detalles extendidos para esta acción."}
                            </p>
                        </div>

                        {/* Botón de acceso directo si la acción está ligada a un Issue */}
                        {log.cardId && onOpenCard && (
                            <button 
                                onClick={() => { onOpenCard(log.cardId!); onClose(); }}
                                className="mt-4 flex items-center gap-2 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-all"
                            >
                                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                Inspeccionar Ticket Afectado
                            </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Estilos CSS Nativos incrustados para la barra de scroll de este modal */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a2a2e; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.4s ease-out forwards; opacity: 0; }
      `}</style>
    </div>
  );
};

export default HistoryModal;