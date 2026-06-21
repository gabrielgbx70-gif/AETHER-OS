/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client safely
const apiKey = process.env.GEMINI_API_KEY || "";
let aiClient: any = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("AETHER OS AI initialized with Gemini API Key.");
  } catch (error) {
    console.error("Failed to initialize Google GenAI SDK:", error);
  }
} else {
  console.log("No GEMINI_API_KEY found or using placeholder. Fallback mode is active.");
}

// Stateful Operational Data Engine (In-Memory Database representing simulated enterprise state)
interface SystemState {
  metrics: {
    revenue: { current: number; target: number; trend: number; forecast: number[]; explanation: string };
    costs: { current: number; trend: number };
    profit: { current: number; margin: number; trend: number };
    growth: { current: number; trend: number };
    productivity: { score: number; change: number; explanation: string };
    risks: { count: number; activeList: any[] };
    cashFlow: { runwayMonths: number; monthlyBurn: number; riskWindowDays: number; predictedShortfall: boolean };
  };
  liveTelemetry: {
    production: any[];
    supplyChain: any[];
    projects: any[];
  };
  people: {
    employees: any[];
    virtualWorkforce: any[];
  };
  finance: {
    ledgers: any[];
    predictions: any[];
  };
  market: {
    customers: { count: number; retention: number; satisfac: number; conversion: number };
    competitors: any[];
    trends: any[];
  };
  legal: {
    contracts: any[];
    complianceScore: number;
  };
  security: {
    threatLevel: "Normal" | "Alert" | "Critical";
    activeThreats: any[];
    recentLogs: any[];
  };
  aiRecommendations: any[];
}

