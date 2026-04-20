import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow'
import { propertiesAdvisor } from './operations/operation.advisor'
import { configureOutputs } from './config.outputs'
import { executeOperationApi, propertiesApi } from './operations/operation.api'
import { executeOperationChatbot, propertiesChatbot } from './operations/operation.chatbot'
import { executeOperationContact, propertiesContact } from './operations/operation.contact'
import { executeOperationGetContext, propertiesContextGet } from './operations/operation.context.get'
import { executeOperationSetContext, propertiesContextSet } from './operations/operation.context.set'
import { executeOperationEnd, propertiesEnd } from './operations/operation.end'
import { propertiesIntent } from './operations/operation.intent'
import { propertiesIntentAction } from './operations/operation.intent.action'
import { propertiesIntentActionBuild } from './operations/operation.intent.action.build'
import { executeOperationMenu, propertiesMenu } from './operations/operation.menu'
import { executeOperationMessage, propertiesMessage } from './operations/operation.message'
import { propertiesTransfer } from './operations/operation.transfer'
import { executeOperationWait, propertiesWait } from './operations/operation.wait'
import { getOperationProperties, getResourceOptions } from './resources'

export class CKit2 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CKit2',
		name: 'cKit2',
		icon: { light: 'file:ckit2.svg', dark: 'file:ckit2.dark.svg' },
		group: ['transform'],
		version: [1],
		subtitle: '={{ $parameter["operation"] }}',
		description: 'Base node for the next generation Chatbot Kit integration',
		defaults: {
			name: 'CKit2',
		},
		inputs: [
			{
				type: 'main',
			},
		],
		outputs: `={{(${configureOutputs})($parameter)}}`,
		usableAsTool: true,
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: getResourceOptions(),
				default: '',
			},
			...getOperationProperties(),
			...propertiesChatbot,
			...propertiesMessage,
			...propertiesAdvisor,
			...propertiesApi,
			...propertiesContact,
			...propertiesContextGet,
			...propertiesContextSet,
			...propertiesEnd,
			...propertiesIntentActionBuild,
			...propertiesIntentAction,
			...propertiesIntent,
			...propertiesMenu,
			...propertiesTransfer,
			...propertiesWait,
		],
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData()
		this.logger.debug(JSON.stringify(items))

		const resource = this.getNodeParameter('resource', 0, '') as string
		const operation = this.getNodeParameter('operation', 0) as string
		if (operation === 'chatbot') { 
    		return executeOperationChatbot(this)
		}
		if (operation === 'message') {
			return executeOperationMessage(this)
		}
		if (operation === 'end') {
			return executeOperationEnd(this)
		}
		if (operation === 'api') {
			return executeOperationApi(this)
		}
		if (operation === 'waitUserMessage') {
			return executeOperationWait(this)
		}
		if (operation === 'menu') {
			return executeOperationMenu(this)
		}
		if (operation === 'contact') {
			return executeOperationContact(this)
		}
		if (operation === 'setContext') {
			return executeOperationSetContext(this)
		}
		if (operation === 'getContext') {
			return executeOperationGetContext(this)
		}
		this.logger.warn(`Resource: ${resource} - Operation: ${operation} - Not implemented yet`)
		return [this.helpers.returnJsonArray(items)]
	}
}
