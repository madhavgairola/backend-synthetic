import { llmService } from '../services/llm';
import { Persona, IdeaAnalysis } from '../types';
import {
  AUDIENCE_GENERATOR_SYSTEM,
  formatAudienceGeneratorPrompt,
  AUDIENCE_GENERATOR_SCHEMA
} from '../prompts/templates';
import * as crypto from 'crypto';

export const generatorAgent = {
  /**
   * Generates a total of 18 highly diverse personas using 3 parallel queries
   * to focus groups, preventing output truncation.
   */
  async generateAudience(ideaText: string, analysis: IdeaAnalysis): Promise<Persona[]> {
    if (!ideaText) {
      throw new Error('Idea text is required to generate an audience.');
    }

    const focusGroups = [
      'Primary End-Users, Consumers, and Direct Beneficiaries (highly specific to the target audience)',
      'Secondary Beneficiaries and Indirect Users',
      'Business Evaluators, Buyers, Founders, and Investors',
      'Highly Skeptical Critics and Direct Competitors'
    ];

    console.log('Generating synthetic audience in parallel batches...');
    
    try {
      const batchPromises = focusGroups.map(async (focusGroup) => {
        const systemInstruction = AUDIENCE_GENERATOR_SYSTEM;
        const userPrompt = formatAudienceGeneratorPrompt(ideaText, analysis, focusGroup);
        
        const personas = await llmService.callLlmJSON<Persona[]>(
          systemInstruction,
          userPrompt,
          'openai/gpt-4o-mini',
          AUDIENCE_GENERATOR_SCHEMA
        );

        if (!Array.isArray(personas)) {
          throw new Error(`Invalid persona response generated for focus group: ${focusGroup}`);
        }
        return personas;
      });

      const batchResults = await Promise.all(batchPromises);
      const combinedPersonas = batchResults.flat();

      if (combinedPersonas.length === 0) {
        throw new Error('Audience Generator Agent failed to return any personas.');
      }

      // Standardize and populate IDs
      const mappedPersonas: Persona[] = combinedPersonas.map((p, idx) => ({
        id: crypto.randomUUID(),
        name: p.name || `Persona ${idx + 1}`,
        age: p.age || 25,
        role: p.role || 'General Stakeholder',
        experience: p.experience || 'Not specified',
        motivations: Array.isArray(p.motivations) ? p.motivations.slice(0, 3) : [],
        frustrations: Array.isArray(p.frustrations) ? p.frustrations.slice(0, 3) : [],
        concerns: Array.isArray(p.concerns) ? p.concerns.slice(0, 3) : [],
        goals: Array.isArray(p.goals) ? p.goals.slice(0, 3) : [],
        personalityTraits: Array.isArray(p.personalityTraits) ? p.personalityTraits.slice(0, 3) : []
      }));

      console.log(`Successfully generated and merged ${mappedPersonas.length} synthetic audience personas.`);
      return mappedPersonas;
    } catch (error) {
      console.error('Error in generatorAgent.generateAudience:', error);
      throw error;
    }
  }
};
