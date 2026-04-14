/**
 * محتوى رفع المواقع والدومينات - Kodax
 * دليل شامل لنشر المواقع على الإنترنت
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس النشر =====
export const DEPLOYMENT_LESSONS: Lesson[] = [
  {
    id: 'deploy-1',
    courseId: 'web-deployment',
    title: 'مقدمة في استضافة المواقع',
    description: 'فهم كيف يعمل الإنترنت والاستضافة',
    content: `
# مقدمة في استضافة المواقع

## كيف يعمل الإنترنت؟

عندما يزور شخص موقعك:

\`\`\`
1. المستخدم يكتب www.example.com
2. DNS يُحول الاسم لـ IP (192.168.1.1)
3. المتصفح يتصل بالسيرفر
4. السيرفر يُرسل ملفات الموقع
5. المتصفح يعرض الموقع
\`\`\`

## ما هي الاستضافة (Hosting)؟

الاستضافة = **تأجير مساحة على سيرفر** متصل بالإنترنت 24/7.

### أنواع الاستضافة

| النوع | الوصف | السعر | لمن؟ |
|-------|------|-------|-----|
| **Shared** | سيرفر مشترك | $3-10/شهر | مبتدئين |
| **VPS** | سيرفر افتراضي خاص | $20-100/شهر | متوسط |
| **Dedicated** | سيرفر كامل لك | $100+/شهر | شركات كبيرة |
| **Cloud** | موارد مرنة | حسب الاستخدام | تطبيقات متقدمة |
| **Static** | ملفات ثابتة فقط | مجاني غالباً | مواقع بسيطة |

## ما هو الدومين (Domain)؟

الدومين = **عنوان موقعك** على الإنترنت.

\`\`\`
https://www.example.com
└──┬──┘ └┬┘ └───┬────┘ └┬┘
Protocol│    Domain    TLD
        subdomain
\`\`\`

### TLDs الشائعة
- **.com** - تجاري (الأكثر شيوعاً)
- **.net** - شبكات
- **.org** - منظمات
- **.io** - شركات تقنية
- **.dev** - مطورين
- **.sa** - السعودية
- **.ae** - الإمارات

### شراء دومين

**مسجلين موثوقين:**
1. **Namecheap** - أسعار جيدة
2. **Google Domains** - سهل
3. **Cloudflare** - بسعر التكلفة
4. **GoDaddy** - الأشهر

**نصائح:**
- اختر اسم قصير وسهل التذكر
- تجنب الأرقام والشرطات
- سجل لعدة سنوات
- فعّل Privacy Protection

## أنواع المواقع والاستضافة المناسبة

### 1. موقع ثابت (Static)
\`\`\`
HTML + CSS + JS فقط
├── Vercel (مجاني)
├── Netlify (مجاني)
├── GitHub Pages (مجاني)
└── Cloudflare Pages (مجاني)
\`\`\`

### 2. موقع ديناميكي (Dynamic)
\`\`\`
Backend + Database
├── Heroku
├── Railway
├── Render
├── DigitalOcean
└── AWS/GCP/Azure
\`\`\`

### 3. WordPress
\`\`\`
├── WordPress.com (سهل)
├── Bluehost
├── SiteGround
└── HostGator
\`\`\`

## DNS - نظام أسماء النطاقات

### سجلات DNS المهمة

\`\`\`
A Record     → يربط الدومين بـ IP
CNAME        → يربط دومين بدومين آخر
MX           → للبريد الإلكتروني
TXT          → للتحقق والإعدادات
NS           → Name Servers
\`\`\`

### مثال إعدادات DNS
\`\`\`
Type    Name    Value              TTL
A       @       185.199.108.153    300
CNAME   www     example.com        300
MX      @       mail.example.com   300
TXT     @       v=spf1 ...         300
\`\`\`

## SSL/HTTPS

### لماذا HTTPS مهم؟
- **الأمان** - تشفير البيانات
- **SEO** - Google يُفضله
- **الثقة** - القفل الأخضر
- **متطلب** - المتصفحات تحذر بدونه

### الحصول على SSL مجاناً
1. **Let's Encrypt** - الأشهر
2. **Cloudflare** - تلقائي
3. **الاستضافة** - معظمها توفره
`,
    codeExample: `# إعدادات DNS مع Cloudflare (مثال)
# ملف: dns-records.json

{
  "domain": "example.com",
  "records": [
    {
      "type": "A",
      "name": "@",
      "content": "185.199.108.153",
      "proxied": true
    },
    {
      "type": "CNAME",
      "name": "www",
      "content": "example.com",
      "proxied": true
    },
    {
      "type": "MX",
      "name": "@",
      "content": "mail.example.com",
      "priority": 10
    }
  ]
}

# للتحقق من DNS:
# nslookup example.com
# dig example.com`,
    language: 'json',
    xpReward: 100,
    order: 1,
    quiz: {
      question: 'ما الفرق بين الاستضافة والدومين؟',
      options: [
        'نفس الشيء',
        'الدومين هو العنوان، والاستضافة هي مكان تخزين الملفات',
        'الدومين أغلى',
        'الاستضافة للبريد فقط',
      ],
      correctAnswer: 1,
      explanation:
        'الدومين مثل عنوان المنزل، والاستضافة مثل المنزل نفسه حيث تُخزن ملفاتك.',
    },
  },
  {
    id: 'deploy-2',
    courseId: 'web-deployment',
    title: 'نشر موقع على Vercel',
    description: 'رفع مشروعك على Vercel مجاناً',
    content: `
# نشر موقع على Vercel

Vercel هي **أفضل منصة لنشر مواقع الـ Frontend** - مجانية وسريعة.

## لماذا Vercel؟

✅ مجاني للمشاريع الشخصية
✅ سريع جداً (Edge Network)
✅ HTTPS تلقائي
✅ دعم ممتاز لـ Next.js, React, Vue
✅ Preview للـ Pull Requests
✅ Serverless Functions
✅ Analytics مدمج

## الطريقة 1: من GitHub (الأسهل)

### الخطوات:
1. **ارفع مشروعك على GitHub**
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/user/repo.git
git push -u origin main
\`\`\`

2. **اذهب لـ vercel.com**
   - سجل دخول بـ GitHub
   - اضغط "New Project"
   - اختر الـ Repository
   - اضغط "Deploy"

3. **انتظر دقيقة... موقعك جاهز! 🎉**

## الطريقة 2: Vercel CLI

### التثبيت
\`\`\`bash
npm install -g vercel
\`\`\`

### الاستخدام
\`\`\`bash
# في مجلد المشروع
vercel

# سيسألك:
# ? Set up and deploy? [Y/n] y
# ? Which scope? your-username
# ? Link to existing project? [y/N] n
# ? Project name? my-project
# ? Directory? ./
# ? Override settings? [y/N] n

# 🎉 جاهز!
# https://my-project.vercel.app
\`\`\`

### أوامر مفيدة
\`\`\`bash
vercel             # نشر preview
vercel --prod      # نشر production
vercel ls          # قائمة المشاريع
vercel logs        # سجلات
vercel env add     # إضافة متغيرات بيئة
\`\`\`

## ربط دومين مخصص

1. في لوحة Vercel → Settings → Domains
2. أضف الدومين: \`example.com\`
3. أضف DNS Records في مسجل الدومين:

\`\`\`
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
\`\`\`

4. انتظر 5-30 دقيقة

## إعدادات vercel.json

\`\`\`json
{
  "version": 2,
  "name": "my-project",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "API_URL": "@api-url"
  },
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
\`\`\`

## متغيرات البيئة

### من الواجهة
Settings → Environment Variables

### من CLI
\`\`\`bash
vercel env add SECRET_KEY
# أدخل القيمة
# اختر البيئات (Production, Preview, Development)
\`\`\`

### في الكود
\`\`\`javascript
// متاح تلقائياً
const apiKey = process.env.API_KEY;
\`\`\`

## Serverless Functions

\`\`\`javascript
// api/hello.js
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello World!' });
}

// الوصول: /api/hello
\`\`\`

## نصائح

1. **استخدم .vercelignore** لتجاهل الملفات
2. **فعّل Preview Comments** للتعاون
3. **راقب Analytics** لأداء الموقع
4. **استخدم Edge Functions** للسرعة
`,
    codeExample: `// ملف: vercel.json - إعدادات متقدمة
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "rewrites": [
    { "source": "/blog/:path*", "destination": "/posts/:path*" }
  ],
  "redirects": [
    { "source": "/old-page", "destination": "/new-page", "permanent": true }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}

// ملف: api/users.js - Serverless Function
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const users = await fetchUsers();
    return res.status(200).json(users);
  }
  
  if (req.method === 'POST') {
    const newUser = await createUser(req.body);
    return res.status(201).json(newUser);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}`,
    language: 'javascript',
    xpReward: 150,
    order: 2,
    quiz: {
      question: 'كيف تنشر مشروع على Vercel؟',
      options: [
        'ترسل ملفات بالإيميل',
        'تربط GitHub Repository وتضغط Deploy',
        'تشتري سيرفر خاص',
        'تتصل بالدعم الفني',
      ],
      correctAnswer: 1,
      explanation:
        'Vercel يتكامل مع GitHub - تربط الـ Repo ويتم النشر تلقائياً مع كل commit.',
    },
  },
  {
    id: 'deploy-3',
    courseId: 'web-deployment',
    title: 'نشر موقع على Netlify',
    description: 'بديل ممتاز لـ Vercel',
    content: `
# نشر موقع على Netlify

Netlify منصة **ممتازة لاستضافة المواقع الثابتة** والـ JAMstack.

## مميزات Netlify

✅ مجاني سخي (100GB bandwidth)
✅ Forms مدمج (بدون backend)
✅ Identity للمستخدمين
✅ Functions (AWS Lambda)
✅ Split Testing (A/B)
✅ Analytics

## النشر من GitHub

### الخطوات:
1. سجل في netlify.com
2. "New site from Git"
3. اختر GitHub
4. اختر Repository
5. حدد إعدادات البناء:
   - Build command: \`npm run build\`
   - Publish directory: \`dist\` أو \`build\`
6. Deploy!

## النشر من CLI

\`\`\`bash
# التثبيت
npm install -g netlify-cli

# تسجيل الدخول
netlify login

# النشر
netlify deploy

# نشر للـ Production
netlify deploy --prod

# فتح الموقع
netlify open
\`\`\`

## Drag & Drop

أبسط طريقة:
1. اذهب لـ app.netlify.com
2. اسحب مجلد \`dist\` للصفحة
3. انتهى! 🎉

## ملف netlify.toml

\`\`\`toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Redirects
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"

# Functions
[functions]
  directory = "netlify/functions"
\`\`\`

## Netlify Forms

\`\`\`html
<!-- نموذج تواصل بدون backend! -->
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <textarea name="message" required></textarea>
  <button type="submit">إرسال</button>
</form>
\`\`\`

## Netlify Functions

\`\`\`javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  const name = event.queryStringParameters.name || 'World';
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: \`Hello \${name}!\`
    })
  };
};

// الوصول: /.netlify/functions/hello?name=Ahmad
\`\`\`

## ربط الدومين

1. Site settings → Domain management
2. Add custom domain
3. أضف DNS Records:

\`\`\`
A Record:
  Name: @
  Value: 75.2.60.5

CNAME:
  Name: www
  Value: your-site.netlify.app
\`\`\`

## Environment Variables

\`\`\`bash
# من CLI
netlify env:set API_KEY "your-key"
netlify env:list
netlify env:unset API_KEY
\`\`\`

## نصائح متقدمة

### Preview Deploys
كل Pull Request يحصل على URL خاص للمراجعة.

### Deploy Contexts
\`\`\`toml
[context.production]
  command = "npm run build:prod"

[context.deploy-preview]
  command = "npm run build:preview"

[context.branch-deploy]
  command = "npm run build:staging"
\`\`\`

### Plugins
\`\`\`toml
[[plugins]]
  package = "@netlify/plugin-lighthouse"

[[plugins]]
  package = "netlify-plugin-sitemap"
\`\`\`
`,
    codeExample: `// ملف: netlify/functions/contact.js
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, email, message } = JSON.parse(event.body);
    
    // إرسال إيميل
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: email,
      to: 'your@email.com',
      subject: \`رسالة من \${name}\`,
      text: message
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// ملف: netlify.toml
// [build]
//   command = "npm run build"
//   publish = "dist"
//   functions = "netlify/functions"`,
    language: 'javascript',
    xpReward: 150,
    order: 3,
    quiz: {
      question: 'ما ميزة Netlify Forms؟',
      options: [
        'أسرع من غيرها',
        'تجمع بيانات النماذج بدون كتابة backend',
        'مجانية فقط',
        'للصور فقط',
      ],
      correctAnswer: 1,
      explanation:
        'Netlify Forms تجمع بيانات النماذج تلقائياً بإضافة data-netlify="true" فقط!',
    },
  },
  {
    id: 'deploy-4',
    courseId: 'web-deployment',
    title: 'GitHub Pages للمواقع الثابتة',
    description: 'استضافة مجانية من GitHub',
    content: `
# GitHub Pages

استضافة **مجانية من GitHub** للمواقع الثابتة.

## متى تستخدم GitHub Pages؟

✅ مواقع شخصية / Portfolio
✅ توثيق المشاريع
✅ مدونات (مع Jekyll)
✅ مشاريع open source

## الإعداد اليدوي

### 1. إنشاء Repository
\`\`\`bash
# اسم خاص: username.github.io
# للموقع الرئيسي
\`\`\`

### 2. رفع الملفات
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo.git
git push -u origin main
\`\`\`

### 3. تفعيل Pages
- Settings → Pages
- Source: Deploy from branch
- Branch: main / root
- Save

### 4. الانتظار
الموقع جاهز على: \`https://username.github.io/repo\`

## GitHub Actions (للبناء التلقائي)

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
\`\`\`

## إعدادات للـ SPA

### vite.config.js
\`\`\`javascript
export default {
  base: '/repo-name/', // مهم!
}
\`\`\`

### 404.html (للـ routing)
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <script>
    // Redirect to index.html with the path
    const path = window.location.pathname;
    window.location.replace('/' + '?p=' + path);
  </script>
</head>
</html>
\`\`\`

## دومين مخصص

### 1. أضف CNAME file
\`\`\`
example.com
\`\`\`

### 2. DNS Settings
\`\`\`
A Records:
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153

CNAME (www):
username.github.io
\`\`\`

### 3. Enforce HTTPS
Settings → Pages → ✅ Enforce HTTPS

## Jekyll (للمدونات)

\`\`\`yaml
# _config.yml
title: مدونتي
description: مدونة تقنية
baseurl: ""
url: "https://username.github.io"

theme: minima

plugins:
  - jekyll-feed
  - jekyll-seo-tag
\`\`\`

\`\`\`markdown
---
layout: post
title: "أول مقالة"
date: 2024-01-15
categories: tech
---

# مرحباً بالعالم

هذه أول مقالة في مدونتي.
\`\`\`

## حدود GitHub Pages

⚠️ 1GB حجم Repository
⚠️ 100GB bandwidth/شهر
⚠️ 10 builds/ساعة
⚠️ Static فقط (لا backend)
⚠️ لا private repos (مجاني)
`,
    codeExample: `# ملف: .github/workflows/deploy.yml
# نشر تلقائي لمشروع React/Vite

name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to Pages
        id: deployment
        uses: actions/deploy-pages@v4`,
    language: 'yaml',
    xpReward: 120,
    order: 4,
    quiz: {
      question: 'ما اسم الـ Repository الخاص للموقع الرئيسي في GitHub Pages؟',
      options: [
        'my-website',
        'username.github.io',
        'pages.github.com',
        'أي اسم',
      ],
      correctAnswer: 1,
      explanation:
        'Repository باسم username.github.io يُصبح موقعك الرئيسي تلقائياً.',
    },
  },
  {
    id: 'deploy-5',
    courseId: 'web-deployment',
    title: 'نشر تطبيقات Backend',
    description: 'استضافة Node.js, Python وغيرها',
    content: `
# نشر تطبيقات Backend

للتطبيقات التي تحتاج **سيرفر وقاعدة بيانات**.

## خيارات الاستضافة

### 1. Railway (الأسهل)
\`\`\`bash
# تثبيت CLI
npm install -g @railway/cli

# تسجيل الدخول
railway login

# إنشاء مشروع
railway init

# النشر
railway up

# إضافة قاعدة بيانات
railway add postgres
\`\`\`

### 2. Render
- ربط GitHub
- اختيار Web Service
- تحديد Build Command
- تلقائي!

### 3. Fly.io
\`\`\`bash
# تثبيت
curl -L https://fly.io/install.sh | sh

# تسجيل
fly auth signup

# نشر
fly launch
fly deploy
\`\`\`

## Dockerfile للنشر

\`\`\`dockerfile
# Node.js
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
\`\`\`

\`\`\`dockerfile
# Python
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]
\`\`\`

## إعدادات شائعة

### package.json
\`\`\`json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm run compile"
  },
  "engines": {
    "node": ">=18"
  }
}
\`\`\`

### Procfile (Heroku/Railway)
\`\`\`
web: node server.js
worker: node worker.js
\`\`\`

### المنافذ
\`\`\`javascript
// استخدم PORT من البيئة
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server on port \${PORT}\`);
});
\`\`\`

## قواعد البيانات

### PostgreSQL
\`\`\`javascript
// الاتصال
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
\`\`\`

### MongoDB
\`\`\`javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);
\`\`\`

### خدمات قواعد بيانات
- **Supabase** - PostgreSQL مجاني
- **PlanetScale** - MySQL serverless
- **MongoDB Atlas** - MongoDB مجاني
- **Neon** - PostgreSQL serverless
- **Upstash** - Redis serverless

## متغيرات البيئة

\`\`\`bash
# .env (محلياً فقط!)
DATABASE_URL=postgres://...
JWT_SECRET=your-secret
API_KEY=xxx

# في الـ deployment
# أضفها من لوحة التحكم أو CLI
\`\`\`

## CI/CD مع GitHub Actions

\`\`\`yaml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: \${{ secrets.RAILWAY_TOKEN }}
          service: backend
\`\`\`

## نصائح للـ Production

1. **استخدم HTTPS دائماً**
2. **لا تُخزن secrets في الكود**
3. **فعّل Rate Limiting**
4. **استخدم Health Checks**
5. **راقب الـ Logs**
6. **أضف Error Tracking** (Sentry)
7. **استخدم CDN** للـ static assets
`,
    codeExample: `// ملف: server.js - Express App جاهز للنشر
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
});
app.use('/api', limiter);

// Body parsing
app.use(express.json());

// Health check (مهم للاستضافة!)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    language: 'javascript',
    xpReward: 180,
    order: 5,
    quiz: {
      question: 'لماذا نستخدم process.env.PORT؟',
      options: [
        'لأنه أسرع',
        'لأن منصات الاستضافة تُحدد المنفذ تلقائياً',
        'لأنه أكثر أماناً',
        'لا سبب محدد',
      ],
      correctAnswer: 1,
      explanation:
        'منصات الاستضافة تُحدد المنفذ عبر متغير PORT، لذا يجب استخدامه ليعمل التطبيق.',
    },
  },
];

// ===== تحديات النشر =====
export const DEPLOYMENT_CHALLENGES: Challenge[] = [
  {
    id: 'deploy-challenge-1',
    title: 'نشر Portfolio',
    description: 'انشر موقع Portfolio على Vercel',
    difficulty: 'easy',
    points: 100,
    language: 'HTML',
    icon: 'cloud-upload-outline',
    starterCode: `<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>My Portfolio</title>
</head>
<body>
  <h1>اسمك</h1>
  <p>مطور ويب</p>
  
  <!-- أضف:
  - قسم المشاريع
  - قسم المهارات
  - قسم التواصل
  -->
</body>
</html>

<!-- المطلوب:
1. أنشئ صفحة Portfolio كاملة
2. ارفعها على GitHub
3. انشرها على Vercel
4. شارك الرابط
-->`,
    solution: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Portfolio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; }
    header { text-align: center; padding: 3rem 1rem; background: #1e293b; }
    header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    section { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    h2 { margin-bottom: 1rem; color: #3b82f6; }
    .projects { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .card { background: #1e293b; border-radius: 12px; padding: 1.5rem; }
    .card h3 { margin-bottom: 0.5rem; }
    .skills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .skill { background: #3b82f6; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.9rem; }
    footer { text-align: center; padding: 2rem; color: #64748b; }
  </style>
</head>
<body>
  <header>
    <h1>اسمك</h1>
    <p>مطور ويب</p>
  </header>
  <section>
    <h2>المشاريع</h2>
    <div class="projects">
      <div class="card"><h3>مشروع 1</h3><p>وصف المشروع</p></div>
      <div class="card"><h3>مشروع 2</h3><p>وصف المشروع</p></div>
    </div>
  </section>
  <section>
    <h2>المهارات</h2>
    <div class="skills">
      <span class="skill">HTML</span>
      <span class="skill">CSS</span>
      <span class="skill">JavaScript</span>
    </div>
  </section>
  <section>
    <h2>تواصل معي</h2>
    <p>البريد: email@example.com</p>
  </section>
  <footer><p>&copy; 2024 جميع الحقوق محفوظة</p></footer>
</body>
</html>`,
    hints: [
      'ابدأ بـ HTML بسيط ثم أضف CSS',
      'استخدم vercel CLI أو الواجهة',
      'تأكد من ملف index.html في الجذر',
    ],
    testCases: [
      {
        input: 'Deploy site',
        expectedOutput: 'Live URL',
        description: 'موقع منشور',
      },
      {
        input: 'HTML structure',
        expectedOutput: 'header, sections, footer present',
        description:
          'الصفحة تحتوي على الأقسام المطلوبة (مشاريع، مهارات، تواصل)',
      },
    ],
    isLocked: false,
    category: 'deployment',
  },
  {
    id: 'deploy-challenge-2',
    title: 'إعداد package.json',
    description: 'أنشئ ملف package.json لمشروع Node.js مع scripts مناسبة',
    difficulty: 'easy',
    points: 40,
    language: 'JavaScript',
    icon: 'settings-outline',
    starterCode: `// أنشئ ملف package.json يحتوي على:
// 1. اسم المشروع: my-app
// 2. الإصدار: 1.0.0
// 3. وصف مناسب
// 4. scripts:
//    - start: تشغيل السيرفر
//    - dev: تشغيل في وضع التطوير
//    - build: بناء المشروع
//    - test: تشغيل الاختبارات
// 5. dependencies: express
// 6. devDependencies: nodemon

// اكتب محتوى package.json هنا:
const packageJson = {
  // أكمل
};
console.log(JSON.stringify(packageJson, null, 2));`,
    solution: `const packageJson = {
  "name": "my-app",
  "version": "1.0.0",
  "description": "تطبيق Node.js",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "echo 'Building...'",
    "test": "echo 'Running tests...'"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
};
console.log(JSON.stringify(packageJson, null, 2));`,
    hints: [
      'تأكد من وجود name و version',
      'استخدم nodemon في سكريبت dev',
      'أضف dependencies و devDependencies',
    ],
    testCases: [
      {
        input: 'packageJson.name',
        expectedOutput: 'my-app',
        description: 'اسم المشروع صحيح',
      },
      {
        input: 'packageJson.scripts.dev',
        expectedOutput: 'nodemon index.js',
        description: 'سكريبت التطوير صحيح',
      },
    ],
    isLocked: false,
    category: 'deployment',
  },
  {
    id: 'deploy-challenge-3',
    title: 'إعداد متغيرات البيئة',
    description: 'أنشئ نظام إدارة متغيرات البيئة (.env) لمشروعك',
    difficulty: 'medium',
    points: 60,
    language: 'JavaScript',
    icon: 'key-outline',
    starterCode: `// أنشئ نظام يقرأ متغيرات البيئة ويوفرها للتطبيق
// المطلوب:
// 1. قراءة المتغيرات من process.env
// 2. توفير قيم افتراضية
// 3. التحقق من المتغيرات المطلوبة
// 4. تصدير الإعدادات ككائن

// المتغيرات المطلوبة:
// PORT, DATABASE_URL, API_KEY, NODE_ENV

function loadConfig() {
  // أكمل الكود
}

module.exports = loadConfig();`,
    solution: `function loadConfig() {
  const requiredVars = ['DATABASE_URL', 'API_KEY'];
  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.warn('Missing env vars:', missing.join(', '));
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    databaseUrl: process.env.DATABASE_URL || 'sqlite://local.db',
    apiKey: process.env.API_KEY || '',
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: (process.env.NODE_ENV || 'development') === 'development',
    isProd: process.env.NODE_ENV === 'production',
  };
}

module.exports = loadConfig();`,
    hints: [
      'استخدم process.env للوصول للمتغيرات',
      'استخدم || لتوفير قيم افتراضية',
      'تحقق من المتغيرات المطلوبة عند البدء',
    ],
    testCases: [
      {
        input: 'config.port',
        expectedOutput: '3000',
        description: 'المنفذ الافتراضي',
      },
      {
        input: 'config.isDev',
        expectedOutput: 'true',
        description: 'وضع التطوير افتراضياً',
      },
    ],
    isLocked: false,
    category: 'deployment',
  },
  {
    id: 'deploy-challenge-4',
    title: 'Dockerfile لتطبيق Node.js',
    description: 'اكتب Dockerfile لتحويل تطبيق Node.js إلى حاوية Docker',
    difficulty: 'hard',
    points: 80,
    language: 'Dockerfile',
    icon: 'cube-outline',
    starterCode: `# اكتب Dockerfile لتطبيق Node.js يحتوي على:
# 1. اختيار صورة أساسية (node:18-alpine)
# 2. تحديد مجلد العمل
# 3. نسخ package.json أولاً وتثبيت المكتبات
# 4. نسخ بقية الملفات
# 5. كشف المنفذ 3000
# 6. تشغيل التطبيق

# اكتب Dockerfile هنا:
# FROM ...
# WORKDIR ...
# COPY ...
# RUN ...
# COPY ...
# EXPOSE ...
# CMD ...`,
    solution: `# Dockerfile
FROM node:18-alpine

WORKDIR /app

# نسخ ملفات التبعيات أولاً (للاستفادة من cache)
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci --only=production

# نسخ بقية الملفات
COPY . .

# كشف المنفذ
EXPOSE 3000

# متغيرات البيئة الافتراضية
ENV NODE_ENV=production

# تشغيل التطبيق
CMD ["node", "index.js"]`,
    hints: [
      'استخدم node:18-alpine للحجم الصغير',
      'انسخ package.json قبل بقية الملفات للاستفادة من Docker cache',
      'استخدم npm ci بدلاً من npm install في الإنتاج',
    ],
    testCases: [
      {
        input: 'Dockerfile valid',
        expectedOutput: 'true',
        description: 'Dockerfile صحيح',
      },
      {
        input: 'base image',
        expectedOutput: 'node:18-alpine',
        description: 'يستخدم صورة node:18-alpine كأساس',
      },
    ],
    isLocked: true,
    category: 'deployment',
  },
];

// ===== التصدير =====
export const ALL_DEPLOYMENT_LESSONS: Lesson[] = DEPLOYMENT_LESSONS;
export const ALL_DEPLOYMENT_CHALLENGES: Challenge[] = DEPLOYMENT_CHALLENGES;
