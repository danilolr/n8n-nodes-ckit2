import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow'
import { CKitMemoryService } from '../ckit_db';
import { ConversationInfo } from '../ckit_chatbot_info_memory';
import { flushInput, readResponseMessage } from '../callback_utils';
import { buildNodeResponse } from '../ckit_model';

export const propertiesMenu: INodeProperties[] = [
	{
		displayName: 'Prompt Menu',
		name: 'promptMenu',
		type: 'string',
		default: 'Selecione uma opção',
		placeholder: 'Prompt',
		description: 'Prompt do a ser mostrado para o usuário',
		displayOptions: {
			show: {
				operation: ['menu'],
			},
		},
	},
	{
		displayName: 'Mensagem Entrada',
		name: 'mensagemEntrada',
		type: 'string',
		default: '',
		placeholder: 'Mensagem',
		description: 'Mensagem a ser mostrada ao entrar no estado',
		displayOptions: {
			show: {
				operation: ['menu'],
			},
		},
	},
	{
		displayName: 'Mensagem Opcão Invalida',
		name: 'mensagemOpcaoInvalida',
		type: 'string',
		default: 'Escolha uma opção válida',
		placeholder: 'Escolha uma opção válida',
		description: 'Mensagem a ser mostrada quando o usuário escolhe uma opção inválida',
		displayOptions: {
			show: {
				operation: ['menu'],
			},
		},
	},
	{
		displayName: 'Mensagem Tipo Mensagem Incorreta',
		name: 'mensagemTipoMensagemIncorreta',
		type: 'string',
		default: 'Você deve digitar uma mensagem com a opcão válida',
		placeholder: 'Mensagem quando o usuário envia uma mensagem que não é de texto',
		description: 'Mensagem quando o usuário envia uma mensagem que não é de texto',
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
		displayName: 'Estados',
		name: 'estados',
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
		default: { estado: [] },
		placeholder: 'Adicionar opcão menu',
		description: 'Adiciona opção menu',
		options: [
			{
				name: 'estado',
				displayName: 'Estado',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						description: 'Opção digitada',
					},
					{
						displayName: 'Texto',
						name: 'texto',
						type: 'string',
						default: '',
						description: 'Texto do menu (Selecione esta opção para ...)',
					},
					{
						displayName: 'Nome Saída',
						name: 'outputName',
						type: 'string',
						default: '',
						description: 'Nome da saída',
					},
				],
			},
		],
	},
]

export async function executeOperationMenu(self: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	self.logger.warn("CKitGeneric: execute MENU operation");
	const menuConfig = self.getNodeParameter('estados', 0, { estado: [] }) as { estado: Array<{ key: string; texto: string; outputName: string }> };

	self.logger.info("CKitMenu execute PATH enter")
	const useNativeMenu = self.getNodeParameter('useNativeMenu', 0, '')
	const onInputMessage = self.getNodeParameter('mensagemEntrada', 0, '') as string
	const promptMenu = self.getNodeParameter('promptMenu', 0, '') as string
	let textoStart = onInputMessage != "" && onInputMessage != null ? onInputMessage + "\n\n" : ""

	const onOptions: INodeExecutionData[][] = []
	const onNone: INodeExecutionData[] = []
	menuConfig.estado.forEach((estadoEntry: { key: string; texto: string; outputName: string }) => {
		onOptions.push([])
		textoStart = textoStart + "\n" + estadoEntry.key + " - " + estadoEntry.texto
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
			nativeMenuMessage.mensagemEntrada = onInputMessage
		}
		menuConfig.estado.forEach((estadoEntry: { key: string; texto: string; outputName: string }) => {
			onOptions.push([]);
			(nativeMenuMessage['menu'] as IDataObject[]).push({ opcao: estadoEntry.key, texto: estadoEntry.texto })
		})
		conversation?.addMenuMessage(nativeMenuMessage)
		self.logger.info("MENU_NATIVO: " + JSON.stringify(nativeMenuMessage))
	}

	const mr = await getMenuResponse(self, menuConfig)

	self.logger.info("FINALIZADA EXECUCAO AtendimentoEstadoMenuNode " + onOptions.length + " " + onNone.length)
	return [
		...mr.onOptions,
		self.helpers.returnJsonArray(mr.onNone),
	];
}

async function getMenuResponse(self: IExecuteFunctions, menuConfig: { estado: Array<{ key: string; texto: string; outputName: string }> }): Promise<{ onOptions: INodeExecutionData[][], onNone: INodeExecutionData[] }> {
	const userResponse = await readResponseMessage(self) as IDataObject
	self.logger.error("User menu answer: " + JSON.stringify(userResponse))
	const onOptions: INodeExecutionData[][] = []
	let onNone: INodeExecutionData[] = []
	if (userResponse['msgType'] != "textMessage") {
		const mensagemTipoMensagemIncorreta = self.getNodeParameter('mensagemTipoMensagemIncorreta', 0, 'Choose a menu option') as string
		const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
		conversation?.addTextMessage(mensagemTipoMensagemIncorreta)
		flushInput(self)
		return await getMenuResponse(self, menuConfig)
	}
	self.logger.error(JSON.stringify(userResponse))
	const resposta = userResponse['texto']
	self.logger.info("OPCAO :" + resposta)
	let p = 0
	let valida = false
	menuConfig.estado.forEach((estadoEntry: { key: string; texto: string; outputName: string }) => {
		onOptions.push([])
		self.logger.info("ESTADO :" + JSON.stringify(estadoEntry))
		if (estadoEntry.key == resposta) {
			onOptions[p] = buildNodeResponse(self, "optionSelected", {})
			valida = true
		}
		p++
	})
	if (valida == false) {
		const mensagemOpcaoInvalida = self.getNodeParameter('mensagemOpcaoInvalida', 0, '') as string
		if (mensagemOpcaoInvalida == null || mensagemOpcaoInvalida == "") {
			onNone = [{
				json: {
					"ok": false,
					"response": "Opção inválida"
				}
			}]
		} else {
			const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
			conversation?.addTextMessage(mensagemOpcaoInvalida)
			flushInput(self)
			return await getMenuResponse(self, menuConfig)
		}
	}
	return { onOptions: onOptions, onNone: onNone }
}

