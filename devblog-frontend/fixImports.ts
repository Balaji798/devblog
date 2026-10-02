import fs from "fs";
import path from "path";

const pagesDir = path.join(process.cwd(), "src", "pages");

function fixDirectory(dirName: string) {
  const targetDir = path.join(pagesDir, dirName);
  if (!fs.existsSync(targetDir)) return;

  const files = fs.readdirSync(targetDir);
  for (const file of files) {
    if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      const filePath = path.join(targetDir, file);
      let content = fs.readFileSync(filePath, "utf-8");

      // Shift all relative paths exactly one level up to compensate for moving the files one level deep
      content = content.replace(
        /(from\s+['"]|import\s+['"])(\.\/|\.\.\/)/g,
        "$1../$2",
      );

      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`Successfully mapped imports for: ${file}`);
    }
  }
}

console.log("Commencing widespread relative import migration...");
fixDirectory("admin");
fixDirectory("user");
console.log("Migration complete!");
