/**
 * مسار الأمن السيبراني — إصلاحات بنيوية فقط (بلا إعادة كتابة للشروح):
 *  - ترتيب الدروس وأقسامها، ومعالجة الترتيبات المكررة (cyber-advanced: 1 و 2 مكرران).
 *  - الدروس المتكررة الموضوع توضع متجاورة بعنوان يميزها (الجزء 1 / الجزء 2) بدل أن تتفرق.
 *  - وسوم لغة لكتل الكود (طلبات HTTP، ترويسات، مخططات، قواعد IDS كانت تُعرض كـ Python).
 *  - تصحيحات كود محددة: hmac.compare_digest لمقارنة الـ hash، فحص Origin/Referer بمقارنة الأصل
 *    كاملاً، وعدم مقارنة كلمات المرور كنص صريح داخل استعلام SQL.
 */
import type { CoursePlan } from '../types';

const F = '```';

export const CYBER_BASICS_PLAN: CoursePlan = {
  courseId: 'cyber-basics',
  sections: [
    { title: 'المفاهيم والتهديدات', lessons: ['cyber-1', 'cyber-2', 'cyber-3', 'cyber-4'] },
    { title: 'الشبكات والويب', lessons: ['cyber-5', 'cyber-http-basics', 'cyber-cookies-sessions'] },
    { title: 'التشفير', lessons: ['cyber-6'] },
  ],
  fenceLangs: {
    'cyber-http-basics': { 1: 'http', 2: 'http', 3: 'http', 4: 'http' },
    'cyber-cookies-sessions': { 1: 'http', 2: 'http', 3: 'http' },
  },
  codeFixes: {
    'cyber-4': [
      ['import hashlib\n', 'import hashlib\nimport hmac\n'],
      ['            100000  # iterations', '            600_000  # iterations (توصية OWASP الحالية لـ PBKDF2-SHA256)'],
      [
        '            100000\n        )\n        return hash_value.hex() == stored_hash',
        '            600_000\n        )\n        # مقارنة ثابتة الزمن: == قد تكشف عبر التوقيت عدد الأحرف المتطابقة\n        return hmac.compare_digest(hash_value.hex(), stored_hash)',
      ],
    ],
    'cyber-6': [['            salt,\n            100000', '            salt,\n            600_000  # توصية OWASP الحالية']],
  },
};

export const CYBER_NETWORK_PLAN: CoursePlan = {
  courseId: 'cyber-network',
  sections: [
    { title: 'الأساسيات', lessons: ['cyber-network-001', 'cyber-firewall-basics', 'cyber-encryption-001'] },
    { title: 'الاتصال الآمن', lessons: ['cyber-vpn-security', 'cyber-wifi-security'] },
    { title: 'معمارية الشبكة', lessons: ['cyber-network-segmentation', 'cyber-dmz-architecture', 'cyber-zero-trust'] },
    { title: 'الكشف والمراقبة', lessons: ['cyber-ids-ips', 'cyber-network-monitoring'] },
  ],
  fenceLangs: {
    'cyber-network-001': { 1: 'text' },
    'cyber-ids-ips': { 1: 'text' },
    'cyber-network-monitoring': { 2: 'text' },
    'cyber-dmz-architecture': { 1: 'text', 2: 'text', 3: 'text' },
    'cyber-network-segmentation': { 1: 'text', 2: 'text', 3: 'text' },
  },
};

