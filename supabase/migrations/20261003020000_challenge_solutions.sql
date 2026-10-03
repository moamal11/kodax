-- ============================================================================
-- الحلول النموذجية للتحديات على السيرفر (لا قراءة مباشرة من التطبيق — RLS بلا سياسات)
-- مولَّد تلقائياً بـ scripts/progression/gen-challenge-solutions.ts — لا تعدّله يدوياً
-- عدد الحلول: 242
-- يعتمد على: 20261003010000_progression_economy (جدول challenge_solutions). قابل للتكرار.
-- ============================================================================
BEGIN;

INSERT INTO challenge_solutions (challenge_id, solution) VALUES
  ('ai-challenge-1', $sol$def accuracy(y_true, y_pred):
    if not y_true:
        return 0.0
    correct = sum(1 for a, b in zip(y_true, y_pred) if a == b)
    return round(correct / len(y_true), 2)


def majority_class(labels):
    counts = {}
    for label in labels:
        counts[label] = counts.get(label, 0) + 1
    return min(counts, key=lambda k: (-counts[k], k))$sol$),
  ('ai-challenge-2', $sol$def sentiment(text, positive_words, negative_words):
    words = [w.strip(".,!?؟،") for w in text.lower().split()]
    pos = sum(1 for w in words if w in positive_words)
    neg = sum(1 for w in words if w in negative_words)
    if pos > neg:
        return "إيجابي"
    if neg > pos:
        return "سلبي"
    return "محايد"$sol$),
  ('ai-challenge-3', $sol$def predict_price(size, m, b):
    return m * size + b


def mse(actual, predicted):
    errors = [(a - p) ** 2 for a, p in zip(actual, predicted)]
    return round(sum(errors) / len(errors), 2)


def r2_score(actual, predicted):
    mean = sum(actual) / len(actual)
    ss_res = sum((a - p) ** 2 for a, p in zip(actual, predicted))
    ss_tot = sum((a - mean) ** 2 for a in actual)
    if ss_tot == 0:
        return 1.0 if ss_res == 0 else 0.0
    return round(1 - ss_res / ss_tot, 3)$sol$),
  ('ai-challenge-4', $sol$import math


def euclidean(a, b):
    return round(math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b))), 2)


def nearest_centroid(point, centroids):
    distances = [euclidean(point, c) for c in centroids]
    return distances.index(min(distances))


def min_max_normalize(values):
    lo, hi = min(values), max(values)
    if hi == lo:
        return [0.0 for _ in values]
    return [round((v - lo) / (hi - lo), 2) for v in values]$sol$),
  ('ai-challenge-5', $sol$import math


def sigmoid(x):
    return round(1 / (1 + math.exp(-x)), 4)


def relu(x):
    return max(0, x)


def neuron_output(inputs, weights, bias):
    total = sum(i * w for i, w in zip(inputs, weights)) + bias
    return sigmoid(total)$sol$),
  ('ai-challenge-6', $sol$def conv2d(image, kernel):
    kh, kw = len(kernel), len(kernel[0])
    rows = len(image) - kh + 1
    cols = len(image[0]) - kw + 1
    result = []
    for i in range(rows):
        row = []
        for j in range(cols):
            total = 0
            for a in range(kh):
                for b in range(kw):
                    total += image[i + a][j + b] * kernel[a][b]
            row.append(total)
        result.append(row)
    return result


def max_pool2d(matrix):
    result = []
    for i in range(0, len(matrix) - 1, 2):
        row = []
        for j in range(0, len(matrix[0]) - 1, 2):
            row.append(max(matrix[i][j], matrix[i][j + 1], matrix[i + 1][j], matrix[i + 1][j + 1]))
        result.append(row)
    return result$sol$),
  ('ai-challenge-7', $sol$import math


def cosine_similarity(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return round(dot / (norm_a * norm_b), 2)


def unrated_items(ratings):
    return [i for i, r in enumerate(ratings) if r == 0]$sol$),
  ('ai-challenge-8', $sol$import re


def tokenize(text):
    return re.findall(r"[a-z0-9]+", text.lower())


def top_words(text, n):
    counts = {}
    for word in tokenize(text):
        counts[word] = counts.get(word, 0) + 1
    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return ranked[:n]


def find_phone_numbers(text):
    return re.findall(r"\b\d{3}-\d{3}-\d{4}\b", text)$sol$),
  ('aib-ch-001', $sol$import re


def tokenize(text):
    return re.findall(r"\w+", text.lower())$sol$),
  ('aib-ch-002', $sol$def bag_of_words(sentence, vocab):
    words = sentence.lower().split()
    return [words.count(w) for w in vocab]$sol$),
  ('aib-ch-003', $sol$def min_max_scale(values):
    lo, hi = min(values), max(values)
    if hi == lo:
        return [0.0 for _ in values]
    return [round((v - lo) / (hi - lo), 3) for v in values]$sol$),
  ('aib-ch-004', $sol$def confusion_counts(actual, predicted):
    c = {"tp": 0, "fp": 0, "tn": 0, "fn": 0}
    for a, p in zip(actual, predicted):
        if a == 1 and p == 1:
            c["tp"] += 1
        elif a == 0 and p == 1:
            c["fp"] += 1
        elif a == 0 and p == 0:
            c["tn"] += 1
        else:
            c["fn"] += 1
    return c$sol$),
  ('algo-ch-anagram-001', $sol$def is_anagram(s1, s2):
    s1 = s1.lower().replace(' ', '')
    s2 = s2.lower().replace(' ', '')
    return sorted(s1) == sorted(s2)$sol$),
  ('algo-ch-binary-001', $sol$def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1$sol$),
  ('algo-ch-dijkstra-001', $sol$def dijkstra(graph, start):
    import heapq
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    while pq:
        current_dist, current = heapq.heappop(pq)
        if current_dist > distances[current]:
            continue
        for neighbor, weight in graph[current]:
            distance = current_dist + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
    return distances$sol$),
  ('algo-ch-dp-coins-001', $sol$def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i and dp[i - coin] + 1 < dp[i]:
                dp[i] = dp[i - coin] + 1
    return dp[amount] if dp[amount] != float('inf') else -1$sol$),
  ('algo-ch-insertion-001', $sol$def insertion_sort(arr):
    arr = arr.copy()
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr$sol$),
  ('algo-ch-kadane-001', $sol$def max_subarray_sum(arr):
    if not arr:
        return 0
    max_sum = arr[0]
    current_sum = arr[0]
    for i in range(1, len(arr)):
        current_sum = max(arr[i], current_sum + arr[i])
        max_sum = max(max_sum, current_sum)
    return max_sum$sol$),
  ('algo-ch-knapsack-001', $sol$def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
            else:
                dp[i][w] = dp[i - 1][w]
    return dp[n][capacity]$sol$),
  ('algo-ch-lcs-001', $sol$def lcs_length(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]$sol$),
  ('algo-ch-linear-001', $sol$def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1$sol$),
  ('algo-ch-max-001', $sol$def find_min_max(arr):
    if not arr:
        return None
    min_val = arr[0]
    max_val = arr[0]
    for num in arr[1:]:
        if num < min_val:
            min_val = num
        if num > max_val:
            max_val = num
    return (min_val, max_val)$sol$),
  ('algo-ch-merge-001', $sol$def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result$sol$),
  ('algo-ch-quick-001', $sol$def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)$sol$),
  ('algo-ch-selection-001', $sol$def selection_sort(arr):
    arr = arr.copy()
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr$sol$),
  ('algo-ch-twopointer-001', $sol$def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        current = arr[left] + arr[right]
        if current == target:
            return (left, right)
        elif current < target:
            left += 1
        else:
            right -= 1
    return (-1, -1)$sol$),
  ('auth-ch-001', $sol$function passwordProblems(pw) {
  const problems = [];
  if (pw.length < 8) problems.push('length');
  if (!/[A-Z]/.test(pw)) problems.push('upper');
  if (!/[a-z]/.test(pw)) problems.push('lower');
  if (!/[0-9]/.test(pw)) problems.push('digit');
  return problems.sort();
}$sol$),
  ('auth-ch-002', $sol$function jwtStatus(token, nowSeconds) {
  const parts = String(token).split('.');
  if (parts.length !== 3) return 'invalid';
  try {
    const json = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const payload = JSON.parse(json);
    if (typeof payload.exp !== 'number') return 'invalid';
    return payload.exp <= nowSeconds ? 'expired' : 'valid:' + payload.sub;
  } catch (e) {
    return 'invalid';
  }
}$sol$),
  ('auth-ch-003', $sol$class TokenStore {
  constructor() {
    this.n = 0;
    this.tokens = new Map();
  }
  issue(userId) {
    const t = 'rt-' + ++this.n;
    this.tokens.set(t, { userId, active: true });
    return t;
  }
  rotate(token) {
    const rec = this.tokens.get(token);
    if (!rec) return null;
    if (!rec.active) {
      for (const r of this.tokens.values()) if (r.userId === rec.userId) r.active = false;
      return null;
    }
    rec.active = false;
    return this.issue(rec.userId);
  }
  activeCount(userId) {
    let c = 0;
    for (const r of this.tokens.values()) if (r.userId === userId && r.active) c++;
    return c;
  }
}$sol$),
  ('auth-ch-004', $sol$const crypto = require('crypto');

function totp(secretHex, timeSeconds, digits = 6) {
  const counter = Math.floor(timeSeconds / 30);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', Buffer.from(secretHex, 'hex')).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  return String(code % 10 ** digits).padStart(digits, '0');
}$sol$),
  ('backend-ch-1', $sol$const express = require('express');
const app = express();
app.use(express.json());

let tasks = [];
let nextId = 1;

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const task = { id: nextId++, ...req.body, completed: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Not found' });
  Object.assign(task, req.body);
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  tasks.splice(index, 1);
  res.status(204).send();
});

app.listen(3000);$sol$),
  ('backend-ch-2', $sol$SELECT 
  u.name AS user_name,
  COUNT(DISTINCT p.id) AS posts_count,
  COUNT(c.id) AS comments_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY u.id, u.name
ORDER BY posts_count DESC;$sol$),
  ('backend-ch-3', $sol$const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token مطلوب' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token غير صالح' });
  }
};

module.exports = authMiddleware;$sol$),
  ('backend-ch-4', $sol$const rateLimiter = (maxRequests, windowMs) => {
  const requests = new Map();
  
  // تنظيف دوري
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requests.entries()) {
      if (now - data.windowStart > windowMs) {
        requests.delete(ip);
      }
    }
  }, windowMs);
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, windowStart: now });
      return next();
    }
    
    const ipData = requests.get(ip);
    
    if (now - ipData.windowStart > windowMs) {
      ipData.count = 1;
      ipData.windowStart = now;
      return next();
    }
    
    if (ipData.count >= maxRequests) {
      return res.status(429).json({
        error: 'تجاوزت الحد المسموح',
        retryAfter: Math.ceil((windowMs - (now - ipData.windowStart)) / 1000)
      });
    }
    
    ipData.count++;
    next();
  };
};

module.exports = rateLimiter;$sol$),
  ('backend-ch-5', $sol$const mongoose = require('mongoose');
const express = require('express');
const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost/shop');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ['electronics', 'clothing', 'food'] },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Create
app.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all
app.get('/products', async (req, res) => {
  const { category, inStock } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (inStock) filter.inStock = inStock === 'true';
  
  const products = await Product.find(filter);
  res.json(products);
});

// Read one
app.get('/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'غير موجود' });
  res.json(product);
});

// Update
app.put('/products/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) return res.status(404).json({ error: 'غير موجود' });
  res.json(product);
});

