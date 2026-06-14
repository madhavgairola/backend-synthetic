import { llmService } from '../services/llm';

export const pivotAgent = {
  async generatePivotedIdea(originalIdea: string, pivotInstruction: string): Promise<string> {
    const systemInstruction = `You are an expert startup advisor. Your client is pivoting their startup idea based on feedback.
Original Idea:
"${originalIdea}"

Pivot Instruction:
"${pivotInstruction}"

Your task is to completely rewrite the original idea so that it heavily incorporates the pivot instruction. 
Keep the core of the original idea intact unless the pivot contradicts it. Ensure the new pitch is cohesive and professional.
Return ONLY the newly rewritten idea text without any preamble.`;

    const userPrompt = `Generate the new pivoted idea.`;

    return await llmService.callLlmText(systemInstruction, userPrompt, 'openai/gpt-4o');
  }
};
