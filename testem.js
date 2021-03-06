/* eslint-env node */
/* eslint-disable camelcase */
module.exports = {
  framework: 'mocha+chai',
  test_page: 'tests/index.html',
  disable_watching: true,
  parallel: -1,
  launch_in_dev: [],
  launch_in_ci: ['chromium', 'firefox'],
  browser_args: {
    chromium: [
      process.env.TRAVIS ? '--no-sandbox' : null,

      '--headless',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--window-size=1440,900'
    ].filter(Boolean),
    firefox: ['--headless']
  }
}