// Delete
app.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.listen(3000);$sol$),
  ('backend-ch-6', $sol$const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = new Map();

io.on('connection', (socket) => {
  console.log('مستخدم جديد:', socket.id);
  
  // تسجيل المستخدم
  socket.on('register', (username) => {
    users.set(socket.id, username);
    io.emit('userJoined', { username, users: [...users.values()] });
  });
  
  // إرسال رسالة
  socket.on('message', (data) => {
    const username = users.get(socket.id);
    io.emit('message', {
      username,
      text: data.text,
      timestamp: new Date()
    });
  });
  
  // الانضمام لغرفة
  socket.on('joinRoom', (room) => {
    socket.join(room);
    socket.to(room).emit('notification', `${users.get(socket.id)} انضم للغرفة`);
  });
  
  // رسالة للغرفة
  socket.on('roomMessage', ({ room, text }) => {
    io.to(room).emit('message', {
      username: users.get(socket.id),
      text,
      room,
      timestamp: new Date()
    });
  });
  
  // قطع الاتصال
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    io.emit('userLeft', { username, users: [...users.values()] });
  });
});

server.listen(3000);$sol$),
  ('backend-ch-7', $sol$const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// التأكد من وجود مجلد الرفع
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// إعدادات التخزين
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.random().toString(36).slice(2);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

// فلتر الملفات (صور فقط)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedTypes.test(file.mimetype);
  
  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error('فقط الصور مسموحة!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// رفع ملف واحد
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم رفع ملف' });
  }
  res.json({
    message: 'تم الرفع',
    file: {
      filename: req.file.filename,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    }
  });
});

// رفع عدة ملفات
app.post('/upload-multiple', upload.array('images', 5), (req, res) => {
  const files = req.files.map(f => ({
    filename: f.filename,
    size: f.size,
    url: `/uploads/${f.filename}`
  }));
  res.json({ message: 'تم الرفع', files });
});

// تقديم الملفات
app.use('/uploads', express.static(uploadDir));

// معالجة أخطاء Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: err.message });
});

app.listen(3000);$sol$),
  ('backend-ch-8', $sol$const express = require('express');
const Redis = require('ioredis');

const app = express();
app.use(express.json());

const redis = new Redis();

// Middleware للـ Caching
const cache = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // تعديل res.json لحفظ النتيجة
      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        await redis.setex(key, duration, JSON.stringify(data));
        return originalJson(data);
      };
      
      next();
    } catch (err) {
      next();
    }
  };
};

// بيانات وهمية
const fetchProducts = async () => {
  await new Promise(r => setTimeout(r, 1000)); // محاكاة تأخير
  return [
    { id: 1, name: 'منتج 1', price: 100 },
    { id: 2, name: 'منتج 2', price: 200 },
  ];
};

// Route مع cache (60 ثانية)
app.get('/products', cache(60), async (req, res) => {
  const products = await fetchProducts();
  res.json(products);
});

// إضافة منتج (invalidate cache)
app.post('/products', async (req, res) => {
  // إضافة المنتج...
  
  // حذف الـ cache
  await redis.del('cache:/products');
  
  res.status(201).json({ message: 'تم الإضافة' });
});

// حذف كل الـ cache
app.delete('/cache', async (req, res) => {
  const keys = await redis.keys('cache:*');
  if (keys.length) {
    await redis.del(...keys);
  }
  res.json({ message: 'تم مسح الـ cache', cleared: keys.length });
});

app.listen(3000);$sol$),
  ('ch-1', $sol$print("Hello, World!")$sol$),
  ('ch-2', $sol$def add(a, b):
    return a + b$sol$),
  ('ch-3', $sol$def reverse_string(text):
    return text[::-1]$sol$),
  ('ch-4', $sol$def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True$sol$),
  ('ch-5', $sol$def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b$sol$),
  ('ch-6', $sol$def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr$sol$),
  ('ch-7', $sol$def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1$sol$),
  ('ch-8', $sol$def is_balanced(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for char in s:
        if char in '([{':
            stack.append(char)
        elif char in ')]}':
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
    return len(stack) == 0$sol$),
  ('ch-9', $sol$def spiral_order(matrix):
    if not matrix:
        return []
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    
    while top <= bottom and left <= right:
        for i in range(left, right + 1):
            result.append(matrix[top][i])
        top += 1
        
        for i in range(top, bottom + 1):
            result.append(matrix[i][right])
        right -= 1
        
        if top <= bottom:
            for i in range(right, left - 1, -1):
                result.append(matrix[bottom][i])
            bottom -= 1
        
        if left <= right:
            for i in range(bottom, top - 1, -1):
                result.append(matrix[i][left])
            left += 1
    
    return result$sol$),
  ('cpp-ch-1', $sol$string reverseArray(vector<int> arr) {
    int start = 0;
    int end = arr.size() - 1;
    
    while (start < end) {
        int temp = arr[start];
        arr[start] = arr[end];
        arr[end] = temp;
        start++;
        end--;
    }
    
    string result;
    for (int i = 0; i < (int)arr.size(); i++) {
        if (i > 0) result += " ";
        result += to_string(arr[i]);
    }
    return result;
}$sol$),
  ('cpp-ch-2', $sol$bool isPalindrome(string text) {
    string clean = "";
    for (char c : text) {
        if (isalnum(c)) {
            clean += tolower(c);
        }
    }
    
    int left = 0;
    int right = clean.length() - 1;
    
    while (left < right) {
        if (clean[left] != clean[right]) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}$sol$),
  ('cpp-ch-3', $sol$long long fibonacci(int n) {
    if (n <= 1) return n;
    
    long long a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        long long temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}$sol$),
  ('cpp-ch-beg-1', $sol$int sumToN(int n) {
    return n * (n + 1) / 2;
}

// أو باستخدام حلقة:
int sumToNLoop(int n) {
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}$sol$),
  ('cpp-ch-beg-2', $sol$int maxOfThree(int a, int b, int c) {
    int max = a;
    if (b > max) max = b;
    if (c > max) max = c;
    return max;
}

// أو باستخدام الدالة المدمجة:
#include <algorithm>
int maxOfThreeSTL(int a, int b, int c) {
    return max({a, b, c});
}$sol$),
  ('cpp-ch-beg-3', $sol$void printTable(int n) {
    for (int i = 1; i <= 10; i++) {
        cout << n << " x " << i << " = " << n * i << endl;
    }
}$sol$),
  ('cpp-ch-beg-4', $sol$bool isPrime(int n) {
    if (n < 2) return false;
    if (n == 2) return true;
    if (n % 2 == 0) return false;
    
    for (int i = 3; i * i <= n; i += 2) {
        if (n % i == 0) return false;
    }
    return true;
}$sol$),
  ('cpp-ch-beg-5', $sol$long long factorial(int n) {
    if (n <= 1) return 1;
    long long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// أو بالتكرار:
long long factorialRecursive(int n) {
    if (n <= 1) return 1;
    return n * factorialRecursive(n - 1);
}$sol$),
  ('cpp-ch-int-1', $sol$int binarySearch(vector<int> arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}$sol$),
  ('cpp-ch-int-2', $sol$string bubbleSort(vector<int> arr) {
    int size = arr.size();
    for (int i = 0; i < size - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < size - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    string result;
    for (int i = 0; i < size; i++) {
        if (i > 0) result += " ";
        result += to_string(arr[i]);
    }
    return result;
}$sol$),
  ('cpp-ch-int-3', $sol$struct Node {
    int data;
    Node* next;
};

class LinkedList {
public:
    Node* head;
    
    LinkedList() : head(nullptr) {}
    
    void insert(int value) {
        Node* newNode = new Node();
        newNode->data = value;
        newNode->next = nullptr;
        
        if (head == nullptr) {
            head = newNode;
        } else {
            Node* temp = head;
            while (temp->next != nullptr) {
                temp = temp->next;
            }
            temp->next = newNode;
        }
    }
    
    string print() {
        string result;
        Node* temp = head;
        while (temp != nullptr) {
            result += to_string(temp->data) + " -> ";
            temp = temp->next;
        }
        result += "NULL";
        return result;
    }
};

string solution(vector<int> vals) {
    LinkedList list;
    for (int v : vals) list.insert(v);
    return list.print();
}$sol$),
  ('cpp-ch-int-4', $sol$class Stack {
private:
    int arr[100];
    int topIndex;
public:
    Stack() : topIndex(-1) {}
    
    void push(int value) {
        if (topIndex >= 99) return;
        arr[++topIndex] = value;
    }
    
    int pop() {
        if (isEmpty()) return -1;
        return arr[topIndex--];
    }
    
    int top() {
        if (isEmpty()) return -1;
        return arr[topIndex];
    }
    
    bool isEmpty() {
        return topIndex == -1;
    }
};

int solution(vector<int> vals) {
    Stack s;
    for (int v : vals) s.push(v);
    return s.pop();
}$sol$),
  ('cpp-ch-int-5', $sol$class Queue {
private:
    int arr[100];
    int front, rear, size;
public:
    Queue() : front(0), rear(-1), size(0) {}
    
    void enqueue(int value) {
        if (size >= 100) return;
        rear = (rear + 1) % 100;
        arr[rear] = value;
        size++;
    }
    
    int dequeue() {
        if (isEmpty()) return -1;
        int value = arr[front];
        front = (front + 1) % 100;
        size--;
        return value;
    }
    
    bool isEmpty() {
        return size == 0;
    }
};

int solution(vector<int> vals) {
    Queue q;
    for (int v : vals) q.enqueue(v);
    return q.dequeue();
}$sol$),
  ('cppadv-ch-001', $sol$template <typename T>
T maxOf(const std::vector<T>& items) {
    T best = items[0];
    for (const T& x : items) if (best < x) best = x;
    return best;
}$sol$),
  ('cppadv-ch-002', $sol$std::string topWord(const std::string& text) {
    std::map<std::string, int> freq;
    std::istringstream in(text);
    std::string w;
    while (in >> w) freq[w]++;
    std::string best;
    int count = 0;
    for (const auto& [word, c] : freq) {
        if (c > count) { best = word; count = c; }
    }
    return best;
}$sol$),
  ('cppadv-ch-003', $sol$std::vector<int> evenSquaresDesc(std::vector<int> v) {
    std::vector<int> out;
    std::copy_if(v.begin(), v.end(), std::back_inserter(out), [](int x) { return x % 2 == 0; });
    std::transform(out.begin(), out.end(), out.begin(), [](int x) { return x * x; });
    std::sort(out.begin(), out.end(), std::greater<int>());
    return out;
}$sol$),
  ('cppadv-ch-004', $sol$int safeDivide(int a, int b) {
    if (b == 0) throw std::invalid_argument("division by zero");
    return a / b;
}

std::string tryDivide(int a, int b) {
    try {
        return "ok:" + std::to_string(safeDivide(a, b));
    } catch (const std::invalid_argument& e) {
        return std::string("error:") + e.what();
    }
}$sol$),
  ('cppadv-ch-005', $sol$std::optional<int> findIndex(const std::vector<int>& v, int target) {
    for (size_t i = 0; i < v.size(); i++)
        if (v[i] == target) return static_cast<int>(i);
    return std::nullopt;
}

std::string describe(const std::vector<int>& v, int target) {
    auto idx = findIndex(v, target);
    return idx ? "found at " + std::to_string(*idx) : "not found";
}$sol$),
  ('cppadv-ch-006', $sol$std::vector<int> mergeIntervals(std::vector<std::pair<int, int>> intervals) {
    std::sort(intervals.begin(), intervals.end());
    std::vector<std::pair<int, int>> merged;
    for (const auto& iv : intervals) {
        if (!merged.empty() && iv.first <= merged.back().second)
            merged.back().second = std::max(merged.back().second, iv.second);
        else
            merged.push_back(iv);
    }
    std::vector<int> out;
    for (const auto& m : merged) { out.push_back(m.first); out.push_back(m.second); }
    return out;
}$sol$),
  ('cppoop-ch-001', $sol$class Rectangle {
    int w, h;
public:
    Rectangle(int w, int h) : w(w), h(h) {}
    int area() { return w * h; }
    int perimeter() { return 2 * (w + h); }
};$sol$),
  ('cppoop-ch-002', $sol$class Account {
    int bal;
public:
    Account(int initial) : bal(initial) {}
    void deposit(int amount) { if (amount > 0) bal += amount; }
    bool withdraw(int amount) {
        if (amount <= 0 || amount > bal) return false;
        bal -= amount;
        return true;
    }
    int balance() { return bal; }
};$sol$),
  ('cppoop-ch-003', $sol$class Ticket {
    static inline int counter = 0;
    int number;
public:
    Ticket() : number(++counter) {}
    int id() { return number; }
    static int total() { return counter; }
};$sol$),
  ('cppoop-ch-004', $sol$class Fraction {
    int n, d;
    void simplify() {
        if (d < 0) { n = -n; d = -d; }
        int g = std::gcd(std::abs(n), d);
        if (g > 1) { n /= g; d /= g; }
    }
public:
    Fraction(int n, int d) : n(n), d(d) { simplify(); }
    Fraction operator+(const Fraction& o) const { return Fraction(n * o.d + o.n * d, d * o.d); }
    bool operator==(const Fraction& o) const { return n == o.n && d == o.d; }
    std::string str() const { return std::to_string(n) + "/" + std::to_string(d); }
};$sol$),
  ('cppoop-ch-005', $sol$class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() {}
};

class Square : public Shape {
    double s;
public:
    Square(double s) : s(s) {}
    double area() const override { return s * s; }
};

class Circle : public Shape {
    double r;
public:
    Circle(double r) : r(r) {}
    double area() const override { return 3.14159 * r * r; }
};

double totalArea(const std::vector<Shape*>& shapes) {
    double sum = 0;
    for (const Shape* s : shapes) sum += s->area();
    return sum;
}$sol$),
  ('cppoop-ch-006', $sol$class Buffer {
    int* data;
    int n;
public:
    Buffer(int n) : data(new int[n]()), n(n) {}
    ~Buffer() { delete[] data; }
    Buffer(const Buffer& o) : data(new int[o.n]), n(o.n) {
        std::copy(o.data, o.data + n, data);
    }
    Buffer& operator=(const Buffer& o) {
        if (this != &o) {
            int* fresh = new int[o.n];
            std::copy(o.data, o.data + o.n, fresh);
            delete[] data;
            data = fresh;
            n = o.n;
        }
        return *this;
    }
    void set(int i, int v) { data[i] = v; }
    int get(int i) const { return data[i]; }
    int size() const { return n; }
};$sol$),
  ('cppoop-ch-007', $sol$class Employee {
public:
    std::string name;
    Employee(std::string n) : name(n) {}
    virtual int salary() const = 0;
    virtual ~Employee() {}
};

class Engineer : public Employee {
    int base;
public:
    Engineer(std::string n, int b) : Employee(n), base(b) {}
    int salary() const override { return base; }
};

class Manager : public Employee {
    int base, reports;
public:
    Manager(std::string n, int b, int r) : Employee(n), base(b), reports(r) {}
    int salary() const override { return base + 100 * reports; }
};

std::string payroll(const std::vector<Employee*>& staff) {
    std::vector<Employee*> v(staff);
    std::sort(v.begin(), v.end(), [](const Employee* a, const Employee* b) {
        if (a->salary() != b->salary()) return a->salary() > b->salary();
        return a->name < b->name;
    });
    std::string out;
    for (size_t i = 0; i < v.size(); i++) {
        if (i) out += ",";
        out += v[i]->name;
    }
    return out;
}

int totalPayroll(const std::vector<Employee*>& staff) {
    int sum = 0;
    for (const Employee* e : staff) sum += e->salary();
    return sum;
}$sol$),
  ('css-ch-1', $sol$.button {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    padding: 15px 30px;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
}

.button:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}$sol$),
  ('css-ch-2', $sol$.product-card {
    width: 300px;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.product-info {
    padding: 20px;
}

.product-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 10px;
}

.product-price {
    color: #3498db;
    font-size: 1.5rem;
    font-weight: bold;
}$sol$),
  ('css-ch-3', $sol$.nav {
    display: flex;
    justify-content: center;
    gap: 30px;
    padding: 20px;
    background: #1a1a2e;
}

.nav-link {
    position: relative;
    color: #fff;
    text-decoration: none;
    font-size: 16px;
    padding: 10px 0;
    transition: color 0.3s;
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    transition: width 0.3s ease;
}

.nav-link:hover {
    color: #667eea;
}

.nav-link:hover::after {
    width: 100%;
}$sol$),
  ('css-ch-4', $sol$.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(102, 126, 234, 0.2);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* نسخة متقدمة */
.spinner-advanced {
    width: 50px;
    height: 50px;
    position: relative;
}

.spinner-advanced::before,
.spinner-advanced::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
}

.spinner-advanced::before {
    width: 100%;
    height: 100%;
    background: rgba(102, 126, 234, 0.3);
}

.spinner-advanced::after {
    width: 70%;
    height: 70%;
    top: 15%;
    left: 15%;
    background: #667eea;
    animation-delay: -1s;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.3);
        opacity: 0.5;
    }
}$sol$),
  ('css-ch-5', $sol$:root {
    --bg-color: #ffffff;
    --text-color: #1a1a2e;
    --card-bg: #f5f5f5;
    --primary: #667eea;
}

.dark-mode {
    --bg-color: #1a1a2e;
    --text-color: #ffffff;
    --card-bg: #2a2a4e;
}

body {
    background: var(--bg-color);
    color: var(--text-color);
    transition: background 0.3s, color 0.3s;
}

.toggle-switch {
    width: 60px;
    height: 30px;
    background: var(--card-bg);
    border-radius: 15px;
    position: relative;
    cursor: pointer;
    transition: background 0.3s;
}

.toggle-switch::before {
    content: '☀️';
    position: absolute;
    width: 26px;
    height: 26px;
    background: var(--primary);
    border-radius: 50%;
    top: 2px;
    left: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: transform 0.3s, content 0.3s;
}

.dark-mode .toggle-switch::before {
    content: '🌙';
    transform: translateX(30px);
}$sol$),
  ('css-ch-beg-1', $sol$.title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #333;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.paragraph {
    font-size: 1rem;
    line-height: 1.8;
    color: #666;
    text-align: justify;
}

