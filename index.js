const core = require('@actions/core');
const exec = require('@actions/exec')


try {
  // get the variables we want
  const channel =- core.getInput('channel') || 'stable';
  const project =- core.getInput('project') || 'chef-workstation';
  const version =- core.getInput('version');
  const omnitruckUrl =- core.getInput('omnitruckUrl') || 'omnitruck.chef.io';
  console.log(`Installing ${project} on ${channel}`)



  var downloadCommand = `curl -L https://${omnitruckUrl}/install.sh -o /tmp/install.sh`

  var installCommand = `sudo /bin/sh -s /tmp/install.sh -c ${channel} -P ${project}`
  if (version) {
    console.log(`adding version pin to ${version}`)
    installCommand += ` -v ${version}`
  }
  exec.exec(downloadCommand).catch(function(e) {
    core.setFailed(e.message)
  }).then(
    exec.exec('sudo chmod +x /tmp/install.sh').catch(function(e) {
      core.setFailed(e.message)
    }).then(
    exec.exec(installCommand).catch(function(e) {
      core.setFailed(e.message)
    })
  )



} catch (error){
  core.setFailed(error.message)
}