let systemState: SystemState = {
  metrics: {
    revenue: {
      current: 48250000,
      target: 50000000,
      trend: 4.8,
      forecast: [48000000, 48500000, 49200000, 50100000, 51000000],
      explanation: "A performance de vendas foi impulsionada pela expansão do canal digital corporativo.",
    },
    costs: {
      current: 31400000,
      trend: -2.1,
    },
    profit: {
      current: 16850000,
      margin: 34.9,
      trend: 6.4,
    },
    growth: {
      current: 12.4,
      trend: 1.2,
    },
    productivity: {
      score: 91.2,
      change: 3.5,
      explanation: "Automações robóticas do People OS e otimização de rotas reduziram atritos internos.",
    },
    risks: {
      count: 2,
      activeList: [
        {
          id: "risk-1",
          level: "medium",
          title: "Gargalo logístico no Canal de Suez",
          category: "Supply Chain",
          mitigation: "Redirecionamento de rotas marítimas via Cabo da Boa Esperança (+12 dias, custo mitigado).",
        },
        {
          id: "risk-2",
          level: "medium",
          title: "Vulnerabilidade descoberta em microsserviço legado",
          category: "Security",
          mitigation: "Remendos de patch automatizados por inteligência autônoma em andamento.",
        }
      ],
    },
    cashFlow: {
      runwayMonths: 18.5,
      monthlyBurn: 2500000,
      riskWindowDays: 90,
      predictedShortfall: false,
    },
  },
  liveTelemetry: {
    production: [
      { id: "p-1", name: "Unidade São Paulo - Alpha", location: "Brasil", efficiency: 94.8, status: "active", outputRate: 2450, energyConsumption: 410 },
      { id: "p-2", name: "Unidade Austin - TechDome", location: "EUA", efficiency: 98.2, status: "active", outputRate: 3800, energyConsumption: 580 },
      { id: "p-3", name: "Unidade Shenzhen - Beta", location: "China", efficiency: 89.1, status: "maintenance", outputRate: 1500, energyConsumption: 300 },
      { id: "p-4", name: "Unidade Munich - Hydro", location: "Alemanha", efficiency: 96.5, status: "active", outputRate: 2100, energyConsumption: 350 },
    ],
    supplyChain: [
      { id: "route-1", origin: "Shenzhen, CN", destination: "Austin, US (Port)", cargo: "Microchips S14", status: "on_time", progress: 72, coordinates: { x: 30, y: 35 } },
      { id: "route-2", origin: "São Paulo, BR", destination: "Munich, DE", cargo: "Ligas de Alumínio", status: "delay_risk", delayExplanation: "Greve no Porto de Santos ameaça embarque programado", progress: 20, coordinates: { x: 45, y: 75 } },
      { id: "route-3", origin: "Rotterdam, NL", destination: "São Paulo, BR", cargo: "Módulos de Energia", status: "on_time", progress: 88, coordinates: { x: 60, y: 50 } },
    ],
    projects: [
      { id: "proj-1", name: "AULA Quantum Platform Upgrade", owner: "Dra. Helena Costa", progress: 84, status: "on_track", aiForecast: "Conclusão estimada em 14 dias com 97% de probabilidade" },
      { id: "proj-2", name: "Adequação ESG Global Tier-3", owner: "Bruno Matos", progress: 41, status: "warning", bottleneck: "Atraso no relatório ambiental de escopo 3", aiForecast: "Risco de multa leve na Europa do Leste se não for corrigido em 20 dias" },
      { id: "proj-3", name: "Redução Tarifária Integrada", owner: "Aether AI Core", progress: 95, status: "on_track", aiForecast: "Automação finalizada. Economia prevista de +$1.8M anualizada" },
    ],
  },
  people: {
    employees: [
      { id: "emp-1", name: "Carla Silveira", role: "Head de IA e Algoritmos", department: "Engineering", skills: ["Python", "TensorFlow", "Quantum C", "Orquestração L3"], projects: ["AULA Quantum Platform Upgrade"], alignment: 98, flightRisk: "Low", aiInsight: "Membro de alto impacto, engajamento excepcional. Potencial de liderança global.", avatarSeed: "carla" },
      { id: "emp-2", name: "Gabriel Albuquerque", role: "Arquiteto de Supply Chain", department: "Operations", skills: ["Global Logistics", "RST Planner", "Datalake Management"], projects: ["Adequação ESG Global Tier-3"], alignment: 74, flightRisk: "Medium", aiInsight: "Níveis de estresse elevados decorrentes do gargalo logístico no Porto de Santos. Recomenda-se remanejamento de carga horária preventiva.", avatarSeed: "gabriel" },
      { id: "emp-3", name: "Julia Mendonça", role: "Diretora Financeira Executiva", department: "Finance", skills: ["Treasury", "M&A", "Crypto Hedge", "Risk Tax"], projects: ["Redução Tarifária Integrada"], alignment: 92, flightRisk: "Low", aiInsight: "Alinhamento preciso com a governança da empresa. Atuação elogiada em fusões digitais.", avatarSeed: "julia" },
      { id: "emp-4", name: "Roberto Ramos", role: "Especialista em Compliance", department: "Legal", skills: ["LGPD", "GDPR", "Estatuição Europeia", "Regulações Tributárias"], projects: ["Adequação ESG Global Tier-3"], alignment: 85, flightRisk: "High", aiInsight: "Sentindo falta de novos desafios corporativos. Risco de saída para concorrente financeiro devido à saturação de rotina.", avatarSeed: "roberto" },
    ],
    virtualWorkforce: [
      { id: "vw-1", name: "Aether Atendimento Autônomo", role: "Customer Care Agent", status: "processing", currentTask: "Processando 1.450 tickets simultâneos de SLA prioritário", efficiencyMultiplier: 12.4, systemCostPerHour: 0.18 },
      { id: "vw-2", name: "Aether Recrutador Estratégico", role: "HR Sorter Bot", status: "idle", currentTask: "Aguardando novos currículos de analistas seniores", efficiencyMultiplier: 8.5, systemCostPerHour: 0.12 },
      { id: "vw-3", name: "Aether Auditor Concorrencial", role: "Market Sweeper AI", status: "processing", currentTask: "Extraindo atualizações tributárias no diário oficial global", efficiencyMultiplier: 15.0, systemCostPerHour: 0.25 },
    ],
  },
  finance: {
    ledgers: [
      { date: "2026-06-20", description: "Faturamento Automático API Gateway (Clientes Core)", type: "income", amount: 145000, channel: "Global Stripe" },
      { date: "2026-06-19", description: "Pagamento Automatizado Logística Shenzhen", type: "outcome", amount: -42000, channel: "HSBC Hong Kong" },
      { date: "2026-06-18", description: "Reserva de Hedge Ethereum / Polygon", type: "income", amount: 89000, channel: "Coinbase Prime" },
      { date: "2026-06-18", description: "Custos de Servidores e Computação em Nuvem", type: "outcome", amount: -125000, channel: "AWS Global Corp" }
    ],
    predictions: [
      { period: "Agora", revenue: 48.25, predicted: 48.25, type: "real" },
      { period: "+3m", revenue: 48.25, predicted: 49.80, type: "forecast" },
      { period: "+1a", revenue: 48.25, predicted: 54.30, type: "forecast" },
      { period: "+5a", revenue: 48.25, predicted: 78.50, type: "forecast" }
    ],
  },
  market: {
    customers: { count: 12450, retention: 96.8, satisfac: 98.4, conversion: 6.8 },
    competitors: [
      { name: "OmniCorp Dynamic", marketShare: 24, recentMove: "Lançamento de assistente autônomo OmniAssist", threatLevel: "Medium", vulnerabilityToAether: "Tecnologia deles é altamente fragmentada, carecem do ecossistema centralizado Aether OS." },
      { name: "Apex Venture Intel", marketShare: 18, recentMove: "Reestruturação de custos internos para cortes bruscos", threatLevel: "Low", vulnerabilityToAether: "Estruturas obsoletas de ERP tradicional impedem agilidade operacional de IA." },
      { name: "Nexus Synergy Systems", marketShare: 31, recentMove: "Expansão maciça na Ásia e fusões com redes logísticas físicas", threatLevel: "High", vulnerabilityToAether: "Altamente capitalizados, porém vulneráveis em compliance de dados europeus." }
    ],
    trends: [
      { topic: "Hiper-regionalização de cadeias produtivas", index: 94, impact: "Positivo para Aether, dada nossa arquitetura de distribuição ágil." },
      { topic: "Soberania regulatória europeia de dados (GDPR V3)", index: 88, impact: "Risco de adequação para sistemas centralizados sem controle granular." }
    ],
  },
  legal: {
    contracts: [
      { id: "c-1", partner: "Global Tech Silicon Corp", purpose: "Compromisso de Fornecimento de Chips", complianceRate: 98, riskScore: 12, criticalClauses: ["Cláusula 14: Renovação automática trimestral", "Cláusula 22: Limitação de teto de preço por IPC"], aiAnalysis: "Contrato de baixo risco, alto nível de compliance operacional mútuo." },
      { id: "c-2", partner: "EuroLogistics GMBH Logistics", purpose: "Transporte e Desembaraço Global", complianceRate: 81, riskScore: 48, criticalClauses: ["Cláusula 8.2: Cláusula de indenização por atrasos marítimos sob força maior", "Cláusula 11: Foro de jurisdição alemão exclusivo"], aiAnalysis: "Risco moderado devido ao aumento do frete marítimo global. Cláusula de força maior protege excessivamente o parceiro logístico." },
    ],
    complianceScore: 97.4,
  },
  security: {
    threatLevel: "Normal",
    activeThreats: [],
    recentLogs: [
      { id: "sec-1", time: "18:42:15", source: "IP 182.25.14.99 (Rússia)", target: "API Database Gateway", severity: "warning", type: "Tentativa de injeção SQL mitigada", actionTaken: "IP banido do firewall e registro de logs enviado à equipe SecOps." },
      { id: "sec-2", time: "17:11:04", source: "Firewall Interno", target: "Servidor DMZ Austin", severity: "info", type: "Varredura normal de portas", actionTaken: "Nenhuma ação necessária. Segurança íntegra." }
    ],
  },
  aiRecommendations: [
    { id: "rec-1", title: "Reduzir custo logístico em 14%", impact: "+$4.2M/ano", description: "Otimizar rotas de Shenzhen utilizando parceiro local brasileiro para consolidar cargas de chips em hubs multimodais redundantes.", confidence: 94, status: "pending", category: "logistics" },
    { id: "rec-2", title: "Expansão Estratégica na América Latina", impact: "+$6.8M/ano", description: "Aproveitar excesso de capacidade da Unidade São Paulo - Alpha para assumir fornecimento secundário regional.", confidence: 88, status: "pending", category: "growth" },
    { id: "rec-3", title: "Realocar Roberto Ramos para Novos Projetos", impact: "+35% Produtividade", description: "Designar Roberto Ramos para liderar a força regulatória ESG Global. Isso mitiga seu Risco de Saída 'Alto' imediatamente por re-engajamento.", confidence: 91, status: "pending", category: "workforce" }
  ]
};

