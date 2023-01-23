type GenerateDescriptionInput = {
  jobTitle: string,
  industry?: string,
  keyWords?: string,
  tone: string,
  numWords: number,
};

const inputDefaults: Pick<GenerateDescriptionInput, 'tone' | 'numWords'> = {
  tone: 'neutral',
  numWords: 200,
};

const generateDescription = async (input: GenerateDescriptionInput, isMock: boolean = false) => {
  const { jobTitle, industry, keyWords, tone, numWords } = {...inputDefaults, ...input};

  if (isMock) {
    return 'Mocked description!';
  }

  try {
    const prompt = `Write a job description for a  ${jobTitle} role ${industry ? `in the ${industry} industry` : ""} that is around ${numWords} words in a ${tone} tone. ${keyWords ? `Incorporate the following keywords: ${keyWords}.` : ""}\n The job position should be described in a way that is SEO friendly, highlighting its unique features and benefits.`
    console.log(prompt);
    const response = await fetch(
      "https://api.openai.com/v1/engines/text-davinci-003/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.5,
      }),
    });

    const data = await response.json();

    console.log(JSON.stringify(data, null, 2));

    return data.choices[0].text;
  } catch (err) {
    console.error(err);
  }
};

export default async function handler(req: any, res: any) {
  const { jobTitle, industry, keyWords, tone, numWords } = req.body;

  const jobDescription = await generateDescription({
    jobTitle,
    industry,
    keyWords,
    tone,
    numWords,
  }, false);

  res.status(200).json({
    jobDescription,
  });
}
