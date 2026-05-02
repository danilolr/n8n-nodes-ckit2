import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow'
import { CKitMemoryService } from '../ckit_db';
import { ConversationInfo } from '../ckit_chatbot_info_memory';
import { flushInput, readResponseMessage, saveLastUserMessage } from '../callback_utils';
import { buildStdMessage } from '../ckit_model';

export const propertiesWait: INodeProperties[] = [
	{
		displayName: 'Wait Text Message',
		name: 'textMessageWait',
		type: 'string',
		default: '',
		placeholder: 'Message text',
		description: 'Message text to send',
		displayOptions: {
			show: {
				operation: ['wait'],
			},
		},
	},
]

export async function executeOperationWait(self: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	self.logger.warn("CKitGeneric: execute WAIT operation")
	const message = self.getNodeParameter('textMessageWait', 0, '') as string
	if (message || message.trim().length > 0) {
		const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
		if (!conversation) {
			self.logger.info("CKitWait: No conversation found")
			return [self.getInputData(0)]
		}

		self.logger.info(`CKitWait: Adding message to conversation ${conversation.uuid} - message: ${message}`)
		conversation.addTextMessage(message)
    	await flushInput(self)
	}

	const msg = await readResponseMessage(self)
	self.logger.info("Will save lastUserMessage in memory: " + JSON.stringify(msg))
	saveLastUserMessage(self, msg)

	const stdMsg = buildStdMessage(self, "executeChatbot")
	const onOut = [{
		json: stdMsg.toJson()
	}]

	return [
		self.helpers.returnJsonArray(onOut)
	]
}
