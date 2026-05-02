import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow'
import { CKitMemoryService } from '../ckit_db'
import { ConversationInfo } from '../ckit_chatbot_info_memory'
import { flushInput, MessageTypeEnum, readResponseMessage } from '../callback_utils'
import { buildStdMessage } from '../ckit_model'

type MenuOption = { key: string; text: string; outputName: string }

type MenuConfig = { option: MenuOption[] }

type LegacyMenuConfig = { estado?: Array<{ key: string; texto?: string; outputName: string }> }

export const propertiesMenu: INodeProperties[] = [
	{
		displayName: 'Prompt Menu',
		name: 'promptMenu',
		type: 'string',
		default: 'Select an option',
		placeholder: 'Prompt',
		description: 'Prompt to show to the user',
		displayOptions: {
			show: {
				operation: ['menu'],
			},
		},
	},
	{
		displayName: 'Entry Message',
		name: 'entryMessage',
		type: 'string',
		default: '',
		placeholder: 'Message',
		description: 'Message to show when entering the menu',
		displayOptions: {
			show: {
				operation: ['menu'],
			},
		},
	},
	{
		displayName: 'Invalid Option Message',
		name: 'invalidOptionMessage',
		type: 'string',
		default: 'Choose a valid option',
		placeholder: 'Choose a valid option',
		description: 'Message to show when the user chooses an invalid option',
		displayOptions: {
			show: {
				operation: ['menu'],
			},
		},
	},
	{
		displayName: 'Invalid Message Type Message',
		name: 'invalidMessageTypeMessage',
		type: 'string',
		default: 'Enter a text message with a valid option',
		placeholder: 'Message to show when the user sends a non-text message',
		description: 'Message to show when the user sends a non-text message',
		displayOptions: {
			show: {
				operation: ['menu'],
			},
		},
	},
	{
		displayName: 'Use Native Menu',
		name: 'useNativeMenu',
		type: 'boolean',
		default: false,
		description: 'Whether to use the native menu of the platform instead of a text menu',
		displayOptions: {
			show: {
				operation: ['menu'],
			},
		},
	},
	{
		displayName: 'Menu Options',
		name: 'menuOptions',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		displayOptions: {
			show: {
				operation: ['menu'],
			},
		},
		default: { option: [] },
		placeholder: 'Add menu option',
		description: 'Add a menu option',
		options: [
			{
				name: 'option',
				displayName: 'Option',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						description: 'Option key entered by the user',
					},
					{
						displayName: 'Text',
						name: 'text',
						type: 'string',
						default: '',
						description: 'Menu option text, for example: Select this option to...',
					},
					{
						displayName: 'Output Name',
						name: 'outputName',
						type: 'string',
						default: '',
						description: 'Name of the output branch',
					},
				],
			},
		],
	},
]

export async function executeOperationMenu(self: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	self.logger.warn("CKitGeneric: execute MENU operation");
	const menuConfig = getMenuConfig(self);

	self.logger.info("CKitMenu execution started")
	const useNativeMenu = self.getNodeParameter('useNativeMenu', 0, '')
	const onInputMessage = getStringNodeParameter(self, 'entryMessage', 'mensagemEntrada')
	const promptMenu = self.getNodeParameter('promptMenu', 0, '') as string
	let textoStart = onInputMessage != "" && onInputMessage != null ? onInputMessage + "\n\n" : ""

	const onOptions: INodeExecutionData[][] = []
	const onNone: INodeExecutionData[] = []
	menuConfig.option.forEach((optionEntry: MenuOption) => {
		onOptions.push([])
		textoStart = textoStart + "\n" + optionEntry.key + " - " + optionEntry.text
	})
	textoStart = textoStart + "\n\n" + promptMenu

	const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
	conversation?.addTextMessage(textoStart)
	flushInput(self)

	if (useNativeMenu) {
		const nativeMenuMessage = {
			menu: [],
			promptMenu: promptMenu,
		} as IDataObject
		if (onInputMessage != null && onInputMessage != "") {
			nativeMenuMessage.entryMessage = onInputMessage
		}
		menuConfig.option.forEach((optionEntry: MenuOption) => {
			onOptions.push([]);
			(nativeMenuMessage['menu'] as IDataObject[]).push({ option: optionEntry.key, text: optionEntry.text })
		})
		conversation?.addMenuMessage(nativeMenuMessage)
		self.logger.info("Native menu message: " + JSON.stringify(nativeMenuMessage))
	}

	const mr = await getMenuResponse(self, menuConfig)

	self.logger.info("Menu operation finished with output counts: " + onOptions.length + " " + onNone.length)
	return [
		...mr.onOptions,
		self.helpers.returnJsonArray(mr.onNone),
	];
}

