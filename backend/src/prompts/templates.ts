import { Schema } from '@google/generative-ai';

// ==========================================
// 1. IDEA ANALYZER AGENT
// ==========================================

export const IDEA_ANALYZER_SYSTEM = `You are a startup CTO, veteran product manager, and industry analyst.
Your task is to dissect a user's submitted idea (which could be a startup idea, feature, ad, or landing page) and extract structured metadata.
Analyze the industry, primary target audience, secondary stakeholders, business type (B2B, B2C, SaaS, etc.), key potential competitors, and the key value proposition.
Ensure your analysis is realistic and objective. Don't add hype.
If the idea is too vague, short, or lacks enough detail for you to determine a highly specific industry and target audience, you MUST set needsMoreInfo to true, and provide 2-3 clarificationQuestions asking the user for the specific missing context. If it's detailed enough to proceed, set needsMoreInfo to false.`;

export function formatIdeaAnalyzerPrompt(ideaText: string): string {
  return `Please analyze the following idea:
"${ideaText}"`;
}

export const IDEA_ANALYZER_SCHEMA: Schema = {
  type: 'object',
  properties: {
    needsMoreInfo: {
      type: 'boolean',
      description: "Set to true if the idea is too vague to accurately judge without more details."
    },
    clarificationQuestions: {
      type: 'array',
      items: { type: 'string' },
      description: "2-3 specific questions asking the user for missing details (only needed if needsMoreInfo is true)."
    },
    industry: {
      type: 'string',
      description: "The primary industry sector this idea belongs to (e.g. EdTech, FinTech, Healthcare SaaS)."
    },
    targetAudience: {
      type: 'string',
      description: "Detailed description of the core target demographic/audience who will buy or use the product."
    },
    stakeholders: {
      type: 'array',
      items: { type: 'string' },
      description: "List of other parties affected or involved (e.g. parents, school administrators, developers, compliance officers)."
    },
    businessType: {
      type: 'string',
      description: "Business model type (e.g., B2B SaaS, B2C Mobile App, Marketplace, transactional ecommerce, freemium)."
    },
    competitors: {
      type: 'array',
      items: { type: 'string' },
      description: "Direct and indirect competitors (list at least 3-4)."
    },
    keyValueProposition: {
      type: 'string',
      description: "The primary, unique value that this product/service solves for its core audience."
    }
  },
  required: ["needsMoreInfo", "industry", "targetAudience", "stakeholders", "businessType", "competitors", "keyValueProposition"]
};

// ==========================================
// 2. AUDIENCE GENERATOR AGENT
// ==========================================

export const AUDIENCE_GENERATOR_SYSTEM = `You are an expert user researcher and demographic specialist.
Given a product/startup idea, its analysis, and a target focus group, generate exactly 5 highly detailed, diverse, and realistic personas representing that group.
CRITICAL: Ensure personas are strictly human and realistic. Do not generate aliens, fantasy creatures, or absurd identities even if the startup idea is humorous or sci-fi themed; instead, generate realistic business people, target demographics, and consumers who would realistically evaluate such an idea.
For each persona, generate a full profile containing:
- A realistic name and age.
- A current professional or personal role matching the target focus group.
- Experience level (years and context).
- Motivations (2-3 items max, brief).
- Frustrations (2-3 pain points, brief).
- Concerns about this product (2-3 items max, brief).
- Goals (2-3 items max, brief).
- 3 distinct personality traits (e.g. Skeptic, Enthusiast, Frugal).
Ensure diversity of opinions (some eager, some pragmatists, some skeptics/critics). Keep all text extremely concise to avoid JSON truncation.`;

export function formatAudienceGeneratorPrompt(ideaText: string, analysis: any, demographicFocus: string): string {
  return `Product Idea:
"${ideaText}"

Industry Analysis:
- Industry: ${analysis.industry}
- Primary Audience: ${analysis.targetAudience}
- Value Proposition: ${analysis.keyValueProposition}

Target Focus Group to generate:
👉 ${demographicFocus} 👈

Generate exactly 5 diverse personas belonging to this target focus group.`;
}

