import type { INodeProperties } from 'n8n-workflow'

export const propertiesIntent: INodeProperties[] = [
	{
		displayName: 'Explanation',
		name: 'intentExplanation',
		type: 'string',
		default: 'Show then the user ',
		description: 'Text to llm prompt',
		displayOptions: {
			show: {
				operation: ['intent'],
			},
		},
	},
	{
		displayName: 'Code',
		name: 'intentCode',
		type: 'string',
		default: '',
		description: 'Code of the intent',
		displayOptions: {
			show: {
				operation: ['intent'],
			},
		},
	},
	{
		displayName: 'Examples',
		name: 'examples',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		displayOptions: {
			show: {
				operation: ['intent'],
			},
		},
		default: { chatbot: [] },
		placeholder: 'Add example',
		description: 'Add example of the intent',
		options: [
			{
				name: 'example',
				displayName: 'Example',
				values: [
					{
						displayName: 'Example',
						name: 'exampleText',
						type: 'string',
						default: '',
						description: 'Example text for the intent',
					},
				],
			},
		],
	},
]
