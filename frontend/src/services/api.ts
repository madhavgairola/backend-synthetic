import axios from 'axios';

const API_URL = 'http://localhost:5000';

export interface IdeaAnalysis {
  needsMoreInfo?: boolean;
  clarificationQuestions?: string[];
  industry: string;
  targetAudience: string[];
  stakeholders: string[];
  experts: string[];
  summary: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  background: string;
  motivations: string;
  concerns: string;
}

export interface Simulation {
  personaId: string;
  result: {
    reaction: string;
    reactionEmoji: string;
    interestScore: number;
    objections: string[];
    suggestions: string[];
  };
}

export interface Report {
  id: string;
  ideaId: string;
  insights: {
    overallInterestScore: number;
    adoptionProbability: number;
    topConcerns: string[];
    topSuggestions: string[];
    mostInterestedSegment: string;
    leastInterestedSegment: string;
    frequentlyAskedQuestions: string[];
    improvementRecommendations: string[];
    actionableRoadmap: string[];
  };
  fullReportMarkdown: string;
}

export const analyzeIdea = async (idea: string) => {
  const response = await axios.post(`${API_URL}/analyze-idea`, { idea });
  return response.data;
};

export const generateAudience = async (ideaId: string) => {
  const response = await axios.post(`${API_URL}/generate-audience`, { ideaId });
  return response.data;
};

export const simulate = async (ideaId: string) => {
  const response = await axios.post(`${API_URL}/simulate`, { ideaId });
  return response.data;
};

export const generateReport = async (ideaId: string) => {
  const response = await axios.post(`${API_URL}/generate-report`, { ideaId });
  return response.data;
};

export const fullAnalysis = async (idea: string) => {
  const response = await axios.post(`${API_URL}/full-analysis`, { idea });
  return response.data;
};

export const sendChatMessage = async (
  ideaId: string, 
  messages: { role: 'user'|'assistant', content: string }[], 
  context?: { type: 'persona' | 'general', targetId?: string }
) => {
  const response = await axios.post(`${API_URL}/chat`, { ideaId, messages, context });
  return response.data;
};

export const generateAsset = async (ideaId: string, targetText: string) => {
  const response = await axios.post(`${API_URL}/generate-asset`, { ideaId, targetText });
  return response.data;
};

export const pivotIdea = async (ideaId: string, pivotInstruction: string) => {
  const response = await axios.post(`${API_URL}/pivot`, { ideaId, pivotInstruction });
  return response.data;
};
