import type { INodeProperties } from 'n8n-workflow'

export const propertiesContextSet: INodeProperties[] = [
	{
		displayName: 'Setters',
		name: 'setters',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		displayOptions: {
			show: {
				operation: ['setContext'],
			},
		},
		default: { setters: [] },
		placeholder: 'Add setter',
		description: 'Add setter',
		options: [
			{
				name: 'setter',
				displayName: 'Setter',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						description: 'Key to set in context',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value to set in context',
					},
				],
			},
		],
	},
]
