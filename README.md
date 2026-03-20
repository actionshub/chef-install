# chef-install

[![CI State](https://github.com/actionshub/chef-install/workflows/generic-linters/badge.svg)](https://github.com/actionshub/markdownlint)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](https://opensource.org/licenses/Apache-2.0)

A Github Action to install Chef on a build agent

Chef installs now use the [Chef Community download API](https://docs.chef.io/download/community/),
which requires a free `license_id`. Cinc installs do not require a license and continue to work
through the Cinc omnibus endpoint.

There is support for Macos, Linux and Windows with this action

## Usage

Use the default settings to install [chef-workstation](https://docs.chef.io/workstation/) from the stable channel

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
      with:
        license: ${{ secrets.CHEF_LICENSE_ID }}
```

Install [inspec](https://www.inspec.io/) from the commercial API on the current channel

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
        license: ${{ secrets.CHEF_LICENSE_ID }}
        chefDownloadUrl: chefdownload-commercial.chef.io
        channel: current
        project: inspec
```

Install Cinc Workstation from the Cinc omnibus endpoint without a license:

```yaml

jobs:
  delivery:
    runs-on: ubuntu-latest
    steps:
    - name: Check out code
      uses: actions/checkout@master
    - name: install cinc
      uses: actionshub/chef-install@main
      with:
        project: cinc-workstation
        omnitruckUrl: omnitruck.cinc.sh
```

The installed Cinc packages are Chef-compatible. If you need direct package downloads instead of
the install script, Cinc also publishes plain packages at <https://cinc.sh/download/>.

### Version selection

By default, `chef-workstation` installs the latest available version.

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

| name            | default                      | description                                                                                         |
| --------------- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| channel         | stable                       | Chef channel to install, stable or current                                                          |
| project         | chef-workstation             | Which product to install, see <https://docs.chef.io/chef_install_script/> for Chef project names   |
| version         | latest (for chef-workstation) | Version to install. Set to `latest` for the newest release.                                        |
| chefDownloadUrl | chefdownload-community.chef.io | Chef download API host. Defaults to the Chef Community API.                                        |
| license         |                              | Chef Downloads license ID. Required for Chef Community/Commercial downloads. Not used for Cinc.    |
| omnitruckUrl    |                              | Deprecated compatibility input for omnitruck hosts. Set this for Cinc, for example `omnitruck.cinc.sh`. |
| windowsPath     | `C:\opscode\chef-workstation\` | Root install path used for the Windows PATH update step. Override this for products installed elsewhere. |

`omnitruckUrl` takes precedence over `chefDownloadUrl`, which preserves compatibility for existing
omnitruck-based installs while allowing Chef downloads to use the community API by default.

When using the default Chef Community API, `channel` must remain `stable`. Use
`chefdownload-commercial.chef.io` if you need the `current` channel for Chef packages.
