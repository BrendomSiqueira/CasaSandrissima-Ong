import React from 'react';
import siteBg from '../assets/images/site_background.jpg';

/**
 * SiteAmbientBackground
 * 
 * Exibe a imagem de fundo oficial da Casa Sandríssima solicitada pelo usuário:
 * Composição geométrica e botânica abstrata em tons de verde esmeralda, floresta e menta,
 * integrando folhagens orgânicas, faixas de luz luminescente com linhas de contorno finas
 * e micro-partículas brilhantes flutuantes.
 * 
 * - Fixada na janela de visualização (fixed inset-0, object-cover)
 * - Equilíbrio visual refinado para garantir alta legibilidade de todos os cartões,
 *   textos e elementos da interface.
 */
export default function SiteAmbientBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
      id="site-ambient-background"
    >
      {/* 1. Imagem de Fundo Oficial Solicitada */}
      <img
        src={siteBg}
        alt="Plano de Fundo Casa Sandríssima"
        className="w-full h-full object-cover object-center fixed inset-0 scale-100"
        referrerPolicy="no-referrer"
      />

      {/* 2. Micro-profundidade e iluminação difusa */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25 pointer-events-none" />

      {/* 3. Escudo central suave para harmonizar o contraste de leitura dos cartões e formulários */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#f4f9f6]/20 to-transparent pointer-events-none" />
    </div>
  );
}
