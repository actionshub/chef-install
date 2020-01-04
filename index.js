const core = require('@actions/core');
const exec = require('@actions/exec')


const runCommand = async function (command){
  exec.exec(command).catch(function(e) {
    core.setFailed(e.message);
  })
}

async function main() {
  try {
    // Get the variables we care about
    const channel =- core.getInput('channel') || 'stable';
    const project =- core.getInput('project') || 'chef-workstation';
    const version =- core.getInput('version');
    const omnitruckUrl =- core.getInput('omnitruckUrl') || 'omnitruck.chef.io';
    // Create the args that the bash script will need
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
  } catch (error){
    core.setFailed(error.message);
  }
}
main()