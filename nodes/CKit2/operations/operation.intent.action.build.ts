import type { INodeProperties } from 'n8n-workflow'

export const propertiesIntentActionBuild: INodeProperties[] = [
	{
		displayName: 'Action Type',
		name: 'actionBuildType',
		type: 'options',
		options: [
			{
				name: 'Send Text Message Sugestion',
				value: 'actiontextMessageSugestion',
				description: 'Send a text message suggestion',
				action: 'Send a text message suggestion',
			},
			{
				name: 'Send a File Message',
				value: 'actionFileMessage',
				action: 'Send a file message',
			},
			{
				name: 'Show a Action Button',
				value: 'actionShowButton',
				action: 'Show a button',
			},
			{
				name: 'Reload Main Page',
				value: 'actionPage',
				action: 'Reload main page',
			},
		],
		default: 'actiontextMessageSugestion',
		noDataExpression: true,
		displayOptions: {
			show: {
				operation: ['actionBuild'],
			},
		},
	},
	{
		displayName: 'Text',
		name: 'textMessage',
		type: 'string',
		default: '',
		placeholder: 'Message text',
		description: 'Message text to be send',
		displayOptions: {
			show: {
				actionBuildType: ['actiontextMessageSugestion'],
			},
		},
	},
	{
		displayName: 'Button Label',
		name: 'buttonLabel',
		type: 'string',
		default: '',
		placeholder: 'Button label',
		description: 'ButtonLabel',
		displayOptions: {
			show: {
				actionBuildType: ['actiontextMessageSugestion'],
			},
		},
	},
	{
		displayName: 'Button Label',
		name: 'buttonLabel',
		type: 'string',
		default: '',
		placeholder: 'Button label',
		displayOptions: {
			show: {
				actionBuildType: ['actionShowButton'],
			},
		},
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'string',
		default: '',
		placeholder: 'Page',
		displayOptions: {
			show: {
				actionBuildType: ['actionPage'],
			},
		},
	},
	{
		displayName: 'Page Type',
		name: 'pageType',
		type: 'options',
		default: 'pageUrl',
		placeholder: 'Page',
		description: 'Page',
		displayOptions: {
			show: {
				actionBuildType: ['actionPage'],
			},
		},
		options: [
			{
				name: 'Load URL',
				value: 'pageUrl',
				description: 'Load a URL',
			},
			{
				name: 'Dynamic Page',
				value: 'dynamicPage',
				description: 'Create a dynamic page',
			},
		],
	},
	{
		displayName: 'File Type',
		name: 'fileType',
		type: 'options',
		displayOptions: {
			show: {
				actionBuildType: ['actionFileMessage'],
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
				description: 'Get the file from a binary data',
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
		description: 'URL of the file to be send',
		displayOptions: {
			show: {
				fileType: ['fileUrl'],
			},
		},
	},
	{
		displayName: 'Parameters',
		name: 'parameters',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		displayOptions: {
			show: {
				operation: ['actionBuild'],
			},
		},
		default: { parameter: [] },
		placeholder: 'Add parameter',
		description: 'Add parameter to the action',
		options: [
			{
				name: 'parameter',
				displayName: 'Parameter',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						description: 'Parameter key',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Parameter value',
					},
				],
			},
		],
	},
]