export const CYBER_ADVANCED_PLAN: CoursePlan = {
  courseId: 'cyber-advanced',
  sections: [
    { title: 'حقن SQL', lessons: ['cyber-adv-1', 'cyber-sql-001'] },
    { title: 'XSS', lessons: ['cyber-adv-2', 'cyber-xss-001'] },
    { title: 'ثغرات الطلبات', lessons: ['cyber-csrf'] },
    { title: 'المنهجية', lessons: ['cyber-adv-3'] },
  ],
  patches: {
    'cyber-adv-1': { title: 'SQL Injection — الجزء 1: الفهم' },
    'cyber-sql-001': { title: 'SQL Injection — الجزء 2: الحماية' },
    'cyber-adv-2': { title: 'XSS — الجزء 1: الأنواع' },
    'cyber-xss-001': { title: 'XSS — الجزء 2: المنع' },
  },
  fenceLangs: {
    'cyber-adv-2': { 1: 'text' },
    'cyber-csrf': { 3: 'http' },
    'cyber-xss-001': { 3: 'http', 4: 'http' },
    'cyber-sql-001': { 2: 'text' },
  },
  contentFixes: {
    'cyber-csrf': [
      ['<img src="https://bank.com/transfer?to=hacker&amount=10000">', '<img src="https://bank.com/transfer?to=hacker&amount=10000" alt="" width="1" height="1">'],
      ['  <input type="hidden" name="amount" value="10000">\n</form>', '  <input type="hidden" name="amount" value="10000">\n  <button type="submit" hidden></button>\n</form>'],
      ['  <input name="to">\n  <input name="amount">\n  <button>تحويل</button>', '  <input type="text" name="to">\n  <input type="number" name="amount">\n  <button type="submit">تحويل</button>'],
      [
        "if request.headers.get('Referer') != 'https://mysite.com':\n    return \"طلب مشبوه\", 403",
        'from urllib.parse import urlparse\n\n\ndef is_same_origin(request, allowed_origin="https://mysite.com"):\n    # Origin أولاً ثم Referer، ونقارن الأصل كاملاً (المخطط + النطاق + المنفذ):\n    # Referer يحتوي المسار، فالمقارنة بالمساواة تفشل، و startswith تقبل mysite.com.evil.com\n    source = request.headers.get("Origin") or request.headers.get("Referer") or ""\n    parsed = urlparse(source)\n    return f"{parsed.scheme}://{parsed.netloc}" == allowed_origin\n\n\n# في معالج الطلب:\n# if not is_same_origin(request):\n#     return "طلب مشبوه", 403',
      ],
    ],
    'cyber-sql-001': [
      [
        "query = f\"SELECT * FROM users WHERE username='{username}' AND password='{password}'\"",
        "username, password = \"admin' --\", \"anything\"   # مدخلات من المستخدم\n# ❌ خطأ مزدوج: لصق المدخلات في الاستعلام (حقن SQL) ومقارنة كلمة المرور كنص صريح\nquery = f\"SELECT * FROM users WHERE username='{username}' AND password='{password}'\"\nprint(query)",
      ],
      [
        'cursor.execute(\n    "SELECT * FROM users WHERE username=? AND password=?",\n    (username, password)\n)',
        'import hashlib\nimport hmac\nimport os\nimport sqlite3\n\nconn = sqlite3.connect(":memory:")\ncursor = conn.cursor()\ncursor.execute("CREATE TABLE users (username TEXT UNIQUE, salt BLOB, password_hash BLOB)")\n\n\ndef hash_password(password, salt):\n    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 600_000)\n\n\nsalt = os.urandom(16)\ncursor.execute("INSERT INTO users VALUES (?, ?, ?)", ("admin", salt, hash_password("S3cure-Pass", salt)))\n\n\ndef login(username, password):\n    # ✅ استعلام معاملي بالاسم فقط — كلمة المرور لا تدخل SQL أبداً\n    cursor.execute("SELECT salt, password_hash FROM users WHERE username = ?", (username,))\n    row = cursor.fetchone()\n    if row is None:\n        return False\n    # مقارنة الـ hash في الكود بمقارنة ثابتة الزمن\n    return hmac.compare_digest(hash_password(password, row[0]), row[1])\n\n\nprint(login("admin", "S3cure-Pass"), login("admin\' --", "anything"))',
      ],
      [
        'User.query.filter_by(username=username).first()',
        '# مع Flask-SQLAlchemy: الـ ORM يمرر القيم كمعاملات تلقائياً — ثم تحقق من الـ hash كما أعلاه\ndef find_user(User, username):\n    return User.query.filter_by(username=username).first()',
      ],
    ],
  },
};

export const CYBER_ETHICAL_PLAN: CoursePlan = {
  courseId: 'cyber-ethical-hacking',
  sections: [
    { title: 'البداية', lessons: ['ethical-intro', 'ethical-recon', 'ethical-scanning'] },
    { title: 'الاستغلال', lessons: ['ethical-exploitation-basics', 'ethical-web-hacking', 'ethical-web-advanced', 'ethical-password-cracking'] },
    { title: 'ما بعد الوصول', lessons: ['ethical-privilege-escalation', 'ethical-post-exploitation'] },
    { title: 'مجالات أخرى', lessons: ['ethical-wireless-hacking', 'ethical-social-engineering'] },
    { title: 'التقارير', lessons: ['ethical-reporting', 'ethical-report-writing'] },
    { title: 'التطوير المهني', lessons: ['ethical-ctf', 'ethical-career-path'] },
  ],
  patches: {
    'ethical-reporting': { title: 'كتابة التقارير الأمنية — الجزء 1: المبادئ' },
    'ethical-report-writing': { title: 'كتابة التقارير الأمنية — الجزء 2: تقرير اختبار الاختراق' },
  },
  fenceLangs: {
    'ethical-intro': { 1: 'text' },
    'ethical-recon': { 3: 'text', 4: 'bash' },
    'ethical-exploitation-basics': { 2: 'text', 3: 'text' },
    'ethical-web-hacking': { 1: 'text' },
    'ethical-password-cracking': { 1: 'text', 2: 'text', 3: 'text' },
    'ethical-web-advanced': { 1: 'text' },
  },
  contentFixes: {
    'ethical-web-advanced': [
      [
        '# خطير!\nimport pickle\ndata = pickle.loads(user_input)',
        '# خطير!\nimport pickle\n\n\ndef load_profile(user_input: bytes):\n    return pickle.loads(user_input)  # ❌ خطأ أمني: فك بيانات غير موثوقة بـ pickle قد ينفذ كوداً — استخدم json',
      ],
    ],
  },
};
