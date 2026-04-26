import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow'
import { CKitMemoryService } from '../ckit_db'
import { flushInput } from '../callback_utils'
import { ConversationInfo } from '../ckit_chatbot_info_memory'
import { buildStdMessage } from '../ckit_model'

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
	self.logger.warn("CKitGeneric: execute CONTACT operation")
	const name = self.getNodeParameter('name', 0, '') as string
	const email = self.getNodeParameter('email', 0, '') as string
	const phone = self.getNodeParameter('phone', 0, '') as string
	const docId = self.getNodeParameter('docId', 0, '') as string
	const docType = self.getNodeParameter('docType', 0, '') as string
	const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
	if (!conversation) {
		self.logger.info("CKitMsg: No conversation found")
		return [self.getInputData(0)]
	}
	conversation.setContact(name, email, phone, docId, docType)
	await flushInput(self)
	const outResponse = [{
		json: buildStdMessage(self, "executeChatbot").toJson()
	}]
	return [outResponse]
}