/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Sparkles, Bell, Globe, ArrowRight, ShieldCheck, Terminal } from "lucide-react";

interface HeaderProps {
  status: "Normal" | "Alert" | "Critical";
  onUniversalQuerySubmit: (query: string) => void;
  riskCount: number;
}

export default function Header({ status = "Normal", onUniversalQuerySubmit, riskCount }: HeaderProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onUniversalQuerySubmit(query);
      setQuery("");
    }
  };

  // Resolve status tags
  const getStatusConfig = () => {
    if (status === "Critical" || riskCount > 3) {
      return {
        label: "Risco Detectado",
        color: "text-red-400 bg-red-500/10 border-red-500/20",
        bullet: "bg-red-500 shadow-[0_0_10px_#ef4444]",
      };
    }
    if (status === "Alert" || riskCount > 0) {
      return {
        label: "Atenção Necessária",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        bullet: "bg-amber-500 shadow-[0_0_10px_#f59e0b]",
      };
    }
    return {
      label: "Operação Normal",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      bullet: "bg-emerald-500 shadow-[0_0_10px_#10b981]",
    };
  };

  const currentStatus = getStatusConfig();

  return (
    <header 
      className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-white/5 bg-[#050505]/80 px-6 backdrop-blur-md select-none"
      id="global-header"
    >
      {/* Platform & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-blue-400" />
          <span className="font-display font-medium tracking-tight text-white hidden md:inline">STATUS DO SISTEMA:</span>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-medium tracking-wide transition-all ${currentStatus.color}`}>
          <span className={`h-2 w-2 rounded-full ${currentStatus.bullet} animate-pulse`} />
          {currentStatus.label}
        </div>
      </div>

      {/* IA Universal Field */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-xl mx-8 relative" id="header-universal-search-form">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
            <Search size={16} />
          </div>
          
          <input
            type="text"
            className="w-full h-10 bg-white/3 hover:bg-white/5 border border-white/8 focus:border-blue-500/60 focus:bg-white/5 focus:outline-none rounded-full pl-11 pr-12 text-sm text-white placeholder-gray-500 tracking-wide font-sans transition-all"
            placeholder="O que você precisa saber hoje? (Pergunte ao AETHER AI...)"
            value={query}
            id="universal-ai-input"
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="absolute inset-y-0 right-3 flex items-center">
            {query.trim() ? (
              <button 
                type="submit" 
                className="p-1 text-blue-400 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                title="Submeter pergunta à inteligência neural"
              >
                <ArrowRight size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-gray-500 select-none">
                <Sparkles size={10} className="text-blue-400/80" />
                <span>AETHER AI</span>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Profile & Controls */}
      <div className="flex items-center gap-4">
        {/* Network Location Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500 font-mono">
          <Globe size={12} className="text-gray-600 animate-spin-slow" />
          <span>LATÊNCIA: 12ms</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer relative">
            <Bell size={16} />
            {riskCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/5">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-medium text-white tracking-wide">Gabriel G.</span>
            <span className="text-[9px] text-[#A1A1AA] font-mono uppercase tracking-tight">Diretor Geral IA</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center border border-white/10 shadow-md">
            <span className="font-display font-medium text-xs text-white">GG</span>
          </div>
        </div>
      </div>
    </header>
  );
}
