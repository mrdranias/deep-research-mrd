import { generateObject } from 'ai';
import { z } from 'zod';

import { o3MiniModel } from './ai/providers';
import { systemPrompt } from './prompt';

// this is the query as managed by the Vercel 'ai' library which has different ways to call an AI API eg generateImage, generateText, generateObject
// https://sdk.vercel.ai/docs/reference/ai-sdk-core/generate-text
export async function generateFeedback({
  query,
  numQuestions = 3,
}: {
  query: string;
  numQuestions?: number;
}) {
  // generateObject represents a high level query to openai via API using the ai library which is most equivalent to langchain
  // the ai protocol hides the request and return message processing and assigns the return message to an object attribute like pydantic.
  // zod is a high level library for representing json schema and processing incoming messages using a json schema pydantic is considered and equivalent
  const userFeedback = await generateObject({
    model: o3MiniModel,
    system: systemPrompt(),
    prompt: `Given the following query from the user, ask some follow up questions to clarify the research direction. Return a maximum of ${numQuestions} questions, but feel free to return less if the original query is clear: <query>${query}</query>`,
    schema: z.object({
      questions: z
        .array(z.string())
        .describe(
          `Follow up questions to clarify the research direction, max of ${numQuestions}`,
        ),
    }),
  });
  // this seems to refer to the structure of the z object schema so it seems the response is encoded as userFeedback.object.
  return userFeedback.object.questions.slice(0, numQuestions);
}
