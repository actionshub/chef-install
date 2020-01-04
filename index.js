const core = require('@actions/core');
const exec = require('@actions/exec')


try {
  // get the variables we want
  const channel =- core.getInput('channel');
  const project =- core.getInput('project');
  const version =- core.getInput('version');
  const omnitruckUrl =- core.getInput('omnitruckUrl');
  console.log(`Hello ${omnitruckUrl}!`);
  console.log(`Installing ${project} on ${channel}`)

  var installCommand = `curl -L ${omnitruckUrl}/install.sh | sudo bash -s -- -c ${channel} -P ${project}`
  if (version) {
    installCommand += ` -v ${version}`
  }
  console.log(installCommand)
  
  await exec.exec(installCommand)

} catch (error){
  core.setFailed(error.message)
}
