# chef-install

[![CI State](https://github.com/actionshub/chef-install/workflows/release/badge.svg)](https://github.com/actionshub/chef-delivery)

A Github Action to install Chef on a build agent

Note you will need to accept the Chef license, you can find more information at <https://docs.chef.io/chef_license.html>

## Usage

```yaml
name: delivery

on: [push, pull_request]

jobs:
  delivery:

    runs-on: ubuntu-latest

    steps:
    - name: Check out code
      uses: actions/checkout@master
    - name: Run Chef Delivery
      uses: actionshub/chef-delivery@master
      env:
        CHEF_LICENSE: accept-no-persist
```
