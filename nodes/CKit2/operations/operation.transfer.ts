import type { INodeProperties } from 'n8n-workflow'

export const propertiesTransfer: INodeProperties[] = [
	{
		displayName: 'Transfer Type',
		name: 'transferType',
		type: 'options',
		options: [
			{
				name: 'To Any Available Agent',
				value: 'toAnyAvailableAgent',
				description: 'Transfer conversation to any available agent',
				action: 'Transfer conversation to any available agent',
			},
			{
				name: 'To Department',
				value: 'toDepartment',
				description: 'Transfer conversation to a specific department',
				action: 'Transfer conversation to a specific department',
			},
			{
				name: 'To User',
				value: 'toUser',
				description: 'Transfer conversation to a specific user',
				action: 'Transfer conversation to a specific user',
			},
		],
		default: 'toAnyAvailableAgent',
		noDataExpression: true,
		displayOptions: {
			show: {
				operation: ['transfer'],
			},
		},
	},
	{
		displayName: 'Department',
		name: 'department',
		type: 'string',
		default: '',
		placeholder: 'Department name',
		description: 'Name of the department',
		displayOptions: {
			show: {
				transferType: ['toDepartment'],
			},
		},
	},
]
