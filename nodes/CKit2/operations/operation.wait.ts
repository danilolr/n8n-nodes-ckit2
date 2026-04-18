import type { INodeProperties } from 'n8n-workflow'

export const propertiesWait: INodeProperties[] = [
	{
		displayName: 'Wait Text Message',
		name: 'textMessageWait',
		type: 'string',
		default: '',
		placeholder: 'Message text',
		description: 'Message text to be send',
		displayOptions: {
			show: {
				operation: ['wait'],
			},
		},
	},
]