async function getMenuResponse(self: IExecuteFunctions, menuConfig: MenuConfig): Promise<{ onOptions: INodeExecutionData[][], onNone: INodeExecutionData[] }> {
	const userResponse = await readResponseMessage(self)
	self.logger.error("User menu answer: " + JSON.stringify(userResponse))
	const onOptions: INodeExecutionData[][] = []
	let onNone: INodeExecutionData[] = []
	if (userResponse.msgType != MessageTypeEnum.TEXT) {
		const invalidMessageTypeMessage = getStringNodeParameter(self, 'invalidMessageTypeMessage', 'mensagemTipoMensagemIncorreta', 'Choose a menu option')
		const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
		conversation?.addTextMessage(invalidMessageTypeMessage)
		flushInput(self)
		return await getMenuResponse(self, menuConfig)
	}
	self.logger.error(JSON.stringify(userResponse))
	const resposta = userResponse.text
	self.logger.info("Selected menu option: " + resposta)
	let p = 0
	let valida = false
	menuConfig.option.forEach((optionEntry: MenuOption) => {
		onOptions.push([])
		self.logger.info("Menu option: " + JSON.stringify(optionEntry))
		if (optionEntry.key == resposta) {
			// onOptions[p] = buildNodeResponse(self, "optionSelected", {})
			const onOut = [{
				json: buildStdMessage(self, "executeChatbot").toJson()
			}]
			onOptions[p] = onOut
			// const stdMsg = buildStdMessage(self, "executeChatbot")
			// const onOut = [{
			// 	json: stdMsg.toJson()
			// }]

			self.logger.info("Matching menu option found: " + p + " " + JSON.stringify(onOptions[p]))
			valida = true
		}
		p++
	})
	self.logger.info("Menu option is valid: " + valida)
	if (!valida) {
		const invalidOptionMessage = getStringNodeParameter(self, 'invalidOptionMessage', 'mensagemOpcaoInvalida')
		if (invalidOptionMessage == null || invalidOptionMessage == "") {
			onNone = [{
				json: {
					"ok": false,
					"response": "Invalid option"
				}
			}]
			return { onOptions: onOptions, onNone: onNone }
		} else {
			const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
			conversation?.addTextMessage(invalidOptionMessage)
			await flushInput(self)
			return await getMenuResponse(self, menuConfig)
		}
	} else {
		return { onOptions: onOptions, onNone: onNone }
	}
}

function getMenuConfig(self: IExecuteFunctions): MenuConfig {
	const menuConfig = self.getNodeParameter('menuOptions', 0, undefined) as MenuConfig | undefined
	if (menuConfig?.option) {
		return menuConfig
	}

	const legacyConfig = self.getNodeParameter('estados', 0, { estado: [] }) as LegacyMenuConfig
	return {
		option: (legacyConfig.estado ?? []).map((option) => ({
			key: option.key,
			text: option.texto ?? '',
			outputName: option.outputName,
		})),
	}
}

function getStringNodeParameter(
	self: IExecuteFunctions,
	name: string,
	legacyName: string,
	defaultValue = '',
): string {
	const value = self.getNodeParameter(name, 0, undefined) as string | undefined
	if (value !== undefined) {
		return value
	}

	return self.getNodeParameter(legacyName, 0, defaultValue) as string
}
