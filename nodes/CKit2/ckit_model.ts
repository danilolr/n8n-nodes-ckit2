import { GenericValue, IDataObject, IExecuteFunctions, INodeExecutionData } from "n8n-workflow"
import { CKitMemoryService } from "./ckit_db"

export class MessageData {
	constructor(
		public msgType: string,
		public text: string,
		public imageUrl?: string,
	) {}
}

export class StdMessage {

    constructor(
        public type: string,
        public executionId: string,
        public payload: unknown
    ) { }

    toJson(): IDataObject {
        return {
            type: this.type,
            executionId: this.executionId,
            payload: this.payload as GenericValue
        }
    }
}

export interface CallerContextInfo {
    uuid: string
    env: string
    clientRef: string
    urlCallback: string
}

export function getCallerContextFromMemory(self: IExecuteFunctions): CallerContextInfo | undefined {
    const executionMemory = CKitMemoryService.getExecutionMemory(self)
    return executionMemory.read("callerContext") as CallerContextInfo | undefined
}

export function getInfoFromMemory(self: IExecuteFunctions, key: string): GenericValue | undefined {
    const executionMemory = CKitMemoryService.getExecutionMemory(self)
    return executionMemory.read(key) as GenericValue | undefined
}

// export function buildStdMessageFromInput(input: IDataObject): StdMessage {
//     return new StdMessage(
//         input['type'] as string,
//         input['executionId'] as string,
//         input['payload'] as unknown
//     )
// }

export function buildNodeResponse(self: IExecuteFunctions, type: string, payload: unknown): INodeExecutionData[] {
    const msg = buildStdMessageFromData(self, type, payload)
    return [{
        json: msg.toJson()
    }]
}

export function buildStdMessage(self: IExecuteFunctions, type: string): StdMessage {
    return new StdMessage(
        type,
        self.getExecutionId(),
        {
            callerContext: getInfoFromMemory(self, "callerContext"),
            contact: getInfoFromMemory(self, "contact"),
            channel: getInfoFromMemory(self, "channel"),
            context: getInfoFromMemory(self, "context"),
            lastUserMessage: getInfoFromMemory(self, "lastUserMessage"),
        }
    )
}

export function buildStdMessageFromData(self: IExecuteFunctions, type: string, payload: unknown): StdMessage {
    return new StdMessage(
        type,
        self.getExecutionId(),
        payload
    )
}

export interface ApiInfo {
    env: string
    apiUrl: string // url to call the API (API node type)
    apiKey: string
}

export function setApiInfoInMemory(self: IExecuteFunctions, apiInfo: ApiInfo) {
    const executionMemory = CKitMemoryService.getExecutionMemory(self)
    // self.logger.error("Setting apiInfo in memory on executionId " + self.getExecutionId() + ": " + JSON.stringify(apiInfo))
    executionMemory.write("apiInfo", apiInfo)
}

export function putApiInfoInMemory(self: IExecuteFunctions, env: string) {
    const apiConfigUi = (self.getNodeParameter('apiConfigUi', 0, {}) as { apiConfigUiValues: { envApiKey: string, envApiUrl: string, urlApiUrl: string }[] })
    // self.logger.info(`PUT API INFO IN MEMORY: ${env}`)
    // self.logger.info(JSON.stringify(apiConfigUi))
    let apiUrl = ""
    let apiKey = ""
    if (apiConfigUi && apiConfigUi.apiConfigUiValues) {
        for (const configApiUrl of apiConfigUi.apiConfigUiValues) {
            if (configApiUrl.envApiUrl == env) {
                self.logger.info(`CKitChatbot apiUrl: ${configApiUrl.urlApiUrl}`)
                apiUrl = configApiUrl.urlApiUrl
                apiKey = configApiUrl.envApiKey
                break
            }
        }
        // self.logger.info(`CKitChatbot apiUrl: [${apiUrl}]`)
    }

    setApiInfoInMemory(self, {
        apiUrl: apiUrl,
        apiKey: apiKey,
        env: env
    })

}
