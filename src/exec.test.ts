import { DefaultExecService } from './exec.ts'

describe('DefaultExecService', () => {
  it('should return successfully on execution', async () => {
    const execService = new DefaultExecService()
    const result = await execService.execWithOutput('node', ['--version'])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('v')
    expect(result.stderr).toBe('')
  })
})
