# chef-install

[![CI State](https://github.com/actionshub/chef-install/workflows/generic-linters/badge.svg)](https://github.com/actionshub/markdownlint)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](https://opensource.org/licenses/Apache-2.0)

A Github Action to install Chef on a build agent

Note you will need to accept the Chef license, you can find more information at <https://docs.chef.io/chef_license.html>

There is support for Macos, Linux and Windows with this action

## Usage

Use the default settings to install [chef-workstation](https://docs.chef.io/workstation/) from the stable channel via Omnitruck

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

Install [chef-workstation](https://docs.chef.io/workstation/) from the Chef Community download API

```yaml

jobs:
  delivery:
    runs-on: ubuntu-latest
    steps:
    - name: Check out code
      uses: actions/checkout@main
    - name: install chef
      uses: actionshub/chef-install@main
      with:
        license: ${{ secrets.CHEF_LICENSE_ID }}
        project: chef-workstation
```

Install [inspec](https://www.inspec.io/) from the Chef Commercial API on the current channel

```yaml

jobs:
  delivery:
    runs-on: ubuntu-latest
    steps:
    - name: Check out code
      uses: actions/checkout@main
    - name: install chef
      uses: actionshub/chef-install@main
      with:
        license: ${{ secrets.CHEF_LICENSE_ID }}
        chefDownloadUrl: chefdownload-commercial.chef.io
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

| name            | default                          | description                                                                            |
| --------------- | -------------------------------- | -------------------------------------------------------------------------------------- |
| channel         | stable                           | Chef channel to install, stable or current                                             |
| project         | chef-workstation                 | Which product to install, see <https://docs.chef.io/chef_install_script/> for the list |
| version         | 21.6.497 (for chef-workstation)  | Version to install. Set to `latest` for the newest release.                            |
| chefDownloadUrl | chefdownload-community.chef.io   | Chef download API host. Used when `license` is provided.                               |
| license         |                                  | Chef license ID. Required for Chef Community/Commercial downloads.                     |
| omnitruckUrl    | omnitruck.chef.io                | Omnitruck base url. Used when no `license` is provided.                                |

When `license` is set, the action downloads the installer from `chefDownloadUrl`. Without a
`license`, the action falls back to `omnitruckUrl` for backwards compatibility.

By changing the `omnitruckUrl` you can also install Cinc projects (e.g. `omnitruck.cinc.sh`).
