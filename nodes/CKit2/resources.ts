import type { INodeProperties, INodePropertyCollection, INodePropertyOptions } from 'n8n-workflow'

type OperationDefinition = {
	name: string
	value: string
	description?: string
	action: string
}

type ResourceDefinition = {
	name: string
	value: string
	operations: OperationDefinition[]
}

const resources: ResourceDefinition[] = [
	{
		name: 'Ai',
		value: 'ai',
		operations: [
			{
				name: 'AI',
				value: 'ai-agent',
				description: 'AI Agent operation',
				action: 'AI Agent',
			},
		],
	},
	{
		name: 'Api',
		value: 'api',
		operations: [
			{
				name: 'Api',
				value: 'api',
				action: 'Api',
			},
		],
	},
	{
		name: 'Chat',
		value: 'chat',
		operations: [
			{
				name: 'Menu',
				value: 'menu',
				description: 'Menu operation',
				action: 'Menu',
			},
			{
				name: 'Message',
				value: 'message',
				description: 'Send message operation',
				action: 'Message',
			},
			{
				name: 'Contact',
				value: 'contact',
				description: 'Contact operation',
				action: 'Contact',
			},
			{
				name: 'WaitUserMessage',
				value: 'waitUserMessage',
				description: 'Wait for message',
				action: 'Wait for message',
			},
			{
				name: 'End',
				value: 'end',
				description: 'End conversation operation',
				action: 'End conversation',
			},
			{
				name: 'Transfer',
				value: 'transfer',
				description: 'Transfer operation',
				action: 'Transfer',
			},
		],
	},
	{
		name: 'Flow',
		value: 'flow',
		operations: [
			{
				name: 'End',
				value: 'end',
				description: 'End conversation operation',
				action: 'End conversation',
			},
			{
				name: 'Transfer',
				value: 'transfer',
				description: 'Transfer operation',
				action: 'Transfer',
			},
		],
	},
	{
		name: 'Config',
		value: 'config',
		operations: [
			{
				name: 'Chatbot',
				value: 'chatbot',
				description: 'Chatbot operation',
				action: 'Chatbot',
			},
		],
	},
	{
		name: 'Context',
		value: 'context',
		operations: [
			{
				name: 'GetContext',
				value: 'getContext',
				description: 'Get Context operation',
				action: 'Get Context',
			},
			{
				name: 'SetContext',
				value: 'setContext',
				description: 'Set Context operation',
				action: 'Set Context',
			},
		],
	},
	{
		name: 'Intent',
		value: 'intent',
		operations: [
			{
				name: 'Action',
				value: 'action',
				description: 'Action operation',
				action: 'Action',
			},
			{
				name: 'Action Build',
				value: 'actionBuild',
				description: 'Action Build operation',
				action: 'Action Build',
			},
			{
				name: 'Advisor',
				value: 'advisor',
				description: 'Advisor operation',
				action: 'Advisor',
			},
			{
				name: 'Intent',
				value: 'intent',
				action: 'Intent',
			},
			{
				name: 'Page',
				value: 'page',
				description: 'Page to show to the human assistant',
				action: 'Page',
			},
		],
	},
]

export function getResourceOptions(): Array<
	INodePropertyOptions | INodeProperties | INodePropertyCollection
> {
	return resources.map((resource) => ({
		name: resource.name,
		value: resource.value,
	}))
}

export function getOperationProperties(): INodeProperties[] {
	return resources.map((resource) => ({
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [resource.value],
			},
		},
		options: resource.operations.map((operation) => ({
			name: operation.name,
			value: operation.value,
			description: operation.description,
			action: operation.action,
		})),
		default: '',
	}))
}
