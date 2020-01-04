const core = require('@actions/core');
const exec = require('@actions/exec')


const runCommand = async function (command){
  exec.exec(command).catch(function(e) {
    core.setFailed(e.message);
  })
}

try {
  // Get the variables we care about
  const channel =- core.getInput('channel') || 'stable';
  const project =- core.getInput('project') || 'chef-workstation';
  const version =- core.getInput('version');
  const omnitruckUrl =- core.getInput('omnitruckUrl') || 'omnitruck.chef.io';
  // Create the args that the bash script will need
  var channelParam = `-c ${channel}`
  var projectParam = `-p ${project}`
  if (version) {
    versionParam = `-v ${version}`
  }
  else {
    versionParam = ''
  }
  runCommand(`script=$(curl -L https://${omnitruckUrl}/install.sh) && echo $script > chefDownload.sh && chmod +x ./chefDownload.sh && bash -s -- ${channelParam} ${projectParam} ${versionParam}`)

} catch (error){
  core.setFailed(error.message);
}
