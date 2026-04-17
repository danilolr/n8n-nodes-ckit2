import type { INodeProperties } from 'n8n-workflow';

export const propertiesEnd: INodeProperties[] = [
	{
		displayName: 'Bye Message',
		name: 'byeMessage',
		type: 'string',
		default: '',
		placeholder: 'Bye message text',
		description: 'Bye message to be send',
		displayOptions: {
			show: {
				operation: ['end'],
			},
		},
	},
];