.highlight {
    background: linear-gradient(120deg, #ffd700 0%, #ffa500 100%);
    padding: 0 5px;
    border-radius: 3px;
}$sol$),
  ('css-ch-beg-2', $sol$.custom-list {
    list-style: none;
    padding: 0;
}

.custom-list li {
    position: relative;
    padding: 10px 0 10px 30px;
    border-bottom: 1px solid #eee;
}

.custom-list li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #4CAF50;
    font-weight: bold;
}$sol$),
  ('css-ch-beg-3', $sol$.box-shadow {
    width: 200px;
    height: 100px;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1),
                0 10px 20px rgba(0, 0, 0, 0.05);
}

.text-shadow {
    font-size: 2rem;
    color: #333;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.bordered {
    border: 3px solid #3498db;
    border-radius: 10px;
    padding: 20px;
    outline: 3px dashed #e74c3c;
    outline-offset: 5px;
}$sol$),
  ('css-ch-int-1', $sol$.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 20px;
    flex-wrap: wrap;
}

.item {
    flex: 1 1 200px;
    min-width: 150px;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    text-align: center;
    color: white;
}$sol$),
  ('css-ch-int-2', $sol$.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px;
}

.grid-item {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
}

.grid-item:hover {
    transform: scale(1.02);
}

/* عنصر يأخذ مساحة أكبر */
.grid-item.featured {
    grid-column: span 2;
}$sol$),
  ('css-ch-int-3', $sol$.card {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 30px;
    padding: 30px;
    background: white;
    border-radius: 16px;
}

.card-image {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-radius: 12px;
}

.card-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

@media (max-width: 768px) {
    .card {
        grid-template-columns: 1fr;
        padding: 20px;
    }
    
    .card-image {
        height: 200px;
    }
    
    .card-content {
        text-align: center;
    }
}

@media (max-width: 480px) {
    .card {
        padding: 15px;
    }
    
    .card-image {
        height: 150px;
    }
}$sol$),
  ('css-ch-int-4', $sol$.form-group {
    position: relative;
    margin-bottom: 25px;
}

.input-field {
    width: 100%;
    padding: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    background: transparent;
    transition: border-color 0.3s, box-shadow 0.3s;
}

.input-field:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.input-label {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    pointer-events: none;
    transition: all 0.3s;
}

.input-field:focus + .input-label,
.input-field:not(:placeholder-shown) + .input-label {
    top: 0;
    font-size: 12px;
    background: white;
    padding: 0 5px;
    color: #667eea;
}$sol$),
  ('cssx-ch-001', $sol$.center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}$sol$),
  ('cssx-ch-002', $sol$.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}$sol$),
  ('cssx-ch-003', $sol$.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 600px) {
  .cards {
    grid-template-columns: 1fr;
  }
}$sol$),
  ('cssx-ch-004', $sol$:root {
  --primary: #6d28d9;
  --bg: #ffffff;
}

body {
  background: var(--bg);
}

.btn {
  background: var(--primary);
}

.dark {
  --bg: #0f0f1e;
}$sol$),
  ('cybd-ch-001', $sol$def cookie_issues(header):
    parts = [p.strip().split("=")[0].lower() for p in header.split(";")]
    required = {"httponly": "HttpOnly", "secure": "Secure", "samesite": "SameSite"}
    return sorted(name for key, name in required.items() if key not in parts)$sol$),
  ('cybd-ch-002', $sol$import re


def phishing_flags(url):
    flags = []
    if "@" in url:
        flags.append("at_sign")
    if not url.lower().startswith("https://"):
        flags.append("no_https")
    host = re.sub(r"^[a-zA-Z]+://", "", url).split("/")[0].split("@")[-1].split(":")[0]
    if re.fullmatch(r"\d{1,3}(\.\d{1,3}){3}", host):
        flags.append("ip_host")
    if host.count(".") > 3:
        flags.append("many_subdomains")
    return sorted(flags)$sol$),
  ('cybd-ch-003', $sol$import hashlib
import hmac


def verify_integrity(content, expected_hex):
    actual = hashlib.sha256(content.encode("utf-8")).hexdigest()
    return hmac.compare_digest(actual, expected_hex.lower())$sol$),
  ('cybd-ch-004', $sol$ALLOWED = {"users": {"id", "name", "email", "role"}}


def build_select(table, filters):
    if table not in ALLOWED:
        raise ValueError("table not allowed")
    cols = sorted(filters)
    for c in cols:
        if c not in ALLOWED[table]:
            raise ValueError("column not allowed")
    sql = f"SELECT * FROM {table}"
    if cols:
        sql += " WHERE " + " AND ".join(f"{c} = ?" for c in cols)
    return (sql, [filters[c] for c in cols])$sol$),
  ('cybd-ch-005', $sol$def escape_html(text):
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#x27;")
    )$sol$),
  ('cybd-ch-006', $sol$def severity(cvss):
    if cvss >= 9:
        return "critical"
    if cvss >= 7:
        return "high"
    if cvss >= 4:
        return "medium"
    return "low"


def prioritize(findings):
    return [f["id"] for f in sorted(findings, key=lambda f: (-f["cvss"], f["id"]))]$sol$),
  ('cyber-ch-1', $sol$def caesar_decrypt(ciphertext, shift):
    result = ""
    for char in ciphertext:
        if char.isalpha():
            ascii_offset = ord('A') if char.isupper() else ord('a')
            decrypted = (ord(char) - ascii_offset - shift) % 26
            result += chr(decrypted + ascii_offset)
        else:
            result += char
    return result$sol$),
  ('cyber-ch-2', $sol$import re

def detect_sqli(input_string):
    patterns = [
        r"('\s*OR\s*')|('\s*or\s*')",
        r"(--)",
        r"(;\s*(DROP|SELECT|INSERT|UPDATE|DELETE|ALTER|CREATE)\b)",
        r"(UNION\s+SELECT)",
        r"(DROP\s+TABLE)",
        r"(INSERT\s+INTO)",
        r"(SELECT\s+\*)",
        r"(1\s*=\s*1)",
        r"(admin\s*'--)"
    ]
    
    for pattern in patterns:
        if re.search(pattern, input_string, re.IGNORECASE):
            return True
    return False$sol$),
  ('cyber-ch-3', $sol$import re

def analyze_password(password):
    score = 0
    tips = []
    
    # الطول
    if len(password) >= 8:
        score += 20
    else:
        tips.append("اجعلها 8 أحرف على الأقل")
    
    if len(password) >= 12:
        score += 10
    
    if len(password) >= 16:
        score += 10
    
    # التنوع
    if re.search(r'[a-z]', password):
        score += 10
    else:
        tips.append("أضف أحرف صغيرة")
    
    if re.search(r'[A-Z]', password):
        score += 15
    else:
        tips.append("أضف أحرف كبيرة")
    
    if re.search(r'[0-9]', password):
        score += 15
    else:
        tips.append("أضف أرقام")
    
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 20
    else:
        tips.append("أضف رموز خاصة")
    
    strength = "weak" if score < 40 else "medium" if score < 70 else "strong"
    
    return {"score": min(score, 100), "strength": strength, "tips": tips}$sol$),
  ('cyber-ch-base64-001', $sol$def base64_encode(text):
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    data = text.encode()
    result = ""
    for i in range(0, len(data), 3):
        chunk = data[i:i + 3]
        n = int.from_bytes(chunk + b"\x00" * (3 - len(chunk)), "big")
        chars = [alphabet[(n >> shift) & 63] for shift in (18, 12, 6, 0)]
        result += "".join(chars[:len(chunk) + 1]) + "=" * (3 - len(chunk))
    return result$sol$),
  ('cyber-ch-bruteforce-001', $sol$def brute_force_count(charset, length):
    return len(charset) ** length$sol$),
  ('cyber-ch-csrf-001', $sol$import secrets
import hmac
import hashlib

def generate_csrf_token(secret_key, user_id):
    """
    ولّد CSRF token فريد للمستخدم
    """
    # توليد random nonce
    nonce = secrets.token_hex(16)
    
    # إنشاء signature = HMAC(secret_key, user_id + nonce)
    message = f"{user_id}:{nonce}".encode()
    signature = hmac.new(
        secret_key.encode(),
        message,
        hashlib.sha256
    ).hexdigest()
    
    # Token = nonce:signature
    token = f"{nonce}:{signature}"
    return token

def verify_csrf_token(token, secret_key, user_id):
    """
    تحقق من صحة CSRF token
    """
    try:
        # فصل nonce و signature
        nonce, signature = token.split(':')
        
        # إعادة حساب signature
        message = f"{user_id}:{nonce}".encode()
        expected_signature = hmac.new(
            secret_key.encode(),
            message,
            hashlib.sha256
        ).hexdigest()
        
        # مقارنة آمنة
        return hmac.compare_digest(signature, expected_signature)
    except:
        return False$sol$),
  ('cyber-ch-emailval-001', $sol$def is_valid_email(email):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))$sol$),
  ('cyber-ch-hash-001', $sol$import hashlib

def crack_md5(target_hash, wordlist):
    """
    حاول كسر هاش MD5 باستخدام قائمة كلمات
    """
    for word in wordlist:
        # حساب هاش الكلمة
        word_hash = hashlib.md5(word.encode()).hexdigest()
        
        # مقارنة مع الهدف
        if word_hash == target_hash:
            return word
    
    return None

# اختبار
wordlist = ['password', '123456', 'admin', 'letmein', 'welcome']
target = '21232f297a57a5a743894a0e4a801fc3'  # admin

result = crack_md5(target, wordlist)
print(f"الكلمة: {result}")  # admin$sol$),
  ('cyber-ch-hash-compare-001', $sol$import hashlib
import hmac

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hash_value):
    return hmac.compare_digest(hash_password(password), hash_value)$sol$),
  ('cyber-ch-http-001', $sol$def parse_http_request(request_text):
    lines = request_text.strip().split('\n')

    # السطر الأول: Method Path Version
    method, path, version = lines[0].split()

    # باقي الأسطر: Header: Value
    headers = {}
    for line in lines[1:]:
        if ':' in line:
            key, value = line.split(':', 1)
            headers[key.strip()] = value.strip()

    return {
        'method': method,
        'path': path,
        'version': version,
        'headers': headers,
    }$sol$),
  ('cyber-ch-ipvalidator-001', $sol$def is_valid_ipv4(ip):
    parts = ip.split('.')
    if len(parts) != 4:
        return False
    for part in parts:
        if not part.isdigit():
            return False
        num = int(part)
        if num < 0 or num > 255:
            return False
        if len(part) > 1 and part[0] == '0':
            return False
    return True$sol$),
  ('cyber-ch-jwt-decode-001', $sol$def decode_jwt(token):
    import base64
    import json
    parts = token.split('.')
    if len(parts) != 3:
        return None
    payload = parts[1]
    padding = 4 - len(payload) % 4
    if padding != 4:
        payload += '=' * padding
    decoded = base64.b64decode(payload).decode()
    return json.loads(decoded)$sol$),
  ('cyber-ch-port-001', $sol$def identify_port(port):
    services = {
        21: "FTP",
        22: "SSH",
        23: "Telnet",
        25: "SMTP",
        53: "DNS",
        80: "HTTP",
        443: "HTTPS",
        3306: "MySQL",
        5432: "PostgreSQL",
        27017: "MongoDB",
        6379: "Redis"
    }
    return services.get(port, "Unknown")$sol$),
  ('cyber-ch-urlparse-001', $sol$def parse_url(url):
    from urllib.parse import urlparse
    parsed = urlparse(url)
    return {
        'protocol': parsed.scheme,
        'domain': parsed.netloc,
        'path': parsed.path or '/'
    }$sol$),
  ('cyber-ch-vigenere-001', $sol$def vigenere_encrypt(plaintext, key):
    result = []
    key = key.upper()
    plaintext = plaintext.upper()
    key_idx = 0
    for char in plaintext:
        if char.isalpha():
            shift = ord(key[key_idx % len(key)]) - ord('A')
            encrypted = chr((ord(char) - ord('A') + shift) % 26 + ord('A'))
            result.append(encrypted)
            key_idx += 1
        else:
            result.append(char)
    return ''.join(result)$sol$),
  ('cyber-ch-xor-001', $sol$def xor_encrypt(text, key):
    result = []
    for i, char in enumerate(text):
        xored = ord(char) ^ ord(key[i % len(key)])
        result.append(chr(xored))
    return ''.join(result)$sol$),
  ('cyber-ch-xss-001', $sol$def sanitize_input(user_input):
    """
    تنظيف المدخلات من أكواد XSS
    """
    if not user_input:
        return ""
    
    # تحويل الأحرف الخاصة
    replacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    }
    
    result = user_input
    for char, entity in replacements.items():
        result = result.replace(char, entity)
    
    return result

