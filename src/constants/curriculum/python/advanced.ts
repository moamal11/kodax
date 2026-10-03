/**
 * منهج py-advanced — Python المتقدم.
 *
 * كان: Decorators أول درس قبل Lambda/الدوال كقيم التي تحتاجها؛ Generators قبل
 * Iterators؛ مثالان يكتبان نصاً عربياً بدون encoding فيفشلان على Windows،
 * وأحدهما يقرأ ملفاً غير موجود (in.txt).
 */
import type { CoursePlan } from '../types';
import { md } from '../md';
import { PY_ADVANCED_CONTENT, PY_ADVANCED_NEW } from './advanced-content';

/** إصلاحات الأمثلة (تُدمج مع الشرح الجديد) */
const CODE_FIXES: CoursePlan['patches'] = {
    'py-adv-5': {
      codeExample: md`
# استخدام with المدمج (encoding ضروري للنص العربي)
with open("test.txt", "w", encoding="utf-8") as f:
    f.write("مرحباً!")
# الملف مغلق تلقائياً هنا

# إنشاء Context Manager بالـ class
import time

class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"الوقت: {time.perf_counter() - self.start:.4f} ثانية")
        return False  # لا نبتلع الأخطاء

with Timer():
    sum(range(1_000_000))

# Context Manager مع معالجة الأخطاء
class DatabaseConnection:
    def __init__(self, host):
        self.host = host
        self.connection = None

    def __enter__(self):
        print(f"الاتصال بـ {self.host}...")
        self.connection = {"connected": True}
        return self.connection

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("إغلاق الاتصال...")
        self.connection = None
        if exc_type is not None:
            print(f"حدث خطأ: {exc_val}")
        return False

with DatabaseConnection("localhost") as db:
    print("استعلام قاعدة البيانات...")

# باستخدام contextmanager decorator
from contextlib import contextmanager, suppress
import shutil
import tempfile

@contextmanager
def temp_directory():
    dirpath = tempfile.mkdtemp()
    print(f"إنشاء مجلد مؤقت: {dirpath}")
    try:
        yield dirpath
    finally:
        shutil.rmtree(dirpath)
        print("حذف المجلد المؤقت")

with temp_directory() as tmpdir:
    print(f"العمل في: {tmpdir}")

# عدة Context Managers في سطر واحد
with open("test.txt", encoding="utf-8") as fin, open("out.txt", "w", encoding="utf-8") as fout:
    fout.write(fin.read() + " (نسخة)")

# suppress لتجاهل خطأ محدد ومتوقع
with suppress(FileNotFoundError):
    with open("nonexistent.txt", encoding="utf-8") as f:
        print(f.read())

# تنظيف ملفات المثال
import os
os.remove("test.txt")
os.remove("out.txt")
`,
    },
    'py-adv-13': {
      codeExample: md`
import csv
import json
import os
import tempfile
from pathlib import Path

# ===== الأساسيات مع with =====
with open("file.txt", "w", encoding="utf-8") as f:
    f.write("مرحباً\n")
    f.writelines(["سطر 1\n", "سطر 2\n"])

with open("file.txt", encoding="utf-8") as f:
    for line in f:
        print(line.strip())

# ===== Path (الطريقة الحديثة) =====
folder = Path("data") / "output"
folder.mkdir(parents=True, exist_ok=True)
file_path = folder / "results.txt"
file_path.write_text("بيانات", encoding="utf-8")
print(file_path.read_text(encoding="utf-8"))
print(file_path.exists(), file_path.is_file(), file_path.suffix, file_path.stem)

for f in Path(".").glob("*.txt"):
    print("ملف نصي:", f.name)

# ===== JSON =====
data = {"name": "أحمد", "age": 25, "scores": [90, 85, 92]}
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
with open("data.json", encoding="utf-8") as f:
    print(json.load(f))

# ===== CSV =====
with open("data.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "age"])
    writer.writeheader()
    writer.writerow({"name": "أحمد", "age": 25})
    writer.writerow({"name": "محمد", "age": 30})
with open("data.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(row["name"], row["age"])

# ===== الملفات الكبيرة: سطراً سطراً أو بكتل =====
def read_in_chunks(path, chunk_size=1024 * 1024):
    with open(path, "rb") as f:
        while chunk := f.read(chunk_size):
            yield chunk

print("حجم file.txt بالبايت:", sum(len(c) for c in read_in_chunks("file.txt")))

# ===== الملفات المؤقتة =====
with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", delete=False) as f:
    f.write("بيانات مؤقتة")
    temp_path = f.name
print("الملف المؤقت:", temp_path)
os.unlink(temp_path)

# تنظيف ملفات المثال
for name in ["file.txt", "data.json", "data.csv"]:
    os.remove(name)
file_path.unlink()
folder.rmdir()
folder.parent.rmdir()
`,
    },
};


export const PY_ADVANCED_PLAN: CoursePlan = {
  course: {
    description:
      'Python المتقدم: الدوال كقيم والإغلاقات، decorators، المكرّرات والمولّدات، مدراء السياق، التعابير النمطية، تلميحات الأنواع، الاختبارات، logging، الملفات المتقدمة، البيئات الافتراضية، async و التوازي — مع مشروع أداة سطر أوامر مختبرة.',
  },
  courseId: 'py-advanced',
  sections: [
    { title: 'الدوال المتقدمة', lessons: ['py-adv-7', 'py-adv-3'] },
    { title: 'التكرار الكسول', lessons: ['py-adv-6', 'py-adv-4'] },
    { title: 'الموارد والنصوص', lessons: ['py-adv-5', 'py-adv-8'] },
    { title: 'جودة الكود', lessons: ['py-adv-10', 'py-adv-11', 'py-adv-12'] },
    { title: 'الملفات والبيئة', lessons: ['py-adv-13', 'py-adv-14'] },
    { title: 'التزامن والتوازي', lessons: ['py-adv-9', 'py-adv-concurrency'] },
    { title: 'المشروع الختامي', lessons: ['py-adv-project'] },
  ],
  patches: Object.fromEntries(
    [...new Set([...Object.keys(PY_ADVANCED_CONTENT), ...Object.keys(CODE_FIXES ?? {})])].map((id) => [
      id,
      { ...(PY_ADVANCED_CONTENT[id] ?? {}), ...(CODE_FIXES?.[id] ?? {}) },
    ])
  ),
  newLessons: PY_ADVANCED_NEW,
};
