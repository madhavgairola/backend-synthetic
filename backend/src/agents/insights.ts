import { llmService } from '../services/llm';
import { AggregateInsights, Persona, Simulation } from '../types';
import {
  INSIGHT_GENERATOR_SYSTEM,
  formatInsightGeneratorPrompt,
  INSIGHT_GENERATOR_SCHEMA
} from '../prompts/templates';

export const insightsAgent = {
  /**
   * Run the Insight Generator Agent on simulated reactions
   */
  async generateInsights(
    ideaText: string,
    simulations: Simulation[]
  ): Promise<AggregateInsights> {
    if (!ideaText) {
      throw new Error('Idea text is required to generate insights.');
    }
    if (!simulations || simulations.length === 0) {
      throw new Error('Simulation results are required to generate insights.');
    }

    const systemInstruction = INSIGHT_GENERATOR_SYSTEM;
    const userPrompt = formatInsightGeneratorPrompt(ideaText, simulations);

    try {
      const result = await llmService.callLlmJSON<AggregateInsights>(
        systemInstruction,
        userPrompt,
        'openai/gpt-4o-mini',
        INSIGHT_GENERATOR_SCHEMA
      );

      // Perform validation and normalization
      return {
        overallInterestScore: typeof result.overallInterestScore === 'number' ? result.overallInterestScore : 50,
        adoptionProbability: typeof result.adoptionProbability === 'number' ? result.adoptionProbability : 50,
        topConcerns: Array.isArray(result.topConcerns) ? result.topConcerns : [],
        topSuggestions: Array.isArray(result.topSuggestions) ? result.topSuggestions : [],
        mostInterestedSegment: result.mostInterestedSegment || 'Not determined',
        leastInterestedSegment: result.leastInterestedSegment || 'Not determined',
        frequentlyAskedQuestions: Array.isArray(result.frequentlyAskedQuestions) ? result.frequentlyAskedQuestions : [],
        improvementRecommendations: Array.isArray(result.improvementRecommendations) ? result.improvementRecommendations : [],
        actionableRoadmap: Array.isArray(result.actionableRoadmap) ? result.actionableRoadmap : []
      };
    } catch (error) {
      console.error('Error in insightsAgent.generateInsights:', error);
      throw error;
    }
  }
};
