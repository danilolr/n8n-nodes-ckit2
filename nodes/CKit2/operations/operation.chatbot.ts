import {
	IHttpRequestOptions,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
} from 'n8n-workflow'
import { buildStdMessage, getChannelInfoFromMemory, putApiInfoInMemory } from '../ckit_model'
import { callBackend, flushInput, MessageTypeEnum, saveLastUserMessage } from '../callback_utils'
import { CKitMemoryService } from '../ckit_db'
import { ConversationInfo } from '../ckit_chatbot_info_memory'
import { getApiInfoFromMemory } from './operation.api'

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
		displayName: 'Call contact on start',
		name: 'callContactOnStart',
		type: 'boolean',
		default: false,
		description: 'Whether to call contact information from API on start conversation',
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

function processOnStartConversation(self: IExecuteFunctions): INodeExecutionData[] {
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
	const callerContext = payload['callerContext'] as IDataObject
	const env = callerContext['env'] as string

	self.logger.info(`CKitChatbot onStartConversation ------------------------------------`)
	self.logger.info(`CKitChatbot env: ${env}`)
	self.logger.info(JSON.stringify(input))

	putApiInfoInMemory(self, env)

	const param = payload['param'] as IDataObject

	const executionMemory = CKitMemoryService.getExecutionMemory(self)
	executionMemory.write("callerContext", callerContext)
	executionMemory.write("contact", payload['contact'] as IDataObject)
	executionMemory.write("channel", payload['channel'] as IDataObject)
	executionMemory.write("context", payload['context'] as IDataObject)
	self.logger.info("Will save lastUserMessage in memory: " + JSON.stringify(param['message'] as IDataObject)	)
	saveLastUserMessage(self, {
		msgType: MessageTypeEnum.TEXT,
		text: param['message'] ? (param['message'] as IDataObject)['text'] as string : undefined,
	})

	const conversationUuid = callerContext['uuid'] as string
	const conversation = new ConversationInfo(self.getExecutionId(), conversationUuid)
	executionMemory.write("conversation", conversation)
	const onMessage = processOnStartConversation(self)

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
	self.logger.debug('Execute chatbot node')
	let onMessage: INodeExecutionData[] = []
	const onGetAdvisor: INodeExecutionData[] = []

	const input = self.getInputData(0)[0] as INodeExecutionData

	if (input.json.body) {
		const requestType = (input.json['body'] as IDataObject)?.['type'] as string
		if (requestType == 'onStartConversation') {
			onMessage = await onStartConversation(self, input)
			const callContactOnStart = self.getNodeParameter('callContactOnStart', 0, false) as boolean
			if (callContactOnStart) {
				await callContact(self)
			}
		} else if (requestType == 'onAdvisor') {
			// onGetAdvisor = onAdvisor(self, input)
		} else {
			throw new NodeOperationError(self.getNode(), 'Unknown request type', {})
		}
	}

	return [onMessage, onGetAdvisor]
}

async function callContact(self: IExecuteFunctions): Promise<void> {
	const apiInfo = getApiInfoFromMemory(self)
	const url = `${apiInfo?.apiUrl}/contact` 
	const channelInfo = getChannelInfoFromMemory(self)
	const p: IDataObject = {
		channelType: channelInfo?.channelType,
		userIdentifier: channelInfo?.userIdentifier,
	}

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: url,
		body: p,
		json: true,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiInfo?.apiKey}`
		},
	}

	self.logger.info("URL: " + url)
	self.logger.error("API CALL options: " + JSON.stringify(options))
	
	const resp = await self.helpers.httpRequest(options)
	self.logger.error("API CALL response: " + JSON.stringify(resp))

	const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
	if (!conversation || !resp || !resp.ok) {
		self.logger.info("CKitMsg: No conversation found")
		return
	}

	conversation.setContact(resp.contact.name, resp.contact.email, resp.contact.phone, resp.contact.docId, resp.contact.docType)
	await flushInput(self)
}
