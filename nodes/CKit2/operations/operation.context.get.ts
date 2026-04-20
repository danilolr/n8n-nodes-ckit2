import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow'

export const propertiesContextGet: INodeProperties[] = [
	{
		displayName: 'Add Prev Node to Context',
		name: 'addPrevNodeToContext',
		type: 'boolean',
		default: false,
		description: "Whether to add the previous node's output to the context",
		displayOptions: {
			show: {
				operation: ['getContext'],
			},
		},
	},
	{
		displayName: 'Node Name',
		name: 'nodeNamePrevNodeGet',
		type: 'string',
		default: '',
		placeholder: 'Node name',
		description: 'Name of the previous node',
		displayOptions: {
			show: {
				addPrevNodeToContext: [true],
			},
		},
	},
]
	
export async function executeOperationGetContext(self: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	return []		
}