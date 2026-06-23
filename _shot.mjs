import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const [name, url] of [["home","http://localhost:3000/en"],["join","http://localhost:3000/en/join"]]) {
  await p.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch(()=>{});
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `C:/Users/USER/Desktop/CKROWD/ckrowd-tourstack/_${name}.png` });
  console.log("shot " + name);
}
await b.close();
