const core = require('@actions/core');
const exec = require('@actions/exec')


try {
  // get the variables we want
  const channel =- core.getInput('channel') || 'stable';
  const project =- core.getInput('project') || 'chef-workstation';
  const version =- core.getInput('version');
  const omnitruckUrl =- core.getInput('omnitruckUrl') || 'omnitruck.chef.io';
  console.log(`Installing ${project} on ${channel}`)

  var downloadCommand = `curl -v -L https://${omnitruckUrl}/install.sh -o install.sh`;

  var installCommand = `sudo /install.sh -c ${channel} -P ${project}`;

  console.log(downloadCommand);
  console.log(installCommand);

  if (version) {
    console.log(`adding version pin to ${version}`);
    installCommand += ` -v ${version}`;
  }

  exec.exec(downloadCommand).catch(function(e) {
    core.setFailed(e.message);
  });
  exec.exec('chmod +x ./install.sh').catch(function(e) {
    core.setFailed(e.message);
  });
  exec.exec(installCommand).catch(function(e) {
    core.setFailed(e.message);
  });

} catch (error){
  core.setFailed(error.message);
}
