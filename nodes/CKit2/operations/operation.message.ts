import type { INodeProperties } from 'n8n-workflow';

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
		description: 'Message text to be send',
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
];
