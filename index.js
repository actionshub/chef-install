const core = require('@actions/core');
const exec = require('@actions/exec')
const os = require('os')

async function main() {
  try {
    // Get the variables we care about
    const channel = core.getInput('channel') || 'stable';
    const project = core.getInput('project') || 'chef-workstation';
    const version = core.getInput('version');
    const omnitruckUrl = core.getInput('omnitruckUrl') || 'omnitruck.chef.io';
    // This tool has intimate knowledge of the os
    // as Windows and Linux/MacOs run different installers
    // so we will check what OS and run appropriately
    // Create the args that the bash script will need
    if (os.platform() != 'win32')
    {
      var channelParam = `-c ${channel}`
      var projectParam = `-P ${project}`
      if (version) {
        versionParam = `-v ${version}`
      }
      else {
        versionParam = ''
      }
      await exec.exec(`curl -L https://${omnitruckUrl}/install.sh -o chefDownload.sh`)
      await exec.exec(`sudo chmod +x chefDownload.sh`)
      await exec.exec(`sudo ./chefDownload.sh ${channelParam} ${projectParam} ${versionParam}`)
      await exec.exec(`rm -f chefDownload.sh`)
    }
    // We are on windows so assume powershell
    else
    {
      const windowsPath = core.getInput('windowsPath');
      var channelParam = `-channel ${channel}`
      var projectParam = `-project ${project}`
      if (version) {
        versionParam = `-version ${version}`
      }
      else {
        versionParam = ''
      }
      await exec.exec(`powershell.exe -command ". { iwr -useb https://${omnitruckUrl}/install.ps1 } | iex; install ${channelParam} ${projectParam} ${versionParam}"`)
      core.addPath(`${windowsPath}\\bin`)
    }

  } catch (error){
    core.setFailed(error.message);
  }
}
main()
