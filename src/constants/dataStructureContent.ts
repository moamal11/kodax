// ===== تحديات هياكل البيانات =====

import { Challenge, Lesson } from './courseData';

// ===== تحديات المبتدئين =====
export const DS_CHALLENGES_BEGINNER: Challenge[] = [
  {
    id: 'ds-ch-stack-001',
    title: 'تطبيق Stack',
    description:
      'اكتب فئة Stack باستخدام قائمة مع عمليات push، pop، peek، و is_empty',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    icon: 'layers',
    starterCode: `def stack_operations(operations):
    # نفّذ عمليات Stack وأرجع النتائج
    # operations = [("push", 1), ("push", 2), ("pop",), ("peek",)]
    # أرجع قائمة بنتائج pop و peek
    pass`,
    solution: `def stack_operations(operations):
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
    return results`,
    hints: [
      'Stack يعمل بمبدأ LIFO (آخر داخل، أول خارج)',
      'استخدم list.append() لـ push',
      'استخدم list.pop() لـ pop',
    ],
    testCases: [
      {
        input: '[("push", 1), ("push", 2), ("pop",), ("peek",)]',
        expectedOutput: '[2, 1]',
        description: 'push ثم pop ثم peek',
      },
      {
        input: '[("push", 5), ("push", 10), ("pop",), ("pop",)]',
        expectedOutput: '[10, 5]',
        description: 'LIFO ترتيب',
      },
    ],
    isLocked: false,
    category: 'data-structures',
  },
  {
    id: 'ds-ch-queue-001',
    title: 'تطبيق Queue',
    description: 'اكتب دالة لتنفيذ عمليات Queue: enqueue، dequeue، peek',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    icon: 'list',
    starterCode: `def queue_operations(operations):
    # نفّذ عمليات Queue وأرجع النتائج
    # operations = [("enqueue", 1), ("dequeue",), ("peek",)]
    pass`,
    solution: `def queue_operations(operations):
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
    return results`,
    hints: [
      'Queue يعمل بمبدأ FIFO (أول داخل، أول خارج)',
      'استخدم collections.deque لكفاءة أفضل',
      'deque.popleft() يزيل أول عنصر',
    ],
    testCases: [
      {
        input: '[("enqueue", 1), ("enqueue", 2), ("dequeue",), ("peek",)]',
        expectedOutput: '[1, 2]',
        description: 'FIFO ترتيب',
      },
      {
        input:
          '[("enqueue", 10), ("enqueue", 20), ("enqueue", 30), ("dequeue",), ("dequeue",)]',
        expectedOutput: '[10, 20]',
        description: 'ثلاث عناصر',
      },
    ],
    isLocked: false,
    category: 'data-structures',
  },
  {
    id: 'ds-ch-hashtable-001',
    title: 'جدول Hash Table',
    description: 'اكتب دالة تنفذ عمليات Hash Table: set، get، delete',
    difficulty: 'easy',
    points: 25,
    language: 'Python',
    icon: 'key',
    starterCode: `def hashtable_operations(operations):
    # نفّذ عمليات Hash Table
    # operations = [("set", "name", "Ali"), ("get", "name"), ("delete", "name")]
    pass`,
    solution: `def hashtable_operations(operations):
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
    return results`,
    hints: [
      'في Python القاموس (dict) هو Hash Table',
      'استخدم dict.get(key, default) للوصول الآمن',
      'استخدم del dict[key] للحذف',
    ],
    testCases: [
      {
        input: '[("set", "a", 1), ("set", "b", 2), ("get", "a"), ("get", "b")]',
        expectedOutput: '[1, 2]',
        description: 'تخزين واسترجاع',
      },
      {
        input: '[("set", "x", 10), ("delete", "x"), ("get", "x")]',
        expectedOutput: '[True, None]',
        description: 'حذف واسترجاع',
      },
    ],
    isLocked: false,
    category: 'data-structures',
  },
  {
    id: 'ds-ch-set-001',
    title: 'عمليات المجموعات (Set)',
    description: 'اكتب دوال للتقاطع والاتحاد والفرق بين مجموعتين',
    difficulty: 'easy',
    points: 15,
    language: 'Python',
    icon: 'ellipse',
    starterCode: `def set_union(set1, set2):
    # أرجع اتحاد المجموعتين
    pass

def set_intersection(set1, set2):
    # أرجع تقاطع المجموعتين
    pass

def set_difference(set1, set2):
    # أرجع الفرق (عناصر في set1 وليست في set2)
    pass`,
    solution: `def set_union(set1, set2):
    return sorted(list(set(set1) | set(set2)))

def set_intersection(set1, set2):
    return sorted(list(set(set1) & set(set2)))

def set_difference(set1, set2):
    return sorted(list(set(set1) - set(set2)))`,
    hints: [
      'استخدم | للاتحاد و & للتقاطع و - للفرق',
      'حوّل القوائم إلى set أولاً',
    ],
    testCases: [
      {
        input: 'set_union([1, 2, 3], [2, 3, 4])',
        expectedOutput: '[1, 2, 3, 4]',
        description: 'اتحاد المجموعتين',
      },
      {
        input: 'set_intersection([1, 2, 3], [2, 3, 4])',
        expectedOutput: '[2, 3]',
        description: 'تقاطع المجموعتين',
      },
      {
        input: 'set_difference([1, 2, 3], [2, 3, 4])',
        expectedOutput: '[1]',
        description: 'فرق المجموعتين (عناصر في الأولى وليست في الثانية)',
      },
      {
        input: 'set_union([5, 10, 15], [10, 20, 30])',
        expectedOutput: '[5, 10, 15, 20, 30]',
        description: 'اتحاد مجموعتين مختلفتين',
      },
      {
        input: 'set_intersection([1, 2, 3], [4, 5, 6])',
        expectedOutput: '[]',
        description: 'تقاطع مجموعتين بدون عناصر مشتركة',
      },
    ],
    isLocked: false,
    category: 'data-structures',
  },
];

