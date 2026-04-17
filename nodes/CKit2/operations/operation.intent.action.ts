import type { INodeProperties } from 'n8n-workflow';

export const propertiesIntentAction: INodeProperties[] = [
	{
		displayName: 'Action ID',
		name: 'actionId',
		type: 'string',
		default: '',
		required: true,
		description: 'Unique action ID',
		displayOptions: {
			show: {
				operation: ['action'],
			},
		},
	},
];
