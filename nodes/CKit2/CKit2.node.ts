import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { propertiesAdvisor } from './operations/operation.advisor';
import { configureOutputs } from './config.outputs';
import { propertiesApi } from './operations/operation.api';
import { propertiesChatbot } from './operations/operation.chatbot';
import { propertiesContact } from './operations/operation.contact';
import { propertiesContextGet } from './operations/operation.context.get';
import { propertiesContextSet } from './operations/operation.context.set';
import { propertiesEnd } from './operations/operation.end';
import { propertiesIntent } from './operations/operation.intent';
import { propertiesIntentAction } from './operations/operation.intent.action';
import { propertiesIntentActionBuild } from './operations/operation.intent.action.build';
import { propertiesMain } from './operations/operation.main';
import { propertiesMenu } from './operations/operation.menu';
import { propertiesMessage } from './operations/operation.message';
import { propertiesPage } from './operations/operation.page';
import { propertiesTransfer } from './operations/operation.transfer';
import { propertiesWait } from './operations/operation.wait';
import { getOperationProperties, getResourceOptions } from './resources';

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
			...propertiesAdvisor,
			...propertiesApi,
			...propertiesChatbot,
			...propertiesContact,
			...propertiesContextGet,
			...propertiesContextSet,
			...propertiesEnd,
			...propertiesIntentActionBuild,
			...propertiesIntentAction,
			...propertiesIntent,
			...propertiesMain,
			...propertiesMenu,
			...propertiesMessage,
			...propertiesPage,
			...propertiesTransfer,
			...propertiesWait,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const resource = this.getNodeParameter('resource', itemIndex, '') as string;
			const operation = this.getNodeParameter('operation', itemIndex, '') as string;

			returnData.push({
				json: {
					...items[itemIndex].json,
					node: 'CKit2',
					resource,
					operation,
					status: 'not-implemented',
				},
				pairedItem: { item: itemIndex },
			});
		}

		return [returnData];
	}
}
