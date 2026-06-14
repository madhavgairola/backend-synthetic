import { Router, Request, Response } from 'express';
import { chatAgent } from '../agents/chat';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => {
  return (req: Request, res: Response, next: any) => {
    fn(req, res).catch(next);
  };
};

/**
 * POST /chat
 * Conversational endpoint to chat with the report or specific personas.
 */
router.post('/chat', asyncHandler(async (req: Request, res: Response) => {
  const { ideaId, messages, context } = req.body;
  if (!ideaId || typeof ideaId !== 'string') {
    return res.status(400).json({ error: 'ideaId is required.' });
  }
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required.' });
  }

  console.log(`API: Processing chat message for idea ${ideaId}... context: ${JSON.stringify(context)}`);
  
  const responseText = await chatAgent.handleChat(ideaId, messages, context);

  return res.json({
    message: 'Chat response generated.',
    response: responseText
  });
}));

export default router;
