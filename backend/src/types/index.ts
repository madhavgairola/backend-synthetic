// TypeScript Types for Synthetic Audience

export interface IdeaAnalysis {
  needsMoreInfo?: boolean;
  clarificationQuestions?: string[];
  industry: string;
  targetAudience: string;
  stakeholders: string[];
  businessType: string;
  competitors: string[];
  keyValueProposition: string;
}

export interface Idea {
  id: string;
  rawText: string;
  analysis?: IdeaAnalysis;
  createdAt: Date;
}

export interface Persona {
  id: string; // generated client-side or database-side (UUID)
  name: string;
  age: number;
  role: string;
  experience: string;
  motivations: string[];
  frustrations: string[];
  concerns: string[];
  goals: string[];
  personalityTraits: string[];
}

export interface SimulationResult {
  reaction: string;
  excitementScore: number; // 1-10
  concerns: string[];
  objections: string[];
  likelihoodToUse: number; // 1-10
  suggestions: string[];
}

export interface Simulation {
  id: string;
  ideaId: string;
  personaId: string;
  persona?: Persona;
  result: SimulationResult;
  createdAt: Date;
}


export interface AggregateInsights {
  overallInterestScore: number; // 1-100
  adoptionProbability: number; // 0-100 (percentage)
  topConcerns: string[];
  topSuggestions: string[];
  mostInterestedSegment: string;
  leastInterestedSegment: string;
  frequentlyAskedQuestions: string[];
  improvementRecommendations: string[];
  actionableRoadmap: string[];
}

export interface Report {
  id: string;
  ideaId: string;
  insights: AggregateInsights;
  fullReportMarkdown: string;
  createdAt: Date;
}

export interface WorkflowState {
  ideaId?: string;
  rawInput?: string;
  analyzedIdea?: IdeaAnalysis;
  personas?: Persona[];
  simulations?: Simulation[];
  insights?: AggregateInsights;
  report?: Report;
}
