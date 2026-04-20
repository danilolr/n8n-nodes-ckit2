import {
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
} from 'n8n-workflow'
import { buildStdMessage, MessageData, putApiInfoInMemory } from '../ckit_model'
import { callBackend } from '../callback_utils'
import { CKitMemoryService } from '../ckit_db'
import { ConversationInfo } from '../ckit_chatbot_info_memory'

export const propertiesChatbot: INodeProperties[] = [
	{
		displayName: 'Chatbot Name',
		name: 'name',
		type: 'string',
		default: '',
		description: 'Name of the chatbot',
		displayOptions: {
			show: {
				operation: ['chatbot'],
			},
		},
	},
	{
		displayName: 'Chatbot Version',
		name: 'version',
		type: 'string',
		default: '0.0.1',
		description: 'Version of the chatbot (e.g., 0.0.1)',
		displayOptions: {
			show: {
				operation: ['chatbot'],
			},
		},
	},
	{
		displayName: 'API Configuration',
		name: 'apiConfigUi',
		placeholder: 'Add URL',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				operation: ['chatbot'],
			},
		},
		options: [
			{
				name: 'apiConfigUiValues',
				displayName: 'API Configuration',
				values: [
					{
						displayName: 'Api Key',
						name: 'envApiKey',
						type: 'string',
						typeOptions: { password: true },
						default: '',
					},
					{
						displayName: 'Env',
						name: 'envApiUrl',
						type: 'string',
						default: '',
					},
					{
						displayName: 'URL',
						name: 'urlApiUrl',
						type: 'string',
						default: '',
					},
				],
			},
		],
	},
	{
		displayName: 'Pages',
		name: 'pages',
		placeholder: 'Add page',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		displayOptions: {
			show: {
				operation: ['chatbot'],
			},
		},
		description: 'Add page',
		options: [
			{
				name: 'pagesValues',
				displayName: 'Page',
				values: [
					{
						displayName: 'Path',
						name: 'pagePath',
						type: 'string',
						default: '',
						description: 'Page path',
					},
					{
						displayName: 'Label',
						name: 'pageLabel',
						type: 'string',
						default: '',
						description: 'Page label',
					},
				],
			},
		],
	},
]

function processOnStartConversation(self: IExecuteFunctions, userIdentifier: string, channelType: string, message: MessageData): INodeExecutionData[] {
	self.logger.info("processOnStartConversation")
	const stdMsg = buildStdMessage(self, "executeChatbot")
	return [{
		json: stdMsg.toJson()
	}]
}

async function onStartConversation(
	self: IExecuteFunctions,
	input: INodeExecutionData,
): Promise<INodeExecutionData[]> {
	const body = input.json['body'] as IDataObject
	const payload = body['payload'] as IDataObject
	const env = (payload['callerContext'] as IDataObject)['env'] as string

	self.logger.info(`CKitChatbot onStartConversation ------------------------------------`)
	self.logger.info(`CKitChatbot env: ${env}`)
	self.logger.info(JSON.stringify(input))

	putApiInfoInMemory(self, env)

	const param = payload['param'] as IDataObject

	const executionMemory = CKitMemoryService.getExecutionMemory(self)
	executionMemory.write("callerContext", payload['callerContext'] as IDataObject)
	executionMemory.write("contact", payload['contact'] as IDataObject)
	executionMemory.write("channel", payload['channel'] as IDataObject)
	executionMemory.write("context", payload['context'] as IDataObject)
	executionMemory.write("lastUserMessage", param['message'] as IDataObject)

	const conversationUuid = (payload['callerContext'] as IDataObject)['uuid'] as string
	const conversation = new ConversationInfo(self.getExecutionId(), conversationUuid)
	executionMemory.write("conversation", conversation)
	const message: MessageData = new MessageData("TEXT", (payload['param'] as IDataObject)['mensagem'] as string)
	const onMessage = processOnStartConversation(self, (payload['context'] as IDataObject)['userIdentifier'] as string, (payload['context'] as IDataObject)['channelType'] as string, message)

	self.logger.info("Will call backend: " + conversationUuid)
	const callbackParams = {
		"executionId": self.getExecutionId(),
	}
	await callBackend(self, "setExecutionId", callbackParams)

	return onMessage 
}

export async function executeOperationChatbot(
	self: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
	self.logger.debug('EXECUTE CB')
	let onMessage: INodeExecutionData[] = []
	let onGetAdvisor: INodeExecutionData[] = []

	const input = self.getInputData(0)[0] as INodeExecutionData

	if (input.json.body) {
		const requestType = (input.json['body'] as IDataObject)?.['type'] as string
		if (requestType == 'onStartConversation') {
			onMessage = await onStartConversation(self, input)
		} else if (requestType == 'onAdvisor') {
			// onGetAdvisor = onAdvisor(self, input)
		} else {
			throw new NodeOperationError(self.getNode(), 'Unknown request type', {})
		}
	}

	return [onMessage, onGetAdvisor]
}