/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Brain, 
  Cpu, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Scale, 
  ShieldAlert, 
  Sliders,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Activity
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }: SidebarProps) {
  const menuItems = [
    { id: "command", label: "Centro de Comando", icon: LayoutDashboard, symbol: "⌂" },
    { id: "intelligence", label: "Inteligência", icon: Brain, symbol: "◉" },
    { id: "operations", label: "Operações", icon: Cpu, symbol: "▣" },
    { id: "people", label: "Pessoas", icon: Users, symbol: "♙" },
    { id: "finance", label: "Finanças", icon: DollarSign, symbol: "◈" },
    { id: "market", label: "Mercado", icon: TrendingUp, symbol: "◌" },
    { id: "legal", label: "Jurídico", icon: Scale, symbol: "⚖" },
    { id: "security", label: "Segurança", icon: ShieldAlert, symbol: "🛡" },
    { id: "system", label: "Sistema", icon: Sliders, symbol: "⚙" },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? "72px" : "260px" }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="h-screen bg-[#0D0D0D]/90 border-r border-white/5 backdrop-blur-xl flex flex-col justify-between select-none sticky top-0 z-40 transition-shadow duration-300"
      id="sidebar-container"
    >
      {/* Upper Brand Info */}
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden pt-6">
        <div className="px-5 flex items-center justify-between min-h-[48px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg relative shrink-0">
              <span className="font-display font-bold text-sm tracking-tighter text-white">Æ</span>
              <div className="absolute inset-0 rounded-lg bg-white/20 animate-pulse" />
            </div>
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col"
                >
                  <span className="font-display font-semibold tracking-widest text-[#FFFFFF] text-sm">AETHER OS</span>
                  <span className="text-[10px] text-gray-500 font-mono tracking-tight font-medium uppercase">Empresa Neural</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors cursor-pointer hidden md:block"
              id="collapse-sidebar-btn"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="mt-8 px-3 space-y-1.5 flex-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                id={`sidebar-tab-${item.id}`}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group cursor-pointer ${
                  isActive 
                    ? "text-white font-medium bg-white/3" 
                    : "text-gray-400 hover:text-white hover:bg-white/1"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 top-1 bottom-1 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                
                <div className="relative flex items-center shrink-0">
                  <span className="absolute -left-1 text-[11px] font-mono text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline">
                    {item.symbol}
                  </span>
                  <IconComponent 
                    size={16} 
                    className={`transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? "text-blue-400" : "text-gray-400"
                    }`}
                  />
                </div>

                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate font-display tracking-wide"
                  >
                    {item.label}
                  </motion.span>
                )}
                
                {isCollapsed && (
                  <div className="absolute left-16 bg-black border border-white/10 text-white text-xs py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl font-display">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Collapse Trigger for bottom when collapsed */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-3">
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full py-2 flex items-center justify-center hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
            id="expand-sidebar-btn"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Neural Core Diagnostics */}
        {!isCollapsed && (
          <div className="p-3 bg-white/1 rounded-lg border border-white/5 flex flex-col gap-1.5 font-mono text-[10px] text-gray-500">
            <div className="flex items-center justify-between text-gray-400">
              <span className="flex items-center gap-1">
                <Activity size={10} className="text-emerald-400 animate-pulse" />
                VANGUARD L3
              </span>
              <span className="text-emerald-400 select-all font-semibold">99.98%</span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[99.98%]" />
            </div>
            <span className="text-gray-600 block mt-0.5">TEMP. NÚCLEO CPU: 34°C</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
