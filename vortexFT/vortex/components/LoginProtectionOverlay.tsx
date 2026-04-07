"use client";

import React from "react";

//  MODULO de Login Profesional Difuminado sobre el Background / Mismo Apple look 🚀

interface LoginProtectionProps {
    isLoading: boolean;
    isAuthenticated: boolean;
    githubOauthUrl: string; // Para conectarle el 'http://localhost:8080/...' Desde Arriba !
}

export default function LoginProtectionOverlay({
  isLoading,
  isAuthenticated,
  githubOauthUrl
}: LoginProtectionProps) {

  // SI Sí te validaron credencial en github Java : NO TAPE NINGUN VISUAL PARA TI MAESTRO
  if (isAuthenticated) {
     return null; // Ocultamos Muralla.
  }

  return (
    // CONTENEDOR 100% (Pantalla llena Overlay Cristal a Blur). Todo Atrás queda inalterable para no destrozarte Layouts y Módulo Pano de Pantalla: 
    <div className="absolute inset-0 z-[1000] flex items-center justify-center p-4 font-sans h-screen w-screen overflow-hidden">
       {/* 1) FILTRO DE EFECTO NETFLIX PARA ENSOMBRESER LA DATA Y EL FALSO ESQUELETO Y PROTEGIDO DETRÁS*/}
       <div className="absolute w-[110%] h-[110%] pointer-events-none select-none brightness-[0.4] saturate-[0.5] opacity-50 z-10 transition-all duration-[2000ms] backdrop-blur-[6px] ">
            <div className="h-full w-full bg-black/10 mix-blend-multiply"></div> 
       </div>
       <div className="absolute inset-0 backdrop-blur-[20px] z-[12]"></div>
        
       {/* LA GRAN TARJETA VISUAL! A PANTALLA GIGANTE ESTILO VERCEL AUTH (Total Estetica Premium Apple). NO USA PNG DEL RED. LOGO PURO PARA 0 FALLOS/404s!  */}
       <div className="bg-white/95 dark:bg-[#131315]/80 border border-neutral-300 dark:border-neutral-800 rounded-3xl shadow-2xl p-10 max-w-[400px] w-full flex flex-col items-center relative overflow-hidden transform scale-100 z-50  ring-1 ring-white/10 mt-[-3vh]  backdrop-blur-md ">
          
           {/* Brillos led neon laterales a la Box OAuth (No es un problema estructural). Estilazos!  */}
           <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/10 rounded-full blur-[50px] pointer-events-none transition-all hover:bg-blue-600/20"></div>
           <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none"></div>

           {isLoading ? (
               <div className="z-10 flex flex-col items-center py-6 gap-6 h-[176px] justify-center ">
                   <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-500 "></i>
                   <p className="font-semibold tracking-wider text-[11px] uppercase text-neutral-600 dark:text-neutral-300 animate-pulse ">Escaneando Autenticaciones...</p>
               </div>
           ) : (
               <div className="z-10 flex flex-col items-center text-center animate-fade-in duration-500 w-full ">
                    
                    {/* LA SALVACIÓN: Tu ícono font awensome no rebotado y Puro HTML para logo github blanco.*/}
                    <div className="w-[85px] h-[85px] bg-[#111113] border-4 border-neutral-800 text-white flex items-center justify-center rounded-[24px] mb-8 shadow-2xl shadow-black relative z-10 transition duration-700 transform hover:scale-[1.03]  group cursor-pointer">
                         <i className="fa-brands fa-github text-[48px] drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]"></i>
                    </div>
                    
                    <h1 className="text-[24px] font-extrabold tracking-tight text-neutral-900 dark:text-gray-100 mb-3  w-full drop-shadow-md  ">
                        Entra a VORTEX
                    </h1>
                    <p className="text-[13px] text-neutral-600 dark:text-neutral-400 mb-8 font-medium  leading-relaxed px-4 opacity-90 mx-auto tracking-normal">
                        Tú Agilidad Operativa al Máximo . Necesitamos vincular la App e identificarte hoy frente la Nube del Código OAuth! 
                    </p>
                    
                    <button
                        onClick={() => window.location.href = githubOauthUrl}
                        className="w-[95%] h-[50px] text-sm tracking-wide bg-[#2ea043] text-white font-extrabold rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-[#2c974b] hover:shadow-[0_8px_30px_rgba(46,160,67,0.35)] active:scale-[0.98] group mx-auto mb-2"
                    >
                         <i className="fa-brands fa-github text-xl transition-transform group-hover:-translate-y-1"></i>
                        Inicia sesión con GitHub
                    </button>
                    
                    <p className="text-[10px] text-neutral-400 font-bold uppercase mt-8 tracking-widest "> End/End SSL Protegido.  v.3.2</p>
               </div>
           )}
       </div>
    </div>
  );
}