export const AUDIENCE_GENERATOR_SCHEMA: Schema = {
  type: 'array',
  description: "Array of generated personas representing target demographics, stakeholders, and skeptics.",
  items: {
    type: 'object',
    properties: {
      name: { type: 'string', description: "Full name of the persona" },
      age: { type: 'integer', description: "Age of the persona" },
      role: { type: 'string', description: "Professional role or student status or lifestyle role" },
      experience: { type: 'string', description: "Brief summary of their experience level or lifestyle context" },
      motivations: {
        type: 'array',
        items: { type: 'string' },
        description: "List of motivations relative to their life and tools"
      },
      frustrations: {
        type: 'array',
        items: { type: 'string' },
        description: "List of current frustrations and pain points in their daily routine"
      },
      concerns: {
        type: 'array',
        items: { type: 'string' },
        description: "Specific reservations or concerns they would have about this new idea"
      },
      goals: {
        type: 'array',
        items: { type: 'string' },
        description: "List of personal or professional goals"
      },
      personalityTraits: {
        type: 'array',
        items: { type: 'string' },
        description: "3 personality traits (e.g., Skeptic, Early Adopter, Pragmatist, Price-sensitive)"
      }
    },
    required: ["name", "age", "role", "experience", "motivations", "frustrations", "concerns", "goals", "personalityTraits"]
  }
};

// ==========================================
// 3. PERSONA SIMULATION ENGINE
// ==========================================

export const PERSONA_SIMULATION_SYSTEM = `You are a simulator designed to model how a target audience reacts to product ideas.
You will receive a product idea and a list of personas.
Your task is to step into the shoes of EACH persona individually and simulate how they would honestly react to the idea, based on their motivations, frustrations, concerns, and traits.
For each persona, return:
- personaId: The exact ID of the persona.
- reaction: A first-person written statement (3-5 sentences) embodying their voice.
- reactionEmoji: A single emoji that best represents their emotional reaction (e.g. 🤩, 😡, 🤔, 💸).
- excitementScore: Scale of 1 to 10.
- concerns: Specific worries about this idea.
- objections: Reasons why they might reject or not buy/use it.
- likelihoodToUse: Likelihood to adopt it, from 1 to 10.
- suggestions: Constructive improvement suggestions.
Ensure authenticity: skeptics should be critical, early adopters enthusiastic, busy people brief.`;

export function formatPersonaSimulationPrompt(ideaText: string, personas: any[]): string {
  const personasFormatted = personas.map((p, idx) => `
ID: ${p.id}
Name: ${p.name}
Role: ${p.role}
Age: ${p.age}
Experience: ${p.experience}
Motivations: ${p.motivations.join(', ')}
Frustrations: ${p.frustrations.join(', ')}
Concerns: ${p.concerns.join(', ')}
Goals: ${p.goals.join(', ')}
Traits: ${p.personalityTraits.join(', ')}
--------------------------------------------------`).join('\n');

  return `Product Idea:
"${ideaText}"

Personas list:
${personasFormatted}

Please simulate the reactions for all the personas listed above.`;
}

export const PERSONA_SIMULATION_SCHEMA: Schema = {
  type: 'array',
  description: "List of simulated reactions for all personas.",
  items: {
    type: 'object',
    properties: {
      personaId: { type: 'string', description: "The exact ID of the persona simulated." },
      reaction: { type: 'string', description: "A first-person reaction from this persona (3-5 sentences)." },
      reactionEmoji: { type: 'string', description: "A single emoji that perfectly captures their reaction." },
      excitementScore: { type: 'integer', description: "1 to 10 scale of excitement." },
      concerns: { type: 'array', items: { type: 'string' }, description: "List of worries relative to the idea." },
      objections: { type: 'array', items: { type: 'string' }, description: "Reasons why this persona would not use the product." },
      likelihoodToUse: { type: 'integer', description: "1 to 10 likelihood of using the product." },
      suggestions: { type: 'array', items: { type: 'string' }, description: "Actionable suggestions for creators." }
    },
    required: ["personaId", "reaction", "reactionEmoji", "excitementScore", "concerns", "objections", "likelihoodToUse", "suggestions"]
  }
};

// ==========================================
// 4. INSIGHT GENERATOR AGENT
// ==========================================

export const INSIGHT_GENERATOR_SYSTEM = `You are a master market researcher and data analyst.
You will receive a product idea along with 15-20 simulated reaction reports from a diverse panel of personas.
Your task is to analyze all simulation responses, aggregate the feedback, and generate key quantitative and qualitative insights.
Calculate:
- Overall interest score (out of 100).
- Overall adoption probability (percentage, 0-100%).
- Top concerns raised across all personas.
- Top suggestions.
- Which segment/roles were most interested.
- Which segment/roles were least interested.
- Frequently Asked Questions (list 3-5 questions personas would have). Do not answer them, just list the questions.
- High-level improvement recommendations.
- Actionable Roadmap: A comprehensive 5-7 step action plan on how to pivot or improve the idea based on feedback.`;

