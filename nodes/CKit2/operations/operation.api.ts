import type { GenericValue, IDataObject, IExecuteFunctions, IHttpRequestOptions, INodeExecutionData, INodeProperties } from 'n8n-workflow'
import { ApiInfo, buildStdMessage } from '../ckit_model'
import { CKitMemoryService } from '../ckit_db'
import { saveLastApiCallResponse } from '../callback_utils'

export const propertiesApi: INodeProperties[] = [
	{
		displayName: 'Method',
		name: 'apiMethod',
		type: 'string',
		default: '',
		placeholder: 'Method',
		description: 'Method to call the API',
		displayOptions: {
			show: {
				operation: ['api'],
			},
		},
	},
	{
		displayName: 'Parameters',
		name: 'parameters',
		placeholder: 'Add param',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		displayOptions: {
			show: {
				operation: ['api'],
			},
		},
		description: 'Add param',
		options: [
			{
				name: 'parametersValues',
				displayName: 'Param',
				values: [
					{
						displayName: 'Name',
						name: 'paramName',
						type: 'string',
						default: '',
						description: 'Param name',
					},
					{
						displayName: 'Value',
						name: 'paramValue',
						type: 'string',
						default: '',
						description: 'Param value',
					},
					{
						displayName: 'Data Type',
						name: 'dataType',
						type: 'options',
						options: [
							{
								name: 'String',
								value: 'string',
							},
							{
								name: 'Integer',
								value: 'int',
							},
							{
								name: 'Float',
								value: 'float',
							},
						],
						default: 'string',
						noDataExpression: true,
					},
				],
			},
		],
	},
]

export function getApiInfoFromMemory(self: IExecuteFunctions): ApiInfo | undefined {
    const executionMemory = CKitMemoryService.getExecutionMemory(self)
    const apiInfo = executionMemory.read("apiInfo") as ApiInfo
    self.logger.error("Getting apiInfo from memory on executionId " + self.getExecutionId() + ": " + JSON.stringify(apiInfo))
    return apiInfo
}

export async function callApi(self: IExecuteFunctions, apiMethod: string, params: GenericValue): Promise<unknown> {
    const apiInfo = getApiInfoFromMemory(self)
    const url = `${apiInfo?.apiUrl}/execute` 
    const p: IDataObject = {
        methodName: apiMethod,
        env: apiInfo?.env,
        params: params
    }

    const options: IHttpRequestOptions = {
        method: 'POST',
        url: url,
        body: p,
        json: true,
        headers: {
            'Content-Type': 'application/json'
        },
    }
    self.logger.info("URL: " + url)
    self.logger.error("API CALL options: " + JSON.stringify(options))
    const resp = await self.helpers.httpRequest(options)
    return resp
}

export async function executeOperationApi(self: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	self.logger.info("CKit: execute API operation")
	self.logger.error("STD INFO ON OPERATION API")
	const apiMethod = self.getNodeParameter('apiMethod', 0, '') as string
	const parameters = self.getNodeParameter('parameters', 0, {}) as { parametersValues: { paramName: string, paramValue: string, dataType: string }[] }
	const params: IDataObject = {}
	if (parameters.parametersValues) {
		for (const param of parameters.parametersValues) {
			if (param.paramName && param.paramValue) {
				if (param.dataType === 'int') {
					params[param.paramName] = parseInt(param.paramValue, 10)
				} else if (param.dataType === 'float') {
					params[param.paramName] = parseFloat(param.paramValue)
				} else {
					params[param.paramName] = param.paramValue
				}
			} else {
				self.logger.error("API parameters missing name or value" + JSON.stringify(parameters))
			}
		}
	} else {
		self.logger.warn("API parameters not provided: " + JSON.stringify(parameters))
	}

	const resp = await callApi(self, apiMethod, params)
	self.logger.info("API response: " + JSON.stringify(resp))
	saveLastApiCallResponse(self, resp)

	const stdMsg = buildStdMessage(self, "executeChatbot")
	const onOut = [{
		json: stdMsg.toJson()
	}]

	return [
		self.helpers.returnJsonArray(onOut)
	]
}
