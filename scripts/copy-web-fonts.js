/**
 * Post-build script:
 * 1. Copy font files from Metro's bundled output to a clean path
 * 2. Create 404.html for SPA fallback (when direct file doesn't exist, Vercel serves 404.html)
 */

const fs = require("fs");
const path = require("path");

const srcDir = path.join(
  __dirname,
  "..",
  "dist",
  "assets",
  "node_modules",
  "@expo",
  "vector-icons",
  "build",
  "vendor",
  "react-native-vector-icons",
  "Fonts",
);

const destDir = path.join(__dirname, "..", "dist", "_expo", "static", "fonts");
const distDir = path.join(__dirname, "..", "dist");

// Create destination directory
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 1. Copy fonts
if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".ttf"));

  for (const file of files) {
    // Strip the content hash: Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf → Ionicons.ttf
    const cleanName = file.replace(/\.[a-f0-9]{32}\.ttf$/, ".ttf");
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, cleanName));
  }

  console.log(
    `✅ Copied ${files.length} font files to dist/_expo/static/fonts/`,
  );
} else {
  console.warn("⚠️  Metro font source directory not found:", srcDir);
  console.warn(
    "   Fonts will only be available via Metro's default asset paths.",
  );
}

// 2. Create 404.html for SPA fallback routing
try {
  const indexPath = path.join(distDir, "index.html");
  const notFoundPath = path.join(distDir, "404.html");

  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, "utf-8");
    fs.writeFileSync(notFoundPath, indexContent);
    console.log("✅ Created 404.html for SPA fallback routing");
  } else {
    console.warn("⚠️  index.html not found:", indexPath);
  }
} catch (err) {
  console.error("❌ Error creating 404.html:", err.message);
}
