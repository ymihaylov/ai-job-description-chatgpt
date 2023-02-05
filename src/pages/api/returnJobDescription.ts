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

const generateDescription = async (input: GenerateDescriptionInput, isMock: boolean = false) => {
  if ( ! process.env.OPENAI_API_KEY) {
    return "API Key not provided!";
  }

  const { jobTitle, industry, keyWords, tone, numWords } = input;

  if (isMock) {
    return "Mocked description";
  }

  const response = await fetch(
    "https://api.openai.com/v1/engines/text-davinci-003/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: `Write a job description for a  ${jobTitle} role
        ${industry ? `in the ${industry} industry` : ""} that is around ${numWords}
          words in a ${tone} tone.
          ${keyWords ? `Incorporate the following keywords: ${keyWords.join(', ')}.` : ""}.
          The job position should be described in a way that is SEO friendly, highlighting its unique features and benefits.`,
        max_tokens: 300,
        temperature: 0.5,
      }),
    }
  );
  const data = await response.json();

  return data.choices[0].text;
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
  try {
    await limiter.check(response, 40, 'CACHE_TOKEN');

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
    console.log(e);
    // response.status(429).json({ error: 'Rate limit exceeded' })
  }
}
