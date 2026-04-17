import type { INodeProperties } from 'n8n-workflow';

export const propertiesMain: INodeProperties[] = [
	{
		displayName: 'API Configuration',
		name: 'apiConfigUi',
		placeholder: 'Add URL',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				operation: ['ckit'],
			},
		},
		options: [
			{
				name: 'apiConfigUiValues',
				displayName: 'API Configuration',
				values: [
					{
						displayName: 'Api Key',
						name: 'envApiKey',
						type: 'string',
						typeOptions: { password: true },
						default: '',
					},
					{
						displayName: 'Env',
						name: 'envApiUrl',
						type: 'string',
						default: '',
					},
					{
						displayName: 'URL',
						name: 'urlApiUrl',
						type: 'string',
						default: '',
					},
				],
			},
		],
	},
];
