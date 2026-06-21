/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CompanyMetrics {
  revenue: {
    current: number;
    target: number;
    trend: number;
    forecast: number[]; // Next few periods
    explanation: string;
  };
  costs: {
    current: number;
    trend: number;
  };
  profit: {
    current: number;
    margin: number;
    trend: number;
  };
  growth: {
    current: number; // percentage
    trend: number;
  };
  productivity: {
    score: number; // 0-100
    change: number;
    explanation: string;
  };
  risks: {
    count: number;
    activeList: Array<{
      id: string;
      level: "low" | "medium" | "high";
      title: string;
      category: string;
      mitigation: string;
    }>;
  };
  cashFlow: {
    runwayMonths: number;
    monthlyBurn: number;
    riskWindowDays: number;
    predictedShortfall: boolean;
  };
}

export interface ProductionTelemetry {
  id: string;
  name: string;
  location: string;
  efficiency: number; // percentage
  status: "active" | "maintenance" | "idle" | "overload";
  outputRate: number; // items/hour
  energyConsumption: number; // kW
}

export interface SupplyChainRoute {
  id: string;
  origin: string;
  destination: string;
  cargo: string;
  status: "on_time" | "delay_risk" | "stalled";
  delayExplanation?: string;
  progress: number; // 0-100
  coordinates: { x: number; y: number }; // Visual percentage offset
}

export interface ProjectTask {
  id: string;
  name: string;
  owner: string;
  progress: number;
  status: "on_track" | "warning" | "delayed";
  aiForecast: string;
  bottleneck?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: "Engineering" | "Operations" | "Growth" | "Finance" | "Legal" | "Executive";
  skills: string[];
  projects: string[];
  alignment: number; // 0-100
  flightRisk: "Low" | "Medium" | "High";
  aiInsight: string;
  avatarSeed: string; // for UI placeholders
}

export interface VirtualWorker {
  id: string;
  name: string;
  role: string;
  status: "idle" | "processing" | "completed";
  currentTask: string;
  efficiencyMultiplier: number;
  systemCostPerHour: number;
}

export interface ContractRisk {
  id: string;
  partner: string;
  purpose: string;
  complianceRate: number;
  riskScore: number; // 0-100
  criticalClauses: string[];
  aiAnalysis: string;
}

export interface ThreatLog {
  id: string;
  time: string;
  source: string;
  target: string;
  severity: "info" | "warning" | "critical";
  type: string;
  actionTaken: string;
}

export interface CompetitorData {
  name: string;
  marketShare: number;
  recentMove: string;
  threatLevel: "Low" | "Medium" | "High" | "Critical";
  vulnerabilityToAether: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  impact: string;
  description: string;
  confidence: number; // 0-100
  status: "pending" | "simulating" | "executed" | "ignored";
  category: "finance" | "logistics" | "growth" | "workforce";
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  contextData?: any; // metrics snapshot or simulation response
}
