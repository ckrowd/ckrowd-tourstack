const fs = require("fs");

const files = [
  "src/components/PageTour.tsx",
  "src/components/TourGuide.tsx",
];

const oldPattern = /\/\/ driver\.js replaces \{\{current\}\}[\s\S]*?\.replace\("\{total\}", "\{\{total\}\}"\);/g;

const newCode = `// Pass driver.js tokens as next-intl interpolation values.
\t// next-intl substitutes {current}\u2192{{current}} and {total}\u2192{{total}},
\t// then driver.js replaces those when rendering each step.
\tconst progressTemplate = tTour("progress", {
\t\tcurrent: "{{current}}",
\t\ttotal: "{{total}}",
\t});`;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const before = content;
  content = content.replace(oldPattern, newCode);
  if (content !== before) {
    fs.writeFileSync(file, content, "utf8");
    console.log("Fixed: " + file);
  } else {
    console.log("No match in: " + file);
  }
}
