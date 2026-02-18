const core = require('@actions/core');
const exec = require('@actions/exec');
const os = require('os');

async function main() {
  try {
    const channel = core.getInput('channel') || 'stable';
    const project = core.getInput('project') || 'chef-workstation';
    const omnitruckUrl = core.getInput('omnitruckUrl') || 'omnitruck.chef.io';

    // Default chef-workstation to the last version with test-kitchen 2.x.
    // Later versions bundle test-kitchen 3.x which has breaking changes.
    // Pass version: latest to opt in to the newest release.
    let version = core.getInput('version');
    if (!version && project === 'chef-workstation') {
      version = '21.6.497';
    }

    if (os.platform() !== 'win32') {
      const channelParam = `-c ${channel}`;
      const projectParam = `-P ${project}`;
      const versionParam = version ? `-v ${version}` : '';
      await exec.exec('bash', ['-c', `set -o pipefail; curl -L "https://${omnitruckUrl}/install.sh" | sudo bash -s -- ${channelParam} ${projectParam} ${versionParam}`]);
    } else {
      const windowsPath = core.getInput('windowsPath');
      const channelParam = `-channel ${channel}`;
      const projectParam = `-project ${project}`;
      const versionParam = version ? `-version ${version}` : '';
      await exec.exec(`powershell.exe -command ". { iwr -useb https://${omnitruckUrl}/install.ps1 } | iex; install ${channelParam} ${projectParam} ${versionParam}"`);
      core.addPath(`${windowsPath}\\bin`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}
main();
