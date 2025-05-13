import { installCmd } from './install.ts'

describe('installCmd', () => {
  it('should return an error for unsupported platform "freebsd"', () => {
    const result = installCmd('freebsd')
    expect(result.isOk()).toBe(false)
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr()).toMatchObject({
      message: 'Unsupported OS: freebsd'
    })
  })
  it('should return the install cmd for linux', () => {
    const result = installCmd('linux')
    expect(result.isOk()).toBe(true)
    expect(result.isErr()).toBe(false)
    expect(result._unsafeUnwrap()).toMatchObject([
      'curl https://raw.githubusercontent.com/habitat-sh/habitat/main/components/hab/install.sh | sudo bash -s -- -c stable',
      'sudo hab pkg install --binlink --force chef/chef-workstation --channel unstable'
    ])
  })
})
