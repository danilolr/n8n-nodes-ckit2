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

	if (operation === 'chatbot') {
		return [
			{
				type: 'main',
				displayName: 'onMessage',
			},
			{
				type: 'main',
				displayName: 'onGetAdvisor',
			},
		]
	}

	if (operation === 'menu') {
		const outputs: Array<{ type: 'main'; displayName: string }> = []
		const menuOptions = (parameters.menuOptions as IDataObject | undefined)?.option as
			| IDataObject[]
			| undefined
		const legacyOptions = (parameters.estados as IDataObject | undefined)?.estado as
			| IDataObject[]
			| undefined

		;(menuOptions ?? legacyOptions ?? []).forEach((option: IDataObject) => {
			outputs.push({
				type: 'main',
				displayName:
					option.outputName == null || option.outputName === ''
						? `onOption${option.key}`
						: String(option.outputName),
			})
		})

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
