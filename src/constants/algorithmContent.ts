// ===== تحديات الخوارزميات =====

import { Challenge, Lesson } from './courseData';

// ===== تحديات خوارزميات - مبتدئ =====
export const ALGORITHM_CHALLENGES_BEGINNER: Challenge[] = [
  {
    id: 'algo-ch-linear-001',
    title: 'البحث الخطي',
    description:
      'اكتب دالة تبحث عن عنصر في قائمة وترجع موقعه، أو -1 إذا لم يُوجد',
    difficulty: 'easy',
    points: 15,
    language: 'Python',
    icon: 'search',
    starterCode: `def linear_search(arr, target):
    # ابحث عن target في arr
    # أرجع index أو -1
    pass`,
    solution: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
    hints: [
      'استخدم حلقة for للمرور على كل عنصر',
      'قارن كل عنصر مع target',
      'إذا وصلت للنهاية بدون إيجاد العنصر، أرجع -1',
    ],
    testCases: [
      {
        input: '[10, 20, 30, 40, 50], 30',
        expectedOutput: '2',
        description: 'عنصر موجود',
      },
      {
        input: '[1, 2, 3], 5',
        expectedOutput: '-1',
        description: 'عنصر غير موجود',
      },
      { input: '[7], 7', expectedOutput: '0', description: 'قائمة بعنصر واحد' },
    ],
    isLocked: false,
    category: 'algorithms',
  },
  {
    id: 'algo-ch-binary-001',
    title: 'البحث الثنائي',
    description: 'اكتب دالة تبحث في قائمة مرتبة باستخدام البحث الثنائي',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    icon: 'search',
    starterCode: `def binary_search(arr, target):
    # ابحث عن target في قائمة مرتبة
    # أرجع index أو -1
    pass`,
    solution: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    hints: [
      'القائمة يجب أن تكون مرتبة',
      'قارن العنصر الأوسط مع target',
      'إذا كان أصغر، ابحث في النصف الأيمن',
    ],
    testCases: [
      {
        input: '[1, 3, 5, 7, 9, 11], 7',
        expectedOutput: '3',
        description: 'عنصر موجود',
      },
      {
        input: '[2, 4, 6, 8], 5',
        expectedOutput: '-1',
        description: 'عنصر غير موجود',
      },
      {
        input: '[10], 10',
        expectedOutput: '0',
        description: 'قائمة بعنصر واحد',
      },
    ],
    isLocked: false,
    category: 'algorithms',
  },
  {
    id: 'algo-ch-selection-001',
    title: 'فرز الاختيار',
    description: 'اكتب دالة ترتب قائمة باستخدام خوارزمية Selection Sort',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    icon: 'swap-vertical',
    starterCode: `def selection_sort(arr):
    # رتب القائمة باستخدام Selection Sort
    # أرجع القائمة المرتبة
    pass`,
    solution: `def selection_sort(arr):
    arr = arr.copy()
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    hints: [
      'ابحث عن أصغر عنصر في الجزء غير المرتب',
      'بدّله مع أول عنصر في الجزء غير المرتب',
      'كرر العملية حتى تنتهي القائمة',
    ],
    testCases: [
      {
        input: '[64, 25, 12, 22, 11]',
        expectedOutput: '[11, 12, 22, 25, 64]',
        description: 'ترتيب أرقام',
      },
      {
        input: '[3, 1, 2]',
        expectedOutput: '[1, 2, 3]',
        description: 'قائمة قصيرة',
      },
      { input: '[1]', expectedOutput: '[1]', description: 'عنصر واحد' },
    ],
    isLocked: false,
    category: 'algorithms',
  },
  {
    id: 'algo-ch-insertion-001',
    title: 'فرز الإدراج',
    description: 'اكتب دالة ترتب قائمة باستخدام خوارزمية Insertion Sort',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    icon: 'swap-vertical',
    starterCode: `def insertion_sort(arr):
    # رتب القائمة باستخدام Insertion Sort
    # أرجع القائمة المرتبة
    pass`,
    solution: `def insertion_sort(arr):
    arr = arr.copy()
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
    hints: [
      'ابدأ من العنصر الثاني',
      'قارن كل عنصر مع العناصر السابقة',
      'أدرج العنصر في المكان الصحيح',
    ],
    testCases: [
      {
        input: '[12, 11, 13, 5, 6]',
        expectedOutput: '[5, 6, 11, 12, 13]',
        description: 'ترتيب أرقام',
      },
      {
        input: '[1, 2, 3]',
        expectedOutput: '[1, 2, 3]',
        description: 'مرتبة مسبقاً',
      },
    ],
    isLocked: false,
    category: 'algorithms',
  },
  {
    id: 'algo-ch-max-001',
    title: 'إيجاد القيمة القصوى والدنيا',
    description: 'اكتب دالة تُرجع أكبر وأصغر قيمة في قائمة',
    difficulty: 'easy',
    points: 15,
    language: 'Python',
    icon: 'analytics',
    starterCode: `def find_min_max(arr):
    # أرجع tuple يحتوي (أصغر, أكبر)
    pass`,
    solution: `def find_min_max(arr):
    if not arr:
        return None
    min_val = arr[0]
    max_val = arr[0]
    for num in arr[1:]:
        if num < min_val:
            min_val = num
        if num > max_val:
            max_val = num
    return (min_val, max_val)`,
    hints: [
      'ابدأ بافتراض أن أول عنصر هو الأصغر والأكبر',
      'مرّ على بقية العناصر وقارن',
    ],
    testCases: [
      {
        input: '[3, 1, 4, 1, 5, 9]',
        expectedOutput: '(1, 9)',
        description: 'قائمة أرقام متنوعة',
      },
      { input: '[5]', expectedOutput: '(5, 5)', description: 'عنصر واحد' },
      {
        input: '[-3, -1, -7]',
        expectedOutput: '(-7, -1)',
        description: 'أرقام سالبة',
      },
    ],
    isLocked: false,
    category: 'algorithms',
  },
];

