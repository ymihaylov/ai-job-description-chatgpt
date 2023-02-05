import { JobDescriptionGenerator } from "@/utils/JobDescriptionGenerator";
import RateLimit from "@/utils/rateLimiter";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid"

type GenerateDescriptionInput = {
  jobTitle: string,
  industry?: string,
  keyWords?: string[],
  tone: string,
  numWords: number,
};

const inputDefaults: Pick<GenerateDescriptionInput, 'tone' | 'numWords'> = {
  tone: 'neutral',
  numWords: 200,
};

const limiter = RateLimit({
  interval: 1 * 1000,
  uniqueTokenPerInterval: 1,
});

interface GenerationRequest<T> extends NextApiRequest {
  body: T
}

export default async function handler(
  request: GenerationRequest<GenerateDescriptionInput>,
  response: NextApiResponse
) {

  await limiter.check(response, 40, 'CACHE_TOKEN').catch(data => {
    response.status(429).json({ error: "Rate limit" })
  });

  try {
    const jobDescriptionGenerator = new JobDescriptionGenerator(true);

    jobDescriptionGenerator
      .generateJobDescription(request.body)
      .then(jobDescription => {
        response.status(200).json({
          id: uuidv4(),
          jobDescription: jobDescription,
        });
      });
  } catch (e) {
    response.status(429).json({ error: JSON.stringify(e) });
  }
}
