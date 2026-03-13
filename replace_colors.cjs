const fs = require("fs");
const path = require("path");

const dir = "e:/web dev/mevn/e_commerce/client/src/pages/admin";

const replacements = [
  {
    regex: /bg-white\s+dark:bg-(?:gray-800|gray-900|\[#0A0A0A\])/g,
    replace: "bg-surface",
  },
  { regex: /bg-gray-50\s+dark:bg-gray-800(?:\/50)?/g, replace: "bg-base" },
  { regex: /bg-gray-100\s+dark:bg-gray-700/g, replace: "bg-borderThin" },
  { regex: /bg-gray-100\s+dark:bg-gray-800/g, replace: "bg-base" },
  { regex: /bg-white(?!\/)/g, replace: "bg-surface" },
  {
    regex: /text-gray-[89]00\s+dark:text-white/g,
    replace: "text-textPrimary tracking-tight",
  },
  { regex: /text-gray-900(?!\/)/g, replace: "text-textPrimary" },
  {
    regex: /text-gray-[56]00\s+dark:text-gray-[34]00/g,
    replace: "text-textSecondary font-medium",
  },
  { regex: /text-gray-[456]00/g, replace: "text-textSecondary" },
  {
    regex: /border-gray-[12]00\s+dark:border-(?:gray-[78]00|white\/10)/g,
    replace: "border-borderThin",
  },
  { regex: /border-gray-[12]00/g, replace: "border-borderThin" },
];

fs.readdirSync(dir).forEach((file) => {
  if (file.endsWith(".vue")) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, "utf8");
    let original = content;
    replacements.forEach((r) => {
      content = content.replace(r.regex, r.replace);
    });
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
});
