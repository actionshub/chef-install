import { getExecOutput } from '@actions/exec'

export interface ExecOutput {
  exitCode: number
  stdout: string
  stderr: string
}

export interface ExecService {
  execWithOutput(commandLine: string, args?: string[]): Promise<ExecOutput>
}

export class DefaultExecService implements ExecService {
  async execWithOutput(
    commandLine: string,
    args?: string[]
  ): Promise<ExecOutput> {
    return await getExecOutput(commandLine, args)
  }
}
