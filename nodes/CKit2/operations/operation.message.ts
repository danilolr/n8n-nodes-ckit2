import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow'
import { flushInput, readResponseMessage, saveLastUserMessage } from '../callback_utils'
import { ConversationInfo } from '../ckit_chatbot_info_memory'
import { CKitMemoryService } from '../ckit_db'
import { buildStdMessage } from '../ckit_model'

export const propertiesMessage: INodeProperties[] = [
	{
		displayName: 'Message Type',
		name: 'msgType',
		type: 'options',
		options: [
			{
				name: 'Send Text Message',
				value: 'textMessage',
				description: 'Send a text message',
				action: 'Send a text message',
			},
			{
				name: 'Send File Message',
				value: 'fileMessage',
				description: 'Send a file message',
				action: 'Send a file message',
			},
		],
		default: 'textMessage',
		noDataExpression: true,
		displayOptions: {
			show: {
				operation: ['message'],
			},
		},
	},
	{
		displayName: 'Text',
		name: 'textMessage',
		type: 'string',
		default: '',
		placeholder: 'Message text',
		description: 'Message text to send',
		displayOptions: {
			show: {
				msgType: ['textMessage'],
			},
		},
	},
	{
		displayName: 'File Type',
		name: 'fileType',
		type: 'options',
		displayOptions: {
			show: {
				msgType: ['fileMessage'],
			},
		},
		options: [
			{
				name: 'File URL',
				value: 'fileUrl',
				description: 'Get the file from a URL',
			},
			{
				name: 'From Binary',
				value: 'fileBinary',
				description: 'Get the file from binary data',
			},
		],
		default: 'fileUrl',
		noDataExpression: true,
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		placeholder: 'File URL',
		description: 'URL of the file to send',
		displayOptions: {
			show: {
				fileType: ['fileUrl'],
			},
		},
	},
	{
		displayName: 'Send Mode',
		name: 'sendMode',
		type: 'options',
		options: [
			{
				name: 'Send and Proceed',
				value: 'sendAndProceed',
				description: 'Send the message immediately and proceed with the workflow',
			},
			{
				name: 'Send and Wait',
				value: 'sendAndWait',
				description: 'Send the message immediately and wait for a message from the user',
			},
			{
				name: "Don't Send",
				value: 'dontSend',
				description: 'Just add the message to be sent later',
			},
		],
		default: 'sendAndProceed',
		displayOptions: {
			show: {
				operation: ['message'],
			},
		},
		noDataExpression: true,
	},
]

export async function executeOperationMessage(self: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	self.logger.warn("CKitGeneric: execute MESSAGE operation")
	const input = self.getInputData()[0].json as IDataObject
	const message = self.getNodeParameter('textMessage', 0, '') as string
	const sendMode = self.getNodeParameter('sendMode', 0, '') as string
	const msgType = self.getNodeParameter('msgType', 0, '') as string

	self.logger.info(`CKitGeneric MESSAGE executed with params: ${JSON.stringify(input)} - message: ${message}, sendMode: ${sendMode}, msgType: ${msgType}`);

	const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
	if (!conversation) {
		self.logger.info("CKitMsg: No conversation found")
		return [self.getInputData(0)]
	}

	if (msgType == "textMessage") {
		self.logger.info(`CKitMsg: Adding text message to conversation ${conversation.uuid} - message: ${message}`)
		conversation.addTextMessage(message)
	} if (msgType == "fileMessage") {
		const fileUrl = self.getNodeParameter('fileUrl', 0, '') as string
		self.logger.info(`CKitMsg: Adding file message to conversation ${conversation.uuid} - message: ${message} ${fileUrl}`)
		conversation.addDocMessage(message, fileUrl)
	}

	self.logger.info(`CKitMsg: Adding text message to conversation ${conversation.uuid} - message: ${message}`)

	if (sendMode == 'sendAndProceed' || sendMode == 'sendAndWait') {
		await flushInput(self)
	}
	if (sendMode == 'sendAndWait') {
		const msg = await readResponseMessage(self)
		self.logger.info("Will save lastUserMessage in memory: " + JSON.stringify(msg))
		saveLastUserMessage(self, msg)
	}

	const stdMsg = buildStdMessage(self, "executeChatbot")
	const onOut = [{
		json: stdMsg.toJson()
	}]
	return [
		self.helpers.returnJsonArray(onOut)
	]
}
