import {
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
} from 'n8n-workflow'
import { buildStdMessageFromData, MessageData, putApiInfoInMemory } from '../ckit_model'

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

export async function executeOperationChatbot(
	self: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
	self.logger.debug('EXECUTE CB')
	let onWebResponse: INodeExecutionData[] = []
	let onMessage: INodeExecutionData[] = []
	const onGetAdvisor: INodeExecutionData[] = []

	const input = self.getInputData(0)[0] as INodeExecutionData

	const resource = self.getNodeParameter('resource', 0, '') as string
	const operation = self.getNodeParameter('operation', 0) as string
	self.logger.warn(`Resource: ${resource} - Operation: ${operation} - Not implemented yet`)

	if (input.json.body) {
		const requestType = (input.json['body'] as IDataObject)?.['type'] as string
		if (requestType == 'onStartConversation') {
			({ onWebResponse, onMessage } = onStartConversation(self, input))
		} else {
			throw new NodeOperationError(self.getNode(), 'Unknown request type', {})
		}
	}

	return [onWebResponse, onMessage, onGetAdvisor]
}

function processOnStartConversation(self: IExecuteFunctions, userIdentifier: string, channelType: string, message: MessageData): INodeExecutionData[] {
	self.logger.info("processOnStartConversation ")
	const stdMsg = buildStdMessageFromData(self, "executeChatbot", {
		"message": {
			"msgType": message.msgType,
			"text": message.text,
		},
		"userIdentifier": userIdentifier,
		"channelType": channelType,
	})
	return [{
		json: stdMsg.toJson()
	}]
}

function onStartConversation(
	self: IExecuteFunctions,
	input: INodeExecutionData,
): { onWebResponse: INodeExecutionData[]; onMessage: INodeExecutionData[] } {
	const body = input.json['body'] as IDataObject
	const payload = body['payload'] as IDataObject
	const env = (payload['callerContext'] as IDataObject)['env'] as string

	self.logger.info(`CKitChatbot onStartConversation ------------------------------------`)
	self.logger.info(`CKitChatbot env: ${env}`)

	putApiInfoInMemory(self, env)
	// setMainUuidInMemory(self, (payload['context'] as IDataObject)['uuid'] as string)
	// let onWebResponse: INodeExecutionData[] = []

	// const executionMemory = CKitMemoryService.getExecutionMemory(self)
	// const conversation = new ConversationInfo(self.getExecutionId(), (payload['context'] as IDataObject)['uuid'] as string)
	// executionMemory.write("conversation", conversation)
	// conversation.setContextVar(self, "userIdentifier", (payload['context'] as IDataObject)['userIdentifier'] as string)
	// conversation.setContextVar(self, "channelType", (payload['context'] as IDataObject)['channelType'] as string)
	// conversation.setContextVar(self, "contact", (payload['context'] as IDataObject)['contact'] as IDataObject)
	const message: MessageData = new MessageData("TEXT", (payload['param'] as IDataObject)['mensagem'] as string)
	const onMessage = processOnStartConversation(self, (payload['context'] as IDataObject)['userIdentifier'] as string, (payload['context'] as IDataObject)['channelType'] as string, message)
	self.logger.info(`CKitChatbot ->` + input.json['webhookUrl'])
	self.logger.info(JSON.stringify(input))
	const onWebResponse = [
		{
			json: {
				ok: true,
				workflowId: self.getExecutionId(),
				callbackUrl: input.json?.webhookUrl as string,
			},
		},
	]
	return { onWebResponse, onMessage } // onChatbot
}
