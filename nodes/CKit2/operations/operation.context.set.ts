import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow'
import { CKitMemoryService } from '../ckit_db'
import { ConversationInfo } from '../ckit_chatbot_info_memory'

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

export async function executeOperationSetContext(self: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	self.logger.warn("CKitGeneric: execute SET CONTEXT operation")
	const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
	if (conversation) {
		const setters = self.getNodeParameter('setters', 0, '') as { setter: { key: string, value: string }[] }
		self.logger.warn(JSON.stringify(setters, null, 2))

		for (const setter of setters.setter) {
			const key = setter.key as string
			const value = setter.value as string
			conversation.setContextVar(self, key, value)
		}
	} else {
		self.logger.error("No current conversation found for workflowId: " + self.getWorkflow().id)
	}
	return [self.getInputData()]
}