# اختبار
malicious = '<script>alert("XSS")</script>'
safe = sanitize_input(malicious)
print(safe)  # &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;$sol$),
  ('deploy-challenge-1', $sol$<!DOCTYPE html>
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
</html>$sol$),
  ('deploy-challenge-2', $sol$const packageJson = {
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
console.log(JSON.stringify(packageJson, null, 2));$sol$),
  ('deploy-challenge-3', $sol$function loadConfig() {
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

module.exports = loadConfig();$sol$),
  ('deploy-challenge-4', $sol$# Dockerfile
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
CMD ["node", "index.js"]$sol$),
  ('dl-ch-001', $sol$import math


def relu(x):
    return max(0, x)


def sigmoid(x):
    return round(1 / (1 + math.exp(-x)), 4)


def softmax(values):
    m = max(values)
    exps = [math.exp(v - m) for v in values]
    total = sum(exps)
    return [round(e / total, 4) for e in exps]$sol$),
  ('dl-ch-002', $sol$import math


def mse(y_true, y_pred):
    return round(sum((t - p) ** 2 for t, p in zip(y_true, y_pred)) / len(y_true), 4)


def binary_cross_entropy(y_true, y_pred):
    eps = 1e-7
    total = 0.0
    for t, p in zip(y_true, y_pred):
        p = min(max(p, eps), 1 - eps)
        total += -(t * math.log(p) + (1 - t) * math.log(1 - p))
    return round(total / len(y_true), 4)$sol$),
  ('dl-ch-003', $sol$def dense_forward(x, W, b):
    out = []
    for j in range(len(b)):
        z = sum(x[i] * W[i][j] for i in range(len(x))) + b[j]
        out.append(max(0, z))
    return out$sol$),
  ('dl-ch-004', $sol$def gradient_descent(lr, steps, start):
    x = start
    for _ in range(steps):
        x -= lr * 2 * (x - 3)
    return round(x, 4)$sol$),
  ('dl-ch-005', $sol$def conv2d(image, kernel):
    kh, kw = len(kernel), len(kernel[0])
    out = []
    for i in range(len(image) - kh + 1):
        row = []
        for j in range(len(image[0]) - kw + 1):
            row.append(sum(image[i + a][j + b] * kernel[a][b] for a in range(kh) for b in range(kw)))
        out.append(row)
    return out


def max_pool(matrix, size):
    out = []
    for i in range(0, len(matrix) - size + 1, size):
        row = []
        for j in range(0, len(matrix[0]) - size + 1, size):
            row.append(max(matrix[i + a][j + b] for a in range(size) for b in range(size)))
        out.append(row)
    return out$sol$),
  ('dl-ch-006', $sol$def batch_norm(values, eps=1e-5):
    n = len(values)
    mean = sum(values) / n
    var = sum((v - mean) ** 2 for v in values) / n
    return [round((v - mean) / (var + eps) ** 0.5, 3) for v in values]$sol$),
  ('dl-ch-007', $sol$def early_stop_epoch(val_losses, patience):
    best = float("inf")
    wait = 0
    for epoch, loss in enumerate(val_losses):
        if loss < best:
            best = loss
            wait = 0
        else:
            wait += 1
            if wait >= patience:
                return epoch
    return len(val_losses) - 1$sol$),
  ('dl-ch-008', $sol$import math


def attention_weights(query, keys):
    d = len(query)
    scores = [sum(q * k for q, k in zip(query, key)) / math.sqrt(d) for key in keys]
    m = max(scores)
    exps = [math.exp(s - m) for s in scores]
    total = sum(exps)
    return [round(e / total, 3) for e in exps]$sol$),
  ('ds-ch-bfs-001', $sol$def bfs(graph, start):
    from collections import deque
    visited = set()
    queue = deque([start])
    visited.add(start)
    result = []
    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in sorted(graph.get(node, [])):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return result$sol$),
  ('ds-ch-dfs-001', $sol$def dfs(graph, start):
    visited = set()
    result = []
    def helper(node):
        if node in visited:
            return
        visited.add(node)
        result.append(node)
        for neighbor in sorted(graph.get(node, [])):
            helper(neighbor)
    helper(start)
    return result$sol$),
  ('ds-ch-graph-cycle-001', $sol$def has_cycle(graph):
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node: WHITE for node in graph}
    def dfs(node):
        color[node] = GRAY
        for neighbor in graph.get(node, []):
            if color.get(neighbor, WHITE) == GRAY:
                return True
            if color.get(neighbor, WHITE) == WHITE and dfs(neighbor):
                return True
        color[node] = BLACK
        return False
    for node in graph:
        if color[node] == WHITE:
            if dfs(node):
                return True
    return False$sol$),
  ('ds-ch-hashtable-001', $sol$def hashtable_operations(operations):
    table = {}
    results = []
    for op in operations:
        if op[0] == "set":
            table[op[1]] = op[2]
        elif op[0] == "get":
            results.append(table.get(op[1], None))
        elif op[0] == "delete":
            if op[1] in table:
                del table[op[1]]
                results.append(True)
            else:
                results.append(False)
    return results$sol$),
  ('ds-ch-linkedlist-001', $sol$def reverse_linked_list(arr):
    prev = None
    result = []
    for i in range(len(arr) - 1, -1, -1):
        result.append(arr[i])
    return result$sol$),
  ('ds-ch-lru-001', $sol$def lru_cache_operations(capacity, operations):
    from collections import OrderedDict
    cache = OrderedDict()
    results = []
    for op in operations:
        if op[0] == "get":
            key = op[1]
            if key in cache:
                cache.move_to_end(key)
                results.append(cache[key])
            else:
                results.append(-1)
        elif op[0] == "put":
            key, value = op[1], op[2]
            if key in cache:
                cache.move_to_end(key)
            cache[key] = value
            if len(cache) > capacity:
                cache.popitem(last=False)
    return results$sol$),
  ('ds-ch-minheap-001', $sol$def k_smallest(arr, k):
    import heapq
    return sorted(heapq.nsmallest(k, arr))$sol$),
  ('ds-ch-queue-001', $sol$def queue_operations(operations):
    from collections import deque
    queue = deque()
    results = []
    for op in operations:
        if op[0] == "enqueue":
            queue.append(op[1])
        elif op[0] == "dequeue":
            results.append(queue.popleft() if queue else -1)
        elif op[0] == "peek":
            results.append(queue[0] if queue else -1)
    return results$sol$),
  ('ds-ch-set-001', $sol$def set_union(set1, set2):
    return sorted(list(set(set1) | set(set2)))

def set_intersection(set1, set2):
    return sorted(list(set(set1) & set(set2)))

def set_difference(set1, set2):
    return sorted(list(set(set1) - set(set2)))$sol$),
  ('ds-ch-stack-001', $sol$def stack_operations(operations):
    stack = []
    results = []
    for op in operations:
        if op[0] == "push":
            stack.append(op[1])
        elif op[0] == "pop":
            results.append(stack.pop() if stack else -1)
        elif op[0] == "peek":
            results.append(stack[-1] if stack else -1)
        elif op[0] == "is_empty":
            results.append(len(stack) == 0)
    return results$sol$),
  ('ds-ch-treetraversal-001', $sol$def inorder_traversal(tree):
    if not tree:
        return []
    result = []
    if len(tree) > 1:
        result.extend(inorder_traversal(tree[1]))
    result.append(tree[0])
    if len(tree) > 2:
        result.extend(inorder_traversal(tree[2]))
    return result$sol$),
  ('ds-ch-trie-001', $sol$def find_words_with_prefix(words, prefix):
    result = [w for w in words if w.startswith(prefix)]
    return sorted(result)$sol$),
  ('fire-ch-001', $sol$function pathKind(path) {
  if (!path) return 'invalid';
  const parts = path.split('/');
  if (parts.some((p) => p === '')) return 'invalid';
  return parts.length % 2 === 0 ? 'document' : 'collection';
}$sol$),
  ('fire-ch-002', $sol$function canUpdatePost(request, resource) {
  if (!request.auth) return false;
  const d = request.data || {};
  const title = typeof d.title === 'string' ? d.title : '';
  return (
    request.auth.uid === resource.ownerId &&
    d.ownerId === resource.ownerId &&
    title.length >= 1 &&
    title.length <= 100
  );
}$sol$),
  ('fire-ch-003', $sol$function nextPage(messages, pageSize, afterTs) {
  const sorted = messages
    .filter((m) => afterTs === null || m.ts > afterTs)
    .sort((a, b) => a.ts - b.ts);
  const page = sorted.slice(0, pageSize);
  const hasMore = sorted.length > pageSize;
  return { items: page.map((m) => m.text), nextCursor: hasMore ? page[page.length - 1].ts : null };
}$sol$),
  ('fire-ch-004', $sol$function allowedUploads(files, maxMB) {
  const limit = maxMB * 1024 * 1024;
  return files.filter((f) => String(f.type).startsWith('image/') && f.size <= limit).map((f) => f.name);
}$sol$),
  ('flutter-ch-counter-001', $sol$import 'package:flutter/material.dart';

class AdvancedCounter extends StatefulWidget {
  @override
  _AdvancedCounterState createState() => _AdvancedCounterState();
}

class _AdvancedCounterState extends State<AdvancedCounter>
    with SingleTickerProviderStateMixin {
  int _count = 0;
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1, end: 1.3).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _animate() {
    _controller.forward().then((_) => _controller.reverse());
  }

  void _increment() {
    setState(() => _count++);
    _animate();
  }

  void _decrement() {
    if (_count > 0) {
      setState(() => _count--);
      _animate();
    }
  }

  void _reset() {
    setState(() => _count = 0);
  }

  Color get _countColor {
    if (_count < 10) return Colors.green;
    if (_count < 50) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('العداد المتقدم'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _reset,
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('القيمة الحالية', style: TextStyle(fontSize: 18)),
            SizedBox(height: 16),
            ScaleTransition(
              scale: _scaleAnimation,
              child: Text(
                '$_count',
                style: TextStyle(
                  fontSize: 72,
                  fontWeight: FontWeight.bold,
                  color: _countColor,
                ),
              ),
            ),
            SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FloatingActionButton(
                  heroTag: 'dec',
                  onPressed: _decrement,
                  backgroundColor: Colors.red[400],
                  child: Icon(Icons.remove, size: 32),
                ),
                SizedBox(width: 32),
                FloatingActionButton(
                  heroTag: 'inc',
                  onPressed: _increment,
                  backgroundColor: Colors.green[400],
                  child: Icon(Icons.add, size: 32),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}$sol$),
  ('flutter-challenge-001', $sol$import 'package:flutter/material.dart';

String? validateEmail(String? value) {
  if (value == null || value.isEmpty) {
    return 'البريد الإلكتروني مطلوب';
  }
  if (!value.contains('@') || !value.contains('.')) {
    return 'بريد إلكتروني غير صالح';
  }
  return null;
}

String? validatePassword(String? value) {
  if (value == null || value.isEmpty) {
    return 'كلمة المرور مطلوبة';
  }
  if (value.length < 6) {
    return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
  }
  return null;
}

Map<String, dynamic> attemptLogin(String email, String password) {
  final emailError = validateEmail(email);
  final passwordError = validatePassword(password);
  if (emailError != null || passwordError != null) {
    return {'success': false, 'error': emailError ?? passwordError};
  }
  return {'success': true, 'error': null};
}$sol$),
  ('flutter-challenge-002', $sol$class Task {
  String id;
  String title;
  bool isDone;
  Task({required this.id, required this.title, this.isDone = false});
}

List<Task> addTask(List<Task> tasks, String title) {
  final newTask = Task(
    id: DateTime.now().millisecondsSinceEpoch.toString(),
    title: title,
  );
  return [...tasks, newTask];
}

List<Task> toggleTask(List<Task> tasks, String id) {
  return tasks.map((task) {
    if (task.id == id) {
      task.isDone = !task.isDone;
    }
    return task;
  }).toList();
}

List<Task> removeTask(List<Task> tasks, String id) {
  return tasks.where((task) => task.id != id).toList();
}

int completedCount(List<Task> tasks) {
  return tasks.where((task) => task.isDone).length;
}$sol$),
  ('flutter-challenge-003', $sol$class WeatherData {
  final String city;
  final double tempKelvin;
  final String description;
  final int humidity;
  WeatherData({required this.city, required this.tempKelvin, required this.description, required this.humidity});
}

double kelvinToCelsius(double kelvin) {
  return kelvin - 273.15;
}

double kelvinToFahrenheit(double kelvin) {
  return (kelvin - 273.15) * 9 / 5 + 32;
}

WeatherData parseWeatherJson(Map<String, dynamic> json) {
  return WeatherData(
    city: json['name'] ?? '',
    tempKelvin: (json['main']['temp'] as num).toDouble(),
    description: json['weather'][0]['description'] ?? '',
    humidity: json['main']['humidity'] ?? 0,
  );
}

String getWeatherAdvice(double tempCelsius) {
  if (tempCelsius < 0) return 'بارد جداً، ارتدِ ملابس ثقيلة';
  if (tempCelsius < 15) return 'بارد، ارتدِ معطفاً';
  if (tempCelsius < 30) return 'معتدل، طقس مناسب';
  return 'حار، اشرب ماءً كثيراً';
}$sol$),
  ('flutter-challenge-004', $sol$class Product {
  final String id;
  final String name;
  final double price;
  int quantity;
  Product({required this.id, required this.name, required this.price, this.quantity = 1});
}

class Cart {
  List<Product> items = [];

  void addItem(Product product) {
    final index = items.indexWhere((item) => item.id == product.id);
    if (index >= 0) {
      items[index].quantity++;
    } else {
      items.add(product);
    }
  }

  void removeItem(String productId) {
    items.removeWhere((item) => item.id == productId);
  }

  double get totalPrice {
    return items.fold(0.0, (sum, item) => sum + (item.price * item.quantity));
  }

  int get itemCount {
    return items.fold(0, (sum, item) => sum + item.quantity);
  }

  double applyDiscount(double percentage) {
    return totalPrice * (1 - percentage / 100);
  }
}$sol$),
  ('flutter-challenge-005', $sol$class Message {
  final String id;
  final String senderId;
  final String text;
  final DateTime timestamp;
  Message({required this.id, required this.senderId, required this.text, required this.timestamp});
}

String formatMessageTime(DateTime time) {
  final hour = time.hour.toString().padLeft(2, '0');
  final minute = time.minute.toString().padLeft(2, '0');
  return '$hour:$minute';
}

List<Message> sortMessages(List<Message> messages) {
  final sorted = List<Message>.from(messages);
  sorted.sort((a, b) => a.timestamp.compareTo(b.timestamp));
  return sorted;
}

Map<String, List<Message>> groupByDate(List<Message> messages) {
  final Map<String, List<Message>> grouped = {};
  for (final msg in messages) {
    final key = '${msg.timestamp.year}-${msg.timestamp.month.toString().padLeft(2, '0')}-${msg.timestamp.day.toString().padLeft(2, '0')}';
    grouped.putIfAbsent(key, () => []);
    grouped[key]!.add(msg);
  }
  return grouped;
}

int unreadCount(List<Message> messages, String lastReadId) {
  final index = messages.indexWhere((m) => m.id == lastReadId);
  if (index < 0) return messages.length;
  return messages.length - index - 1;
}$sol$),
  ('git-ch-basics-001', $sol$# الترتيب الصحيح:
# 1. C - git init
# 2. B - git add .
# 3. D - git commit -m "first commit"
# 4. E - git remote add origin URL
# 5. A - git push -u origin main

# الأوامر كاملة:
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/user/repo.git
git push -u origin main$sol$),
  ('html-ch-faq-001', $sol$<section class="faq">
  <h1>الأسئلة الشائعة</h1>
  
  <details open>
    <summary>ما هو Kodax؟</summary>
    <p>Kodax هو تطبيق تعليمي لتعلم البرمجة باللغة العربية.</p>
  </details>

  <details>
    <summary>هل التطبيق مجاني؟</summary>
    <p>نعم، Kodax مجاني بالكامل، والدورات المتقدمة تُفتح بكوينات تجمعها من التعلم.</p>
  </details>

  <details>
    <summary>ما اللغات المتاحة؟</summary>
    <p>نوفر دورات في HTML, CSS, JavaScript, Python, C++ والمزيد.</p>
  </details>

  <details>
    <summary>كيف أحصل على XP؟</summary>
    <p>تحصل على XP عند إكمال الدروس وحل التحديات لأول مرة.</p>
  </details>

  <details>
    <summary>كيف أتواصل مع الدعم؟</summary>
    <p>يمكنك التواصل عبر البريد الإلكتروني أو صفحة التواصل.</p>
  </details>
</section>

<style>
  .faq { max-width: 700px; margin: 0 auto; }
  details { margin: 1rem 0; padding: 1rem; background: #1a1a3e; border-radius: 8px; }
  summary { cursor: pointer; font-weight: bold; color: #3b82f6; }
  details p { margin-top: 0.5rem; color: #9ca3af; }
</style>$sol$),
  ('html-ch-form-001', $sol$<form action="/register" method="POST">
  <label>الاسم الكامل:
    <input type="text" name="fullname" required minlength="3">
  </label>
  
  <label>البريد الإلكتروني:
    <input type="email" name="email" required>
  </label>
  
  <label>كلمة المرور:
    <input type="password" name="password" required minlength="8">
  </label>
  
  <label>تأكيد كلمة المرور:
    <input type="password" name="confirm_password" required minlength="8">
  </label>
  
  <label>رقم الهاتف:
    <input type="tel" name="phone" pattern="[0-9]{11}">
  </label>
  
  <label>تاريخ الميلاد:
    <input type="date" name="birthdate">
  </label>
  
  <fieldset>
    <legend>الجنس:</legend>
    <label><input type="radio" name="gender" value="male" required> ذكر</label>
    <label><input type="radio" name="gender" value="female"> أنثى</label>
  </fieldset>
  
  <label>
    <input type="checkbox" name="terms" required>
    أوافق على الشروط والأحكام
  </label>
  
  <button type="submit">تسجيل</button>
</form>$sol$),
  ('html-ch-media-001', $sol$<section>
  <h2>معرض الوسائط</h2>
  
  <figure>
    <video controls poster="thumb.jpg" width="640">
      <source src="video.mp4" type="video/mp4">
      <source src="video.webm" type="video/webm">
      متصفحك لا يدعم الفيديو
    </video>
    <figcaption>فيديو تعليمي</figcaption>
  </figure>

  <figure>
    <audio controls>
      <source src="audio.mp3" type="audio/mpeg">
      <source src="audio.ogg" type="audio/ogg">
      متصفحك لا يدعم الصوت
    </audio>
    <figcaption>بودكاست تعليمي</figcaption>
  </figure>

  <figure>
    <img src="photo.jpg" alt="وصف الصورة" width="400" loading="lazy">
    <figcaption>صورة توضيحية</figcaption>
  </figure>
</section>$sol$),
  ('html-ch-nav-001', $sol$<nav>
  <div class="logo">
    <a href="/">Kodax</a>
  </div>
  <ul class="nav-links">
    <li><a href="/">الرئيسية</a></li>
    <li class="dropdown">
      <a href="/courses">الدورات ▼</a>
      <ul class="dropdown-menu">
        <li><a href="/html">HTML</a></li>
        <li><a href="/css">CSS</a></li>
        <li><a href="/js">JavaScript</a></li>
      </ul>
    </li>
    <li><a href="/articles">المقالات</a></li>
    <li><a href="/contact">اتصل بنا</a></li>
  </ul>
</nav>

<style>
  nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #1a1a3e; }
  .nav-links { display: flex; list-style: none; gap: 1.5rem; }
  .nav-links a { color: white; text-decoration: none; }
  .dropdown { position: relative; }
  .dropdown-menu { display: none; position: absolute; background: #252550; list-style: none; padding: 0.5rem 0; min-width: 150px; }
  .dropdown:hover .dropdown-menu { display: block; }
  .dropdown-menu li a { display: block; padding: 0.5rem 1rem; }
</style>$sol$),
  ('html-ch-semantic-001', $sol$<header>
  <h1>مدونتي</h1>
  <nav>
    <a href="/">الرئيسية</a>
    <a href="/about">من نحن</a>
  </nav>
</header>

<main>
  <article>
    <header>
      <h2>عنوان المقال</h2>
      <time datetime="2024-01-15">15 يناير 2024</time>
    </header>
    <p>محتوى المقال...</p>
  </article>
  
  <aside>
    <h3>مقالات أخرى</h3>
  </aside>
</main>

<footer>
  <p>حقوق النشر 2024</p>
</footer>$sol$),
  ('html-ch-table-001', $sol$<table border="1">
  <thead>
    <tr>
      <th>الاسم</th>
      <th>الرياضيات</th>
      <th>العلوم</th>
      <th>المعدل</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>أحمد</td>
      <td>85</td>
      <td>90</td>
      <td>87.5</td>
    </tr>
    <tr>
      <td>سارة</td>
      <td>92</td>
      <td>88</td>
      <td>90</td>
    </tr>
    <tr>
      <td>محمد</td>
      <td>78</td>
      <td>82</td>
      <td>80</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="3">المعدل العام</td>
      <td>85.8</td>
    </tr>
  </tfoot>
</table>$sol$),
  ('js-ch-beg-1', $sol$function calculator(a, b, operator) {
  switch(operator) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : 'Error';
    default: return 'Invalid operator';
  }
}$sol$),
  ('js-ch-beg-2', $sol$function findMax(arr) {
  if (arr.length === 0) return undefined;
  return Math.max(...arr);
}

// أو يدوياً:
function findMaxManual(arr) {
  let max = arr[0];
  for (let num of arr) {
    if (num > max) max = num;
  }
  return max;
}$sol$),
  ('js-ch-beg-3', $sol$function countChar(str, char) {
  return str.split(char).length - 1;
}

// أو:
function countCharLoop(str, char) {
  let count = 0;
  for (let c of str) {
    if (c === char) count++;
  }
  return count;
}$sol$),
  ('js-ch-beg-4', $sol$function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5/9;
}$sol$),
  ('js-ch-beg-5', $sol$function isAdult(age) {
  return age >= 18;
}

function canVote(age, country) {
  const votingAge = {
    "USA": 18,
    "Brazil": 16,
    "Austria": 16
  };
  return age >= (votingAge[country] || 18);
}$sol$),
  ('js-ch-int-1', $sol$function removeDuplicates(arr) {
  return [...new Set(arr)];
}

// أو يدوياً:
function removeDuplicatesManual(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}$sol$),
  ('js-ch-int-2', $sol$function flatten(arr) {
  return arr.flat(Infinity);
}

// أو باستخدام التكرار:
function flattenRecursive(arr) {
  return arr.reduce((flat, item) => 
    flat.concat(Array.isArray(item) ? flattenRecursive(item) : item), []);
}$sol$),
  ('js-ch-int-3', $sol$function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const value = item[key];
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
}$sol$),
  ('js-ch-int-4', $sol$function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}$sol$),
  ('js-ch-int-5', $sol$function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const clone = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
}

// أو ببساطة:
const deepCloneSimple = obj => JSON.parse(JSON.stringify(obj));$sol$),
  ('js-challenge-1', $sol$function reverseString(str) {
  return str.split('').reverse().join('');
}$sol$),
  ('js-challenge-2', $sol$function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      result.push("FizzBuzz");
    } else if (i % 3 === 0) {
      result.push("Fizz");
    } else if (i % 5 === 0) {
      result.push("Buzz");
    } else {
      result.push(i);
    }
  }
  return result;
}$sol$),
  ('js-challenge-3', $sol$function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}$sol$),
  ('js-challenge-4', $sol$function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}$sol$),
  ('js-challenge-5', $sol$function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}$sol$),
  ('json-ch-001', $sol$function processJSON(obj) {
  const jsonString = JSON.stringify(obj);
  const parsed = JSON.parse(jsonString);
  return parsed.name;
}$sol$),
  ('ml-ch-001', $sol$def fit_line(xs, ys):
    n = len(xs)
    mx = sum(xs) / n
    my = sum(ys) / n
    num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    den = sum((x - mx) ** 2 for x in xs)
    slope = num / den
    return (round(slope, 3), round(my - slope * mx, 3))$sol$),
  ('ml-ch-002', $sol$import math


def predict_proba(weights, bias, x):
    z = sum(w * v for w, v in zip(weights, x)) + bias
    return round(1 / (1 + math.exp(-z)), 3)


def predict(weights, bias, x):
    return 1 if predict_proba(weights, bias, x) >= 0.5 else 0$sol$),
  ('ml-ch-003', $sol$from collections import Counter


def knn_predict(points, labels, query, k):
    dist = sorted(
        (sum((a - b) ** 2 for a, b in zip(p, query)), lbl)
        for p, lbl in zip(points, labels)
    )
    votes = Counter(lbl for _, lbl in dist[:k])
    best = max(votes.values())
    return min(lbl for lbl, v in votes.items() if v == best)$sol$),
  ('ml-ch-004', $sol$from collections import Counter


def gini(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    return round(1 - sum((c / n) ** 2 for c in Counter(labels).values()), 3)


def best_split(values, labels):
    best = None
    n = len(values)
    for t in sorted(set(values)):
        left = [l for v, l in zip(values, labels) if v <= t]
        right = [l for v, l in zip(values, labels) if v > t]
        score = (len(left) * gini(left) + len(right) * gini(right)) / n
        if best is None or score < best[0] - 1e-12:
            best = (score, t)
    return best[1]$sol$),
  ('mongo-ch-001', $sol$function findIds(docs, query) {
  const ops = {
    $gt: (a, b) => a > b,
    $gte: (a, b) => a >= b,
    $lt: (a, b) => a < b,
    $lte: (a, b) => a <= b,
    $ne: (a, b) => a !== b,
  };
  const match = (doc) =>
    Object.entries(query).every(([field, cond]) => {
      if (cond !== null && typeof cond === 'object') {
        return Object.entries(cond).every(([op, v]) => ops[op] && ops[op](doc[field], v));
      }
      return doc[field] === cond;
    });
  return docs.filter(match).map((d) => d._id);
}$sol$),
  ('mongo-ch-002', $sol$function groupSum(docs, key, field) {
  const totals = new Map();
  for (const d of docs) totals.set(d[key], (totals.get(d[key]) || 0) + (d[field] || 0));
  return [...totals.entries()]
    .map(([_id, total]) => ({ _id, total }))
    .sort((a, b) => b.total - a.total || String(a._id).localeCompare(String(b._id)));
}$sol$),
  ('mongo-ch-003', $sol$function populate(posts, users) {
  const byId = new Map(users.map((u) => [u._id, { _id: u._id, name: u.name }]));
  return posts.map((p) => ({ ...p, author: byId.get(p.author) || null }));
}$sol$),
  ('mongo-ch-004', $sol$function runPipeline(docs, stages) {
  let out = docs.map((d) => ({ ...d }));
  for (const stage of stages) {
    const [op, arg] = Object.entries(stage)[0];
    if (op === '$match') {
      out = out.filter((d) => Object.entries(arg).every(([k, v]) => d[k] === v));
    } else if (op === '$sort') {
      const [k, dir] = Object.entries(arg)[0];
      out = [...out].sort((a, b) => (a[k] > b[k] ? dir : a[k] < b[k] ? -dir : 0));
    } else if (op === '$limit') {
      out = out.slice(0, arg);
    } else if (op === '$project') {
      const keep = Object.keys(arg).filter((k) => arg[k]);
      out = out.map((d) => Object.fromEntries(keep.filter((k) => k in d).map((k) => [k, d[k]])));
    } else {
      throw new Error('unsupported stage ' + op);
    }
  }
  return out;
}$sol$),
  ('py-ch-adv-1', $sol$def is_balanced(expression):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{', '>': '<'}
    opening = set(pairs.values())
    closing = set(pairs.keys())
    
    for char in expression:
        if char in opening:
            stack.append(char)
        elif char in closing:
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
    
    return len(stack) == 0$sol$),
  ('py-ch-adv-2', $sol$def compress(text):
    if not text:
        return ""
    result = []
    count = 1
    for i in range(1, len(text)):
        if text[i] == text[i-1]:
            count += 1
        else:
            result.append(f"{text[i-1]}{count}")
            count = 1
    result.append(f"{text[-1]}{count}")
    return "".join(result)

def decompress(compressed):
    result = []
    i = 0
    while i < len(compressed):
        char = compressed[i]
        num = ""
        i += 1
        while i < len(compressed) and compressed[i].isdigit():
            num += compressed[i]
            i += 1
        result.append(char * int(num))
    return "".join(result)$sol$),
  ('py-ch-adv-3', $sol$class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None
    
    def insert(self, value):
        if not self.root:
            self.root = Node(value)
        else:
            self._insert_recursive(self.root, value)
    
    def _insert_recursive(self, node, value):
        if value < node.value:
            if node.left is None:
                node.left = Node(value)
            else:
                self._insert_recursive(node.left, value)
        else:
            if node.right is None:
                node.right = Node(value)
            else:
                self._insert_recursive(node.right, value)
    
    def search(self, value):
        return self._search_recursive(self.root, value)
    
    def _search_recursive(self, node, value):
        if node is None:
            return False
        if value == node.value:
            return True
        elif value < node.value:
            return self._search_recursive(node.left, value)
        else:
            return self._search_recursive(node.right, value)
    
    def inorder(self):
        result = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, node, result):
        if node:
            self._inorder_recursive(node.left, result)
            result.append(node.value)
            self._inorder_recursive(node.right, result)$sol$),
  ('py-ch-beg-1', $sol$def calculator(a, b, operation):
    if operation == '+':
        return a + b
    elif operation == '-':
        return a - b
    elif operation == '*':
        return a * b
    elif operation == '/':
        if b != 0:
            return a / b
        return "لا يمكن القسمة على صفر"
    return "عملية غير صالحة"$sol$),
  ('py-ch-beg-2', $sol$def reverse_string(text):
    return text[::-1]

# أو بطريقة أخرى:
def reverse_string_loop(text):
    result = ""
    for char in text:
        result = char + result
    return result$sol$),
  ('py-ch-beg-3', $sol$def even_or_odd(number):
    if number % 2 == 0:
        return "زوجي"
    return "فردي"$sol$),
  ('py-ch-beg-4', $sol$def calculate_average(numbers):
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)$sol$),
  ('py-ch-beg-5', $sol$def count_words(text):
    if not text.strip():
        return 0
    return len(text.split())$sol$),
  ('py-ch-int-1', $sol$def fizzbuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 3 == 0 and i % 5 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result$sol$),
  ('py-ch-int-2', $sol$def is_prime(n):
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(n**0.5) + 1, 2):
        if n % i == 0:
            return False
    return True

