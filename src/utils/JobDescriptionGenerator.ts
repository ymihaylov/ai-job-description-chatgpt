import { PrismaClient } from "@prisma/client";

type GenerateDescriptionParams = {
	jobTitle: string,
	industry?: string,
	keyWords?: string[],
	tone: string,
	numWords: number,
};

export type GenerationRequestOutputType = {
    id: number | null
    jobTitle: string | null
    industry: string | null
    tone: string | null
    numWords: number | null
    fullTextPrompt: string | null
    status: string | null
    responseText: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

const defaultParamValues: Pick<GenerateDescriptionParams, 'tone' | 'numWords' | 'keyWords'> = {
	tone: 'neutral',
	numWords: 200,
};

enum RequestStatus {
	REQUESTED = "requested",
	FAILED = "failed",
	SUCCEDED = "succeded",
};

export class JobDescriptionGenerator {
	private readonly prisma: PrismaClient;
	private readonly shouldMockTheCall: boolean;

	public constructor(shouldMockTheCall: boolean = false) {
		this.prisma = new PrismaClient();
		this.shouldMockTheCall = shouldMockTheCall;
	}

	public async generateJobDescription(params: GenerateDescriptionParams) {
		const paramsAppliedDefaults = {...params, ...defaultParamValues};

		// 1. Genearate prompt
		const prompt = this.interpolatePrompt(paramsAppliedDefaults);

		// 2. Add record in db
		let recordId: number = 0;
		this.createRecordInDb(paramsAppliedDefaults, prompt)
			.then(rId => {
				recordId = rId;
			});

		// 3. Make a request
		let jobDescription = '';
		this.makeCallToChatGPT(prompt)
			.then(jobDscr => {
				this.updateStatusInDb(recordId, RequestStatus.SUCCEDED, jobDscr)
			});

		// 4. Update record in db


		// 5. Return the description
		return jobDescription;
	}

	private async makeCallToChatGPT(prompt: string): Promise<string> {
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
		const hasKeyWords = params.keyWords && params.keyWords.length > 0;

		return `Write a job description for a ${params.jobTitle} role ${params.industry ? `in the ${params.industry} industry` : ""}that is around ${params.numWords} words in a ${params.tone} tone. ${hasKeyWords ? `Incorporate the following keywords: ${params.keyWords?.join(', ')}` : ""} The job position should be described in a way that is SEO friendly, highlighting its unique features and benefits.`;
	}

	private async createRecordInDb(params: GenerateDescriptionParams, prompt: string): Promise<number> {
		let id: number = 0;
		await this.prisma.generationRequest.create({
		  data: {
			...params,
			status: RequestStatus.REQUESTED,
			fullTextPrompt: prompt,
		  },
		}).then(result => {
			id = result.id;
		});

		return id;
	}

	private async updateStatusInDb(id: number, status: RequestStatus, responseText: string) {
		 await this.prisma.generationRequest.update({
			where: {
				id: id,
			},
			data: {
				status: status,
				responseText: responseText
			},
		})
	}
}
