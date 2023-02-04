import { PrismaClient } from "@prisma/client";

type GenerateDescriptionParams = {
	jobTitle: string,
	industry?: string,
	keyWords?: string[],
	tone: string,
	numWords: number,
};

const defaultParamValues: Pick<GenerateDescriptionParams, 'tone' | 'numWords'> = {
	tone: 'neutral',
	numWords: 200,
};

enum RequestStatus {
	REQUESTED = "requested",
	FAILED = "failed",
	SUCCEDED = "succeded",
};

export class JobDescriptionGenerator {
	private readonly shouldMockTheCall: boolean;

	public constructor(shouldMockTheCall: boolean = false) {
		this.shouldMockTheCall = shouldMockTheCall;
	}

	public generateJobDescription(params: GenerateDescriptionParams, shouldMock: boolean = false): string {
		// 1. Genearate prompt
		const prompt = this.interpolatePrompt({...defaultParamValues, ...params});

		// 2. Add record in db
		const id = this.createRecordInDb(params, prompt);

		// 3. Make a request
		const jobDescription = this.makeCallToChatGPT(prompt);

		// 4. Update record in db
		this.updateStatusInDb(id, RequestStatus.SUCCEDED)

		// 5. Return the description
		return '';
	}

	private async makeCallToChatGPT(prompt: string): string {
		if (this.shouldMockTheCall) {
			return "Mocked Job Description!"
		}

		const response = await fetch(
			"https://api.openai.com/v1/engines/text-davinci-003/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
				prompt: prompt,
				max_tokens: 300,
				temperature: 0.5,
			}),
		});

		const data = await response.json();
		return data.choices[0].text;
	}

	private interpolatePrompt(params: GenerateDescriptionParams): string {
		return `Write a job description for a  ${params.jobTitle} role
			${params.industry ? `in the ${params.industry} industry` : ""} that is around ${params.numWords}
			words in a ${params.tone} tone.
          	${params.keyWords ? `Incorporate the following keywords: ${params.keyWords.join(', ')}.` : ""}.
          	The job position should be described in a way that is SEO friendly, highlighting its unique features and benefits.`;
	}

	private async createRecordInDb(params: GenerateDescriptionParams, prompt: string) {
		const prisma = new PrismaClient();
		await prisma.generationRequest.create({
		  data: {
			...params,
			keyWords: params.keyWords?.join(","),
			status: RequestStatus.SUCCEDED,
			fullTextPrompt: prompt,
		  },
		});

		return 1;
	}

	private async updateStatusInDb(id: number, status: RequestStatus) {
		console.log('ok')
	}
}