// Telemetry background simulator (simulates real-time system variance every 10 seconds empty, and slowly oscillates statistics)
setInterval(() => {
  // Oscillation on efficiency
  systemState.liveTelemetry.production.forEach(p => {
    const change = (Math.random() - 0.5) * 1.5;
    p.efficiency = Math.min(100, Math.max(70, Number((p.efficiency + change).toFixed(2))));
    p.outputRate = Math.round(p.outputRate * (1 + (Math.random() - 0.5) * 0.02));
  });

  // Supply Chain route progress
  systemState.liveTelemetry.supplyChain.forEach(r => {
    if (r.progress < 100) {
      r.progress += Math.round(Math.random() * 3);
      if (r.progress >= 100) {
        r.progress = 0; // restart transit route
      }
    }
  });

  // Random security log once in a while
  if (Math.random() > 0.7) {
    const time = new Date().toTimeString().split(" ")[0];
    const sourceIp = `IP ${Math.floor(Math.random() * 200 + 20)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
    const targets = ["FrontEnd Edge Node", "Admin API Server", "OAuth Storage Cache", "Vanguard Proxy S4"];
    const target = targets[Math.floor(Math.random() * targets.length)];
    const severities: ("info" | "warning")[] = ["info", "warning"];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    const newLog = {
      id: `sec-${Date.now()}`,
      time,
      source: sourceIp,
      target,
      severity,
      type: severity === "warning" ? "Tentativa de login brute-force bloqueada" : "Renovação de token TLS concluída",
      actionTaken: severity === "warning" ? "Bloqueio temporário por 15 minutos aplicado." : "Monitorado sem alertas."
    };
    systemState.security.recentLogs.unshift(newLog);
    if (systemState.security.recentLogs.length > 8) {
      systemState.security.recentLogs.pop();
    }
  }
}, 10000);

// API Endpoints
app.get("/api/company/status", (req, res) => {
  res.json(systemState);
});

// AI Recommendation Executive Actions (Simulate, Execute, Ignore)
app.post("/api/company/action", (req, res) => {
  const { recommendationId, action } = req.body as { recommendationId: string; action: "simulate" | "execute" | "ignore" };
  const rec = systemState.aiRecommendations.find(r => r.id === recommendationId);
  
  if (!rec) {
    res.status(404).json({ error: "Recomendação não encontrada." });
    return;
  }

  rec.status = action === "simulate" ? "simulating" : action === "execute" ? "executed" : "ignored";

  // Simulate or execute changes onto in-memory metrics database
  if (action === "execute") {
    if (rec.id === "rec-1") {
      // Reduce logistic costs
      systemState.metrics.costs.current -= 4200000;
      systemState.metrics.profit.current += 4200000;
      systemState.metrics.profit.margin = Number(((systemState.metrics.profit.current / systemState.metrics.revenue.current) * 100).toFixed(1));
      systemState.metrics.revenue.explanation += " Economia logística de $4.2M anuais aplicada com êxito.";
      
      // Update supply chain route
      const route = systemState.liveTelemetry.supplyChain.find(r => r.id === "route-2");
      if (route) {
        route.status = "on_time";
        route.delayExplanation = "Mitigado por redirecionamento de hub multimodal redundante.";
      }
    } else if (rec.id === "rec-2") {
      // Expand strategic business LATAM
      systemState.metrics.revenue.current += 6800000;
      systemState.metrics.revenue.target += 50000000;
      systemState.metrics.growth.current += 2.8;
      systemState.metrics.profit.current += 2200000;
      systemState.metrics.profit.margin = Number(((systemState.metrics.profit.current / systemState.metrics.revenue.current) * 100).toFixed(1));
    } else if (rec.id === "rec-3") {
      // Reallocate Roberto Ramos
      const roberto = systemState.people.employees.find(e => e.id === "emp-4");
      if (roberto) {
        roberto.role = "Lead Global de Governança ESG";
        roberto.flightRisk = "Low";
        roberto.projects = ["Adequação ESG Global Tier-3 (Líder)"];
        roberto.aiInsight = "Promoção estancou o risco de evasão. Roberto demonstra forte entusiasmo no novo mandato ESG.";
      }
      systemState.metrics.productivity.score = Math.min(100, Number((systemState.metrics.productivity.score + 2.5).toFixed(1)));
    }
  }

  res.json({ success: true, message: `Ação '${action}' aplicada à recomendação ${recommendationId}`, state: systemState });
});

// Dynamic AI Scenario Simulator Endpoint (Real Simulation powered by Gemini OR highly polished sandbox algorithm)
app.post("/api/company/simulate-prompt", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).json({ error: "Prompt de simulação em falta." });
    return;
  }

  // Pre-generate operational impacts based on key keywords or context
  const textLower = prompt.toLowerCase();
  let impactDescription = `A simulação de "${prompt}" foi orquestrada com sucesso pelos mecanismos do AETHER OS Core.`;
  let deltaRevenue = 0;
  let deltaCosts = 0;
  let deltaProductivity = 0;
  let deltaRiskLevelStr = "Inalterado";

  if (textLower.includes("filial") || textLower.includes("expans") || textLower.includes("abrir")) {
    deltaRevenue = 8500000;
    deltaCosts = 5200000;
    deltaProductivity = 4.2;
    deltaRiskLevelStr = "Risco Operacional Temporário (+15% em Supply Chain)";
    impactDescription = "Abertura de nova representação comercial/filial estratégica simula aumento volumétrico de mercado mas acarreta investimentos Capex pesados a curto prazo.";
  } else if (textLower.includes("demit") || textLower.includes("corte") || textLower.includes("reduzir custo")) {
    deltaRevenue = -1200000;
    deltaCosts = -4500000;
    deltaProductivity = -8.5;
    deltaRiskLevelStr = "Aumento crítico na Evasão de Talentos (Flight Risk geral +30%)";
    impactDescription = "Corte abrupto de equipe acarreta economia financeira imediata, mas deteriora o clima organizacional de inteligência, resultando em sobrecarga e gargalos produtivos subsequentes.";
  } else if (textLower.includes("ia") || textLower.includes("automatiza") || textLower.includes("bot") || textLower.includes("inteligencia")) {
    deltaRevenue = 2000000;
    deltaCosts = -1500000;
    deltaProductivity = 12.0;
    deltaRiskLevelStr = "Excelente mitigação de riscos de segurança de infraestrutura.";
    impactDescription = "Otimização via agentes inteligentes do AETHER Virtual Workforce acelera triagens em lotes, escalando a taxa de conversão sem sobrecarregar a força humana de engenharia.";
  } else if (textLower.includes("greve") || textLower.includes("gargalo") || textLower.includes("risco")) {
    deltaRevenue = -3400000;
    deltaCosts = 800000;
    deltaProductivity = -5.0;
    deltaRiskLevelStr = "Alerta logístico ativado.";
    impactDescription = "Situações extremas na cadeia de suprimentos demandam acionamento de frotas terrestres auxiliares, inflacionando custos logísticos transfronteiriços temporários.";
  }

  // If Gemini client is active, let's call Gemini to give us a highly elegant qualitative prediction analysis too!
  let customAiAnalysis = "";
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Você é o AETHER OS Core Simulator, o cérebro preditivo de uma organização multibilionária. 
Analise a seguinte proposta de simulação estratégica enviada pelo Diretor Geral Executivo:
"${prompt}"

Com base no estado corporativo atual:
Receita: $48.25M, Custos: $31.4M, Margem de Lucro: 34.9%, Produtividade: 91.2%, Risco do caixa: Estável em 18 meses de runway.

Gere uma resposta corporativa de altíssimo nível em PORTUGUÊS (máximo 4 parágrafos pequenos), contendo:
1. Uma avaliação realista do impacto nos negócios.
2. Análise qualitativa de fatores ocultos políticos, mercadológicos ou humanos.
3. Decisão executiva recomendada: se deve Prosseguir (Sinal Verde), Ajustar antes de executar (Sinal Amarelo) ou Rejeitar (Sinal Vermelho).

Forneça de forma estritamente profissional e futurista, no formato markdown mais atraente.`,
      });
      customAiAnalysis = response.text || "";
    } catch (err) {
      console.error("Gemini failed during simulation prompt. Using sandboxed summary.", err);
    }
  }

  res.json({
    success: true,
    simulationPrompt: prompt,
    description: impactDescription,
    impact: {
      deltaRevenue,
      deltaCosts,
      deltaProductivity,
      deltaRiskLevelStr
    },
    aiAnalysis: customAiAnalysis || `
### AETHER SIMULATION CORE REPORT
**Status da Recomendação:** Sinal Verde Condicional

1. **Perspectiva de Fluxo de Caixa**: A decisão trará instabilidade aceitável nos primeiros 45 dias, estabilizando-se em lucros progressivos após o terceiro trimestre.
2. **Implicação Sistêmica**: Geração de sinergia entre núcleos produtivos operacionais. Os nós de Austin e São Paulo terão aumento de vazão estimado de 8.4%.
3. **Reclamação de Mitigação**: Recomendamos acionar redundância operacional em Shenzhen para amortecer atritos iniciais na cadeia fabril.
`
  });
});

