import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow'

export const propertiesContact: INodeProperties[] = [
	{
		displayName: 'User Name',
		name: 'name',
		type: 'string',
		default: '',
		description: 'Name of the user',
		displayOptions: {
			show: {
				operation: ['contact'],
			},
		},
	},
	{
		displayName: 'User Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		description: 'Email of the user',
		displayOptions: {
			show: {
				operation: ['contact'],
			},
		},
	},
	{
		displayName: 'User Phone',
		name: 'phone',
		type: 'string',
		default: '',
		description: 'Phone of the user',
		displayOptions: {
			show: {
				operation: ['contact'],
			},
		},
	},
	{
		displayName: 'Document ID',
		name: 'docId',
		type: 'string',
		default: '',
		description: 'User Document ID',
		displayOptions: {
			show: {
				operation: ['contact'],
			},
		},
	},
	{
		displayName: 'Document Type',
		name: 'docType',
		type: 'string',
		default: '',
		description: 'User Document Type',
		displayOptions: {
			show: {
				operation: ['contact'],
			},
		},
	},
]

export async function executeOperationContact(self: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	return []	
}