import { readFileSync, writeFileSync } from "fs";

let c = readFileSync("src/components/EOIClient.tsx", "utf8");

const intFields = [
  "yearsInBusiness", "concertsOrganized", "largestConcertCapacity", "averageEventsYear",
  "spotifyListeners", "youtubeSubscribers", "artistInstagram",
  "venueCapacity", "venueRentalCost", "expectedTicketSales", "expectedOccupancy",
  "artistFee", "productionCosts", "marketingCosts", "operationsCosts",
  "totalBudget", "ticketingRevenue", "sponsorshipRevenue", "otherRevenue",
  "totalRevenue", "netProfit", "financingAmount",
  "bankAccountNumber", "bvnOrRc",
];

for (const field of intFields) {
  // match both single and double quote variants
  const re = new RegExp(`onChange=\\{e => set\\("${field}", e\\.target\\.value\\)\\}`, "g");
  const replacement = `onChange={e => set("${field}", e.target.value.replace(/\\D/g, ""))}`;
  const prev = c;
  c = c.replace(re, replacement);
  if (c !== prev) console.log(`✓ ${field}`);
  else console.log(`✗ ${field} — no match`);
}

writeFileSync("src/components/EOIClient.tsx", c);
console.log("done");
