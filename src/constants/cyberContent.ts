/**
 * دروس الأمن السيبراني - من الصفر إلى الاحتراف
 * Kodax Cybersecurity Curriculum
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس الأمن السيبراني للمبتدئين =====
export const CYBER_LESSONS_BEGINNER: Lesson[] = [
  {
    id: 'cyber-1',
    courseId: 'cyber-basics',
    title: 'مقدمة في الأمن السيبراني',
    description: 'ما هو الأمن السيبراني ولماذا هو مهم؟',
    content: `
# مرحباً بك في عالم الأمن السيبراني!

## ما هو الأمن السيبراني؟
حماية الأنظمة والشبكات والبرامج من الهجمات الرقمية.

## ثالوث CIA
أساس الأمن السيبراني:
- **Confidentiality** (السرية): البيانات للمصرح لهم فقط
- **Integrity** (النزاهة): البيانات صحيحة وغير معدّلة
- **Availability** (التوفر): البيانات متاحة عند الحاجة

## أنواع التهديدات
- 🦠 الفيروسات والبرمجيات الخبيثة
- 🎣 التصيد الاحتيالي (Phishing)
- 🔐 هجمات كلمات المرور
- 💻 هجمات الشبكات
- 👤 الهندسة الاجتماعية

## مجالات العمل
- Penetration Tester
- Security Analyst
- Security Engineer
- Incident Responder
- Ethical Hacker
`,
    codeExample: `# مثال بسيط: فحص قوة كلمة المرور
import re

def check_password_strength(password):
    """
    فحص قوة كلمة المرور
    """
    score = 0
    feedback = []
    
    # الطول
    if len(password) >= 8:
        score += 1
    else:
        feedback.append("❌ يجب أن تكون 8 أحرف على الأقل")
    
    if len(password) >= 12:
        score += 1
    
    # الأحرف الكبيرة
    if re.search(r'[A-Z]', password):
        score += 1
    else:
        feedback.append("❌ أضف حرف كبير")
    
    # الأحرف الصغيرة
    if re.search(r'[a-z]', password):
        score += 1
    else:
        feedback.append("❌ أضف حرف صغير")
    
    # الأرقام
    if re.search(r'[0-9]', password):
        score += 1
    else:
        feedback.append("❌ أضف رقم")
    
    # الرموز
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 1
    else:
        feedback.append("❌ أضف رمز خاص")
    
    # التقييم
    if score <= 2:
        strength = "ضعيفة جداً 🔴"
    elif score <= 4:
        strength = "متوسطة 🟡"
    else:
        strength = "قوية 🟢"
    
    return {
        "score": score,
        "strength": strength,
        "feedback": feedback
    }

# اختبار
password = "MyP@ssw0rd!"
result = check_password_strength(password)
print(f"كلمة المرور: {password}")
print(f"القوة: {result['strength']}")
print(f"النقاط: {result['score']}/6")`,
    language: 'python',
    xpReward: 100,
    order: 1,
    quiz: {
      question: 'ما المقصود بـ CIA في الأمن السيبراني؟',
      options: [
        'وكالة المخابرات الأمريكية',
        'Confidentiality, Integrity, Availability',
        'Computer Information Analysis',
        'Cyber Intelligence Agency',
      ],
      correctAnswer: 1,
      explanation: 'CIA هو ثالوث الأمن: السرية، النزاهة، التوفر',
    },
  },
  {
    id: 'cyber-2',
    courseId: 'cyber-basics',
    title: 'أنواع البرمجيات الخبيثة',
    description: 'تعرف على Malware وأنواعها',
    content: `
# البرمجيات الخبيثة (Malware)

## أنواع Malware

### 🦠 Virus
ينتشر عبر الملفات ويحتاج تفعيل المستخدم.

### 🐛 Worm
ينتشر ذاتياً عبر الشبكات.

### 🏇 Trojan Horse
يتنكر كبرنامج مفيد.

### 🔒 Ransomware
يشفر الملفات ويطلب فدية.

### 👁️ Spyware
يتجسس على نشاط المستخدم.

### ⌨️ Keylogger
يسجل ضغطات لوحة المفاتيح.

### 🧟 Botnet
يحول الجهاز لـ "zombie" للتحكم عن بُعد.

## كيف تحمي نفسك؟
- تحديث النظام والبرامج
- مكافح فيروسات محدث
- عدم فتح روابط مشبوهة
- النسخ الاحتياطي المنتظم
`,
    codeExample: `# محاكاة بسيطة لاكتشاف الأنماط المشبوهة
import hashlib
import os

class SimpleMalwareScanner:
    def __init__(self):
        # قائمة بسيطة من التواقيع المعروفة (MD5 hashes)
        self.known_signatures = {
            "44d88612fea8a8f36de82e1278abb02f": "EICAR Test File",
            "e99a18c428cb38d5f260853678922e03": "Suspicious Pattern 1",
        }
        
        # أنماط مشبوهة في الكود
        self.suspicious_patterns = [
            r"exec\\s*\\(",         # تنفيذ ديناميكي
            r"eval\\s*\\(",         # eval خطير
            r"subprocess",          # تشغيل processes
            r"os\\.system",         # أوامر نظام
            r"socket\\.",           # اتصالات شبكية
            r"base64\\.decode",     # فك تشفير (قد يخفي كود)
            r"\\\\x[0-9a-fA-F]{2}", # Hex encoded
        ]
    
    def calculate_hash(self, filepath):
        """حساب MD5 hash للملف"""
        hasher = hashlib.md5()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                hasher.update(chunk)
        return hasher.hexdigest()
    
    def scan_file(self, filepath):
        """فحص ملف واحد"""
        results = {
            "file": filepath,
            "threats": [],
            "is_safe": True
        }
        
        # فحص التوقيع
        file_hash = self.calculate_hash(filepath)
        if file_hash in self.known_signatures:
            results["threats"].append({
                "type": "Known Malware",
                "name": self.known_signatures[file_hash]
            })
            results["is_safe"] = False
        
        # فحص الأنماط (للملفات النصية)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                for pattern in self.suspicious_patterns:
                    import re
                    if re.search(pattern, content):
                        results["threats"].append({
                            "type": "Suspicious Pattern",
                            "pattern": pattern
                        })
                        results["is_safe"] = False
        except:
            pass  # ملف binary
        
        return results

# مثال الاستخدام
scanner = SimpleMalwareScanner()
# result = scanner.scan_file("suspicious_file.py")
# print(result)`,
    language: 'python',
    xpReward: 100,
    order: 2,
    quiz: {
      question: 'ما نوع Malware الذي يشفر ملفاتك ويطلب فدية؟',
      options: ['Virus', 'Worm', 'Ransomware', 'Spyware'],
      correctAnswer: 2,
      explanation: 'Ransomware يشفر الملفات ويطلب دفع فدية لفك التشفير',
    },
  },
  {
    id: 'cyber-3',
    courseId: 'cyber-basics',
    title: 'التصيد الاحتيالي (Phishing)',
    description: 'كيف تكتشف محاولات التصيد',
    content: `
# التصيد الاحتيالي (Phishing)

## ما هو Phishing؟
محاولة خداع لسرقة معلومات حساسة.

## أنواع Phishing

### 📧 Email Phishing
رسائل تتنكر كجهات موثوقة.

### 🎯 Spear Phishing
هجوم موجه لشخص/منظمة محددة.

### 🐋 Whaling
استهداف المدراء التنفيذيين.

### 📱 Smishing
عبر الرسائل النصية.

### 📞 Vishing
عبر المكالمات الهاتفية.

## علامات التحذير
- 🔗 روابط مشبوهة
- ✍️ أخطاء إملائية
- ⚠️ طلب معلومات عاجل
- 📧 عنوان مرسل غريب
- 🎁 عروض "جيدة جداً"

## كيف تحمي نفسك؟
- تحقق من المرسل
- لا تضغط روابط مشبوهة
- تحقق من HTTPS
- استخدم 2FA
`,
    codeExample: `# كاشف روابط التصيد البسيط
import re
from urllib.parse import urlparse

class PhishingDetector:
    def __init__(self):
        # الكلمات المشبوهة في الروابط
        self.suspicious_keywords = [
            'login', 'signin', 'verify', 'secure',
            'account', 'update', 'confirm', 'banking',
            'paypal', 'amazon', 'apple', 'microsoft',
            'password', 'credential'
        ]
        
        # نطاقات موثوقة (مثال)
        self.trusted_domains = [
            'google.com', 'microsoft.com', 'apple.com',
            'amazon.com', 'paypal.com', 'facebook.com'
        ]
        
        # TLDs مشبوهة
        self.suspicious_tlds = [
            '.tk', '.ml', '.ga', '.cf', '.gq',
            '.xyz', '.top', '.work', '.click'
        ]
    
    def analyze_url(self, url):
        """تحليل URL للكشف عن التصيد"""
        results = {
            "url": url,
            "risk_score": 0,
            "warnings": [],
            "is_suspicious": False
        }
        
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            path = parsed.path.lower()
            
            # 1. فحص HTTPS
            if parsed.scheme != 'https':
                results["risk_score"] += 2
                results["warnings"].append("⚠️ لا يستخدم HTTPS")
            
            # 2. فحص طول URL
            if len(url) > 75:
                results["risk_score"] += 1
                results["warnings"].append("⚠️ URL طويل جداً")
            
            # 3. فحص IP بدلاً من نطاق
            if re.match(r'\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', domain):
                results["risk_score"] += 3
                results["warnings"].append("🚨 يستخدم IP بدلاً من نطاق")
            
            # 4. فحص @ في URL
            if '@' in url:
                results["risk_score"] += 3
                results["warnings"].append("🚨 يحتوي @ (محاولة إخفاء)")
            
            # 5. فحص الكلمات المشبوهة
            for keyword in self.suspicious_keywords:
                if keyword in domain and domain not in self.trusted_domains:
                    results["risk_score"] += 2
                    results["warnings"].append(f"⚠️ يحتوي كلمة مشبوهة: {keyword}")
                    break
            
            # 6. فحص TLD مشبوه
            for tld in self.suspicious_tlds:
                if domain.endswith(tld):
                    results["risk_score"] += 2
                    results["warnings"].append(f"⚠️ نطاق TLD مشبوه: {tld}")
                    break
            
            # 7. فحص النطاقات الفرعية الكثيرة
            subdomains = domain.split('.')
            if len(subdomains) > 4:
                results["risk_score"] += 2
                results["warnings"].append("⚠️ نطاقات فرعية كثيرة")
            
            # 8. فحص typosquatting (مثال بسيط)
            typos = {
                'googel': 'google', 'gogle': 'google',
                'microsft': 'microsoft', 'mircosoft': 'microsoft',
                'amzon': 'amazon', 'amazn': 'amazon'
            }
            for typo, correct in typos.items():
                if typo in domain:
                    results["risk_score"] += 4
                    results["warnings"].append(f"🚨 Typosquatting محتمل: {typo} → {correct}")
            
            # التقييم النهائي
            if results["risk_score"] >= 5:
                results["is_suspicious"] = True
                results["verdict"] = "🔴 خطر عالي"
            elif results["risk_score"] >= 3:
                results["is_suspicious"] = True
                results["verdict"] = "🟡 مشبوه"
            else:
                results["verdict"] = "🟢 يبدو آمناً"
                
        except Exception as e:
            results["warnings"].append(f"خطأ في التحليل: {str(e)}")
        
        return results

# اختبار
detector = PhishingDetector()
urls = [
    "https://google.com/search",
    "http://googel-login.tk/verify",
    "http://192.168.1.1/paypal/login",
    "https://secure-banking-update.xyz/account"
]

for url in urls:
    result = detector.analyze_url(url)
    print(f"\\n{result['verdict']} - {url}")
    for warning in result['warnings']:
        print(f"  {warning}")`,
    language: 'python',
    xpReward: 100,
    order: 3,
    quiz: {
      question: 'ما هو Spear Phishing؟',
      options: [
        'هجوم عشوائي على الجميع',
        'هجوم موجه لشخص أو منظمة محددة',
        'هجوم عبر الهاتف',
        'هجوم على الشبكات',
      ],
      correctAnswer: 1,
      explanation: 'Spear Phishing هجوم مخصص ومدروس يستهدف ضحية محددة',
    },
  },
  {
    id: 'cyber-4',
    courseId: 'cyber-basics',
    title: 'أمن كلمات المرور',
    description: 'إنشاء وإدارة كلمات مرور قوية',
    content: `
# أمن كلمات المرور

## خصائص كلمة المرور القوية
- 12 حرف على الأقل
- أحرف كبيرة وصغيرة
- أرقام ورموز
- لا معلومات شخصية
- فريدة لكل حساب

## هجمات كلمات المرور

### 🔨 Brute Force
تجربة كل الاحتمالات.

### 📖 Dictionary Attack
استخدام قائمة كلمات شائعة.

### 🌈 Rainbow Table
جداول محسوبة مسبقاً للـ hashes.

### 🎭 Credential Stuffing
استخدام بيانات مسربة.

## أفضل الممارسات
- استخدم Password Manager
- فعّل 2FA/MFA
- لا تعيد استخدام كلمات المرور
- غيّرها عند الاختراق
`,
    codeExample: `import secrets
import string
import hashlib

class PasswordManager:
    """
    أدوات إدارة كلمات المرور الآمنة
    """
    
    @staticmethod
    def generate_password(length=16, 
                         use_upper=True, 
                         use_lower=True,
                         use_digits=True, 
                         use_special=True):
        """
        توليد كلمة مرور عشوائية آمنة
        """
        characters = ""
        required = []
        
        if use_lower:
            characters += string.ascii_lowercase
            required.append(secrets.choice(string.ascii_lowercase))
        
        if use_upper:
            characters += string.ascii_uppercase
            required.append(secrets.choice(string.ascii_uppercase))
        
        if use_digits:
            characters += string.digits
            required.append(secrets.choice(string.digits))
        
        if use_special:
            special = "!@#$%^&*()_+-=[]{}|;:,.<>?"
            characters += special
            required.append(secrets.choice(special))
        
        # توليد باقي الأحرف
        remaining_length = length - len(required)
        password_chars = required + [
            secrets.choice(characters) 
            for _ in range(remaining_length)
        ]
        
        # خلط الأحرف
        secrets.SystemRandom().shuffle(password_chars)
        
        return ''.join(password_chars)
    
    @staticmethod
    def generate_passphrase(num_words=4):
        """
        توليد عبارة مرور (أسهل للحفظ)
        """
        # قائمة كلمات بسيطة (في الواقع استخدم قائمة أكبر)
        words = [
            "apple", "banana", "cherry", "dragon", "eagle",
            "forest", "galaxy", "harbor", "island", "jungle",
            "knight", "lemon", "mountain", "nebula", "ocean",
            "phoenix", "quantum", "river", "storm", "thunder",
            "umbrella", "volcano", "winter", "xenon", "yellow"
        ]
        
        selected = [secrets.choice(words) for _ in range(num_words)]
        separator = secrets.choice(["-", "_", "."])
        
        return separator.join(selected)
    
    @staticmethod
    def hash_password(password, salt=None):
        """
        تشفير كلمة المرور (للتخزين)
        """
        if salt is None:
            salt = secrets.token_hex(16)
        
        # استخدام PBKDF2 (أفضل من MD5/SHA1)
        hash_value = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000  # iterations
        )
        
        return {
            "salt": salt,
            "hash": hash_value.hex()
        }
    
    @staticmethod
    def verify_password(password, salt, stored_hash):
        """
        التحقق من كلمة المرور
        """
        hash_value = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return hash_value.hex() == stored_hash
    
    @staticmethod
    def check_pwned(password):
        """
        فحص إذا كانت كلمة المرور مسربة
        (باستخدام k-anonymity - آمن)
        """
        sha1 = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
        prefix = sha1[:5]
        suffix = sha1[5:]
        
        # في التطبيق الحقيقي: ارسل prefix لـ haveibeenpwned API
        # هنا نحاكي النتيجة
        return {
            "prefix": prefix,
            "is_pwned": False,  # محاكاة
            "message": "للفحص الحقيقي استخدم haveibeenpwned.com/Passwords"
        }

# اختبار
pm = PasswordManager()

# توليد كلمات مرور
print("كلمة مرور عشوائية:")
print(pm.generate_password(16))

print("\\nعبارة مرور:")
print(pm.generate_passphrase(4))

# تشفير والتحقق
password = "MySecureP@ss123"
hashed = pm.hash_password(password)
print(f"\\nSalt: {hashed['salt']}")
print(f"Hash: {hashed['hash'][:40]}...")

# التحقق
is_valid = pm.verify_password(password, hashed['salt'], hashed['hash'])
print(f"\\nالتحقق: {'✅ صحيحة' if is_valid else '❌ خاطئة'}")`,
    language: 'python',
    xpReward: 100,
    order: 4,
    quiz: {
      question: 'ما أفضل طريقة لتخزين كلمات المرور؟',
      options: ['نص عادي', 'MD5 hash', 'SHA1 hash', 'PBKDF2/bcrypt مع salt'],
      correctAnswer: 3,
      explanation:
        'PBKDF2 أو bcrypt مع salt يوفران حماية ضد rainbow tables وbrute force',
    },
  },
  {
    id: 'cyber-5',
    courseId: 'cyber-basics',
    title: 'أساسيات الشبكات للأمن',
    description: 'فهم الشبكات من منظور أمني',
    content: `
# أساسيات الشبكات للأمن

## نموذج OSI
7 طبقات للاتصال:
1. Physical (فيزيائية)
2. Data Link (ربط البيانات)
3. Network (الشبكة) - IP
4. Transport (النقل) - TCP/UDP
5. Session (الجلسة)
6. Presentation (العرض)
7. Application (التطبيق) - HTTP

## بروتوكولات مهمة

### TCP vs UDP
- TCP: موثوق، مرتب (HTTP, SSH)
- UDP: سريع، غير موثوق (DNS, VoIP)

### المنافذ الشائعة
- 80: HTTP
- 443: HTTPS
- 22: SSH
- 21: FTP
- 3389: RDP
- 3306: MySQL

## أدوات الفحص
- nmap: فحص المنافذ
- Wireshark: تحليل الحزم
- netstat: الاتصالات الحالية
`,
    codeExample: `import socket
import struct

class NetworkTools:
    """
    أدوات شبكية للأمن السيبراني
    """
    
    @staticmethod
    def port_scan(target, ports=[21, 22, 23, 25, 53, 80, 443, 3306, 3389, 8080]):
        """
        فحص المنافذ (Port Scanner بسيط)
        ⚠️ للاستخدام على أنظمتك فقط!
        """
        results = {
            "target": target,
            "open_ports": [],
            "closed_ports": []
        }
        
        port_services = {
            21: "FTP",
            22: "SSH",
            23: "Telnet",
            25: "SMTP",
            53: "DNS",
            80: "HTTP",
            443: "HTTPS",
            3306: "MySQL",
            3389: "RDP",
            8080: "HTTP-Proxy"
        }
        
        for port in ports:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            
            try:
                result = sock.connect_ex((target, port))
                if result == 0:
                    service = port_services.get(port, "Unknown")
                    results["open_ports"].append({
                        "port": port,
                        "service": service,
                        "status": "OPEN"
                    })
                else:
                    results["closed_ports"].append(port)
            except:
                pass
            finally:
                sock.close()
        
        return results
    
    @staticmethod
    def get_local_ip():
        """الحصول على IP المحلي"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "127.0.0.1"
    
    @staticmethod
    def dns_lookup(domain):
        """استعلام DNS"""
        results = {
            "domain": domain,
            "records": {}
        }
        
        try:
            # A Record
            results["records"]["A"] = socket.gethostbyname(domain)
            
            # All records
            results["records"]["ALL"] = socket.gethostbyname_ex(domain)
            
        except socket.gaierror as e:
            results["error"] = str(e)
        
        return results
    
    @staticmethod
    def check_connection(host, port, timeout=5):
        """فحص اتصال TCP"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            sock.close()
            
            return {
                "host": host,
                "port": port,
                "reachable": result == 0,
                "status": "متصل ✅" if result == 0 else "غير متصل ❌"
            }
        except Exception as e:
            return {
                "host": host,
                "port": port,
                "reachable": False,
                "error": str(e)
            }
    
    @staticmethod
    def analyze_packet_header(data):
        """
        تحليل رأس حزمة IP (للتعليم)
        """
        if len(data) < 20:
            return {"error": "البيانات قصيرة جداً"}
        
        # فك رأس IP
        version_ihl = data[0]
        version = version_ihl >> 4
        ihl = version_ihl & 0xF
        
        ttl = data[8]
        protocol = data[9]
        
        src_ip = ".".join(map(str, data[12:16]))
        dst_ip = ".".join(map(str, data[16:20]))
        
        protocols = {1: "ICMP", 6: "TCP", 17: "UDP"}
        
        return {
            "version": version,
            "header_length": ihl * 4,
            "ttl": ttl,
            "protocol": protocols.get(protocol, f"Unknown ({protocol})"),
            "source_ip": src_ip,
            "destination_ip": dst_ip
        }

# اختبار
tools = NetworkTools()

# IP المحلي
print(f"IP المحلي: {tools.get_local_ip()}")

# DNS lookup
dns = tools.dns_lookup("google.com")
print(f"\\nDNS لـ google.com:")
print(f"  IP: {dns['records'].get('A', 'N/A')}")

# فحص اتصال
conn = tools.check_connection("google.com", 443)
print(f"\\nفحص اتصال google.com:443")
print(f"  {conn['status']}")

# ⚠️ فحص المنافذ - للاستخدام على أنظمتك فقط!
# result = tools.port_scan("localhost")
# print(result)`,
    language: 'python',
    xpReward: 120,
    order: 5,
    quiz: {
      question: 'ما المنفذ الافتراضي لـ HTTPS؟',
      options: ['80', '443', '22', '8080'],
      correctAnswer: 1,
      explanation: 'HTTPS يستخدم المنفذ 443 افتراضياً',
    },
  },
  {
    id: 'cyber-6',
    courseId: 'cyber-basics',
    title: 'التشفير الأساسي',
    description: 'مبادئ التشفير وأنواعه',
    content: `
# التشفير (Cryptography)

## أنواع التشفير

### التشفير المتماثل (Symmetric)
- مفتاح واحد للتشفير والفك
- أسرع
- أمثلة: AES, DES

### التشفير غير المتماثل (Asymmetric)
- مفتاح عام للتشفير
- مفتاح خاص للفك
- أمثلة: RSA, ECC

### Hashing
- اتجاه واحد (لا يُفك)
- للتحقق من السلامة
- أمثلة: SHA-256, bcrypt

## استخدامات التشفير
- 🔐 حماية البيانات
- 🌐 HTTPS/TLS
- 📧 توقيع البريد
- 💰 العملات الرقمية
- 🔑 كلمات المرور
`,
    codeExample: `import hashlib
import base64
import os
from typing import Tuple

class CryptoDemo:
    """
    عرض توضيحي لمفاهيم التشفير
    ⚠️ للتعليم فقط - في الإنتاج استخدم مكتبات موثوقة
    """
    
    # ===== Caesar Cipher (تاريخي - للتعليم) =====
    @staticmethod
    def caesar_encrypt(text, shift=3):
        """تشفير قيصر البسيط"""
        result = ""
        for char in text:
            if char.isalpha():
                ascii_offset = ord('A') if char.isupper() else ord('a')
                shifted = (ord(char) - ascii_offset + shift) % 26
                result += chr(shifted + ascii_offset)
            else:
                result += char
        return result
    
    @staticmethod
    def caesar_decrypt(text, shift=3):
        """فك تشفير قيصر"""
        return CryptoDemo.caesar_encrypt(text, -shift)
    
    # ===== XOR Cipher =====
    @staticmethod
    def xor_cipher(data: bytes, key: bytes) -> bytes:
        """تشفير XOR البسيط"""
        return bytes([d ^ key[i % len(key)] for i, d in enumerate(data)])
    
    # ===== Hashing =====
    @staticmethod
    def hash_md5(data: str) -> str:
        """MD5 hash (⚠️ ضعيف - لا تستخدم للأمان)"""
        return hashlib.md5(data.encode()).hexdigest()
    
    @staticmethod
    def hash_sha256(data: str) -> str:
        """SHA-256 hash (آمن)"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    @staticmethod
    def hash_sha512(data: str) -> str:
        """SHA-512 hash (أقوى)"""
        return hashlib.sha512(data.encode()).hexdigest()
    
    @staticmethod
    def hash_with_salt(password: str, salt: bytes = None) -> Tuple[str, bytes]:
        """Hash مع salt"""
        if salt is None:
            salt = os.urandom(16)
        
        hash_value = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode(),
            salt,
            100000
        )
        return hash_value.hex(), salt
    
    # ===== Base64 (ترميز وليس تشفير!) =====
    @staticmethod
    def base64_encode(data: str) -> str:
        """ترميز Base64 (ليس تشفير!)"""
        return base64.b64encode(data.encode()).decode()
    
    @staticmethod
    def base64_decode(data: str) -> str:
        """فك ترميز Base64"""
        return base64.b64decode(data.encode()).decode()
    
    # ===== أدوات تحليل =====
    @staticmethod
    def frequency_analysis(text: str) -> dict:
        """تحليل التردد (لكسر التشفير البسيط)"""
        text = text.upper()
        freq = {}
        total = 0
        
        for char in text:
            if char.isalpha():
                freq[char] = freq.get(char, 0) + 1
                total += 1
        
        # تحويل لنسب مئوية
        for char in freq:
            freq[char] = round((freq[char] / total) * 100, 2)
        
        return dict(sorted(freq.items(), key=lambda x: x[1], reverse=True))

# ===== أمثلة =====
crypto = CryptoDemo()

# Caesar Cipher
print("=== Caesar Cipher ===")
original = "HELLO WORLD"
encrypted = crypto.caesar_encrypt(original, 3)
decrypted = crypto.caesar_decrypt(encrypted, 3)
print(f"Original:  {original}")
print(f"Encrypted: {encrypted}")
print(f"Decrypted: {decrypted}")

# Hashing
print("\\n=== Hashing ===")
message = "password123"
print(f"النص: {message}")
print(f"MD5:    {crypto.hash_md5(message)}")
print(f"SHA256: {crypto.hash_sha256(message)}")

# Hash مع Salt
print("\\n=== Hash with Salt ===")
hash_val, salt = crypto.hash_with_salt("mypassword")
print(f"Hash: {hash_val[:40]}...")
print(f"Salt: {salt.hex()}")

# Base64
print("\\n=== Base64 (ترميز وليس تشفير!) ===")
text = "Secret Message"
encoded = crypto.base64_encode(text)
decoded = crypto.base64_decode(encoded)
print(f"Original: {text}")
print(f"Encoded:  {encoded}")
print(f"Decoded:  {decoded}")

# Frequency Analysis
print("\\n=== Frequency Analysis ===")
sample = "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG"
freq = crypto.frequency_analysis(sample)
print("أكثر 5 حروف تكراراً:")
for i, (char, pct) in enumerate(list(freq.items())[:5]):
    print(f"  {char}: {pct}%")`,
    language: 'python',
    xpReward: 120,
    order: 6,
    quiz: {
      question: 'ما الفرق بين التشفير المتماثل وغير المتماثل؟',
      options: [
        'لا فرق',
        'المتماثل يستخدم مفتاحين مختلفين',
        'غير المتماثل يستخدم مفتاح عام وخاص',
        'المتماثل للنصوص فقط',
      ],
      correctAnswer: 2,
      explanation:
        'التشفير غير المتماثل يستخدم زوج من المفاتيح: عام للتشفير وخاص للفك',
    },
  },
];

// ===== دروس الأمن المتقدمة =====
export const CYBER_LESSONS_ADVANCED: Lesson[] = [
  {
    id: 'cyber-adv-1',
    courseId: 'cyber-advanced',
    title: 'SQL Injection',
    description: 'فهم ومنع حقن SQL',
    content: `
# SQL Injection

## ما هو SQL Injection؟
هجوم يحقن أوامر SQL ضارة عبر مدخلات المستخدم.

## أنواع SQL Injection

### Classic SQLi
\`' OR 1=1 --\`

### Union-based
استخراج بيانات من جداول أخرى.

### Blind SQLi
لا يظهر الخطأ، لكن يمكن استنتاجه.

### Time-based
استخدام SLEEP() لاستنتاج المعلومات.

## الوقاية
- ✅ Prepared Statements
- ✅ Parameterized Queries
- ✅ Input Validation
- ✅ Least Privilege
- ❌ String Concatenation
`,
    codeExample: `import sqlite3
import re

class SQLInjectionDemo:
    """
    عرض توضيحي لـ SQL Injection وكيفية الوقاية
    """
    
    def __init__(self):
        # إنشاء قاعدة بيانات للاختبار
        self.conn = sqlite3.connect(':memory:')
        self.cursor = self.conn.cursor()
        self._setup_db()
    
    def _setup_db(self):
        """إعداد جداول الاختبار"""
        self.cursor.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY,
                username TEXT,
                password TEXT,
                email TEXT,
                is_admin INTEGER
            )
        ''')
        
        # بيانات تجريبية
        users = [
            (1, 'admin', 'admin123', 'admin@example.com', 1),
            (2, 'user1', 'pass123', 'user1@example.com', 0),
            (3, 'user2', 'pass456', 'user2@example.com', 0),
        ]
        self.cursor.executemany(
            'INSERT INTO users VALUES (?, ?, ?, ?, ?)', 
            users
        )
        self.conn.commit()
    
    # ❌ طريقة خاطئة - معرضة للـ SQLi
    def vulnerable_login(self, username, password):
        """
        ⚠️ هذا كود ضعيف! للتوضيح فقط
        """
        query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
        print(f"Query: {query}")
        
        try:
            self.cursor.execute(query)
            result = self.cursor.fetchone()
            return result
        except Exception as e:
            return f"Error: {e}"
    
    # ✅ طريقة صحيحة - محمية
    def secure_login(self, username, password):
        """
        ✅ استخدام Parameterized Queries
        """
        query = "SELECT * FROM users WHERE username=? AND password=?"
        print(f"Query: {query}")
        print(f"Params: ({username}, {password})")
        
        self.cursor.execute(query, (username, password))
        return self.cursor.fetchone()
    
    # التحقق من المدخلات
    @staticmethod
    def validate_input(user_input):
        """
        فحص المدخلات للأنماط المشبوهة
        """
        suspicious_patterns = [
            r"('\\s*OR\\s*')",
            r"(--)",
            r"(;)",
            r"(UNION\\s+SELECT)",
            r"(DROP\\s+TABLE)",
            r"(INSERT\\s+INTO)",
            r"(DELETE\\s+FROM)",
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, user_input, re.IGNORECASE):
                return False, f"نمط مشبوه: {pattern}"
        
        return True, "OK"

# ===== عرض توضيحي =====
demo = SQLInjectionDemo()

print("=== محاولة تسجيل دخول عادية ===")
result = demo.vulnerable_login("admin", "admin123")
print(f"النتيجة: {result}\\n")

print("=== هجوم SQL Injection ===")
# ' OR '1'='1 يجعل الشرط دائماً صحيح
malicious_input = "' OR '1'='1"
result = demo.vulnerable_login(malicious_input, malicious_input)
print(f"النتيجة: {result}")
print("⚠️ تم الدخول بدون كلمة مرور صحيحة!\\n")

print("=== نفس الهجوم على الكود الآمن ===")
result = demo.secure_login(malicious_input, malicious_input)
print(f"النتيجة: {result}")
print("✅ الهجوم فشل!\\n")

print("=== فحص المدخلات ===")
test_inputs = [
    "normaluser",
    "' OR 1=1 --",
    "admin'; DROP TABLE users; --"
]

for test in test_inputs:
    valid, msg = SQLInjectionDemo.validate_input(test)
    status = "✅" if valid else "❌"
    print(f"{status} '{test}' - {msg}")`,
    language: 'python',
    xpReward: 150,
    order: 1,
    quiz: {
      question: 'ما أفضل طريقة لمنع SQL Injection؟',
      options: [
        'فلترة الأحرف الخاصة',
        'استخدام Prepared Statements',
        'تشفير المدخلات',
        'إخفاء رسائل الخطأ',
      ],
      correctAnswer: 1,
      explanation:
        'Prepared Statements تفصل بين الكود والبيانات، مما يمنع الحقن',
    },
  },
  {
    id: 'cyber-adv-2',
    courseId: 'cyber-advanced',
    title: 'XSS - Cross-Site Scripting',
    description: 'هجمات حقن JavaScript',
    content: `
# Cross-Site Scripting (XSS)

## ما هو XSS؟
حقن كود JavaScript ضار في صفحات الويب.

## أنواع XSS

### Reflected XSS
يُرسل في URL ويُعكس في الصفحة.
\`\`\`
https://site.com/search?q=<script>alert('XSS')</script>
\`\`\`

### Stored XSS
يُخزن في قاعدة البيانات (أخطر).

### DOM-based XSS
يحدث في كود JavaScript العميل.

## مخاطر XSS
- سرقة Cookies/Sessions
- تعديل محتوى الصفحة
- إعادة توجيه المستخدم
- نشر Malware

## الوقاية
- ✅ Escape Output
- ✅ Content Security Policy
- ✅ HttpOnly Cookies
- ✅ Input Validation
`,
    codeExample: `import html
import re
from typing import Dict, List

class XSSProtection:
    """
    أدوات الحماية من XSS
    """
    
    @staticmethod
    def escape_html(text: str) -> str:
        """
        تحويل الأحرف الخطرة لـ HTML entities
        """
        return html.escape(text)
    
    @staticmethod
    def sanitize_input(text: str, allowed_tags: List[str] = None) -> str:
        """
        تنظيف HTML مع السماح ببعض العناصر
        """
        if allowed_tags is None:
            allowed_tags = ['b', 'i', 'u', 'p', 'br']
        
        # إزالة كل العناصر غير المسموحة
        pattern = r'<(?!/?({}))([^>]*)>'.format('|'.join(allowed_tags))
        cleaned = re.sub(pattern, '', text)
        
        # إزالة الأحداث مثل onclick, onerror
        event_pattern = r'\\s+on\\w+\\s*=\\s*["\\'][^"\\']*["\\']'
        cleaned = re.sub(event_pattern, '', cleaned, flags=re.IGNORECASE)
        
        return cleaned
    
    @staticmethod
    def detect_xss_patterns(text: str) -> Dict:
        """
        كشف أنماط XSS المشبوهة
        """
        patterns = {
            'script_tag': r'<script[^>]*>.*?</script>',
            'event_handler': r'\\s+on\\w+\\s*=',
            'javascript_url': r'javascript\\s*:',
            'data_url': r'data\\s*:',
            'vbscript': r'vbscript\\s*:',
            'expression': r'expression\\s*\\(',
            'iframe': r'<iframe[^>]*>',
            'object_embed': r'<(object|embed)[^>]*>',
            'svg_event': r'<svg[^>]*on\\w+',
            'img_onerror': r'<img[^>]*onerror',
        }
        
        results = {
            'is_suspicious': False,
            'detected_patterns': []
        }
        
        for name, pattern in patterns.items():
            if re.search(pattern, text, re.IGNORECASE | re.DOTALL):
                results['is_suspicious'] = True
                results['detected_patterns'].append(name)
        
        return results
    
    @staticmethod
    def generate_csp_header() -> str:
        """
        توليد Content-Security-Policy header
        """
        policies = [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self'",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "form-action 'self'",
        ]
        return "; ".join(policies)
    
    @staticmethod
    def encode_for_javascript(text: str) -> str:
        """
        تشفير للاستخدام داخل JavaScript
        """
        # تحويل لـ Unicode escape sequences
        result = ""
        for char in text:
            if char.isalnum():
                result += char
            else:
                result += "\\\\u{:04x}".format(ord(char))
        return result

# ===== عرض توضيحي =====
xss = XSSProtection()

print("=== HTML Escaping ===")
malicious = '<script>alert("XSS")</script>'
safe = xss.escape_html(malicious)
print(f"Original: {malicious}")
print(f"Escaped:  {safe}\\n")

print("=== تنظيف HTML ===")
dirty_html = '<p>Hello <b>World</b></p><script>evil()</script><img onerror="alert(1)">'
clean = xss.sanitize_input(dirty_html)
print(f"Original: {dirty_html}")
print(f"Cleaned:  {clean}\\n")

print("=== كشف أنماط XSS ===")
test_inputs = [
    "Hello World",
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert(1)>",
    "<a href='javascript:void(0)'>Click</a>",
    "Normal text with <b>bold</b>"
]

for test in test_inputs:
    result = xss.detect_xss_patterns(test)
    status = "🚨" if result['is_suspicious'] else "✅"
    print(f"{status} '{test[:40]}...'")
    if result['detected_patterns']:
        print(f"   Patterns: {', '.join(result['detected_patterns'])}")

print("\\n=== CSP Header ===")
print(xss.generate_csp_header())`,
    language: 'python',
    xpReward: 150,
    order: 2,
    quiz: {
      question: 'ما أخطر نوع من XSS؟',
      options: [
        'Reflected XSS',
        'Stored XSS',
        'DOM-based XSS',
        'كلهم بنفس الخطورة',
      ],
      correctAnswer: 1,
      explanation: 'Stored XSS أخطر لأنه يُخزن ويؤثر على كل من يزور الصفحة',
    },
  },
  {
    id: 'cyber-adv-3',
    courseId: 'cyber-advanced',
    title: 'اختبار الاختراق (Pen Testing)',
    description: 'منهجية وأدوات اختبار الاختراق',
    content: `
# اختبار الاختراق (Penetration Testing)

## مراحل اختبار الاختراق

### 1. Reconnaissance (الاستطلاع)
- Passive: بدون تفاعل مباشر
- Active: تفاعل مع الهدف

### 2. Scanning (الفحص)
- Port scanning
- Vulnerability scanning
- Service enumeration

### 3. Exploitation (الاستغلال)
- استغلال الثغرات المكتشفة
- الحصول على access

### 4. Post-Exploitation
- Privilege escalation
- Lateral movement
- Data exfiltration

### 5. Reporting
- توثيق كل شيء
- تقديم التوصيات

## أدوات شهيرة
- Nmap, Burp Suite
- Metasploit, SQLmap
- Wireshark, John the Ripper
`,
    codeExample: `import socket
import subprocess
import sys
import re

class PenTestTools:
    """
    أدوات اختبار اختراق بسيطة للتعليم
    ⚠️ للاستخدام على أنظمتك فقط بإذن!
    """
    
    @staticmethod
    def banner_grab(target: str, port: int) -> dict:
        """
        جمع معلومات الخدمة (Banner Grabbing)
        """
        result = {
            "target": target,
            "port": port,
            "banner": None,
            "error": None
        }
        
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            sock.connect((target, port))
            
            # إرسال طلب بسيط
            if port == 80:
                sock.send(b"HEAD / HTTP/1.1\\r\\nHost: " + target.encode() + b"\\r\\n\\r\\n")
            else:
                sock.send(b"\\r\\n")
            
            banner = sock.recv(1024).decode('utf-8', errors='ignore')
            result["banner"] = banner.strip()
            
        except Exception as e:
            result["error"] = str(e)
        finally:
            sock.close()
        
        return result
    
    @staticmethod
    def subdomain_enum(domain: str, wordlist: list = None) -> list:
        """
        اكتشاف النطاقات الفرعية
        """
        if wordlist is None:
            wordlist = [
                'www', 'mail', 'ftp', 'admin', 'blog',
                'api', 'dev', 'test', 'staging', 'app',
                'shop', 'store', 'secure', 'vpn', 'remote'
            ]
        
        found = []
        
        for sub in wordlist:
            subdomain = f"{sub}.{domain}"
            try:
                ip = socket.gethostbyname(subdomain)
                found.append({
                    "subdomain": subdomain,
                    "ip": ip
                })
            except socket.gaierror:
                pass
        
        return found
    
    @staticmethod
    def check_common_vulns(url: str) -> dict:
        """
        فحص ثغرات شائعة (محاكاة)
        """
        checks = {
            "sql_injection_params": False,
            "xss_reflection": False,
            "directory_listing": False,
            "sensitive_files": [],
            "security_headers": {}
        }
        
        # فحص ملفات حساسة شائعة
        sensitive_paths = [
            "/.env", "/config.php", "/wp-config.php",
            "/.git/config", "/backup.sql", "/admin",
            "/phpinfo.php", "/.htaccess", "/server-status"
        ]
        
        # محاكاة - في الواقع نرسل requests
        checks["notes"] = "هذا فحص محاكاة للتعليم"
        
        return checks
    
    @staticmethod
    def password_strength_audit(passwords: list) -> list:
        """
        تدقيق قوة كلمات المرور
        """
        common_passwords = [
            "password", "123456", "qwerty", "admin",
            "letmein", "welcome", "monkey", "dragon"
        ]
        
        results = []
        
        for pwd in passwords:
            audit = {
                "password": pwd[:3] + "*" * (len(pwd) - 3),
                "issues": []
            }
            
            if len(pwd) < 8:
                audit["issues"].append("قصيرة جداً (< 8)")
            
            if pwd.lower() in common_passwords:
                audit["issues"].append("كلمة مرور شائعة!")
            
            if not re.search(r'[A-Z]', pwd):
                audit["issues"].append("لا تحتوي حروف كبيرة")
            
            if not re.search(r'[0-9]', pwd):
                audit["issues"].append("لا تحتوي أرقام")
            
            if not re.search(r'[!@#$%^&*]', pwd):
                audit["issues"].append("لا تحتوي رموز")
            
            audit["risk"] = "🔴 عالي" if len(audit["issues"]) >= 3 else \
                           "🟡 متوسط" if len(audit["issues"]) >= 1 else "🟢 منخفض"
            
            results.append(audit)
        
        return results
    
    @staticmethod
    def generate_report(findings: dict) -> str:
        """
        توليد تقرير اختبار اختراق
        """
        report = """
╔══════════════════════════════════════════════╗
║         تقرير اختبار الاختراق               ║
╚══════════════════════════════════════════════╝

📅 التاريخ: {date}
🎯 الهدف: {target}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ملخص النتائج:
  - ثغرات حرجة: {critical}
  - ثغرات عالية: {high}
  - ثغرات متوسطة: {medium}
  - ثغرات منخفضة: {low}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 التوصيات:
{recommendations}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
        return report.format(**findings)

# ===== عرض توضيحي =====
tools = PenTestTools()

print("=== Banner Grabbing ===")
# result = tools.banner_grab("scanme.nmap.org", 80)
# print(result)
print("(يتطلب اتصال بالشبكة)\\n")

print("=== Subdomain Enumeration ===")
# subdomains = tools.subdomain_enum("google.com")
# for sub in subdomains:
#     print(f"  {sub['subdomain']} -> {sub['ip']}")
print("(يتطلب اتصال بالشبكة)\\n")

print("=== Password Audit ===")
test_passwords = ["admin", "MyP@ssw0rd!", "hello123", "Tr0ub4dor&3"]
audit_results = tools.password_strength_audit(test_passwords)

for result in audit_results:
    print(f"{result['risk']} {result['password']}")
    for issue in result['issues']:
        print(f"    ↳ {issue}")`,
    language: 'python',
    xpReward: 180,
    order: 3,
    quiz: {
      question: 'ما أول مرحلة في اختبار الاختراق؟',
      options: ['Exploitation', 'Reconnaissance', 'Reporting', 'Scanning'],
      correctAnswer: 1,
      explanation:
        'Reconnaissance (الاستطلاع) هي المرحلة الأولى لجمع المعلومات',
    },
  },
];

// ===== تحديات الأمن السيبراني =====
export const CYBER_CHALLENGES: Challenge[] = [
  {
    id: 'cyber-ch-1',
    title: 'فك تشفير قيصر',
    description: 'فك تشفير نص مشفر بتشفير قيصر',
    difficulty: 'easy',
    points: 30,
    language: 'Python',
    icon: 'lock-open',
    starterCode: `def caesar_decrypt(ciphertext, shift):
    """
    فك تشفير قيصر
    """
    # اكتب الحل هنا
    pass

# اختبار
# النص المشفر بإزاحة 3
encrypted = "KHOOR ZRUOG"
print(caesar_decrypt(encrypted, 3))  # HELLO WORLD`,
    solution: `def caesar_decrypt(ciphertext, shift):
    result = ""
    for char in ciphertext:
        if char.isalpha():
            ascii_offset = ord('A') if char.isupper() else ord('a')
            decrypted = (ord(char) - ascii_offset - shift) % 26
            result += chr(decrypted + ascii_offset)
        else:
            result += char
    return result`,
    hints: [
      'فك التشفير = طرح الإزاحة',
      'استخدم modulo 26 للأحرف',
      'حافظ على المسافات والرموز',
    ],
    testCases: [
      {
        input: '"KHOOR ZRUOG", 3',
        expectedOutput: '"HELLO WORLD"',
        description: 'نص بسيط',
      },
      { input: '"ABC", 1', expectedOutput: '"ZAB"', description: 'التفاف' },
    ],
    isLocked: false,
    category: 'cryptography',
  },
  {
    id: 'cyber-ch-2',
    title: 'كاشف SQL Injection',
    description: 'اكتشف أنماط SQL Injection في المدخلات',
    difficulty: 'medium',
    points: 50,
    language: 'Python',
    icon: 'security',
    starterCode: `import re

def detect_sqli(input_string):
    """
    اكتشاف محاولات SQL Injection
    أرجع True إذا كان مشبوهاً
    """
    # اكتب الحل هنا
    pass

# اختبار
print(detect_sqli("admin"))              # False
print(detect_sqli("' OR 1=1 --"))       # True
print(detect_sqli("1; DROP TABLE"))     # True`,
    solution: `import re

def detect_sqli(input_string):
    patterns = [
        r"('\\s*OR\\s*')|('\\s*or\\s*')",
        r"(--)",
        r"(;\\s*(DROP|SELECT|INSERT|UPDATE|DELETE|ALTER|CREATE)\\b)",
        r"(UNION\\s+SELECT)",
        r"(DROP\\s+TABLE)",
        r"(INSERT\\s+INTO)",
        r"(SELECT\\s+\\*)",
        r"(1\\s*=\\s*1)",
        r"(admin\\s*'--)"
    ]
    
    for pattern in patterns:
        if re.search(pattern, input_string, re.IGNORECASE):
            return True
    return False`,
    hints: [
      'ابحث عن أنماط SQL الشائعة',
      'استخدم regex مع re.IGNORECASE',
      'فكر في: OR, --, UNION, DROP',
    ],
    testCases: [
      {
        input: '"normal text"',
        expectedOutput: 'False',
        description: 'نص عادي',
      },
      {
        input: "\"' OR '1'='1\"",
        expectedOutput: 'True',
        description: 'Classic SQLi',
      },
      {
        input: '"hello; world"',
        expectedOutput: 'False',
        description: 'فاصلة منقوطة عادية بدون SQL',
      },
      {
        input: '"1; DROP TABLE users"',
        expectedOutput: 'True',
        description: 'SQL Injection مع DROP',
      },
    ],
    isLocked: true,
    category: 'web-security',
  },
  {
    id: 'cyber-ch-3',
    title: 'محلل قوة كلمة المرور',
    description: 'قيّم قوة كلمة المرور وأعط نصائح',
    difficulty: 'medium',
    points: 50,
    language: 'Python',
    icon: 'vpn-key',
    starterCode: `def analyze_password(password):
    """
    تحليل قوة كلمة المرور
    أرجع: {"score": 0-100, "strength": "weak/medium/strong", "tips": [...]}
    """
    # اكتب الحل هنا
    pass

# اختبار
print(analyze_password("hello"))
print(analyze_password("MyP@ssw0rd!2024"))`,
    solution: `import re

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
    
    return {"score": min(score, 100), "strength": strength, "tips": tips}`,
    hints: [
      'احسب نقاط لكل معيار',
      'تحقق من: الطول، الحروف، الأرقام، الرموز',
      'أضف نصائح للتحسين',
    ],
    testCases: [
      {
        input: 'analyze_password("123")["strength"]',
        expectedOutput: 'weak',
        description: 'كلمة ضعيفة',
      },
      {
        input: 'analyze_password("MyP@ss123!")["strength"]',
        expectedOutput: 'strong',
        description: 'كلمة قوية',
      },
    ],
    isLocked: true,
    category: 'security',
  },
];

// تصدير الكل
export const ALL_CYBER_LESSONS = [
  ...CYBER_LESSONS_BEGINNER,
  ...CYBER_LESSONS_ADVANCED,
];
export const ALL_CYBER_CHALLENGES = CYBER_CHALLENGES;
