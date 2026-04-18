import type { IDataObject, INodeParameters } from 'n8n-workflow'

export const configureOutputs = (parameters: INodeParameters) => {
	const operation = parameters.operation as string

	if (operation === 'ai-agent') {
		return [
			{
				type: 'main',
			},
		]
	}

	// if (operation === 'ckit') {
	// 	return [
	// 		{
	// 			type: 'main',
	// 			displayName: 'onWebResponse',
	// 		},
	// 		{
	// 			type: 'main',
	// 			displayName: 'onChatbot',
	// 		},
	// 		{
	// 			type: 'main',
	// 			displayName: 'onError',
	// 		},
	// 		{
	// 			type: 'main',
	// 			displayName: 'onCallback',
	// 		},
	// 	];
	// }

	if (operation === 'chatbot') {
		return [
			{
				type: 'main',
				displayName: 'onWebResponse',
			},
			{
				type: 'main',
				displayName: 'onMessage',
			},
			// {
			// 	type: 'main',
			// 	displayName: 'onGetPages',
			// },
			{
				type: 'main',
				displayName: 'onGetAdvisor',
			},
		]
	}

	if (operation === 'menu') {
		const outputs: Array<{ type: 'main'; displayName: string }> = []

		if (parameters.estados) {
			;((parameters.estados as IDataObject).estado as IDataObject[]).forEach(
				(estado: IDataObject) => {
					outputs.push({
						type: 'main',
						displayName:
							estado.outputName == null || estado.outputName === ''
								? `onOption${estado.key}`
								: String(estado.outputName),
					})
				},
			)
		}

		outputs.push({
			type: 'main',
			displayName: 'onNone',
		})

		return outputs
	}

	if (operation === 'action') {
		return [
			{
				type: 'main',
				displayName: 'build',
			},
			{
				type: 'main',
				displayName: 'execute',
			},
		]
	}

	if (operation === 'actionBuild') {
		return []
	}

	return [
		{
			type: 'main',
		},
	]
}