export function formatInsightGeneratorPrompt(ideaText: string, simulations: any[]): string {
  const simsFormatted = simulations.map((s, idx) => {
    const p = s.persona;
    const r = s.result;
    return `--- PERSONA #${idx + 1} (${p.name}, ${p.role}, Age ${p.age}, Traits: ${p.personalityTraits.join('/')}) ---
Excitement Score: ${r.excitementScore}/10
Likelihood to Use: ${r.likelihoodToUse}/10
Reaction: "${r.reaction}"
Concerns: ${r.concerns.join(', ')}
Objections: ${r.objections.join(', ')}
Suggestions: ${r.suggestions.join(', ')}`;
  }).join('\n\n');

  return `Product Idea:
"${ideaText}"

Simulated Reactions:
${simsFormatted}

Aggregate these results into structured high-level insights.`;
}

export const INSIGHT_GENERATOR_SCHEMA: Schema = {
  type: 'object',
  properties: {
    overallInterestScore: {
      type: 'integer',
      description: "Overall interest score scaled from 1 to 100 based on excitement scores."
    },
    adoptionProbability: {
      type: 'integer',
      description: "Projected percentage probability of adoption (0-100) based on likelihood to use."
    },
    topConcerns: {
      type: 'array',
      items: { type: 'string' },
      description: "The top 3-5 recurring concerns or anxieties mentioned by the personas."
    },
    topSuggestions: {
      type: 'array',
      items: { type: 'string' },
      description: "The top 3-5 most constructive suggestions for improvements."
    },
    mostInterestedSegment: {
      type: 'string',
      description: "The demographic or role segment that showed the highest average enthusiasm."
    },
    leastInterestedSegment: {
      type: 'string',
      description: "The demographic or role segment that was most skeptical or uninterested."
    },
    frequentlyAskedQuestions: {
      type: 'array',
      items: { type: 'string' },
      description: "3-5 common questions personas had about the product proposition."
    },
    improvementRecommendations: {
      type: 'array',
      items: { type: 'string' },
      description: "Strategic pivot/feature recommendations to double the excitement score."
    },
    actionableRoadmap: {
      type: 'array',
      items: { type: 'string' },
      description: "A comprehensive 5-7 step actionable roadmap or plan to make the idea better based on feedback."
    }
  },
  required: [
    "overallInterestScore",
    "adoptionProbability",
    "topConcerns",
    "topSuggestions",
    "mostInterestedSegment",
    "leastInterestedSegment",
    "frequentlyAskedQuestions",
    "improvementRecommendations",
    "actionableRoadmap"
  ]
};

// ==========================================
// 5. REPORT GENERATOR AGENT
// ==========================================

export const REPORT_GENERATOR_SYSTEM = `You are a world-class startup consultant and business writer.
Generate a comprehensive, beautifully-formatted business validation report in Markdown format.
You must use the following sections exactly:
1. Executive Summary: Summarize the product, key findings, and the bottom line.
2. Audience Breakdown: Break down the simulated audience profile and persona categories.
3. Interest Score: Detail the overall score, segment variations, and what it implies.
4. Adoption Probability: Define the likelihood of conversion/adoption.
5. Common Objections: Bulleted list of objections with context.
6. Suggestions: Summary of constructive feedback.
7. FAQs: Frequently Asked Questions.
8. Risk Analysis: Main product/market risks identified.
9. Improvement Opportunities: Concrete action items to improve the idea.
10. Actionable Roadmap: A comprehensive 5-7 step plan to execute the improvements.

Make the style professional, insightful, and formatted cleanly with headers, tables, bullet points, and markdown highlights.`;

export function formatReportGeneratorPrompt(ideaText: string, personas: any[], simulations: any[], insights: any): string {
  const personaList = personas.map(p => `- **${p.name}** (${p.role}, Age ${p.age}): ${p.personalityTraits.join(', ')}`).join('\n');
  
  return `Product Idea:
"${ideaText}"

Aggregate Insights:
- Interest Score: ${insights.overallInterestScore}/100
- Adoption Probability: ${insights.adoptionProbability}%
- Most Interested: ${insights.mostInterestedSegment}
- Least Interested: ${insights.leastInterestedSegment}
- Top Concerns: ${insights.topConcerns.join('; ')}
- Top Suggestions: ${insights.topSuggestions.join('; ')}
- FAQs: ${insights.frequentlyAskedQuestions.join('; ')}
- Recommendations: ${insights.improvementRecommendations.join('; ')}
- Roadmap: ${insights.actionableRoadmap.join('; ')}

Audience Personas:
${personaList}

Please generate the final validation report in full Markdown following the 9 specified sections.`;
}
