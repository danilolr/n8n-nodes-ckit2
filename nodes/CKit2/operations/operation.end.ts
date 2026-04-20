import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow'
import { ConversationInfo } from '../ckit_chatbot_info_memory'
import { CKitMemoryService } from '../ckit_db'
import { endConversation, flushInput } from '../callback_utils'

export const propertiesEnd: INodeProperties[] = [
	{
		displayName: 'Bye Message',
		name: 'byeMessage',
		type: 'string',
		default: '',
		placeholder: 'Bye message text',
		description: 'Bye message to be send',
		displayOptions: {
			show: {
				operation: ['end'],
			},
		},
	},
]

export async function executeOperationEnd(self: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        self.logger.warn("CKitGeneric: execute END operation")
        const byeMessage = self.getNodeParameter('byeMessage', 0, '') as string
        if (byeMessage && byeMessage.trim() !== '') {
            const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
            if (!conversation) {
                self.logger.error("CKitMsg: No conversation found")
                return [self.getInputData(0)]
            }
            conversation.addTextMessage(byeMessage)
        }
        await endConversation(self)
        await flushInput(self)
        return []
}