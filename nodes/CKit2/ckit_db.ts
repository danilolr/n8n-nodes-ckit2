import { IExecuteFunctions } from 'n8n-workflow'

export class CKitMemoryService {
	private static globalMemory: CKitMemory
	private static executionMemory: Map<string, CKitMemory> = new Map()

	public static getGlobalMemory(): CKitMemory {
		if (!this.globalMemory) {
			this.globalMemory = new CKitMemory()
		}
		return this.globalMemory
	}

	public static getExecutionMemory(self: IExecuteFunctions): CKitMemory {
		const executionId = self.getExecutionId()
		let memory = this.executionMemory.get(executionId)
		if (!memory) {
			memory = new CKitMemory()
			this.executionMemory.set(executionId, memory)
		}
		return memory
	}
}

export class CKitMemory {
	private data: Map<string, unknown> = new Map()

	write(key: string, value: unknown): void {
		this.data.set(key, value)
	}

	read(key: string): unknown {
		return this.data.get(key)
	}
}
