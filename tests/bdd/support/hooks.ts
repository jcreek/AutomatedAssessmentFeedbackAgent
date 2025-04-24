import { After, Status } from '@cucumber/cucumber';
import fs from 'fs';
import path from 'path';

const dir = path.resolve('screenshots');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

After(async function (scenario) {
  // 'this' is the World instance
  // @ts-ignore
  const worldPage = this.page || (global as any).page;
  const scenarioName =
    scenario.pickle?.name ||
    scenario.pickle?.title ||
    (scenario.pickle && scenario.pickle) ||
    'unknown_scenario';

  if (scenario.result?.status === Status.FAILED && worldPage) {
    const fileName = scenarioName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const screenshotPath = path.join(dir, `${fileName}.png`);
    await worldPage.screenshot({ path: screenshotPath, fullPage: true });
    // Optionally attach to report if supported:
    // this.attach(fs.readFileSync(screenshotPath), 'image/png');
    console.log(`Screenshot saved: ${screenshotPath}`);
  } else if (scenario.result?.status === Status.FAILED) {
    console.log(`[Screenshot skipped] No page found for scenario: ${scenarioName}`);
  }
});
