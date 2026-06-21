/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Zap,
  Globe,
  Database,
  Briefcase,
  Play,
  RotateCcw,
  Shield,
  HelpCircle,
  DollarSign,
  Maximize2,
  Lock,
  Cpu,
  CornerDownRight,
  Send,
  AlertOctagon,
  UserCheck,
  Check,
  BadgeAlert,
  Users,
  Brain
} from "lucide-react";

// Local interfaces based on backend models
import { 
  CompanyMetrics, 
  ProductionTelemetry, 
  SupplyChainRoute, 
  ProjectTask, 
  Employee, 
  VirtualWorker, 
  ContractRisk, 
  ThreatLog, 
  CompetitorData, 
  AIRecommendation, 
  ChatMessage 
} from "./types";

export default function App() {
  // Sidebar states
  const [activeTab, setActiveTab] = useState<string>("command");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // App States
  const [stateData, setStateData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null);
  const [isSimulatingRec, setIsSimulatingRec] = useState<boolean>(false);
  const [simulationPrompt, setSimulationPrompt] = useState<string>("");
  const [customSimulationResult, setCustomSimulationResult] = useState<any>(null);
  const [isCustomSimulating, setIsCustomSimulating] = useState<boolean>(false);

  // Quick Assist / floating Chat States
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "model",
      text: "Olá! Eu sou o **AETHER OS Core Assistant**. Estou conectado em tempo real à infraestrutura, finanças e matriz de talentos da empresa. Pergunte-me qualquer coisa sobre nossa operação, gargalos logísticos ou sugira simulações de cenários.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatSending, setIsChatSending] = useState<boolean>(false);

  // Selected Detail Card modal
  const [activeAnalysisCard, setActiveAnalysisCard] = useState<{
    title: string;
    description: string;
    forecast: string;
    details: Array<{ label: string; value: string }>;
  } | null>(null);

  // Fetch company operational status
  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/company/status");
      if (response.ok) {
        const data = await response.json();
        setStateData(data);
      }
    } catch (e) {
      console.error("Erro de sincronização com AETHER Core API:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll telemetry data every 8 seconds for visual alive metrics
    const interval = setInterval(() => {
      fetchStatus();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Universal Header Query Submission: redirects queries to chat assistant + opens it
  const handleUniversalQuerySubmit = async (query: string) => {
    setIsAssistantOpen(true);
    await sendChatMessage(query);
  };

  // Submit action simulator (Simulate, Execute, Ignore on recommendation)
  const handleRecommendationAction = async (recId: string, action: "simulate" | "execute" | "ignore") => {
    if (action === "simulate") {
      setIsSimulatingRec(true);
      // Simulate quick action response delayed for maximum tech feedback
      setTimeout(() => {
        setIsSimulatingRec(false);
        const recommendation = stateData?.aiRecommendations?.find((r: any) => r.id === recId);
        if (recommendation) {
          setSelectedRec({
            ...recommendation,
            status: "simulating"
          });
          // Update local status mock for simulation feel
          const updatedRecs = stateData.aiRecommendations.map((r: any) => 
            r.id === recId ? { ...r, status: "simulating" } : r
          );
          setStateData({ ...stateData, aiRecommendations: updatedRecs });
        }
      }, 1000);
      return;
    }

    try {
      const response = await fetch("/api/company/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId: recId, action })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          fetchStatus(); // Reload updated stats from server state
          if (selectedRec?.id === recId) {
            setSelectedRec(null);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao aplicar ação corporativa executiva:", error);
    }
  };

  // Chat message submit to Gemini / endpoint
  const sendChatMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}-user`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatSending(true);

    try {
      const chatPayload = [
        ...chatMessages.map(m => ({ role: m.role, text: m.text })),
      ];

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatPayload, userPrompt: textToSend })
      });

      if (response.ok) {
        const reply = await response.json();
        const modelMsg: ChatMessage = {
          id: `m-${Date.now()}-model`,
          role: "model",
          text: reply.text,
          timestamp: new Date(reply.timestamp).toLocaleTimeString()
        };
        setChatMessages((prev) => [...prev, modelMsg]);
      } else {
        throw new Error("API central com latência indesejada hoje.");
      }
    } catch (e) {
      // Fallback local response
      const errMsg: ChatMessage = {
        id: `m-${Date.now()}-model`,
        role: "model",
        text: "Desculpe, meu processador central está operando em buffer limitado ou offline temporário. Reajustando frequências da rede neural. Por favor, tente enviar novamente.",
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Core Simulation custom query (predictions digital twin screen prompt)
  const submitCustomSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulationPrompt.trim()) return;
    setIsCustomSimulating(true);
    setCustomSimulationResult(null);

    try {
      const response = await fetch("/api/company/simulate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: simulationPrompt })
      });
      if (response.ok) {
        const resData = await response.json();
        setCustomSimulationResult(resData);
      }
    } catch (err) {
      console.error("Simulação falhou:", err);
    } finally {
      setIsCustomSimulating(false);
    }
  };

  if (loading || !stateData) {
    return (
      <div className="h-screen w-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden" id="initial-loading-splash">
        {/* Futuristic glowing backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="z-10 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 flex items-center justify-center relative p-0.5 shadow-2xl">
            <span className="font-display font-extrabold text-[#FFFFFF] text-2xl">Æ</span>
            <div className="absolute inset-0 rounded-2xl bg-white/10 animate-ping opacity-60" style={{ animationDuration: '2.5s' }} />
          </div>

          <div className="text-center flex flex-col gap-1.5">
            <h2 className="text-white font-display font-semibold tracking-widest text-lg uppercase">AETHER OS</h2>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Orquestrando Inteligência de Negócios</p>
          </div>

          <div className="flex flex-col items-center gap-2 mt-4">
            <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-2/3 animate-pulse" />
            </div>
            <span className="text-[10px] text-blue-500 font-mono animate-pulse uppercase tracking-widest">Sinalizando Satélites Globais...</span>
          </div>
        </div>
      </div>
    );
  }

  // Destruction / quick unpacking of metrics for clean UI bindings
  const { metrics, liveTelemetry, people: peopleData, finance: financeData, market: marketData, legal, security, aiRecommendations } = stateData;

  // Render content switch based on Active Tab selector
  const renderCurrentTabTabContent = () => {
    switch (activeTab) {
      case "command":
        return (
          <div className="space-y-8 animate-fade-in" id="tab-command-center">
            {/* Top row micro instructions summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-display font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Centro de Comando</span>
                  <span className="text-xs font-mono font-normal bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">HIPERVISÃO ATIVA</span>
                </h1>
                <p className="text-xs text-gray-400 font-sans mt-1">Visão geral unificada dos sinais vitais da empresa monitorados por agentes autônomos.</p>
              </div>
              
              <div className="flex items-center gap-3 bg-white/2 border border-white/5 px-4 py-2 rounded-lg font-mono text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                  AGENTES CONECTADOS: 3
                </span>
                <span className="text-gray-600">|</span>
                <span>SINCRONIA PULL: 100% OK</span>
              </div>
            </div>

            {/* Smart Cards Bento Grid Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" id="metric-bento-grid">
              
              {/* Box 1: Revenue */}
              <div 
                onClick={() => setActiveAnalysisCard({
                  title: "Faturamento Institucional Global",
                  description: "Nivelamento de vendas robusto consolidado via canais de distribuição direta da empresa.",
                  forecast: "Projeção de alta para o próximo trimestre com expansão do mercado na América Latina.",
                  details: [
                    { label: "Meta Trimestre", value: "$50.00 M" },
                    { label: "Corrente Atual", value: `$${(metrics.revenue.current / 1000000).toFixed(2)} M` },
                    { label: "Margem Residual", value: `${metrics.profit.margin}%` }
                  ]
                })}
                id="card-revenue"
                className="bg-[#0D0D0D]/60 hover:bg-[#0D0D0D]/80 border border-white/5 hover:border-blue-500/30 p-5 rounded-2xl transition-all cursor-pointer group shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.02] rounded-full blur-2xl" />
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono tracking-wider text-gray-500 uppercase">Receita</span>
                  <span className="text-emerald-400 text-xs font-mono font-medium flex items-center gap-0.5">
                    <TrendingUp size={12} />
                    +{metrics.revenue.trend}%
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-display font-bold text-white tracking-tight">${(metrics.revenue.current / 1000000).toFixed(2)} M</h3>
                  <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (metrics.revenue.current / metrics.revenue.target) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 line-clamp-1">Meta: ${(metrics.revenue.target / 1000000).toFixed(0)}M. Clique para relatório IA.</p>
                </div>
              </div>

              {/* Box 2: Costs */}
              <div 
                onClick={() => setActiveAnalysisCard({
                  title: "Custos de Infraestrutura e Frotas",
                  description: "Monitoramento de custos logísticos, infraestrutura de nuvem global, e pagamento de pessoal.",
                  forecast: "A redução de custos por IA na área asiática projeta uma curva descendente expressiva.",
                  details: [
                    { label: "Custo Fixo", value: "$18.50 M" },
                    { label: "Custo Variável", value: `$${(metrics.costs.current / 1000000 - 18.5).toFixed(2)} M` },
                    { label: "Previsão Recessão", value: "Sem alarmes" }
                  ]
                })}
                id="card-costs"
                className="bg-[#0D0D0D]/60 hover:bg-[#0D0D0D]/80 border border-white/5 hover:border-red-500/30 p-5 rounded-2xl transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono tracking-wider text-gray-500 uppercase">Custos Totais</span>
                  <span className="text-emerald-400 text-xs font-mono font-medium flex items-center gap-0.5">
                    <TrendingDown size={12} />
                    {metrics.costs.trend}%
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-display font-bold text-white tracking-tight">${(metrics.costs.current / 1000000).toFixed(2)} M</h3>
                  <span className="text-[9px] font-mono text-emerald-400/80 block mt-2.5">Otimização orçamentária ativa por IA.</span>
                </div>
              </div>

              {/* Box 3: Profit */}
              <div 
                onClick={() => setActiveAnalysisCard({
                  title: "Lucro Líquido Operacional",
                  description: "Taxa de retorno direto da empresa aplicando amortizações globais e impostos.",
                  forecast: "Tendência histórica de alta após renegociação contratual e implementação assistencial.",
                  details: [
                    { label: "Margem Alvo", value: "35%" },
                    { label: "Retorno Líquido", value: `$${(metrics.profit.current / 1000000).toFixed(2)} M` },
                    { label: "Vazamento Fiscal", value: "0% Detectado" }
                  ]
                })}
                id="card-profit"
                className="bg-[#0D0D0D]/60 hover:bg-[#0D0D0D]/80 border border-white/5 hover:border-blue-500/30 p-5 rounded-2xl transition-all cursor-pointer group shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.02] rounded-full blur-2xl" />
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono tracking-wider text-gray-500 uppercase">Lucro</span>
                  <span className="text-emerald-400 text-xs font-mono font-medium flex items-center gap-0.5">
                    <TrendingUp size={12} />
                    +{metrics.profit.trend}%
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-display font-bold text-[#FFFFFF] tracking-tight">${(metrics.profit.current / 1000000).toFixed(2)} M</h3>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-gray-400">Margem:</span>
                    <span className="text-[10px] font-mono text-blue-400 font-semibold">{metrics.profit.margin}%</span>
                  </div>
                </div>
              </div>

              {/* Box 4: Productivity */}
              <div 
                onClick={() => setActiveAnalysisCard({
                  title: "Indicador de Produtividade do Ecossistema",
                  description: "Combinação matemática entre entrega de projetos, aproveitamento energético e eficácia automatizada.",
                  forecast: "Sistemas virtuais compensaram flutuações de feriados e mitigaram o atrito de comunicação.",
                  details: [
                    { label: "Score Alvo", value: "95" },
                    { label: "Pico Registrado", value: "98.2 (EUA)" },
                    { label: "Eficiência Humana", value: "91%" }
                  ]
                })}
                id="card-productivity"
                className="bg-[#0D0D0D]/60 hover:bg-[#0D0D0D]/80 border border-white/5 hover:border-blue-500/30 p-5 rounded-2xl transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono tracking-wider text-gray-500 uppercase font-medium">Eficácia Geral</span>
                  <span className="text-emerald-400 text-xs font-mono font-medium flex items-center gap-0.5">
                    <TrendingUp size={12} />
                    +3.5%
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-display font-bold text-white tracking-tight">{metrics.productivity.score}%</h3>
                  <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${metrics.productivity.score}%` }} />
                  </div>
                </div>
              </div>

              {/* Box 5: Active Risks */}
              <div 
                onClick={() => setActiveTab("security")}
                id="card-risks"
                className="bg-[#0D0D0D]/60 hover:bg-[#0D0D0D]/80 border border-white/5 hover:border-amber-500/30 p-5 rounded-2xl transition-all cursor-pointer group shadow-lg relative"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono tracking-wider text-gray-500 uppercase">Riscos Ativos</span>
                  <span className="text-amber-400 text-xs font-mono font-medium flex items-center gap-0.5">
                    <AlertTriangle size={12} />
                    Alerta Leve
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-display font-bold text-white tracking-tight">{metrics.risks.count}</h3>
                  <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-amber-500/80 font-mono">
                    <span className="h-1 w-1 bg-amber-500 rounded-full animate-ping" />
                    2 Ameaças moderadas sob mitigação.
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Row: Live Telemetry & AI Recs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Telemetry Panel */}
              <div className="lg:col-span-7 bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6 shadow-xl" id="command-telemetry-panel">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-blue-400" />
                    <h2 className="font-display font-semibold text-sm text-white">Telemetria em Tempo Real (Unidades Físicas)</h2>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">TRANSMISSÃO TELEMÉTRICA ONLINE</span>
                </div>

                <div className="space-y-4">
                  {liveTelemetry.production.map((p: ProductionTelemetry) => (
                    <div key={p.id} className="p-4 bg-white/2 rounded-xl border border-white/5 hover:bg-white/3 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${p.status === "active" ? "bg-emerald-500" : p.status === "maintenance" ? "bg-amber-500" : "bg-red-500"}`} />
                          <span className="font-display text-xs font-medium text-white">{p.name}</span>
                          <span className="text-[9px] font-mono text-gray-500">({p.location})</span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] text-gray-400 font-mono">Vazão: <b className="text-white font-medium">{p.outputRate} un/h</b></span>
                          <span className="text-[10px] text-gray-400 font-mono">Eficácia: <b className="text-blue-400 font-medium">{p.efficiency}%</b></span>
                          <span className="text-[10px] text-gray-400 font-mono">Consumo: <b className="text-[#A1A1AA] font-medium">{p.energyConsumption}kW</b></span>
                        </div>
                      </div>

                      <div className="w-full md:w-32 flex flex-col gap-1.5 items-end">
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${p.efficiency > 90 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${p.efficiency}%` }} />
                        </div>
                        <span className="text-[9px] font-mono text-gray-500">{p.status === "active" ? "OPERANDO EM CARGA TOTAL" : "MANUTENÇÃO PREVENTIVA"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendations Executive Decision Panel */}
              <div className="lg:col-span-5 bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6 shadow-xl" id="command-ai-recs-panel">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400" />
                    <h2 className="font-display font-semibold text-sm text-white">Recomendações da AETHER AI</h2>
                  </div>
                  <span className="text-xs font-mono text-indigo-400">HUB DE DECISÕES</span>
                </div>

                <div className="space-y-4">
                  {aiRecommendations.map((rec: AIRecommendation) => {
                    const isSelected = selectedRec?.id === rec.id;
                    const getCategoryTheme = () => {
                      switch (rec.category) {
                        case "finance": return "text-emerald-400 bg-emerald-400/5";
                        case "logistics": return "text-blue-400 bg-blue-400/5";
                        case "workforce": return "text-indigo-400 bg-indigo-400/5";
                        default: return "text-gray-400 bg-gray-400/5";
                      }
                    };

                    return (
                      <div 
                        key={rec.id} 
                        className={`p-4 bg-[#0A0A0A] rounded-xl border transition-all ${
                          isSelected ? "border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.1)] bg-[#0C0C0C]" : "border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-col gap-1">
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded self-start uppercase font-medium tracking-wide ${getCategoryTheme()}`}>
                              {rec.category}
                            </span>
                            <h4 className="font-display text-xs font-semibold text-white mt-1">{rec.title}</h4>
                          </div>

                          <div className="text-right">
                            <span className="text-emerald-400 font-display font-bold text-xs block">{rec.impact}</span>
                            <span className="text-[9px] font-mono text-gray-500">Confiança {rec.confidence}%</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{rec.description}</p>

                        {/* Recommendation Interaction states */}
                        {rec.status === "executed" ? (
                          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono bg-emerald-500/5 border border-emerald-500/20 px-2 py-1 rounded">
                            <Check size={12} />
                            AETHER OS: Mudança implementada nas operações globais.
                          </div>
                        ) : rec.status === "ignored" ? (
                          <div className="mt-3 text-[10px] text-gray-500 font-mono bg-white/2 border border-white/5 px-2 py-1 rounded">
                            Ignorado pela gerência executiva.
                          </div>
                        ) : (
                          <div className="mt-4 flex gap-2 justify-end">
                            <button 
                              onClick={() => handleRecommendationAction(rec.id, "simulate")}
                              className="px-2.5 py-1 text-[10px] font-mono text-indigo-400 hover:text-white hover:bg-indigo-500/10 rounded border border-indigo-500/20 transition-all cursor-pointer"
                            >
                              {rec.status === "simulating" ? "Simulando..." : "Simular"}
                            </button>
                            <button 
                              onClick={() => handleRecommendationAction(rec.id, "execute")}
                              className="px-2.5 py-1 text-[10px] font-mono bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors cursor-pointer"
                            >
                              Executar
                            </button>
                            <button 
                              onClick={() => handleRecommendationAction(rec.id, "ignore")}
                              className="px-2.5 py-1 text-[10px] font-mono text-gray-500 hover:bg-white/5 rounded transition-all cursor-pointer"
                            >
                              Ignorar
                            </button>
                          </div>
                        )}

                        {/* Interactive live simulation panel inside the card if simulated */}
                        <AnimatePresence>
                          {isSelected && rec.status === "simulating" && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-white/5 text-[10px] font-mono text-indigo-300"
                            >
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Sparkles size={12} className="animate-spin" />
                                <span>RESULTADO PREDITIVO DA AETHER AI:</span>
                              </div>
                              <p className="text-gray-400 leading-normal">
                                Economia imediata simulada em $4.2M ao ano, reduzindo nossa taxa média de queima em $350k ao mês. Risco operacional avaliado como insignificante. Recomenda-se acionar "Executar".
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case "intelligence":
        return (
          <div className="space-y-8 animate-fade-in" id="tab-intelligence">
            <div className="border-b border-white/5 pb-4">
              <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <span>Inteligência Cognitiva</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">Interaja diretamente com a simulação do twin digital e orquestração preditiva.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Interactive Twin Visual Representing nodes */}
              <div className="lg:col-span-7 bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between min-h-[480px]">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="font-display font-semibold text-white text-xs">Representação de Gêmeo Digital (Digital Twin)</h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">Visão topológica do ecossistema de dados da empresa</p>
                    </div>
                    <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">SINTONIA EM TEMPO REAL</span>
                  </div>

                  {/* Connected Topological Interactive Graph representation using absolute vector coordinates styles */}
                  <div className="relative h-64 bg-black/40 border border-white/5 rounded-xl overflow-hidden flex items-center justify-center">
                    
                    {/* Futuristic Scanning Line */}
                    <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent top-1/3 animate-pulse pointer-events-none" />

                    {/* Visual Line Connectors SVG Grid */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40">
                      <line x1="20%" y1="50%" x2="50%" y2="20%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="50%" y1="20%" x2="80%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="80%" y1="50%" x2="50%" y2="80%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="50%" y1="80%" x2="20%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="20%" y1="50%" x2="50%" y2="50%" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" />
                      <line x1="50%" y1="20%" x2="50%" y2="50%" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" />
                      <line x1="80%" y1="50%" x2="50%" y2="50%" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" />
                      <line x1="50%" y1="80%" x2="50%" y2="50%" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" />
                    </svg>

                    {/* Nodes of Digital Organism */}
                    {/* Node 1: Operations */}
                    <div className="absolute top-[12%] left-[45%] flex flex-col items-center gap-1.5 z-10">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse">
                        <Cpu size={12} className="text-blue-400" />
                      </div>
                      <span className="text-[9px] font-mono text-gray-300">Produção</span>
                    </div>

                    {/* Node 2: People Matrix */}
                    <div className="absolute top-[42%] left-[12%] flex flex-col items-center gap-1.5 z-10">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                        <Users size={12} className="text-emerald-400" />
                      </div>
                      <span className="text-[9px] font-mono text-gray-300">Pessoas</span>
                    </div>

                    {/* Node 3: Core AI intelligence system */}
                    <div className="absolute top-[40%] left-[46%] flex flex-col items-center gap-1.5 z-10">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.6)]">
                        <Sparkles size={18} className="text-indigo-300 animate-spin-slow" />
                      </div>
                      <span className="text-[10px] font-display font-medium text-white tracking-widest uppercase">AETHER CORE</span>
                    </div>

                    {/* Node 4: Finance */}
                    <div className="absolute top-[42%] right-[12%] flex flex-col items-center gap-1.5 z-10">
                      <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                        <DollarSign size={12} className="text-violet-400" />
                      </div>
                      <span className="text-[9px] font-mono text-gray-300">Finanças</span>
                    </div>

                    {/* Node 5: Customers & Market */}
                    <div className="absolute bottom-[10%] left-[45%] flex flex-col items-center gap-1.5 z-10">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <TrendingUp size={12} className="text-amber-400" />
                      </div>
                      <span className="text-[9px] font-mono text-gray-300">Mercado</span>
                    </div>
                  </div>
                </div>

                {/* Simulation command box below graph */}
                <div className="mt-4 pt-6 border-t border-white/5">
                  <h5 className="text-xs font-display text-white font-semibold mb-2">Simular Cenário Alternativo</h5>
                  <form onSubmit={submitCustomSimulation} className="flex gap-2" id="cognitive-twin-simulation-form">
                    <input 
                      type="text" 
                      placeholder="Ex: 'E se a taxa de evasão de talentos crescer em 20%?' ou 'E se abrirmos uma filial em Austin?'"
                      className="flex-1 h-10 bg-white/3 border border-white/8 rounded-lg px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      value={simulationPrompt}
                      onChange={(e) => setSimulationPrompt(e.target.value)}
                    />
                    <button 
                      type="submit" 
                      disabled={isCustomSimulating}
                      className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {isCustomSimulating ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Play size={12} />
                          Simular
                        </>
                      )}
                    </button>
                  </form>

                  {/* Outlay of custom simulation results dynamically computed */}
                  <AnimatePresence>
                    {customSimulationResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-3"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="text-[10px] text-indigo-400 font-mono uppercase font-semibold">Simulado: {customSimulationResult.simulationPrompt}</span>
                          <button 
                            type="button"
                            onClick={() => setCustomSimulationResult(null)}
                            className="text-gray-500 hover:text-white font-mono text-[9px]"
                          >
                            FECHAR[X]
                          </button>
                        </div>
                        
                        <p className="text-xs text-gray-300 leading-normal">{customSimulationResult.description}</p>
                        
                        {/* Dynamic impact badges */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center pt-1">
                          <div className="p-2 bg-black/40 rounded border border-white/5">
                            <span className="text-[8px] text-gray-500 font-mono block">FATURAMENTO</span>
                            <span className={`text-[11px] font-mono font-semibold ${customSimulationResult.impact.deltaRevenue >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {(customSimulationResult.impact.deltaRevenue / 1000000).toFixed(2)} M
                            </span>
                          </div>
                          <div className="p-2 bg-black/40 rounded border border-white/5">
                            <span className="text-[8px] text-gray-500 font-mono block">CUSTOS</span>
                            <span className={`text-[11px] font-mono font-semibold ${customSimulationResult.impact.deltaCosts <= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {(customSimulationResult.impact.deltaCosts / 1000000).toFixed(2)} M
                            </span>
                          </div>
                          <div className="p-2 bg-black/40 rounded border border-white/5">
                            <span className="text-[8px] text-gray-500 font-mono block">PRODUTIVIDADE</span>
                            <span className={`text-[11px] font-mono font-semibold ${customSimulationResult.impact.deltaProductivity >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {customSimulationResult.impact.deltaProductivity > 0 ? "+" : ""}{customSimulationResult.impact.deltaProductivity}%
                            </span>
                          </div>
                          <div className="p-2 bg-black/40 rounded border border-white/5">
                            <span className="text-[8px] text-gray-500 font-mono block">ALERTA RISCOS</span>
                            <span className="text-[10px] font-mono text-gray-300 block leading-tight truncate">{customSimulationResult.impact.deltaRiskLevelStr}</span>
                          </div>
                        </div>

                        {/* Qualitative analysis from Gemini */}
                        {customSimulationResult.aiAnalysis && (
                          <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-400 font-sans space-y-1">
                            <span className="text-indigo-400 font-mono text-[9px] block">INFERÊNCIA PREDITIVA DE CONFORMIDADE DA AETHER AI:</span>
                            <div className="leading-relaxed whitespace-pre-wrap">{customSimulationResult.aiAnalysis}</div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Chat Central Premium Console */}
              <div className="lg:col-span-5 bg-[#0D0D0D]/40 border border-white/5 rounded-2xl flex flex-col h-[480px]">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain size={16} className="text-indigo-400" />
                    <div>
                      <h4 className="font-display font-semibold text-xs text-white">Chat Central AETHER Premium</h4>
                      <span className="text-[9px] text-[#10B981] font-mono">SISTEMA DE COGNIÇÃO NEURAL OPERADO POR GEMINI 3.5</span>
                    </div>
                  </div>
                </div>

                {/* Messages feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={msg.id || idx} 
                      className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      <div className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user" 
                          ? "bg-blue-600 text-white rounded-tr-none" 
                          : "bg-white/4 text-gray-300 rounded-tl-none border border-white/5"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-gray-500 font-mono mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  ))}
                  {isChatSending && (
                    <div className="mr-auto items-start max-w-[80%] flex flex-col">
                      <div className="p-3 bg-white/4 rounded-2xl rounded-tl-none border border-white/5 text-gray-400 flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="font-mono text-[9px]">Aether está analisando e consultando matriz financeira corporativa...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input row */}
                <div className="p-4 border-t border-white/5 bg-black/20">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendChatMessage(chatInput);
                    }} 
                    className="flex gap-2"
                  >
                    <input 
                      type="text"
                      className="flex-1 h-10 bg-white/3 border border-white/8 rounded-xl px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      placeholder="Faça uma pergunta sobre nossas operações e finanças..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button 
                      type="submit"
                      disabled={isChatSending}
                      className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Timeline visual predictions widget */}
            <div className="bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6 shadow-xl">
              <h4 className="font-display font-semibold text-xs text-white mb-4">Linha do Tempo de Previsões da Empresa</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                
                {/* Horizontal progress connection */}
                <div className="absolute top-[25px] left-[50px] right-[50px] h-[1px] bg-white/5 hidden md:block" />

                {financeData.predictions.map((p: any, idx: number) => (
                  <div key={idx} className="relative z-10 flex flex-col items-center p-4 bg-white/1 rounded-xl border border-white/5 hover:bg-white/2 transition-colors text-center">
                    <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">{p.period}</span>
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 my-3 flex items-center justify-center border border-black shadow-[0_0_8px_#3b82f6]" />
                    <span className="text-sm font-display font-bold text-white">${p.predicted.toFixed(2)} M</span>
                    <span className="text-[9px] text-gray-500 font-mono uppercase mt-1">Previsão Proativa OS</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "operations":
        return (
          <div className="space-y-8 animate-fade-in text-xs" id="tab-operations">
            <div className="border-b border-white/5 pb-4">
              <h1 className="text-2xl font-display font-bold text-white">Operações (OS)</h1>
              <p className="text-xs text-gray-400 mt-1">Status de cadeias fabris, rotas de supply chain globais e andamento de projetos ativos.</p>
            </div>

            {/* Interactive Supply Chain Map */}
            <div className="bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-blue-400 animate-spin-slow" />
                  <h3 className="font-display font-semibold text-sm text-white">Monitor Global de Rotas e Supply Chain</h3>
                </div>
                <span className="text-[9px] font-mono text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded border border-blue-400/10">GPS COGNITIVO ATIVO</span>
              </div>

              {/* Physical routes coordinate map visualizer wrapper */}
              <div className="relative h-64 bg-black/60 rounded-xl border border-white/5 overflow-hidden flex flex-col justify-end p-4">
                
                {/* SVG representing a futuristic world map grid */}
                <svg className="absolute inset-0 w-full h-full opacity-10">
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Draw transiting routes */}
                {liveTelemetry.supplyChain.map((route: SupplyChainRoute) => (
                  <div 
                    key={route.id} 
                    className="absolute" 
                    style={{ left: `${route.coordinates.x}%`, top: `${route.coordinates.y}%` }}
                  >
                    {/* Pulsing beacon marker */}
                    <div className="relative flex items-center justify-center">
                      <span className={`absolute inline-flex h-4.5 w-4.5 rounded-full opacity-40 animate-ping ${
                        route.status === "on_time" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        route.status === "on_time" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                    </div>

                    {/* Popover labeling with minimal design */}
                    <div className="absolute top-4 -left-12 bg-black/90 p-2 border border-white/10 rounded font-mono text-[8px] text-white whitespace-nowrap pointer-events-none z-10 shadow-lg">
                      <div className="font-bold">{route.cargo}</div>
                      <div className="text-gray-400">{route.origin} → {route.destination}</div>
                      <div className={`mt-0.5 ${route.status === "on_time" ? "text-emerald-400" : "text-amber-400"}`}>
                        {route.status === "on_time" ? "No Prazo" : "Risco de Atraso"} ({route.progress}%)
                      </div>
                    </div>
                  </div>
                ))}

                <div className="text-gray-500 font-mono text-[9px] relative z-10 bg-black/40 self-start p-1.5 rounded">
                  *As coordenadas representam simulações de satélites geocentrados corporativos.
                </div>
              </div>

              {/* Grid outline below map listing routes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {liveTelemetry.supplyChain.map((route: SupplyChainRoute) => (
                  <div key={route.id} className="p-4 bg-white/1 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white tracking-wide font-display">{route.cargo}</span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-medium ${
                        route.status === "on_time" ? "text-emerald-400 bg-emerald-500/5" : "text-amber-400 bg-amber-500/5"
                      }`}>
                        {route.status === "on_time" ? "EM DIA" : "ATENÇÃO"}
                      </span>
                    </div>

                    <div className="font-mono text-[10px] text-gray-400">
                      <div>Rota: <b>{route.origin} → {route.destination}</b></div>
                      <div className="mt-1">Trajeto percorrido: <b>{route.progress}%</b></div>
                    </div>

                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${route.status === "on_time" ? "bg-emerald-500" : "bg-amber-500"}`} 
                        style={{ width: `${route.progress}%` }} 
                      />
                    </div>

                    {route.delayExplanation && (
                      <div className="text-[10px] text-amber-500/90 font-mono flex items-start gap-1 pt-1">
                        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                        <span>AETHER AI Audit: {route.delayExplanation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* active engineering project files */}
            <div className="bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm text-white mb-4">Projetos Ativos e Previsões Probabilísticas de IA</h3>
              <div className="space-y-4">
                {liveTelemetry.projects.map((proj: ProjectTask) => (
                  <div key={proj.id} className="p-4 bg-white/1 border border-white/5 rounded-xl space-y-3 hover:bg-white/2 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div>
                        <span className="text-[10px] text-blue-400 font-mono tracking-wider">PROJECT-FILE #{proj.id}</span>
                        <h4 className="font-display text-xs font-semibold text-white mt-0.5">{proj.name}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-mono">Dono: <b className="text-white font-medium">{proj.owner}</b></span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          proj.status === "on_track" ? "text-emerald-400 bg-emerald-500/5" : "text-amber-400 bg-amber-500/5"
                        }`}>
                          {proj.status === "on_track" ? "NO TRILHO" : "GARGALO REPORTADO"}
                        </span>
                      </div>
                    </div>

                    {/* Progress tracking */}
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-gray-400 w-8">{proj.progress}%</span>
                      <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${proj.status === "on_track" ? "bg-emerald-500" : "bg-amber-500"}`} 
                          style={{ width: `${proj.progress}%` }} 
                        />
                      </div>
                    </div>

                    {/* AI analysis forecast snippet */}
                    <div className="p-3 bg-black/40 rounded border border-white/5 text-[10px] font-mono text-gray-400 flex items-start gap-2">
                      <Sparkles size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-indigo-400 font-medium">AETHER Predictor Engine:</span> {proj.aiForecast}
                        {proj.bottleneck && (
                          <div className="text-amber-400 font-medium mt-1">Gargalo Crítico Identificado: {proj.bottleneck}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "people":
        return (
          <div className="space-y-8 animate-fade-in text-xs" id="tab-people">
            <div className="border-b border-white/5 pb-4">
              <h1 className="text-2xl font-display font-bold text-white">Sistema de Pessoas e Inteligência de Talentos</h1>
              <p className="text-xs text-gray-400 mt-1">Mapeamento de engajamento, risco de evasão humana, e monitoramento de workforce virtual.</p>
            </div>

            {/* Employees Matrix Grid */}
            <div className="bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm text-white mb-4">Matriz de Engajamento de Talentos</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 font-mono text-[10px]">
                      <th className="py-3 px-4">Profissional</th>
                      <th className="py-3 px-4">Departamento / Papel</th>
                      <th className="py-3 px-4">Alinhamento Executivo</th>
                      <th className="py-3 px-4">Risco Evasão</th>
                      <th className="py-3 px-4 text-right">Insights Cognitivos de IA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/2">
                    {peopleData.employees.map((emp: Employee) => (
                      <tr key={emp.id} className="hover:bg-white/1 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white font-display">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-[9px]">
                              {emp.name.slice(0, 2).toUpperCase()}
                            </div>
                            {emp.name}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 font-mono text-[11px]">
                          <div>{emp.role}</div>
                          <span className="text-[9px] text-[#A1A1AA] uppercase">{emp.department}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white">{emp.alignment}%</span>
                            <div className="w-16 bg-white/5 h-1 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${emp.alignment}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            emp.flightRisk === "Low" 
                              ? "text-emerald-400 bg-emerald-500/5" 
                              : emp.flightRisk === "Medium"
                              ? "text-amber-400 bg-amber-500/5"
                              : "text-red-400 bg-red-500/5 active-pulse animate-pulse"
                          }`}>
                            Risco: {emp.flightRisk === "Low" ? "Baixo" : emp.flightRisk === "Medium" ? "Médio" : "Alto"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 text-right font-sans text-[11px] max-w-sm ml-auto">
                          {emp.aiInsight}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Virtual Workforce Agents section */}
            <div className="bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-1.5">
                  <Cpu size={16} className="text-indigo-400" />
                  <h3 className="font-display font-semibold text-sm text-white">Colaboradores Digitais Autônomos (IA de Força de Trabalho)</h3>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase">Orquestrador Ativo</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {peopleData.virtualWorkforce.map((worker: VirtualWorker) => (
                  <div key={worker.id} className="p-4 bg-white/1 border border-white/5 rounded-xl space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/[0.01] rounded-full blur-xl animate-pulse" />
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-semibold text-white">{worker.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono">{worker.role}</span>
                      </div>
                      <span className={`h-2 w-2 rounded-full ${worker.status === "processing" ? "bg-emerald-500 animate-ping" : "bg-gray-600"}`} />
                    </div>

                    <p className="text-[11px] text-gray-500 font-sans leading-relaxed">{worker.currentTask}</p>

                    <div className="pt-2 border-t border-white/5 flex justify-between font-mono text-[9px] text-[#A1A1AA]">
                      <span>Multiplicador de eficiência: <b>{worker.efficiencyMultiplier}x</b></span>
                      <span>Custo de computação: <b>${worker.systemCostPerHour}/h</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "finance":
        return (
          <div className="space-y-8 animate-fade-in text-xs" id="tab-finance">
            <div className="border-b border-white/5 pb-4">
              <h1 className="text-2xl font-display font-bold text-white">Inteligência Financeira e Fluxo de Caixa</h1>
              <p className="text-xs text-gray-400 mt-1">Relatórios de contabilidade automatizada em lote e previsão inteligente de fluxo de caixa.</p>
            </div>

            {/* Cash flow prediction warnings alert */}
            <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display font-semibold text-white text-sm">Previsão Inteligente de Saúde de Caixa (90 Dias)</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Nossos canais de faturamento projetam solvência completa. Runway estimado em mais de 18.5 meses de despesas fixas.</p>
                </div>
              </div>
              <div className="font-mono text-center md:text-right">
                <div className="text-lg font-bold text-emerald-400">Canal Estável</div>
                <span className="text-[10px] text-gray-500 uppercase">AUDITORIA AETHER AI OK</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Transactions Ledger log */}
              <div className="lg:col-span-7 bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6">
                <h3 className="font-display font-semibold text-sm text-white mb-4">Registros Contábeis da Empresa (Ledger)</h3>
                <div className="space-y-3">
                  {financeData.ledgers.map((ledger: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white/1 rounded-xl border border-white/5 flex justify-between items-center hover:bg-white/2 transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-sans font-medium text-white">{ledger.description}</span>
                        <div className="flex items-center gap-2 text-[9px] font-mono text-gray-500">
                          <span>{ledger.date}</span>
                          <span>•</span>
                          <span>Gateway: {ledger.channel}</span>
                        </div>
                      </div>

                      <span className={`font-mono font-bold text-xs ${ledger.type === "income" ? "text-emerald-400" : "text-amber-400"}`}>
                        {ledger.type === "income" ? "+" : "-"}${Math.abs(ledger.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Global integration pay channels */}
              <div className="lg:col-span-5 bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-semibold text-sm text-white mb-4">Integrações e Canais de Pagamento</h3>
                  <div className="space-y-3">
                    <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center">
                      <span className="font-mono text-xs text-white">Stripe Corporate Gateway</span>
                      <span className="text-[10px] font-mono text-emerald-400">ACTIVE [99.9%]</span>
                    </div>
                    <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center">
                      <span className="font-mono text-xs text-white">HSBC Global Wire API</span>
                      <span className="text-[10px] font-mono text-emerald-400">CONNECTED</span>
                    </div>
                    <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center">
                      <span className="font-mono text-xs text-white">Coinbase Hedging Ledger</span>
                      <span className="text-[10px] font-mono text-emerald-400">SYNCED</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-mono text-gray-500 leading-normal">
                  *Todas as liquidações multilaterais de canais bancários são autorresponsavelmente auditadas pela inteligência de backoffice e registradas na ledger descentralizada local.
                </div>
              </div>
            </div>
          </div>
        );

      case "market":
        return (
          <div className="space-y-8 animate-fade-in text-xs" id="tab-market">
            <div className="border-b border-white/5 pb-4">
              <h1 className="text-2xl font-display font-bold text-white">Matriz de Inteligência de Mercado</h1>
              <p className="text-xs text-gray-400 mt-1">Análises de retenção de clientes, monitoramento adversarial de concorrência e tendências identificadas em diários oficiais.</p>
            </div>

            {/* Customers retention metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white/1 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Total de Clientes</span>
                <span className="text-lg font-display font-bold text-white block mt-2">{marketData.customers.count.toLocaleString()}</span>
              </div>
              <div className="p-5 bg-white/1 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] font-mono text-gray-500 uppercase font-medium">Retenção de Contas</span>
                <span className="text-lg font-display font-bold text-emerald-400 block mt-2">{marketData.customers.retention}%</span>
              </div>
              <div className="p-5 bg-white/1 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Satisfação Geral</span>
                <span className="text-lg font-display font-bold text-blue-400 block mt-2">{marketData.customers.satisfac}%</span>
              </div>
              <div className="p-5 bg-white/1 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Conversão Média</span>
                <span className="text-lg font-display font-bold text-white block mt-2">{marketData.customers.conversion}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Competitors List */}
              <div className="lg:col-span-7 bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6">
                <h3 className="font-display font-semibold text-sm text-white mb-4">Auditoria Competitiva de Concorrentes</h3>
                <div className="space-y-4">
                  {marketData.competitors.map((compe: CompetitorData, idx: number) => (
                    <div key={idx} className="p-4 bg-[#0A0A0A] border border-white/5 rounded-xl space-y-2 hover:bg-[#0C0C0C]">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white font-display text-xs">{compe.name}</h4>
                          <span className="text-[9px] font-mono text-gray-400">Quota de Mercado: <b>{compe.marketShare}%</b></span>
                        </div>
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                          compe.threatLevel === "High" ? "text-red-400 bg-red-400/5" : "text-amber-400 bg-amber-500/5"
                        }`}>
                          Ameaça: {compe.threatLevel === "High" ? "Alta" : "Média"}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono text-gray-500">
                        Última movimentação: <p className="text-gray-300 mt-0.5">{compe.recentMove}</p>
                      </div>

                      <div className="p-3 bg-black/40 rounded border border-white/5 text-[10px] font-mono">
                        <span className="text-indigo-400">Vulnerabilidade para Aether OS:</span> {compe.vulnerabilityToAether}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trends indexes list computed */}
              <div className="lg:col-span-5 bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6">
                <h3 className="font-display font-semibold text-[#FFFFFF] text-sm mb-4">Indicadores de Tendências Globais</h3>
                <div className="space-y-3">
                  {marketData.trends.map((trend: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-white/1 rounded-xl border border-white/5 hover:bg-white/2 transition-colors space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-white font-display leading-tight">{trend.topic}</span>
                        <span className="text-[10px] font-mono text-blue-400 font-semibold">Índice: {trend.index}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-normal">{trend.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "legal":
        return (
          <div className="space-y-8 animate-fade-in text-xs" id="tab-legal">
            <div className="border-b border-white/5 pb-4">
              <h1 className="text-2xl font-display font-bold text-white">Centro de Conformidade e Jurídico</h1>
              <p className="text-xs text-gray-400 mt-1">Análise inteligente de termos, mapeamento de risco em cláusulas de contratos estruturados de parceiros globais.</p>
            </div>

            {/* Compliance general meter banner */}
            <div className="p-5 bg-white/2 border border-white/5 rounded-2xl flex justify-between items-center">
              <div>
                <h4 className="font-display font-semibold text-white">Pontuação de Conformidade Empresarial</h4>
                <p className="text-xs text-gray-400 mt-1">Adequação jurídica ativa perante diretrizes internacionais corporativas, LGPD e GDPR europeia comercial.</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold text-emerald-400 font-display">{legal.complianceScore}%</span>
                <span className="text-[10px] font-mono text-gray-500 block">CONFORMIDADE TOTAL REGISTRADA</span>
              </div>
            </div>

            {/* Connected Contracts Risk representation */}
            <div className="bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-semibold text-sm text-white">Fila de Auditoria de Risco de Contratos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {legal.contracts.map((contract: ContractRisk) => (
                  <div key={contract.id} className="p-4 bg-white/1 border border-white/5 rounded-xl space-y-3 hover:bg-white/2 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono text-indigo-400">ID CONTRATO: #{contract.id}</span>
                        <h4 className="font-display font-semibold text-white mt-0.5">{contract.partner}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{contract.purpose}</p>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          contract.riskScore < 20 ? "text-emerald-400 bg-emerald-500/5" : "text-amber-400 bg-amber-500/5"
                        }`}>
                          Grau de Risco: {contract.riskScore}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-black/40 rounded border border-white/5 text-[10px] font-mono text-gray-400">
                      <span className="text-indigo-400 font-medium">Cláusulas Inteligentes Monitoradas:</span>
                      <ul className="list-disc list-inside mt-1.5 space-y-1">
                        {contract.criticalClauses.map((clause, idx) => (
                          <li key={idx} className="truncate">{clause}</li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-[11px] text-gray-400 font-sans leading-relaxed pt-1/2">{contract.aiAnalysis}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-8 animate-fade-in text-xs" id="tab-security">
            <div className="border-b border-white/5 pb-4">
              <h1 className="text-2xl font-display font-bold text-white">Monitor de Autodefesa e Segurança</h1>
              <p className="text-xs text-gray-400 mt-1">Gargalos de firewalls mitigados, auditorias de hashes em roteamento, e logs de ameaças detectadas.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Threat Logs Feed */}
              <div className="lg:col-span-8 bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-semibold text-sm text-white">Logs Globais de Intrusão e Ameaças</h3>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">MURO COGNITIVO DE SEGURANÇA ATIVO</span>
                </div>

                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {security.recentLogs.map((log: ThreatLog, idx: number) => (
                    <div key={idx} className="p-3.5 bg-white/1 rounded-xl border border-white/5 hover:bg-white/2 transition-all space-y-2">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${log.severity === "critical" ? "bg-red-500 animate-ping" : log.severity === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
                          <span className="font-mono font-bold text-white text-[11px]">{log.type}</span>
                        </div>
                        <span className="text-[9px] font-mono text-gray-500">{log.time} • Origem: {log.source}</span>
                      </div>

                      <div className="font-mono text-[10px] text-gray-400">
                        Alvo infraestrutura: <b>{log.target}</b>
                      </div>

                      <div className="p-2 bg-black/40 rounded border border-white/5 font-mono text-[9px] text-[#A1A1AA] flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-400" />
                        <span>Ação defensiva aplicada: {log.actionTaken}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Endpoint permission indicators */}
              <div className="lg:col-span-4 bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-semibold text-sm text-white mb-4">Controle de Acesso e Escudo de IA</h3>
                  
                  <div className="space-y-3 font-mono text-[10px]">
                    <div className="p-3 bg-black/40 rounded border border-white/5 flex justify-between items-center">
                      <span className="text-gray-400">Filtro de IP Dinâmico</span>
                      <span className="text-emerald-400">HABILITADO</span>
                    </div>
                    <div className="p-3 bg-black/40 rounded border border-white/5 flex justify-between items-center">
                      <span className="text-gray-400">Antivírus Autônomo H3</span>
                      <span className="text-emerald-400">ATIVO [100%]</span>
                    </div>
                    <div className="p-3 bg-black/40 rounded border border-white/5 flex justify-between items-center">
                      <span className="text-gray-400">Criptografia Local TLS</span>
                      <span className="text-emerald-400">PROTEÇÃO OK</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2 font-mono text-[9.5px] text-gray-500 leading-normal">
                  <div className="flex items-center gap-1">
                    <Shield size={12} className="text-blue-400" />
                    <span>AETHER AI Core Shield v12.4.9</span>
                  </div>
                  <p>Orquestrador autônomo monitora requisições ativas. Logs suspeitos disparam bans permanentes de frotas de rede.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "system":
        return (
          <div className="space-y-8 animate-fade-in text-xs" id="tab-system">
            <div className="border-b border-white/5 pb-4">
              <h1 className="text-2xl font-display font-bold text-white">Integrações do Sistema e Treinamento de IA</h1>
              <p className="text-xs text-gray-400 mt-1">Conecte ferramentas externas da empresa, gerencie pipelines de dados de computadores físicos e recalibre pesos do assistente inteligente.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ERP/CRM connections control interface */}
              <div className="lg:col-span-7 bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6 space-y-4">
                <h3 className="font-display font-semibold text-sm text-white">Integrações de Sistemas Empresariais</h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-white/1 border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-display font-semibold text-white">SAP S/4HANA ERP Connection</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Sincronização de custos fiscais e inventário físico.</p>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded">CONECTADO</span>
                  </div>

                  <div className="p-4 bg-white/1 border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-display font-semibold text-white">Salesforce Integration API</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Atualização de contas ativas e funil de conversão.</p>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded">CONECTADO</span>
                  </div>

                  <div className="p-4 bg-white/1 border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-display font-semibold text-white">Mecanismo Legado de Planilhas</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Conexão de backup para preenchimentos manuais de finanças.</p>
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">NÃO CONFIGURADO</span>
                  </div>
                </div>
              </div>

              {/* Data Management & Neural Weights tuning simulator */}
              <div className="lg:col-span-5 bg-[#0D0D0D]/40 border border-white/5 rounded-2xl p-6">
                <h3 className="font-display font-semibold text-sm text-white mb-4">Calibração de Pesos Neurais</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-indigo-400 font-mono block">Frequência Cognitiva</span>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full w-[94%]" />
                      </div>
                      <span className="font-mono text-white text-[11px] font-bold">94%</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">Os pesos estão alinhados e calibrados com o feedback financeiro mensal.</p>
                  </div>

                  <button 
                    onClick={() => {
                      alert("AETHER Core OS: Calibração neural concluída com feedback de latência zero.");
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-medium tracking-wide cursor-pointer transition-colors"
                  >
                    Recalibrar Pesos da IA
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505]/95 relative text-white antialiased font-sans" id="aether-root-viewport">
      
      {/* Background vector glow orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/[0.01] rounded-full blur-3xl pointer-events-none z-0" />

      {/* Sidebar Component */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />

      {/* Secondary Main Wrapper Viewport split */}
      <div className="flex-1 flex flex-col justify-start min-w-0 relative z-10" id="main-view-layout">
        
        {/* Header bar */}
        <Header 
          status={security.threatLevel} 
          riskCount={metrics.risks.count}
          onUniversalQuerySubmit={handleUniversalQuerySubmit} 
        />

        {/* Core Main dynamic Tab Container view content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24">
          {renderCurrentTabTabContent()}
        </main>
      </div>

      {/* DETAILED ACTIVE ANALYSIS EXECUTING MODAL DIALOG */}
      <AnimatePresence>
        {activeAnalysisCard && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-none" id="detailed-metric-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0D0D0D]/90 border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl relative"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-display text-base font-bold text-white tracking-tight">{activeAnalysisCard.title}</h3>
                <button 
                  type="button" 
                  onClick={() => setActiveAnalysisCard(null)} 
                  className="p-1 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  FECHAR [X]
                </button>
              </div>

              <p className="text-xs text-gray-400 font-sans leading-relaxed">{activeAnalysisCard.description}</p>

              <div className="p-3.5 bg-black/50 border border-white/5 rounded-xl text-xs space-y-2">
                <span className="text-indigo-400 font-mono text-[9px] block">RESULTADO DE CONFORMIDADE PREDITIVA DA AETHER:</span>
                <p className="text-gray-300 font-sans leading-normal">{activeAnalysisCard.forecast}</p>
              </div>

              <div className="space-y-2.5">
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wide">Métricas de Operações:</span>
                <div className="divide-y divide-white/5">
                  {activeAnalysisCard.details.map((det, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 font-mono text-[11px]">
                      <span className="text-gray-400">{det.label}</span>
                      <span className="text-white font-semibold">{det.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING PERMANENT AETHER CORE CORE ASSISTANT BUTTON / WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none" id="floating-aether-assistant-wrapper">
        
        {/* Expanded Micro-Chat Console view */}
        <AnimatePresence>
          {isAssistantOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="w-80 md:w-96 h-96 bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-3xl pointer-events-none" />

              {/* Title bar */}
              <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                    <span className="font-display font-bold text-[10px]">Æ</span>
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-xs text-white">Assistente Core AETHER</h4>
                    <span className="text-[8px] text-emerald-400 font-mono uppercase">Orquestrador Neural Direto</span>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => setIsAssistantOpen(false)}
                  className="text-[9px] font-mono text-gray-500 hover:text-white cursor-pointer"
                >
                  REDUZIR [-]
                </button>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-[11px] relative z-10">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={msg.id || idx} 
                    className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <div className={`p-2.5 rounded-xl leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white/4 text-gray-300 rounded-tl-none border border-white/5"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatSending && (
                  <div className="mr-auto items-start max-w-[80%] flex flex-col">
                    <div className="p-2.5 bg-white/4 rounded-xl rounded-tl-none border border-white/5 text-gray-400 flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input action commands */}
              <div className="p-3 border-t border-white/5 bg-black/40 relative z-10 space-y-2">
                
                {/* Suggestions triggers keys */}
                {chatMessages.length === 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    <button 
                      onClick={() => sendChatMessage("Por que as vendas caíram?")}
                      className="px-2 py-0.5 bg-white/3 hover:bg-white/5 border border-white/5 rounded text-[9px] text-gray-400 hover:text-white font-mono cursor-pointer transition-all"
                    >
                      Por que as vendas caíram?
                    </button>
                    <button 
                      onClick={() => sendChatMessage("Quais riscos de caixa existem hoje?")}
                      className="px-2 py-0.5 bg-white/3 hover:bg-white/5 border border-white/5 rounded text-[9px] text-gray-400 hover:text-white font-mono cursor-pointer transition-all"
                    >
                      Quais riscos existem hoje?
                    </button>
                  </div>
                )}

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendChatMessage(chatInput);
                  }} 
                  className="flex gap-2"
                >
                  <input 
                    type="text" 
                    placeholder="Faça uma pergunta orçamentária ou de pessoal..."
                    className="flex-1 h-8 bg-white/3 border border-white/8 rounded-lg px-2 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    disabled={isChatSending}
                    className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Send size={12} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating circular persistent trigger button */}
        <button 
          onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          id="floating-aether-pulse-btn"
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 flex items-center justify-center text-[#FFFFFF] shadow-2xl relative group cursor-pointer"
        >
          <Sparkles 
            size={20} 
            className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" 
          />
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-60" style={{ animationDuration: '3s' }} />
        </button>
      </div>

    </div>
  );
}
