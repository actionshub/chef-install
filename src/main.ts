import { installCmd } from './install.ts'
import * as os from 'os'
import * as core from '@actions/core'
import { DefaultExecService } from './exec.ts'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  // build the installation string based on inputs
  const cmds = installCmd(os.platform())
  if (cmds.isErr()) {
    core.setFailed(cmds.error.message)
    return
  }
  const execSvc = new DefaultExecService()
  cmds.value.forEach((cmd) => {
    core.debug(`Executing command: ${cmd}`)
    execSvc.execWithOutput(cmd).then((result) => {
      core.debug(`Command ${cmd} finished with exit code ${result.exitCode}`)
      if (result.exitCode !== 0) {
        core.setFailed(
          `Command ${cmd} failed with exit code ${result.exitCode}`
        )
        return
      }
      core.debug(`stdout: ${result.stdout}`)
      core.debug(`stderr: ${result.stderr}`)
    })
  })
}
