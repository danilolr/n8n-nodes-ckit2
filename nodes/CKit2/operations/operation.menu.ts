import type { INodeProperties } from 'n8n-workflow';

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
];
