const core = require('@actions/core');
const exec = require('@actions/exec')


try {
  // get the variables we want
  const channel =- core.getInput('channel');
  const project =- core.getInput('project');
  const version =- core.getInput('version');
  const omnitruckUrl =- core.getInput('omnitruckUrl');
  console.log(`Installing ${project} on ${channel}`)

  var installCommand = `curl -L ${omnitruckUrl}/install.sh | sudo bash -s -- -c ${channel} -P ${project}`
  if (version) {
    console.log(`adding version pin to ${version}`)
    installCommand += ` -v ${version}`
  }
  console.log(installCommand)
  
  exec.exec(installCommand).catch(function(e) {
    core.setFailed(e.message)
  })

} catch (error){
  core.setFailed(error.message)
}
