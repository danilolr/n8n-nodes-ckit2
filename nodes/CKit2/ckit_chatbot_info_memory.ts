import { IExecuteFunctions, IDataObject, GenericValue } from 'n8n-workflow'
import { MessageData } from './ckit_model'

export class PageInfo {
	constructor(
		public path: string,
		public label: string,
	) {}
}

export class IntentInfo {
	public examples: string[] = []
	constructor(
		public code: string,
		public explanation: string,
	) {}
}

export class AdvisorInfo {
	public intents: IntentInfo[] = []

	constructor(
		public reference: string,
		public advisorPrompt: string,
	) {}
}

export class ChatbotInfo {
	private advisors: AdvisorInfo[] = []
	private pages: PageInfo[] = []

	constructor(
		public name: string,
		public version: string,
	) {}

	addAdvisor(advisorName: string, advisorPrompt: string) {
		this.advisors.push(new AdvisorInfo(advisorName, advisorPrompt))
	}

	addPage(page: PageInfo) {
		this.pages.push(page)
	}

	getAdvisors(): AdvisorInfo[] {
		return this.advisors
	}

	getPages(): PageInfo[] {
		return this.pages
	}

	getAdvisor(reference: string): AdvisorInfo | undefined {
		const advisor = this.advisors.find((a) => a.reference === reference)
		if (!advisor) {
			return
		}
		return advisor
	}
}

export class ChatbotInfoMemory {
	private chatbots: ChatbotInfo[] = []

	addChatbot(name: string, version: string) {
		const chatbotInfo = new ChatbotInfo(name, version)
		this.chatbots.push(chatbotInfo)
	}

	getChatbots(): ChatbotInfo[] {
		return this.chatbots
	}

	clearChatbots() {
		this.chatbots = []
	}

	addPage(chatbotName: string, page: PageInfo) {
		const chatbot = this.chatbots.find((c) => c.name === chatbotName)
		if (!chatbot) {
			return
		}
		chatbot.addPage(page)
	}

	addAdvisor(chatbotName: string, advisorName: string, advisorPrompt: string) {
		const chatbot = this.chatbots.find((c) => c.name === chatbotName)
		if (!chatbot) {
			return
		}
		chatbot.addAdvisor(advisorName, advisorPrompt)
	}

	getAdvisor(chatbotName: string, reference: string): AdvisorInfo | undefined {
		const chatbot = this.chatbots.find((c) => c.name === chatbotName)
		if (!chatbot) {
			return
		}
		const advisor = chatbot.getAdvisors().find((a) => a.reference === reference)
		if (!advisor) {
			return
		}
		return advisor
	}
}

export class ConversationInfo {
    
	pendingMessages: MessageData[] = []
	context: IDataObject = {}
	pendingContact?: { name: string; email: string; phone: string; docId: string; docType: string }
	private actions: IDataObject[] = []
	ended: boolean = false

	constructor(
		public workflowId: string,
		public uuid: string,
	) {}

    setEnded() {
        this.ended = true
    }

	addTextMessage(text: string) {
		const message = new MessageData('TEXT', text, undefined)
		this.pendingMessages.push(message)
	}

	addMenuMessage(menu: IDataObject) {
		const message = new MessageData('MENU', JSON.stringify(menu), undefined)
		this.pendingMessages.push(message)
	}

	addDocMessage(text: string, imageUrl: string) {
		const message = new MessageData('DOCUMENTO', text, imageUrl)
		this.pendingMessages.push(message)
	}

	getPendingMessages(): MessageData[] {
		return this.pendingMessages
	}

	clearPendingMessages() {
		this.pendingMessages = []
	}

	setContextVar(
		self: IExecuteFunctions,
		key: string,
		value: GenericValue | IDataObject | GenericValue[] | IDataObject[],
	) {
		self.logger.info('Setting context variable: ' + key + ' = ' + value)
		this.context[key] = value
		self.logger.info('Current context: ' + JSON.stringify(this.context, null, 2))
	}

	getContextVar(key: string): string | undefined {
		return this.context[key] as string | undefined
	}

	getContext(): IDataObject {
		return this.context
	}

	getContextClone(): IDataObject {
		return { ...this.context }
	}

	setContact(name: string, email: string, phone: string, docId: string, docType: string) {
		this.pendingContact = {
			name: name,
			email: email,
			phone: phone,
			docId: docId,
			docType: docType,
		}
	}

	clearContact() {
		this.pendingContact = undefined
	}

	addAction(self: IExecuteFunctions, action: IDataObject): void {
		self.logger.info('Adding action XXX: ' + JSON.stringify(action, null, 2))
		this.actions.push(action)
	}

	clearActions(): void {
		this.actions = []
	}

	getActions(): IDataObject[] {
		return this.actions
	}
}
