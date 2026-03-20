# chef-install

[![CI State](https://github.com/actionshub/chef-install/workflows/generic-linters/badge.svg)](https://github.com/actionshub/markdownlint)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](https://opensource.org/licenses/Apache-2.0)

A Github Action to install Chef on a build agent

By default this action installs Cinc from `omnitruck.cinc.sh`. Chef installs use the
[Chef Community download API](https://docs.chef.io/download/community/) or the Chef commercial API
when you provide a `license_id`.

There is support for Macos, Linux and Windows with this action

## Usage

Use the default settings to install [Cinc Workstation](https://cinc.sh/start/workstation/) from
the Cinc omnibus endpoint

```yaml
name: delivery

on: [push, pull_request]

jobs:
  delivery:
    runs-on: ubuntu-latest
    steps:
    - name: Check out code
      uses: actions/checkout@master
    - name: install cinc
      uses: actionshub/chef-install@main
```

Install [Chef Workstation](https://docs.chef.io/workstation/) from the Chef Community API

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
        project: chef-workstation
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

Install Cinc Workstation explicitly:

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
```

The installed Cinc packages are Chef-compatible. If you need direct package downloads instead of
the install script, Cinc also publishes plain packages at <https://cinc.sh/download/>.

### Version selection

By default, `cinc-workstation` installs the latest available version.

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
| project         | cinc-workstation             | Which product to install, see <https://docs.chef.io/chef_install_script/> for Chef project names and <https://cinc.sh/start/> for Cinc products |
| version         | latest (for workstation installs) | Version to install. Set to `latest` for the newest release.                                    |
| chefDownloadUrl | chefdownload-community.chef.io | Chef download API host. Defaults to the Chef Community API.                                        |
| license         |                              | Chef Downloads license ID. Required for Chef Community/Commercial downloads. Not used for Cinc.    |
| omnitruckUrl    | omnitruck.cinc.sh            | Deprecated compatibility input for omnitruck hosts. Defaults to the Cinc omnibus endpoint.         |
| windowsPath     | auto                         | Root install path used for the Windows PATH update step. Override this for products installed elsewhere. |

When `license` is set, the action uses `chefDownloadUrl`. Without a `license`, the action uses
`omnitruckUrl`, which defaults to Cinc.

When using the default Chef Community API, `channel` must remain `stable`. Use
`chefdownload-commercial.chef.io` if you need the `current` channel for Chef packages.

For compatibility, Chef product names are mapped to their Cinc equivalents when installing from
the default Cinc omnitruck endpoint:

- `chef-workstation` becomes `cinc-workstation`
- `inspec` becomes `cinc-auditor`
- `chef` and `chef-client` become `cinc`
