import type { INodeProperties } from 'n8n-workflow';

export const propertiesChatbot: INodeProperties[] = [
	{
		displayName: 'Chatbot Name',
		name: 'name',
		type: 'string',
		default: '',
		description: 'Name of the chatbot',
		displayOptions: {
			show: {
				operation: ['chatbot'],
			},
		},
	},
	{
		displayName: 'Chatbot Version',
		name: 'version',
		type: 'string',
		default: '0.0.1',
		description: 'Version of the chatbot (e.g., 0.0.1)',
		displayOptions: {
			show: {
				operation: ['chatbot'],
			},
		},
	},
];
