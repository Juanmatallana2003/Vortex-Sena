// app/layout.tsx
import './globals.css'; // Asegúrate de que tus estilos estén aquí
import type { Metadata } from 'next';
import React from "react";

export const metadata: Metadata = {
    title: 'Vortex - Kanban Board',
    description: 'Project management simplified',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
        <head>
            {/* Agregué FontAwesome ya que veo que usas clases fa-solid */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
            <title></title>
        </head>
        <body>
        {children}
        </body>
        </html>
    );
}