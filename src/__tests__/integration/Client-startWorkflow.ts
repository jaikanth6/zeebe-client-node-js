import { ZBClient } from '../..'
import { createUniqueTaskType } from '../../lib/createUniqueTaskType'

process.env.ZEEBE_NODE_LOG_LEVEL = process.env.ZEEBE_NODE_LOG_LEVEL || 'NONE'
jest.setTimeout(30000)

describe('ZBClient', () => {
	let zbc: ZBClient
	let wf

	beforeEach(async () => {
		zbc = new ZBClient()
	})

	afterEach(async done => {
		await zbc.close() // Makes sure we don't forget to close connection
		done()
	})

	it('Can start a workflow', async () => {
		const { bpmn } = createUniqueTaskType({
			bpmnFilePath: './src/__tests__/testdata/hello-world.bpmn',
			processIdPrefix: 'start-wf-',
			taskTypes: ['console-log'],
		})
		const res = await zbc.deployWorkflow({
			definition: bpmn,
			name: 'start-hello-world.bpmn',
		})
		expect(res?.workflows?.length).toBe(1)

		wf = await zbc.createWorkflowInstance('start-wf-hello-world', {})
		await zbc.cancelWorkflowInstance(wf?.workflowInstanceKey)
		expect(wf?.bpmnProcessId).toBe('start-wf-hello-world')
		expect(wf?.workflowInstanceKey).toBeTruthy()
	})
})
