const core = require('@actions/core');
const github = require('@actions/github')

try {
  // get the variables we want
  const channel =- core.getInput('channel');
  const project =- core.getInput('project');
  const version =- core.getInput('version');
  const omnitruckUrl =- core.getInput('omnitruckUrl');
  console.log(`Hello ${omnitruckUrl}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);

  // get event payload, because it's interesting I guess
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error){
  core.setFailed(error.message)
}
