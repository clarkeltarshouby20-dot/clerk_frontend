const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (
        file.endsWith(".vue") ||
        file.endsWith(".js") ||
        file.endsWith(".css")
      ) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let original = content;

  // Replace bg-base with bg-background globally
  content = content.replace(/\bbg-base\b/g, "bg-background");

  // In style.css, replace the CSS variable
  if (file.endsWith("style.css")) {
    content = content.replace(/--color-base/g, "--color-background");
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