def primes_up_to(limit):
    return [n for n in range(2, limit + 1) if is_prime(n)]$sol$),
  ('py-ch-int-3', $sol$def bubble_sort(arr):
    arr = arr.copy()
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr$sol$),
  ('py-ch-int-4', $sol$def count_frequency(items):
    freq = {}
    for item in items:
        freq[item] = freq.get(item, 0) + 1
    return freq

# أو باستخدام Counter:
from collections import Counter
def count_frequency_v2(items):
    return dict(Counter(items))$sol$),
  ('py-ch-int-5', $sol$def fibonacci(n):
    if n <= 0:
        return []
    if n == 1:
        return [0]
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib

def fibonacci_recursive(n):
    if n <= 1:
        return n
    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)$sol$),
  ('pyadv-ch-001', $sol$def compose(*funcs):
    def composed(x):
        for f in reversed(funcs):
            x = f(x)
        return x
    return composed$sol$),
  ('pyadv-ch-002', $sol$import functools


def count_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper$sol$),
  ('pyadv-ch-003', $sol$def batched(items, size):
    batch = []
    for item in items:
        batch.append(item)
        if len(batch) == size:
            yield batch
            batch = []
    if batch:
        yield batch$sol$),
  ('pyadv-ch-004', $sol$import time


class Timer:
    def __init__(self):
        self.entered = False
        self.elapsed = None
        self.error = None

    def __enter__(self):
        self.entered = True
        self._start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self._start
        if exc_type is not None:
            self.error = exc_type.__name__
        return False$sol$),
  ('pyadv-ch-005', $sol$import re


def extract_dates(text):
    pattern = r"\b(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b"
    return ["-".join(m) for m in re.findall(pattern, text)]$sol$),
  ('pyadv-ch-006', $sol$class Countdown:
    def __init__(self, start):
        self.start = start

    def __iter__(self):
        current = self.start
        while current > 0:
            yield current
            current -= 1$sol$),
  ('pyadv-ch-007', $sol$from collections import Counter


def summarize_logs(lines):
    counts = Counter()
    errors = Counter()
    for line in lines:
        parts = line.strip().split(" ", 1)
        if len(parts) != 2 or parts[0] not in ("INFO", "WARNING", "ERROR"):
            continue
        level, message = parts
        counts[level] += 1
        if level == "ERROR":
            errors[message.strip()] += 1
    top = None
    if errors:
        top = sorted(errors.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
    return {"counts": dict(sorted(counts.items())), "top_error": top}$sol$),
  ('pyoop-ch-001', $sol$class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.__balance = balance

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount

    def withdraw(self, amount):
        if 0 < amount <= self.__balance:
            self.__balance -= amount
            return True
        return False

    @property
    def balance(self):
        return self.__balance$sol$),
  ('pyoop-ch-002', $sol$class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, f):
        return cls(round((f - 32) * 5 / 9, 1))

    @staticmethod
    def is_freezing(c):
        return c <= 0

    def to_fahrenheit(self):
        return round(self.celsius * 9 / 5 + 32, 1)$sol$),
  ('pyoop-ch-003', $sol$class Shape:
    def area(self):
        raise NotImplementedError


class Rectangle(Shape):
    def __init__(self, w, h):
        self.w = w
        self.h = h

    def area(self):
        return self.w * self.h


class Circle(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):
        return 3.14159 * self.r ** 2


def total_area(shapes):
    return round(sum(s.area() for s in shapes), 2)$sol$),
  ('pyoop-ch-004', $sol$class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, k):
        return Vector(self.x * k, self.y * k)

    def __eq__(self, other):
        return isinstance(other, Vector) and self.x == other.x and self.y == other.y

    def __abs__(self):
        return round((self.x ** 2 + self.y ** 2) ** 0.5, 2)

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"$sol$),
  ('pyoop-ch-005', $sol$class Engine:
    def __init__(self, hp):
        self.hp = hp

    def start(self):
        return f"Engine {self.hp}hp started"


class Car:
    def __init__(self, model, engine):
        self.model = model
        self.engine = engine

    def start(self):
        return f"{self.model}: {self.engine.start()}"

    def upgrade_engine(self, engine):
        self.engine = engine$sol$),
  ('pyoop-ch-006', $sol$class Library:
    def __init__(self):
        self.copies = {}
        self.loans = {}

    def add_book(self, title, copies=1):
        self.copies[title] = self.copies.get(title, 0) + copies

    def borrow(self, member, title):
        books = self.loans.setdefault(member, set())
        if self.copies.get(title, 0) <= 0 or title in books:
            return False
        self.copies[title] -= 1
        books.add(title)
        return True

    def return_book(self, member, title):
        books = self.loans.get(member, set())
        if title not in books:
            return False
        books.remove(title)
        self.copies[title] += 1
        return True

    def available(self, title):
        return self.copies.get(title, 0)

    def borrowed_by(self, member):
        return sorted(self.loans.get(member, set()))$sol$),
  ('react-ch-4', $sol$import { useState } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

function Demo() {
  const [name, setName] = useLocalStorage('name', '');
  return <div>{name}</div>;
}$sol$),
  ('react-ch-5', $sol$import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });
  
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// الاستخدام:
// <ThemeProvider><App /></ThemeProvider>
// const { theme, toggleTheme } = useTheme();$sol$),
  ('react-ch-6', $sol$import { useState } from 'react';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    } else if (formData.name.length < 3) {
      newErrors.name = 'الاسم قصير جداً';
    }
    
    if (!formData.email) {
      newErrors.email = 'البريد مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'بريد غير صالح';
    }
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور قصيرة (8 أحرف على الأقل)';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('تم الإرسال:', formData);
      setSubmitted(true);
    }
  };
  
  if (submitted) {
    return <p>✅ تم التسجيل بنجاح!</p>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="name"
          placeholder="الاسم"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      
      <div>
        <input
          name="email"
          type="email"
          placeholder="البريد"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <input
          name="password"
          type="password"
          placeholder="كلمة المرور"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      
      <div>
        <input
          name="confirmPassword"
          type="password"
          placeholder="تأكيد كلمة المرور"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
      </div>
      
      <button type="submit">تسجيل</button>
    </form>
  );
}$sol$),
  ('react-ch-7', $sol$import { useState, useEffect, useRef, useCallback } from 'react';

function InfiniteList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const observerRef = useRef();
  const lastItemRef = useCallback(node => {
    if (loading) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore]);
  
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`
        );
        const data = await response.json();
        
        setItems(prev => [...prev, ...data]);
        setHasMore(data.length > 0);
      } catch (error) {
        console.error(error);
      }
      
      setLoading(false);
    };
    
    fetchItems();
  }, [page]);
  
  return (
    <div>
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={index === items.length - 1 ? lastItemRef : null}
          className="item"
        >
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </div>
      ))}
      
      {loading && <p>جارٍ التحميل...</p>}
      {!hasMore && <p>لا يوجد المزيد</p>}
    </div>
  );
}$sol$),
  ('react-ch-beg-1', $sol$function ProfileCard({ name, title, avatar }) {
  return (
    <div className="card">
      <img src={avatar} alt={name} className="avatar" />
      <h2>{name}</h2>
      <p>{title}</p>
    </div>
  );
}$sol$),
  ('react-ch-beg-2', $sol$function ColorButton() {
  const [color, setColor] = useState('blue');
  
  const colors = ['blue', 'red', 'green', 'purple', 'orange'];
  
  const changeColor = () => {
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    setColor(newColor);
  };
  
  return (
    <button 
      onClick={changeColor}
      style={{ backgroundColor: color, color: 'white', padding: '10px 20px' }}
    >
      اضغطني!
    </button>
  );
}$sol$),
  ('react-ch-beg-3', $sol$function ToggleText() {
  const [show, setShow] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShow(!show)}>
        {show ? 'إخفاء' : 'إظهار'}
      </button>
      {show && <p>هذا نص سري! 🎉</p>}
    </div>
  );
}$sol$),
  ('react-ch-beg-4', $sol$function FruitList() {
  const fruits = ['تفاح', 'برتقال', 'موز', 'عنب'];
  
  return (
    <ul>
      {fruits.map((fruit, index) => (
        <li key={index}>{fruit}</li>
      ))}
    </ul>
  );
}$sol$),
  ('react-ch-beg-5', $sol$function ControlledInput() {
  const [value, setValue] = useState('');
  
  return (
    <div>
      <input 
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="اكتب شيئاً..."
      />
      <p>كتبت: {value}</p>
      <p>عدد الأحرف: {value.length}</p>
    </div>
  );
}$sol$),
  ('react-ch-int-1', $sol$function FilterableList() {
  const items = ['React', 'Angular', 'Vue', 'Svelte', 'Next.js'];
  const [search, setSearch] = useState('');
  
  const filtered = items.filter(item => 
    item.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div>
      <input 
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="ابحث..."
      />
      <ul>
        {filtered.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>{filtered.length} نتيجة</p>
    </div>
  );
}$sol$),
  ('react-ch-int-2', $sol$function SignupForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    if (!form.email.includes('@')) {
      newErrors.email = 'بريد غير صالح';
    }
    if (form.password.length < 6) {
      newErrors.password = 'كلمة المرور قصيرة';
    }
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      alert('تم التسجيل!');
    } else {
      setErrors(newErrors);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={form.email}
        onChange={e => setForm({...form, email: e.target.value})}
        placeholder="البريد الإلكتروني"
      />
      {errors.email && <span>{errors.email}</span>}
      
      <input
        type="password"
        value={form.password}
        onChange={e => setForm({...form, password: e.target.value})}
        placeholder="كلمة المرور"
      />
      {errors.password && <span>{errors.password}</span>}
      
      <button type="submit">تسجيل</button>
    </form>
  );
}$sol$),
  ('react-ch-int-3', $sol$function Countdown() {
  const [time, setTime] = useState(60);
  const [running, setRunning] = useState(false);
  
  useEffect(() => {
    let interval;
    if (running && time > 0) {
      interval = setInterval(() => {
        setTime(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, time]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div>
      <h1>{formatTime(time)}</h1>
      <button onClick={() => setRunning(!running)}>
        {running ? 'إيقاف' : 'بدء'}
      </button>
      <button onClick={() => { setTime(60); setRunning(false); }}>
        إعادة
      </button>
    </div>
  );
}$sol$),
  ('react-ch-int-4', $sol$function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}$sol$),
  ('react-ch-int-5', $sol$const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  
  const toggle = () => setDark(!dark);
  
  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div className={dark ? 'dark-theme' : 'light-theme'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

function ThemeToggle() {
  const { dark, toggle } = useContext(ThemeContext);
  
  return (
    <button onClick={toggle}>
      {dark ? '☀️ فاتح' : '🌙 مظلم'}
    </button>
  );
}$sol$),
  ('react-challenge-1', $sol$function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>العداد: {count}</h1>
      <button onClick={() => setCount(c => c - 1)}>-</button>
      <button onClick={() => setCount(0)}>0</button>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}$sol$),
  ('react-challenge-2', $sol$function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  
  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, done: false }]);
    setInput('');
  };
  
  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };
  
  const toggleTodo = (id) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };
  
  return (
    <div>
      <input 
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && addTodo()}
        placeholder="مهمة جديدة..."
      />
      <button onClick={addTodo}>إضافة</button>
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input 
              type="checkbox" 
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>حذف</button>
          </li>
        ))}
      </ul>
    </div>
  );
}$sol$),
  ('react-challenge-3', $sol$function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(res => {
        if (!res.ok) throw new Error('فشل الجلب');
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <p>جارٍ التحميل...</p>;
  if (error) return <p>خطأ: {error}</p>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}$sol$),
  ('rn-ch-todo-001', $sol$import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');

  const addTodo = () => {
    if (inputText.trim()) {
      setTodos([
        ...todos,
        { id: Date.now().toString(), text: inputText.trim(), completed: false },
      ]);
      setInputText('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 مهامي</Text>
      
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="أضف مهمة جديدة..."
        />
        <Button title="إضافة" onPress={addTodo} />
      </View>

      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity onPress={() => toggleTodo(item.id)} style={styles.todoText}>
              <Text style={item.completed ? styles.completed : undefined}>
                {item.completed ? '✅' : '⬜'} {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <Text style={styles.deleteBtn}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      
      <Text style={styles.stats}>
        المهام: {todos.length} | مكتملة: {todos.filter(t => t.completed).length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  inputRow: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginRight: 10 },
  todoItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8 },
  todoText: { flex: 1 },
  completed: { textDecorationLine: 'line-through', color: 'gray' },
  deleteBtn: { fontSize: 18 },
  stats: { textAlign: 'center', marginTop: 20, color: '#666' },
});$sol$),
  ('rn-challenge-001', $sol$import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }
    Alert.alert('نجاح', 'تم تسجيل الدخول بنجاح!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تسجيل الدخول</Text>
      <TextInput
        style={styles.input}
        placeholder="البريد الإلكتروني"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="كلمة المرور"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>دخول</Text>
      </TouchableOpacity>
    </View>
  );
}$sol$),
  ('rn-challenge-002', $sol$function createCounter(initialValue = 0) {
  let value = initialValue;
  return {
    getValue: () => value,
    increment: () => ++value,
    decrement: () => --value,
    reset: () => { value = initialValue; return value; },
    incrementBy: (n) => { value += n; return value; },
  };
}

function safeDecrement(value) {
  return Math.max(0, value - 1);
}

function formatCounter(value) {
  if (value > 0) return '+' + value;
  return '' + value;
}$sol$),
  ('rn-challenge-003', $sol$function createTodoList() {
  let tasks = [];
  let nextId = 1;

  return {
    addTask(text) {
      tasks.push({ id: nextId++, text, done: false });
      return tasks;
    },
    toggleTask(id) {
      tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
      return tasks;
    },
    removeTask(id) {
      tasks = tasks.filter(t => t.id !== id);
      return tasks;
    },
    getTasks() { return tasks; },
    completedCount() {
      return tasks.filter(t => t.done).length;
    },
    getActiveTasks() {
      return tasks.filter(t => !t.done);
    },
  };
}$sol$),
  ('rn-challenge-004', $sol$function createStore() {
  const products = [
    { id: '1', name: 'هاتف', price: 500 },
    { id: '2', name: 'لابتوب', price: 1200 },
    { id: '3', name: 'سماعات', price: 80 },
  ];
  let cart = [];

  return {
    getProducts() { return products; },
    addToCart(productId) {
      const existing = cart.find(item => item.productId === productId);
      if (existing) {
        existing.quantity++;
      } else {
        const product = products.find(p => p.id === productId);
        if (product) cart.push({ productId, name: product.name, price: product.price, quantity: 1 });
      }
      return cart;
    },
    removeFromCart(productId) {
      cart = cart.filter(item => item.productId !== productId);
      return cart;
    },
    getTotal() {
      return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    getCartCount() {
      return cart.reduce((sum, item) => sum + item.quantity, 0);
    },
    getCart() { return cart; },
  };
}$sol$),
  ('rn-challenge-005', $sol$function kelvinToCelsius(kelvin) {
  return Math.round((kelvin - 273.15) * 100) / 100;
}

function kelvinToFahrenheit(kelvin) {
  return Math.round(((kelvin - 273.15) * 9/5 + 32) * 100) / 100;
}

function parseWeatherData(apiResponse) {
  return {
    city: apiResponse.name,
    temp: kelvinToCelsius(apiResponse.main.temp),
    description: apiResponse.weather[0].description,
    humidity: apiResponse.main.humidity,
  };
}

function getWeatherAdvice(tempCelsius) {
  if (tempCelsius < 0) return 'بارد جداً، ارتدِ ملابس ثقيلة';
  if (tempCelsius < 15) return 'بارد، ارتدِ معطفاً';
  if (tempCelsius < 30) return 'طقس معتدل';
  return 'حار، اشرب ماءً كثيراً';
}$sol$),
  ('sql-ch-001', $sol$SELECT name, price FROM products WHERE price > 100 ORDER BY price DESC;$sol$),
  ('sql-ch-002', $sol$SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;$sol$),
  ('sql-ch-003', $sol$SELECT category, COUNT(*), ROUND(AVG(price), 2)
FROM products
GROUP BY category
HAVING COUNT(*) >= 2
ORDER BY category;$sol$),
  ('sql-ch-004', $sol$SELECT e.name
FROM employees e
WHERE e.salary > (SELECT AVG(x.salary) FROM employees x WHERE x.dept = e.dept)
ORDER BY e.name;$sol$),
  ('sql-ch-005', $sol$WITH spend AS (
  SELECT c.city, c.name, SUM(o.total) AS total
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id, c.city, c.name
),
ranked AS (
  SELECT city, name, total,
         ROW_NUMBER() OVER (PARTITION BY city ORDER BY total DESC, name) AS rn
  FROM spend
)
SELECT city, name, total FROM ranked WHERE rn = 1 ORDER BY city;$sol$),
  ('supa-ch-001', $sol$function toPostgrest(filters) {
  const ops = new Set(['eq', 'neq', 'gt', 'gte', 'lt', 'lte']);
  return Object.keys(filters)
    .sort()
    .map((k) => {
      const [op, value] = filters[k];
      if (!ops.has(op)) throw new Error('bad operator');
      return k + '=' + op + '.' + encodeURIComponent(value);
    })
    .join('&');
}$sol$),
  ('supa-ch-002', $sol$function visibleNoteIds(notes, userId, teamIds) {
  const teams = new Set(userId ? teamIds : []);
  return notes
    .filter((n) => n.is_public || (userId && n.owner_id === userId) || (n.team_id && teams.has(n.team_id)))
    .map((n) => n.id)
    .sort((a, b) => a - b);
}$sol$),
  ('supa-ch-003', $sol$function applyChanges(rows, events) {
  const byId = new Map(rows.map((r) => [r.id, { ...r }]));
  for (const e of events) {
    const r = e.record;
    if (e.type === 'INSERT') byId.set(r.id, { ...r });
    else if (e.type === 'UPDATE' && byId.has(r.id)) byId.set(r.id, { ...byId.get(r.id), ...r });
    else if (e.type === 'DELETE') byId.delete(r.id);
  }
  return [...byId.values()].sort((a, b) => a.id - b.id);
}$sol$),
  ('supa-ch-004', $sol$function safeStoragePath(userId, filename) {
  if (!filename || /[\\/]/.test(filename) || filename.includes('..')) return null;
  const m = filename.match(/\.([A-Za-z0-9]+)$/);
  if (!m || !['png', 'jpg', 'jpeg', 'pdf'].includes(m[1].toLowerCase())) return null;
  return userId + '/' + filename;
}$sol$),
  ('web-ch-camelcase-001', $sol$function toCamelCase(str) {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
}$sol$),
  ('web-ch-debounce-impl-001', $sol$function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}$sol$),
  ('web-ch-flatten-obj-001', $sol$function flattenObject(obj, prefix = '') {
  const result = {};
  for (const key in obj) {
    const newKey = prefix ? prefix + '.' + key : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flattenObject(obj[key], newKey));
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
}$sol$),
  ('web-ch-htmlentity-001', $sol$function encodeHTML(str) {
  const entities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, c => entities[c]);
}$sol$),
  ('web-ch-querystring-001', $sol$function parseQueryString(query) {
  if (!query || query === '') return {};
  return query.split('&').reduce((obj, pair) => {
    const [key, value] = pair.split('=');
    obj[decodeURIComponent(key)] = decodeURIComponent(value || '');
    return obj;
  }, {});
}$sol$),
  ('web-ch-slugify-001', $sol$function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}$sol$),
  ('web-ch-truncate-001', $sol$function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}$sol$)
ON CONFLICT (challenge_id) DO UPDATE SET solution = EXCLUDED.solution, updated_at = NOW();

COMMIT;
