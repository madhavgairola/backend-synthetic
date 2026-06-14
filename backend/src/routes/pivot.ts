import { Router, Request, Response } from 'express';
import { dbService } from '../services/database';
import { pivotAgent } from '../agents/pivot';
import { compiledWorkflow } from '../langgraph/workflow';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => {
  return (req: Request, res: Response, next: any) => {
    fn(req, res).catch(next);
  };
};

/**
 * POST /pivot
 * Pivots an existing idea and runs a full simulation pipeline on the new idea.
 */
router.post('/pivot', asyncHandler(async (req: Request, res: Response) => {
  const { ideaId, pivotInstruction } = req.body;
  if (!ideaId || typeof ideaId !== 'string') {
    return res.status(400).json({ error: 'ideaId is required.' });
  }
  if (!pivotInstruction || typeof pivotInstruction !== 'string') {
    return res.status(400).json({ error: 'pivotInstruction is required.' });
  }

  const idea = await dbService.getIdea(ideaId);
  if (!idea) {
    return res.status(404).json({ error: `Idea with ID ${ideaId} not found.` });
  }

  console.log(`API: Pivoting idea ${ideaId}... Instruction: ${pivotInstruction}`);
  
  // 1. Generate the new idea text
  const newIdeaText = await pivotAgent.generatePivotedIdea(idea.rawText, pivotInstruction);
  
  console.log(`API: New pivoted idea generated. Running full analysis pipeline...`);

  // 2. Run the full LangGraph workflow on the new idea
  const finalState = await compiledWorkflow.invoke({
    rawInput: newIdeaText
  });

  return res.json({
    message: 'Idea successfully pivoted and simulated.',
    ideaId: finalState.ideaId,
    analyzedIdea: finalState.analyzedIdea,
    personasCount: finalState.personas?.length || 0,
    personas: finalState.personas,
    simulations: finalState.simulations,
    insights: finalState.insights,
    report: finalState.report
  });
}));

export default router;
