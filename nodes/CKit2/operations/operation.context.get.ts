import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow'
import { CKitMemoryService } from '../ckit_db'
import { ConversationInfo } from '../ckit_chatbot_info_memory'

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
	self.logger.info("CKitGeneric: execute GET CONTEXT operation ----------------------------")
	const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
	let outResponse: INodeExecutionData[] = []
	if (conversation) {
		const context = conversation.getContext()
		self.logger.info("Current context")
		self.logger.info(JSON.stringify(context))

		const prevNodeName = self.getNodeParameter('nodeNamePrevNodeGet', 0, '') as string
		const addPrevNodeToContext = self.getNodeParameter('addPrevNodeToContext', 0, false) as boolean
		let prevInput = null
		if (addPrevNodeToContext && prevNodeName != "") {
			self.logger.info("Adding previous node to context: " + prevNodeName)
		}
		if (!prevInput) {
			prevInput = self.getInputData(0)[0].json
		}
		const response: IDataObject = {
			context: context,
			prevInput: prevInput
		}
		// const contact = getContactInfoFromMemory(self)
		// if (contact) {
		//     response['contact'] = contact
		// }
		// const executionMemory = CKitMemoryService.getExecutionMemory(self)
		// const runAction = executionMemory.read("runAction") as RunActionData
		// if (runAction) {
		//     response['runAction'] = runAction
		// }
		outResponse = [
			{
				json: response
			}
		]
	} else {
		self.logger.error("No current conversation found for workflowId: " + self.getWorkflow().id)
		outResponse = [
			{
				json: {
					context: {},
				}
			}
		]
	}
	return [outResponse]
}