// ===== تحديات متوسطة =====
export const DS_CHALLENGES_INTERMEDIATE: Challenge[] = [
  {
    id: 'ds-ch-linkedlist-001',
    title: 'قائمة مترابطة (Linked List)',
    description: 'اكتب دالة لعكس قائمة مترابطة مُمثلة كمصفوفة',
    difficulty: 'medium',
    points: 35,
    language: 'Python',
    icon: 'link',
    starterCode: `def reverse_linked_list(arr):
    # اعكس ترتيب العناصر (محاكاة عكس Linked List)
    # أرجع القائمة المعكوسة
    pass`,
    solution: `def reverse_linked_list(arr):
    prev = None
    result = []
    for i in range(len(arr) - 1, -1, -1):
        result.append(arr[i])
    return result`,
    hints: [
      'لعكس Linked List: اعكس اتجاه المؤشرات',
      'يمكن استخدام مؤشرات prev و current و next',
      'مرّ على القائمة عنصر عنصر وغيّر الاتجاه',
    ],
    testCases: [
      {
        input: '[1, 2, 3, 4, 5]',
        expectedOutput: '[5, 4, 3, 2, 1]',
        description: 'عكس قائمة',
      },
      { input: '[1]', expectedOutput: '[1]', description: 'عنصر واحد' },
      { input: '[1, 2]', expectedOutput: '[2, 1]', description: 'عنصرين' },
    ],
    isLocked: false,
    category: 'data-structures',
  },
  {
    id: 'ds-ch-minheap-001',
    title: 'Min Heap - أصغر K عناصر',
    description: 'اكتب دالة تجد أصغر K عناصر في قائمة باستخدام Heap',
    difficulty: 'medium',
    points: 35,
    language: 'Python',
    icon: 'triangle',
    starterCode: `def k_smallest(arr, k):
    # أوجد أصغر k عناصر باستخدام heap
    pass`,
    solution: `def k_smallest(arr, k):
    import heapq
    return sorted(heapq.nsmallest(k, arr))`,
    hints: [
      'استخدم heapq.nsmallest(k, arr)',
      'أو ابنِ min heap ثم استخرج k عناصر',
    ],
    testCases: [
      {
        input: '[7, 10, 4, 3, 20, 15], 3',
        expectedOutput: '[3, 4, 7]',
        description: 'أصغر 3',
      },
      {
        input: '[1, 23, 12, 9, 30, 2, 50], 4',
        expectedOutput: '[1, 2, 9, 12]',
        description: 'أصغر 4',
      },
    ],
    isLocked: false,
    category: 'data-structures',
  },
  {
    id: 'ds-ch-treetraversal-001',
    title: 'المرور على شجرة ثنائية',
    description:
      'اكتب دالة للمرور على شجرة ثنائية (مُمثلة كقائمة) بترتيب inorder',
    difficulty: 'medium',
    points: 40,
    language: 'Python',
    icon: 'git-branch',
    starterCode: `def inorder_traversal(tree):
    # tree = [root, [left_subtree], [right_subtree]]
    # tree = [1, [2, [], []], [3, [], []]]
    # أرجع قائمة العناصر بترتيب inorder
    pass`,
    solution: `def inorder_traversal(tree):
    if not tree:
        return []
    result = []
    if len(tree) > 1:
        result.extend(inorder_traversal(tree[1]))
    result.append(tree[0])
    if len(tree) > 2:
        result.extend(inorder_traversal(tree[2]))
    return result`,
    hints: [
      'Inorder: يسار → جذر → يمين',
      'استخدم Recursion للمرور على كل شجرة فرعية',
      'الشجرة الفارغة تُرجع قائمة فارغة',
    ],
    testCases: [
      {
        input: '[1, [2, [], []], [3, [], []]]',
        expectedOutput: '[2, 1, 3]',
        description: 'شجرة بسيطة',
      },
      {
        input:
          '[4, [2, [1, [], []], [3, [], []]], [6, [5, [], []], [7, [], []]]]',
        expectedOutput: '[1, 2, 3, 4, 5, 6, 7]',
        description: 'شجرة متوازنة',
      },
    ],
    isLocked: false,
    category: 'data-structures',
  },
  {
    id: 'ds-ch-bfs-001',
    title: 'بحث بالعرض (BFS)',
    description: 'اكتب دالة للبحث بالعرض في رسم بياني',
    difficulty: 'medium',
    points: 40,
    language: 'Python',
    icon: 'git-network',
    starterCode: `def bfs(graph, start):
    # graph = {node: [neighbors]}
    # أرجع قائمة العقد بترتيب BFS
    pass`,
    solution: `def bfs(graph, start):
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
    return result`,
    hints: [
      'استخدم Queue (طابور) لتتبع العقد',
      'استخدم set لتسجيل العقد المزارة',
      'أضف جيران العقدة الحالية للطابور',
    ],
    testCases: [
      {
        input: '{"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}, "A"',
        expectedOutput: "['A', 'B', 'C', 'D']",
        description: 'بحث بالعرض من A',
      },
      {
        input: '{"1": ["2", "3"], "2": ["4"], "3": [], "4": []}, "1"',
        expectedOutput: "['1', '2', '3', '4']",
        description: 'بحث بالعرض من 1',
      },
    ],
    isLocked: false,
    category: 'data-structures',
  },
  {
    id: 'ds-ch-dfs-001',
    title: 'بحث بالعمق (DFS)',
    description: 'اكتب دالة للبحث بالعمق في رسم بياني',
    difficulty: 'medium',
    points: 40,
    language: 'Python',
    icon: 'git-network',
    starterCode: `def dfs(graph, start):
    # graph = {node: [neighbors]}
    # أرجع قائمة العقد بترتيب DFS
    pass`,
    solution: `def dfs(graph, start):
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
    return result`,
    hints: [
      'استخدم Stack أو Recursion',
      'سجّل العقد المزارة لتجنب الحلقات',
      'زُر كل عقدة واستكشف جيرانها بالعمق',
    ],
    testCases: [
      {
        input: '{"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}, "A"',
        expectedOutput: "['A', 'B', 'D', 'C']",
        description: 'بحث بالعمق من A',
      },
      {
        input: '{"1": ["2", "3"], "2": ["4"], "3": [], "4": []}, "1"',
        expectedOutput: "['1', '2', '4', '3']",
        description: 'بحث بالعمق من 1',
      },
    ],
    isLocked: false,
    category: 'data-structures',
  },
];

