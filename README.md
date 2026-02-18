# chef-install

[![CI State](https://github.com/actionshub/chef-install/workflows/generic-linters/badge.svg)](https://github.com/actionshub/markdownlint)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](https://opensource.org/licenses/Apache-2.0)

A Github Action to install Chef on a build agent

Note you will need to accept the Chef license, you can find more information at <https://docs.chef.io/chef_license.html>

There is support for Macos, Linux and Windows with this action

## Usage

Use the default settings to install [chef-workstation](https://www.chef.sh/docs/chef-workstation/about/) from the stable channel

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
      uses: actionshub/chef-install@main
```

Install [inspec](https://www.inspec.io/) from the current channel

```yaml

jobs:
  delivery:
    runs-on: ubuntu-latest
    steps:
    - name: Check out code
      uses: actions/checkout@master
    - name: install chef
      uses: actionshub/chef-install@main
      with:
        channel: current
        project: inspec
```

### Version pinning

By default, `chef-workstation` installs version **21.6.497** — the last release that ships
test-kitchen 2.x. Versions 21.7.524 and later bundle test-kitchen 3.x which contains
breaking changes.

To opt in to the latest release:

```yaml
    - name: install chef
      uses: actionshub/chef-install@main
      with:
        version: latest
```

To pin to a specific version:

```yaml
    - name: install chef
      uses: actionshub/chef-install@main
      with:
        version: 21.6.497
```

## Parameters

We support the following parameters

| name         | default                            | description                                                                            |
| ------------ | ---------------------------------- | -------------------------------------------------------------------------------------- |
| channel      | stable                             | Chef Channel to install, stable or current                                             |
| project      | chef-workstation                   | Which product to install, see <https://docs.chef.io/install_omnibus.html> for the list |
| version      | 21.6.497 (for chef-workstation)    | Version to install. Set to `latest` for the newest release.                            |
| omnitruckUrl | omnitruck.chef.io                  | which Omnitruck to use, default is Chef Official                                       |

By Changing the omnitruck Url you can also install Cinc projects
