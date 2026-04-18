import type { INodeProperties } from 'n8n-workflow'

export const propertiesApi: INodeProperties[] = [
	{
		displayName: 'Method',
		name: 'apiMethod',
		type: 'string',
		default: '',
		placeholder: 'Method',
		description: 'Method to call the API',
		displayOptions: {
			show: {
				operation: ['api'],
			},
		},
	},
	{
		displayName: 'Parameters',
		name: 'parameters',
		placeholder: 'Add param',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		displayOptions: {
			show: {
				operation: ['api'],
			},
		},
		description: 'Add param',
		options: [
			{
				name: 'parametersValues',
				displayName: 'Param',
				values: [
					{
						displayName: 'Name',
						name: 'paramName',
						type: 'string',
						default: '',
						description: 'Param name',
					},
					{
						displayName: 'Value',
						name: 'paramValue',
						type: 'string',
						default: '',
						description: 'Param value',
					},
					{
						displayName: 'Data Type',
						name: 'dataType',
						type: 'options',
						options: [
							{
								name: 'String',
								value: 'string',
							},
							{
								name: 'Integer',
								value: 'int',
							},
							{
								name: 'Float',
								value: 'float',
							},
						],
						default: 'string',
						noDataExpression: true,
					},
				],
			},
		],
	},
]
