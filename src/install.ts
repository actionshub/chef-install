import * as core from '@actions/core'
import { err, ok, Result } from 'neverthrow'

type installError = {
  message: string
}

export function installCmd(platform: string): Result<string[], installError> {
  console.log(`Platform: ${platform}`)
  switch (platform) {
    case 'linux':
      core.debug('Linux detected')
      return ok(linuxInstallCmd())
    // break;
    // case 'darwin':
    //     core.debug('MacOS detected');
    //     break;
    // case 'win32':
    //     core.debug('Windows detected');
    //     break;
    default:
      core.debug(`Unsupported OS: ${platform}`)
      return err({ message: `Unsupported OS: ${platform}` })
  }
}

function linuxInstallCmd(): string[] {
  const habInstall =
    'curl https://raw.githubusercontent.com/habitat-sh/habitat/main/components/hab/install.sh | sudo bash -s -- -c stable'
  const chefInstall =
    'sudo hab pkg install --binlink --force chef/chef-workstation --channel unstable'
  return [habInstall, chefInstall]
}