// AETHER Chat Inteligente Executor Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, userPrompt } = req.body as { messages: any[]; userPrompt: string };
  
  if (!userPrompt) {
    res.status(400).json({ error: "Falta o prompt do usuário." });
    return;
  }

  // Pre-compile current system state to feed to Gemini system instructions
  const currentStateSummary = `
SISTEMA CORPORATIVO AETHER OS - ESTADO ATUAL:
- Receita Atual: $48.25M
- Custos Operacionais Totais: $31.4M
- Lucro Líquido: $16.85M (Margem de 34.9%)
- Produtividade do Ecossistema: 91.2% (Trend +3.5%)
- Caixa Global Runway: 18.5 meses (Burn Rate mensal: $2.5M)
- Unidades de Produção Físicas: 
    * São Paulo (Brasil) - Eficiência 94.8% (Ativa)
    * Austin (EUA) - Eficiência 98.2% (Ativa)
    * Shenzhen (China) - Eficiência 89.1% (Em Manutenção Preventiva)
    * Munich (Alemanha) - Eficiência 96.5% (Ativa)
- Riscos Ativos de Alta Prioridade:
    1. Gargalo logístico no Canal de Suez (mitigação via Cabo da Boa Esperança ativa).
    2. Vulnerabilidade descoberta em microsserviço legado (patches automáticos em andamento).
- Integrantes Chave da Equipe (People Matrix):
    * Carla Silveira (Head de IA, Produtividade Excelente, Low Flight Risk)
    * Gabriel Albuquerque (Arquiteto de Supply Chain, Estresse Elevado devido a Porto de Santos, Medium Flight Risk)
    * Roberto Ramos (Compliance, Saturação de Rotina, High Flight Risk)
    * Julia Mendonça (Financeira, Alinhamento Perfeito, Low Flight Risk)
`;

  if (aiClient) {
    try {
      // Map previous chat messages to Gemini's expected SDK formatting:
      // standard contents: { role: 'user' | 'model', parts: [{ text: '...' }] }[]
      const contents = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));
      
      // Append the latest user instruction
      contents.push({
        role: "user",
        parts: [{ text: userPrompt }]
      });

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: `Você é a inteligência executiva máxima e integrada do **AETHER OS**, o sistema operacional de controle empresarial mais avançado e futurista do mundo.
O seu tom de resposta deve ser EXTREMAMENTE profissional, seguro, sutilmente futurista (como uma IA bilionária integrada semelhante ao J.A.R.V.I.S. ou à interface premium OpenAI/Tesla OS), direto ao ponto e focado em soluções executivas estruturadas.

Você tem acesso completo aos dados reais do sistema em tempo real:
${currentStateSummary}

Quando o usuário lhe fizer perguntas sobre finanças, pessoas, riscos, logística, simulação ou o que ele precisa saber:
1. Responda em PORTUGUÊS usando Markdown lindamente estruturado.
2. Nunca invente dados falsos que divirjam das métricas listadas no resumo de estado corporativo atual, mas sinta-se livre para analisar desdobramentos, fazer previsões baseadas nessas métricas e sugerir mitigações ousadas.
3. Se o investidor pedir para simular cenários ("E se..."), encoraje-o e comente o que o simulador preditivo de cenários pode calcular.
4. Mantenha os parágrafos muito limpos, com uso inteligente de bullet points, tabelas markdown e negritos.`,
        }
      });

      res.json({
        role: "model",
        text: response.text || "Sem resposta do processador central.",
        timestamp: new Date().toISOString(),
      });
      return;
    } catch (error: any) {
      console.error("Gemini model chat call error:", error);
      // Fallback below if Gemini fails
    }
  }

  // Highly sophisticated fallback simulation responses in case API Key is missing or failed
  let fallbackText = "";
  const cleanedPrompt = userPrompt.toLowerCase();

  if (cleanedPrompt.includes("venda") || cleanedPrompt.includes("queda") || cleanedPrompt.includes("lucro")) {
    fallbackText = `### análise financeira de margem aether os
Nossas vendas globais encontram-se atualmente em **$48.25M** de faturamento contra uma meta de **$50.0M**. 

**Gargalos financeiros identificados:**
* **Estagnação na Europa Central**: A adequação ambiental de nível ESG causou um atraso regulatório leve, reduzindo compras industriais locais em 4.1%.
* **Frete Logístico**: Custos de desobstrução de mercadorias no Atlântico Sul sofreram pico inflacionário de $180k.

**Ações de Mitigação Recomendadas:**
1. Ativar a recomendação de **Redução de custos logísticos de Shenzhen** para realocar margem (+ $4.2M anualizados).
2. Otimizar as campanhas de conversão do **AETHER Atendimento Autônomo** para expandir a taxa de conversão institucional dos atuais 6.8% para 8.5%.`;
  } else if (cleanedPrompt.includes("risco") || cleanedPrompt.includes("ameaça") || cleanedPrompt.includes("perigo")) {
    fallbackText = `### verificação de riscos e redundâncias de segurança
Atualmente temos **${systemState.metrics.risks.count} riscos ativos** monitorados em tempo real na nossa console AETHER OS:

1. **Gargalo de Supply Chain (Canal de Suez)**:
   * *Status:* Mitigado. As cargas foram redirecionadas ao redor da África do Sul. Custos sob controle mas tempo de trânsito estendido.
2. **FDI e Evasão de Talentos (Legal e HR)**:
   * *Status:* Alerta Amarelo na equipe. **Roberto Ramos** (Especialista em Compliance) possui risco de saída elevado por saturação de desafios. 

Recomendo autorizar a realocação preventiva do Roberto para liderar a adequação ESG imediatamente. Deseja realizar essa movimentação agora?`;
  } else if (cleanedPrompt.includes("roberto") || cleanedPrompt.includes("funcionario") || cleanedPrompt.includes("equipe") || cleanedPrompt.includes("pessoas")) {
    fallbackText = `### matriz de pessoas e talentos inteligentes
Nosso ecossistema humano monitora o alinhamento de 4 executivos seniores.

* **Fator Crítico - Roberto Ramos (Compliance)**: Classificado com **Flight Risk Alto**. A inteligência comportamental detectou que a rotina operacional estagnou seu engajamento intelectual. 
* **Fatur de Sinergia - Carla Silveira (IA)**: Mantém excelentes 100% de engajamento no programa Quantum Platform.

*Sugiro fortemente promover Roberto Ramos a Líder Global de Governança ESG para preencher o gargalo do projeto Tier-3 e reverter seu risco de evasão.*`;
  } else {
    fallbackText = `### aether neural system running
Olá, sou o painel IA cognitivo centralizador do **AETHER OS**. Estou monitorando os sistemas de produção físicos de Austin, Shenzhen e São Paulo em tempo real.

Como posso ajudá-lo na tomada de decisões estratégicas hoje?
* "Por que as vendas caíram e as margens estagnaram?"
* "Quais riscos operacionais e cibernéticos ameaçam o caixa?"
* "Analisar retenção de talentos ocultos na empresa."
* "Simular o impacto da automatização de rotinas via Virtual Workforce."`;
  }

  res.json({
    role: "model",
    text: fallbackText,
    timestamp: new Date().toISOString(),
    fallback: true
  });
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server mounted as Express middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AETHER OS Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
