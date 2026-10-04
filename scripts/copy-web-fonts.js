/**
 * Post-build script:
 * 1. Copy font files from Metro's bundled output to a clean path
 * 2. Create 404.html for SPA fallback (when direct file doesn't exist, Vercel serves 404.html)
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

// possible locations where Metro may place the vector-icons fonts
const possibleSrcDirs = [
  path.join(
    __dirname,
    '..',
    'dist',
    'assets',
    'node_modules',
    '@expo',
    'vector-icons',
    'build',
    'vendor',
    'react-native-vector-icons',
    'Fonts'
  ),
  path.join(
    __dirname,
    '..',
    'dist',
    'assets',
    'node_modules',
    '@expo',
    'vector-icons',
    'build',
    'react-native-vector-icons',
    'Fonts'
  ),
  path.join(__dirname, '..', 'dist', 'assets', 'Fonts'),
];

let srcDir = null;
for (const p of possibleSrcDirs) {
  if (fs.existsSync(p)) {
    srcDir = p;
    break;
  }
}

const destDir = path.join(__dirname, '..', 'dist', '_expo', 'static', 'fonts');

try {
  // Create destination directory
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // 1. Copy fonts
  if (srcDir && fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.ttf'));

    if (files.length === 0) {
      console.warn('⚠️  No .ttf font files found in:', srcDir);
    } else {
      for (const file of files) {
        // Strip the content hash if present: Ionicons.b4eb097d....ttf → Ionicons.ttf
        const cleanName = file.replace(/\.[a-f0-9]{16,64}\.ttf$/, '.ttf');
        try {
          fs.copyFileSync(
            path.join(srcDir, file),
            path.join(destDir, cleanName)
          );
        } catch (copyErr) {
          console.warn(`⚠️ Failed to copy ${file}:`, copyErr.message);
        }
      }

      console.log(`✅ Copied ${files.length} font files to ${destDir}`);
    }
  } else {
    console.warn('⚠️  Metro font source directory not found among candidates:');
    possibleSrcDirs.forEach((p) => console.warn('   -', p));
    console.warn(
      "   Fonts will only be available via Metro's default asset paths."
    );
  }
} catch (err) {
  console.warn('⚠️  Unexpected error while copying fonts:', err.message);
}

// 2. Create 404.html for SPA fallback routing
try {
  const indexPath = path.join(distDir, 'index.html');
  const notFoundPath = path.join(distDir, '404.html');

  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    fs.writeFileSync(notFoundPath, indexContent);
    console.log('✅ Created 404.html for SPA fallback routing');
  } else {
    console.warn('⚠️  index.html not found:', indexPath);
  }
} catch (err) {
  console.warn('⚠️ Error creating 404.html:', err.message);
}

// 3. Ensure static public legal pages exist in dist/ for direct access
try {
  const legalPages = ['privacy', 'terms', 'delete-account'];
  for (const page of legalPages) {
    const publicFile = path.join(__dirname, '..', 'public', page, 'index.html');
    const distPageDir = path.join(distDir, page);
    const distIndex = path.join(distPageDir, 'index.html');
    const distHtml = path.join(distDir, `${page}.html`);

    if (fs.existsSync(publicFile)) {
      if (!fs.existsSync(distPageDir)) {
        fs.mkdirSync(distPageDir, { recursive: true });
      }
      fs.copyFileSync(publicFile, distIndex);
      fs.copyFileSync(publicFile, distHtml);
      console.log(`✅ Synced static legal page: ${page} -> ${distIndex} & ${distHtml}`);
    }
  }
} catch (legalErr) {
  console.warn('⚠️ Error copying legal pages to dist:', legalErr.message);
}

// Ensure the script never fails the build — log and set exit code 0
process.exitCode = 0;

// Create a minimal package.json in dist so Vercel's static builder detects the output
try {
  const pkgPath = path.join(distDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    const pkg = {
      name: 'kodax-dist',
      private: true,
      version: '1.0.0',
      description: 'Static export artifacts for Kodax',
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');
    console.log('✅ Created minimal dist/package.json for Vercel');
  }
} catch (pkgErr) {
  console.warn('⚠️ Failed to create dist/package.json:', pkgErr.message);
}
