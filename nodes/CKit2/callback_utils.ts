import { IDataObject, IExecuteFunctions, IHttpRequestOptions, sleep } from "n8n-workflow"
import { getCallerContextFromMemory } from "./ckit_model"
import { CKitMemoryService } from "./ckit_db"
import { ConversationInfo } from "./ckit_chatbot_info_memory"

export async function callBackend(self: IExecuteFunctions, callbackType: string, params: IDataObject) {
    if (callbackType !== "isMessageAvaliable") {
    self.logger.warn("***** CALLBACKEND START *****")
    }
    const callerContext = getCallerContextFromMemory(self)
    if (!callerContext) {
        self.logger.error("No callerContext found in memory")
        return
    }
    const urlCallback = `${callerContext.urlCallback}/${callbackType}/${callerContext.uuid}`
    if (callbackType !== "isMessageAvaliable") {
        self.logger.info("callBackend type: " + callbackType)
        self.logger.info("callBackend params: " + JSON.stringify(params) + " callbackType: " + callbackType)
        self.logger.info("callBackend callerContext: " + JSON.stringify(callerContext))
        self.logger.error("callBackend urlCallback: " + JSON.stringify(urlCallback))
    }
    if (!urlCallback) {
        self.logger.error("No urlCallback found")
        return
    }
    const options: IHttpRequestOptions = {
        method: 'POST',
        url: urlCallback,
        body: params,
        json: true,
        headers: {
            'Content-Type': 'application/json'
        },
    }
    const resp = await self.helpers.httpRequest(options)
    if (callbackType !== "isMessageAvaliable") {
        self.logger.warn("callBackend response :" + JSON.stringify(resp))
        self.logger.warn("***** CALLBACKEND END *****")
    }    
    return resp
}

export async function endConversation(self: IExecuteFunctions) {
    const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
    if (!conversation) {
        self.logger.error("No current conversation found for workflowId: " + self.getExecutionId())
        return
    }
    conversation.setEnded()
}

export async function flushInput(self: IExecuteFunctions) {
    const conversation = CKitMemoryService.getExecutionMemory(self).read("conversation") as ConversationInfo
    if (!conversation) {
        self.logger.error("No current conversation found for workflowId: " + self.getExecutionId())
        return
    }

    const params: IDataObject = {
    }

    const pendingMessages = conversation.getPendingMessages().map((msg) => {
        return { msgType: msg.msgType, text: msg.text, imageUrl: msg.imageUrl }
    })

    if (pendingMessages.length > 0) {
        params.messages = pendingMessages
    }

    const pendingContact = conversation.pendingContact
    if (pendingContact) {
        params.contact = {
            name: pendingContact.name,
            email: pendingContact.email,
            phone: pendingContact.phone,
            docId: pendingContact.docId,
            docType: pendingContact.docType
        }
    }
    try {
        self.logger.info("Getting actions from conversation context")
        self.logger.info("Context: " + (conversation.getContext() != null))
        if (conversation.getActions().length > 0) {
            params.advisor = {
                actions: conversation.getActions()
            }
        }
        conversation.clearActions()
    } catch (error) {
        self.logger.error("Error getting actions: " + error)
    }

    if (conversation.ended) {
        params.end = true
    }

    await callBackend(self, "generic", params)
    conversation.clearPendingMessages()
}

export async function readResponseMessage(self: IExecuteFunctions): Promise<UserMessage> {
    let msg = await callBackend(self, "isMessageAvaliable", {})
    while (msg.ok === false) {
        await sleep(1000)
        msg = await callBackend(self, "isMessageAvaliable", {})
    }
    self.logger.info("readResponseMessage: " + JSON.stringify(msg))
    return { msgType: MessageTypeEnum.TEXT, text: msg.message.text, caminhoHttpArquivo: undefined }
}

export async function saveLastUserMessage(self: IExecuteFunctions, param: UserMessage) {
    const executionMemory = CKitMemoryService.getExecutionMemory(self)
    executionMemory.write("lastUserMessage", param)
}

export enum MessageTypeEnum {
    TEXT = "TEXT"
}

export interface UserMessage {
    msgType: MessageTypeEnum
    text?: string
    caminhoHttpArquivo?: string
}