// ===== تحديات متقدمة =====
export const DS_CHALLENGES_ADVANCED: Challenge[] = [
  {
    id: 'ds-ch-trie-001',
    title: 'شجرة Trie - بحث الكلمات',
    description:
      'اكتب دالة تبحث عن كلمات تبدأ بحروف معينة (prefix) في قائمة كلمات',
    difficulty: 'hard',
    points: 50,
    language: 'Python',
    icon: 'book',
    starterCode: `def find_words_with_prefix(words, prefix):
    # أوجد كل الكلمات التي تبدأ بـ prefix
    # أرجع قائمة مرتبة
    pass`,
    solution: `def find_words_with_prefix(words, prefix):
    result = [w for w in words if w.startswith(prefix)]
    return sorted(result)`,
    hints: [
      'استخدم startswith() للتحقق من البداية',
      'أو ابنِ Trie لكفاءة أفضل',
      'رتّب النتائج أبجدياً',
    ],
    testCases: [
      {
        input: '["apple", "app", "ape", "banana", "band"], "ap"',
        expectedOutput: "['ape', 'app', 'apple']",
        description: 'كلمات تبدأ بـ ap',
      },
      {
        input: '["car", "card", "care", "dog"], "car"',
        expectedOutput: "['car', 'card', 'care']",
        description: 'كلمات تبدأ بـ car',
      },
      {
        input: '["hello", "world"], "xyz"',
        expectedOutput: '[]',
        description: 'لا توجد نتائج',
      },
    ],
    isLocked: true,
    category: 'data-structures',
  },
  {
    id: 'ds-ch-lru-001',
    title: 'LRU Cache',
    description: 'اكتب دالة تحاكي ذاكرة LRU Cache بسعة محددة',
    difficulty: 'hard',
    points: 60,
    language: 'Python',
    icon: 'server',
    starterCode: `def lru_cache_operations(capacity, operations):
    # capacity = سعة الذاكرة
    # operations = [("get", key), ("put", key, value)]
    # أرجع نتائج عمليات get (-1 إذا غير موجود)
    pass`,
    solution: `def lru_cache_operations(capacity, operations):
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
    return results`,
    hints: [
      'LRU = Least Recently Used (أقل استخداماً مؤخراً)',
      'استخدم OrderedDict للحفاظ على ترتيب الوصول',
      'عند تجاوز السعة، احذف أقدم عنصر',
    ],
    testCases: [
      {
        input:
          '2, [("put", 1, 1), ("put", 2, 2), ("get", 1), ("put", 3, 3), ("get", 2)]',
        expectedOutput: '[1, -1]',
        description: 'LRU مع سعة 2',
      },
      {
        input: '1, [("put", 1, 10), ("put", 2, 20), ("get", 1), ("get", 2)]',
        expectedOutput: '[-1, 20]',
        description: 'LRU مع سعة 1',
      },
    ],
    isLocked: true,
    category: 'data-structures',
  },
  {
    id: 'ds-ch-graph-cycle-001',
    title: 'اكتشاف الدورة في رسم بياني',
    description: 'اكتب دالة تتحقق من وجود دورة (cycle) في رسم بياني موجّه',
    difficulty: 'hard',
    points: 55,
    language: 'Python',
    icon: 'reload',
    starterCode: `def has_cycle(graph):
    # graph = {node: [neighbors]}
    # أرجع True إذا وُجدت دورة
    pass`,
    solution: `def has_cycle(graph):
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
    return False`,
    hints: [
      'استخدم ثلاث حالات: أبيض (لم يُزَر)، رمادي (قيد المعالجة)، أسود (منتهي)',
      'إذا وصلت لعقدة رمادية، يوجد دورة',
      'استخدم DFS مع تتبع الحالة',
    ],
    testCases: [
      {
        input: '{"A": ["B"], "B": ["C"], "C": ["A"]}',
        expectedOutput: 'True',
        description: 'دورة A→B→C→A',
      },
      {
        input: '{"A": ["B"], "B": ["C"], "C": []}',
        expectedOutput: 'False',
        description: 'بدون دورة',
      },
    ],
    isLocked: true,
    category: 'data-structures',
  },
];

// ===== تجميع كل التحديات =====
export const ALL_DS_CHALLENGES: Challenge[] = [
  ...DS_CHALLENGES_BEGINNER,
  ...DS_CHALLENGES_INTERMEDIATE,
  ...DS_CHALLENGES_ADVANCED,
];

// ===== دروس هياكل البيانات (فارغة - لربط المستقبلي) =====
export const ALL_DS_LESSONS: Lesson[] = [];
