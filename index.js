const core = require('@actions/core');
const exec = require('@actions/exec')


try {
  // get the variables we want
  const channel =- core.getInput('channel') || 'stable';
  const project =- core.getInput('project') || 'chef-workstation';
  const version =- core.getInput('version');
  const omnitruckUrl =- core.getInput('omnitruckUrl') || 'omnitruck.chef.io';
  console.log(`Installing ${project} on ${channel}`)

  exec.exec('sudo -v')

  var installCommand = `curl -v -L https://${omnitruckUrl}/install.sh`
  if (version) {
    console.log(`adding version pin to ${version}`)
    installCommand += ` -v ${version}`
  }

  exec.exec(installCommand).catch(function(e) {
    core.setFailed(e.message)
  })

} catch (error){
  core.setFailed(error.message)
}
