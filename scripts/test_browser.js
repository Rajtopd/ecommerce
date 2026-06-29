const { chromium } = require('playwright')

async function run() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`)
  })

  page.on('pageerror', err => {
    console.log(`BROWSER ERROR: ${err.message}`)
    console.log(err.stack)
  })

  console.log('Navigating to page...')
  await page.goto('http://localhost:3001/order-confirmed/2f75e77c-eb8e-4719-a61a-1fd018c60686')
  
  console.log('Waiting 5 seconds...')
  await page.waitForTimeout(5000)

  const content = await page.content()
  console.log('--- PAGE HTML ---')
  console.log(content)
  console.log('-----------------')

  await browser.close()
}

run().catch(console.error)
