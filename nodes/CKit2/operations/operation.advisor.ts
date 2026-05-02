import type { INodeProperties } from 'n8n-workflow'

export const propertiesAdvisor: INodeProperties[] = [
	{
		displayName: 'Reference',
		name: 'reference',
		type: 'string',
		default: '',
		description: 'Reference to the advisor',
		displayOptions: {
			show: {
				operation: ['advisor'],
			},
		},
	},
	{
		displayName: 'Prompt',
		name: 'advisorPrompt',
		type: 'string',
		default: 'You are an advisor ...',
		description: 'Text to use as the LLM prompt',
		displayOptions: {
			show: {
				operation: ['advisor'],
			},
		},
	},
]
