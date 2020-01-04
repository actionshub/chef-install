const core = require('@actions/core');
const exec = require('@actions/exec')


try {
  console.log(`hello || world`)

} catch (error){
  core.setFailed(error.message)
}