// ===== تحديات خوارزميات - متوسط =====
export const ALGORITHM_CHALLENGES_INTERMEDIATE: Challenge[] = [
  {
    id: 'algo-ch-merge-001',
    title: 'فرز الدمج (Merge Sort)',
    description: 'اكتب دالة ترتب قائمة باستخدام خوارزمية Merge Sort',
    difficulty: 'medium',
    points: 40,
    language: 'Python',
    icon: 'git-merge',
    starterCode: `def merge_sort(arr):
    # رتب القائمة باستخدام Merge Sort
    # أرجع القائمة المرتبة
    pass`,
    solution: `def merge_sort(arr):
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
    return result`,
    hints: [
      'قسّم القائمة إلى نصفين حتى تصل لعنصر واحد',
      'ادمج القوائم الصغيرة بترتيب',
      'استخدم Recursion للتقسيم',
    ],
    testCases: [
      {
        input: '[38, 27, 43, 3, 9, 82, 10]',
        expectedOutput: '[3, 9, 10, 27, 38, 43, 82]',
        description: 'ترتيب أرقام',
      },
      {
        input: '[5, 1, 3, 2, 4]',
        expectedOutput: '[1, 2, 3, 4, 5]',
        description: 'قائمة قصيرة',
      },
    ],
    isLocked: false,
    category: 'algorithms',
  },
  {
    id: 'algo-ch-quick-001',
    title: 'فرز سريع (Quick Sort)',
    description: 'اكتب دالة ترتب قائمة باستخدام خوارزمية Quick Sort',
    difficulty: 'medium',
    points: 45,
    language: 'Python',
    icon: 'flash',
    starterCode: `def quick_sort(arr):
    # رتب القائمة باستخدام Quick Sort
    # أرجع القائمة المرتبة
    pass`,
    solution: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`,
    hints: [
      'اختر عنصر محوري (pivot)',
      'قسّم القائمة: أصغر من المحور، يساوي، أكبر',
      'رتّب كل قسم بنفس الطريقة (Recursion)',
    ],
    testCases: [
      {
        input: '[10, 7, 8, 9, 1, 5]',
        expectedOutput: '[1, 5, 7, 8, 9, 10]',
        description: 'ترتيب أرقام',
      },
      {
        input: '[3, 3, 1, 2, 2]',
        expectedOutput: '[1, 2, 2, 3, 3]',
        description: 'أرقام مكررة',
      },
    ],
    isLocked: false,
    category: 'algorithms',
  },
  {
    id: 'algo-ch-kadane-001',
    title: 'أكبر مجموع متصل (Kadane)',
    description: 'اكتب دالة تجد أكبر مجموع لمصفوفة فرعية متصلة',
    difficulty: 'medium',
    points: 40,
    language: 'Python',
    icon: 'trending-up',
    starterCode: `def max_subarray_sum(arr):
    # أوجد أكبر مجموع لعناصر متتالية
    pass`,
    solution: `def max_subarray_sum(arr):
    if not arr:
        return 0
    max_sum = arr[0]
    current_sum = arr[0]
    for i in range(1, len(arr)):
        current_sum = max(arr[i], current_sum + arr[i])
        max_sum = max(max_sum, current_sum)
    return max_sum`,
    hints: [
      'استخدم خوارزمية Kadane',
      'تابع المجموع الحالي، إذا أصبح سالباً ابدأ من جديد',
      'خزّن أكبر مجموع وُجد',
    ],
    testCases: [
      {
        input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        expectedOutput: '6',
        description: 'مصفوفة فرعية [4,-1,2,1]',
      },
      {
        input: '[1, 2, 3]',
        expectedOutput: '6',
        description: 'كل العناصر موجبة',
      },
      {
        input: '[-1, -2, -3]',
        expectedOutput: '-1',
        description: 'كل العناصر سالبة',
      },
    ],
    isLocked: false,
    category: 'algorithms',
  },
  {
    id: 'algo-ch-anagram-001',
    title: 'فحص Anagram',
    description: 'اكتب دالة تتحقق إذا كانت كلمتان هما anagram لبعضهما',
    difficulty: 'medium',
    points: 30,
    language: 'Python',
    icon: 'text',
    starterCode: `def is_anagram(s1, s2):
    # تحقق إذا s1 و s2 يحتويان نفس الحروف
    pass`,
    solution: `def is_anagram(s1, s2):
    s1 = s1.lower().replace(' ', '')
    s2 = s2.lower().replace(' ', '')
    return sorted(s1) == sorted(s2)`,
    hints: [
      'رتّب حروف كل كلمة وقارن',
      'أو استخدم Counter للعد',
      'حوّل للأحرف الصغيرة أولاً',
    ],
    testCases: [
      {
        input: '"listen", "silent"',
        expectedOutput: 'True',
        description: 'كلمتان anagram',
      },
      {
        input: '"hello", "world"',
        expectedOutput: 'False',
        description: 'ليستا anagram',
      },
      {
        input: '"Triangle", "Integral"',
        expectedOutput: 'True',
        description: 'حالة أحرف مختلفة',
      },
    ],
    isLocked: false,
    category: 'algorithms',
  },
  {
    id: 'algo-ch-twopointer-001',
    title: 'مجموع زوجين (Two Sum Sorted)',
    description: 'اكتب دالة تجد زوج أرقام مجموعهما يساوي target في قائمة مرتبة',
    difficulty: 'medium',
    points: 35,
    language: 'Python',
    icon: 'locate',
    starterCode: `def two_sum_sorted(arr, target):
    # أوجد index لعنصرين مجموعهما = target
    # أرجع tuple (i, j)
    pass`,
    solution: `def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        current = arr[left] + arr[right]
        if current == target:
            return (left, right)
        elif current < target:
            left += 1
        else:
            right -= 1
    return (-1, -1)`,
    hints: [
      'استخدم مؤشرين: واحد من البداية وواحد من النهاية',
      'إذا المجموع أصغر، حرّك المؤشر الأيسر',
      'إذا المجموع أكبر، حرّك المؤشر الأيمن',
    ],
    testCases: [
      {
        input: '[1, 2, 3, 4, 6], 6',
        expectedOutput: '(1, 3)',
        description: 'زوج موجود: 2+4=6',
      },
      {
        input: '[2, 3, 5, 8], 10',
        expectedOutput: '(0, 3)',
        description: '2+8=10',
      },
      {
        input: '[1, 2], 5',
        expectedOutput: '(-1, -1)',
        description: 'لا يوجد زوج',
      },
    ],
    isLocked: false,
    category: 'algorithms',
  },
];

// ===== تحديات خوارزميات - متقدم =====
export const ALGORITHM_CHALLENGES_ADVANCED: Challenge[] = [
  {
    id: 'algo-ch-lcs-001',
    title: 'أطول سلسلة فرعية مشتركة (LCS)',
    description: 'اكتب دالة تجد طول أطول سلسلة فرعية مشتركة بين نصين',
    difficulty: 'hard',
    points: 60,
    language: 'Python',
    icon: 'git-compare',
    starterCode: `def lcs_length(s1, s2):
    # أوجد طول أطول سلسلة فرعية مشتركة
    pass`,
    solution: `def lcs_length(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
    hints: [
      'استخدم البرمجة الديناميكية (Dynamic Programming)',
      'أنشئ جدول 2D بحجم (m+1) × (n+1)',
      'إذا تطابق حرفان: dp[i][j] = dp[i-1][j-1] + 1',
    ],
    testCases: [
      {
        input: '"ABCBDAB", "BDCAB"',
        expectedOutput: '4',
        description: 'LCS = BCAB',
      },
      { input: '"ABC", "AC"', expectedOutput: '2', description: 'LCS = AC' },
      {
        input: '"ABC", "DEF"',
        expectedOutput: '0',
        description: 'لا توجد أحرف مشتركة',
      },
    ],
    isLocked: true,
    category: 'algorithms',
  },
  {
    id: 'algo-ch-knapsack-001',
    title: 'مسألة الحقيبة (Knapsack)',
    description: 'اكتب دالة لحل مسألة الحقيبة 0/1 باستخدام البرمجة الديناميكية',
    difficulty: 'hard',
    points: 70,
    language: 'Python',
    icon: 'briefcase',
    starterCode: `def knapsack(weights, values, capacity):
    # أوجد أقصى قيمة يمكن حملها
    pass`,
    solution: `def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
            else:
                dp[i][w] = dp[i - 1][w]
    return dp[n][capacity]`,
    hints: [
      'استخدم جدول dp بحجم (n+1) × (capacity+1)',
      'لكل عنصر: إما تأخذه أو تتركه',
      'dp[i][w] = max(بدون العنصر, مع العنصر)',
    ],
    testCases: [
      {
        input: '[1, 2, 3], [6, 10, 12], 5',
        expectedOutput: '22',
        description: 'سعة 5',
      },
      {
        input: '[2, 3, 4, 5], [3, 4, 5, 6], 5',
        expectedOutput: '7',
        description: 'اختيار أفضل مجموعة',
      },
    ],
    isLocked: true,
    category: 'algorithms',
  },
  {
    id: 'algo-ch-dijkstra-001',
    title: 'خوارزمية ديكسترا',
    description: 'اكتب دالة تجد أقصر مسار من نقطة البداية لكل النقاط الأخرى',
    difficulty: 'hard',
    points: 80,
    language: 'Python',
    icon: 'navigate',
    starterCode: `def dijkstra(graph, start):
    # graph = {node: [(neighbor, weight), ...]}
    # أرجع dict بأقصر مسافة لكل نقطة
    pass`,
    solution: `def dijkstra(graph, start):
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
    return distances`,
    hints: [
      'استخدم Priority Queue (heapq)',
      'ابدأ بمسافة 0 لنقطة البداية و∞ للباقي',
      'حدّث المسافات إذا وجدت مساراً أقصر',
    ],
    testCases: [
      {
        input: '{"A": [("B", 1), ("C", 4)], "B": [("C", 2)], "C": []}, "A"',
        expectedOutput: "{'A': 0, 'B': 1, 'C': 3}",
        description: 'أقصر مسار من A',
      },
      {
        input:
          '{"A": [("B", 4), ("C", 1)], "B": [("D", 1)], "C": [("B", 2), ("D", 5)], "D": []}, "A"',
        expectedOutput: "{'A': 0, 'B': 3, 'C': 1, 'D': 4}",
        description: 'رسم بياني أكبر مع مسارات متعددة',
      },
      {
        input: '{"X": [("Y", 2)], "Y": [("Z", 3)], "Z": []}, "X"',
        expectedOutput: "{'X': 0, 'Y': 2, 'Z': 5}",
        description: 'مسار خطي بسيط',
      },
    ],
    isLocked: true,
    category: 'algorithms',
  },
  {
    id: 'algo-ch-dp-coins-001',
    title: 'مسألة العملات (Coin Change)',
    description: 'اكتب دالة تجد أقل عدد من العملات لتكوين مبلغ معين',
    difficulty: 'hard',
    points: 60,
    language: 'Python',
    icon: 'cash',
    starterCode: `def coin_change(coins, amount):
    # أوجد أقل عدد عملات لتكوين amount
    # أرجع -1 إذا مستحيل
    pass`,
    solution: `def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i and dp[i - coin] + 1 < dp[i]:
                dp[i] = dp[i - coin] + 1
    return dp[amount] if dp[amount] != float('inf') else -1`,
    hints: [
      'استخدم مصفوفة dp بحجم amount + 1',
      'dp[i] = أقل عدد عملات لتكوين i',
      'لكل مبلغ، جرّب كل عملة متاحة',
    ],
    testCases: [
      {
        input: '[1, 5, 10, 25], 30',
        expectedOutput: '2',
        description: '25+5=30',
      },
      { input: '[2], 3', expectedOutput: '-1', description: 'مستحيل' },
      { input: '[1, 2, 5], 11', expectedOutput: '3', description: '5+5+1=11' },
    ],
    isLocked: true,
    category: 'algorithms',
  },
];

// ===== تجميع كل التحديات =====
export const ALL_ALGORITHM_CHALLENGES: Challenge[] = [
  ...ALGORITHM_CHALLENGES_BEGINNER,
  ...ALGORITHM_CHALLENGES_INTERMEDIATE,
  ...ALGORITHM_CHALLENGES_ADVANCED,
];

// ===== دروس الخوارزميات (فارغة - لربط المستقبلي) =====
export const ALL_ALGORITHM_LESSONS: Lesson[] = [];
