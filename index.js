const core = require('@actions/core');
const spawn = require('child-process').spawn


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
  var prc = spawn(installCommand);

  //noinspection JSUnresolvedFunction
  prc.stdout.setEncoding('utf8');
  prc.stdout.on('data', function (data) {
      var str = data.toString()
      var lines = str.split(/(\r?\n)/g);
      console.log(lines.join(""));
  });

  prc.on('close', function (code) {
      console.log('process exit code ' + code);
      if (code != 0){
        core.setFailed('Install exited with error, see logs')
      }
  });

} catch (error){
  core.setFailed(error.message)
}
