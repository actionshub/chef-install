# chef-install

[![CI State](https://github.com/actionshub/chef-install/workflows/generic-linters/badge.svg)](https://github.com/actionshub/markdownlint)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](https://opensource.org/licenses/Apache-2.0)

A Github Action to install Chef on a build agent

Note you will need to accept the Chef license, you can find more information at <https://docs.chef.io/chef_license.html>

There is support for Macos, Linux and Windows with this action

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
    - name: install chef
      uses: actionshub/chef-install@master
 ```

## Envrionment Variables

We support the following Environment Variables

|name| default| description|
|--- |------- |----------- |
|channel| stable | Chef Channel to install, stable or current |
|project | chef-workstation | Which product to install,
see <https://docs.chef.io/install_omnibus.html> for the list |
|version | latest | version to install |
|omnitruckUrl| omnitruck.chef.io | which Omnitruck to use, default is Chef Official|

By Changing the omnitruck Url you can also install Cinc projects
