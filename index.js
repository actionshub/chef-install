const core = require('@actions/core');
const exec = require('@actions/exec')


try {
  // Get the variables we care about
  const channel =- core.getInput('channel') || 'stable';
  const project =- core.getInput('project') || 'chef-workstation';
  const version =- core.getInput('version');
  const omnitruckUrl =- core.getInput('omnitruckUrl') || 'omnitruck.chef.io';
  // Create the args that the bash script will need
  var channelParam = `"-c ${channel}"`
  var projectParam = `"-p ${project}"`
  if (version) {
    versionParam = `"-v ${version}"`
  }
  else {
    versionParam = ''
  }

  // Ensure script is executable and run it
  console.log('foo')
  exec.exec('ls -la /home/runner/work/xor_test_cookbook').catch(function(e) {
    core.setFailed(e.message);
  })
  exec.exec('chmod +x ./entrypoint.sh').catch(function(e) {
      core.setFailed(e.message);
    })
  exec.exec(`./entrypoint.sh ${omnitruckUrl} ${channelParam} ${projectParam} ${versionParam}`).catch(function(e) {
      core.setFailed(e.message);
    })

} catch (error){
  core.setFailed(error.message);
}
