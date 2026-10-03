/**
 * Syntax Highlighter - نظام تلوين الأكواد الاحترافي
 * يدعم جميع اللغات بدون رسائل "غير مدعوم"
 * محسّن لـ React Native + Web
 */

export type Token = {
  content: string;
  type: TokenType;
};

export type TokenType =
  | 'keyword'
  | 'string'
  | 'number'
  | 'function'
  | 'comment'
  | 'operator'
  | 'punctuation'
  | 'className'
  | 'property'
  | 'boolean'
  | 'constant'
  | 'tag'
  | 'attribute'
  | 'variable'
  | 'default';

// ==================== كلمات مفتاحية لكل لغة ====================
const KEYWORDS: Record<string, string[]> = {
  javascript: [
    'const',
    'let',
    'var',
    'function',
    'async',
    'await',
    'return',
    'if',
    'else',
    'for',
    'while',
    'do',
    'switch',
    'case',
    'break',
    'continue',
    'try',
    'catch',
    'finally',
    'throw',
    'new',
    'class',
    'extends',
    'import',
    'export',
    'default',
    'from',
    'as',
    'typeof',
    'instanceof',
    'this',
    'super',
    'static',
    'get',
    'set',
    'delete',
    'void',
    'yield',
    'in',
    'of',
    'with',
    'debugger',
  ],
  typescript: [
    'const',
    'let',
    'var',
    'function',
    'async',
    'await',
    'return',
    'if',
    'else',
    'for',
    'while',
    'do',
    'switch',
    'case',
    'break',
    'continue',
    'try',
    'catch',
    'finally',
    'throw',
    'new',
    'class',
    'extends',
    'import',
    'export',
    'default',
    'from',
    'as',
    'typeof',
    'instanceof',
    'this',
    'super',
    'static',
    'get',
    'set',
    'delete',
    'void',
    'yield',
    'in',
    'of',
    'interface',
    'type',
    'enum',
    'namespace',
    'declare',
    'abstract',
    'implements',
    'readonly',
    'private',
    'protected',
    'public',
    'any',
    'unknown',
    'never',
    'keyof',
    'infer',
    'satisfies',
    'module',
  ],
  python: [
    'def',
    'class',
    'if',
    'elif',
    'else',
    'for',
    'while',
    'return',
    'import',
    'from',
    'as',
    'try',
    'except',
    'finally',
    'raise',
    'with',
    'pass',
    'break',
    'continue',
    'lambda',
    'yield',
    'async',
    'await',
    'global',
    'nonlocal',
    'assert',
    'del',
    'is',
    'not',
    'and',
    'or',
    'in',
    'None',
    'True',
    'False',
    'self',
    'match',
    'case',
  ],
  java: [
    'public',
    'private',
    'protected',
    'static',
    'final',
    'class',
    'interface',
    'extends',
    'implements',
    'void',
    'int',
    'long',
    'double',
    'float',
    'boolean',
    'char',
    'byte',
    'short',
    'String',
    'if',
    'else',
    'for',
    'while',
    'do',
    'switch',
    'case',
    'break',
    'continue',
    'return',
    'try',
    'catch',
    'finally',
    'throw',
    'throws',
    'new',
    'this',
    'super',
    'abstract',
    'synchronized',
    'volatile',
    'transient',
    'native',
    'strictfp',
    'package',
    'import',
    'enum',
    'instanceof',
    'default',
    'assert',
    'record',
    'sealed',
    'permits',
    'var',
    'yield',
  ],
  cpp: [
    'int',
    'long',
    'short',
    'char',
    'float',
    'double',
    'bool',
    'void',
    'auto',
    'const',
    'static',
    'extern',
    'register',
    'volatile',
    'signed',
    'unsigned',
    'struct',
    'union',
    'enum',
    'class',
    'namespace',
    'using',
    'typedef',
    'template',
    'typename',
    'if',
    'else',
    'for',
    'while',
    'do',
    'switch',
    'case',
    'break',
    'continue',
    'return',
    'goto',
    'try',
    'catch',
    'throw',
    'public',
    'private',
    'protected',
    'virtual',
    'friend',
    'inline',
    'operator',
    'new',
    'delete',
    'this',
    'nullptr',
    'true',
    'false',
    'constexpr',
    'decltype',
    'noexcept',
    'override',
    'final',
    'static_assert',
    'mutable',
    'concept',
    'requires',
    'module',
    'import',
    'export',
    'sizeof',
    'alignof',
    'typeid',
  ],
  c: [
    'auto',
    'break',
    'case',
    'char',
    'const',
    'continue',
    'default',
    'do',
    'double',
    'else',
    'enum',
    'extern',
    'float',
    'for',
    'goto',
    'if',
    'inline',
    'int',
    'long',
    'register',
    'restrict',
    'return',
    'short',
    'signed',
    'sizeof',
    'static',
    'struct',
    'switch',
    'typedef',
    'union',
    'unsigned',
    'void',
    'volatile',
    'while',
    'NULL',
    'true',
    'false',
  ],
  csharp: [
    'using',
    'namespace',
    'class',
    'interface',
    'struct',
    'enum',
    'public',
    'private',
    'protected',
    'internal',
    'static',
    'readonly',
    'const',
    'void',
    'int',
    'long',
    'short',
    'byte',
    'float',
    'double',
    'decimal',
    'bool',
    'char',
    'string',
    'object',
    'var',
    'dynamic',
    'if',
    'else',
    'for',
    'foreach',
    'while',
    'do',
    'switch',
    'case',
    'break',
    'continue',
    'return',
    'try',
    'catch',
    'finally',
    'throw',
    'new',
    'this',
    'base',
    'abstract',
    'virtual',
    'override',
    'sealed',
    'async',
    'await',
    'yield',
    'get',
    'set',
    'partial',
    'lock',
    'true',
    'false',
    'null',
    'is',
    'as',
    'typeof',
    'sizeof',
    'delegate',
    'event',
    'in',
    'out',
    'ref',
    'params',
    'when',
    'where',
    'select',
    'from',
    'orderby',
    'group',
    'into',
    'join',
    'let',
    'on',
    'equals',
    'record',
    'init',
    'required',
    'global',
    'with',
    'not',
  ],
  go: [
    'break',
    'case',
    'chan',
    'const',
    'continue',
    'default',
    'defer',
    'else',
    'fallthrough',
    'for',
    'func',
    'go',
    'goto',
    'if',
    'import',
    'interface',
    'map',
    'package',
    'range',
    'return',
    'select',
    'struct',
    'switch',
    'type',
    'var',
    'nil',
    'true',
    'false',
    'iota',
    'any',
  ],
  rust: [
    'as',
    'async',
    'await',
    'break',
    'const',
    'continue',
    'crate',
    'dyn',
    'else',
    'enum',
    'extern',
    'false',
    'fn',
    'for',
    'if',
    'impl',
    'in',
    'let',
    'loop',
    'match',
    'mod',
    'move',
    'mut',
    'pub',
    'ref',
    'return',
    'self',
    'Self',
    'static',
    'struct',
    'super',
    'trait',
    'true',
    'type',
    'unsafe',
    'use',
    'where',
    'while',
    'yield',
    'macro_rules',
    'union',
  ],
  swift: [
    'class',
    'struct',
    'enum',
    'protocol',
    'extension',
    'func',
    'var',
    'let',
    'if',
    'else',
    'for',
    'while',
    'repeat',
    'switch',
    'case',
    'break',
    'continue',
    'return',
    'guard',
    'defer',
    'do',
    'try',
    'catch',
    'throw',
    'throws',
    'rethrows',
    'import',
    'typealias',
    'init',
    'deinit',
    'subscript',
    'operator',
    'inout',
    'self',
    'Self',
    'super',
    'nil',
    'true',
    'false',
    'is',
    'as',
    'in',
    'where',
    'private',
    'fileprivate',
    'internal',
    'public',
    'open',
    'static',
    'final',
    'override',
    'mutating',
    'lazy',
    'weak',
    'unowned',
    'optional',
    'required',
    'convenience',
    'dynamic',
    'indirect',
    'async',
    'await',
    'some',
    'any',
    'actor',
  ],
  kotlin: [
    'abstract',
    'actual',
    'annotation',
    'as',
    'break',
    'by',
    'catch',
    'class',
    'companion',
    'const',
    'constructor',
    'continue',
    'data',
    'do',
    'dynamic',
    'else',
    'enum',
    'expect',
    'external',
    'final',
    'finally',
    'for',
    'fun',
    'get',
    'if',
    'import',
    'in',
    'infix',
    'init',
    'inline',
    'inner',
    'interface',
    'internal',
    'is',
    'lateinit',
    'null',
    'object',
    'open',
    'operator',
    'out',
    'override',
    'package',
    'private',
    'protected',
    'public',
    'return',
    'sealed',
    'set',
    'super',
    'suspend',
    'this',
    'throw',
    'true',
    'false',
    'try',
    'typealias',
    'typeof',
    'val',
    'var',
    'vararg',
    'when',
    'where',
    'while',
    'yield',
  ],
  php: [
    'abstract',
    'and',
    'array',
    'as',
    'break',
    'callable',
    'case',
    'catch',
    'class',
    'clone',
    'const',
    'continue',
    'declare',
    'default',
    'die',
    'do',
    'echo',
    'else',
    'elseif',
    'empty',
    'endfor',
    'endforeach',
    'endif',
    'endswitch',
    'endwhile',
    'eval',
    'exit',
    'extends',
    'false',
    'final',
    'finally',
    'fn',
    'for',
    'foreach',
    'function',
    'global',
    'goto',
    'if',
    'implements',
    'include',
    'instanceof',
    'interface',
    'isset',
    'list',
    'match',
    'namespace',
    'new',
    'null',
    'or',
    'print',
    'private',
    'protected',
    'public',
    'readonly',
    'require',
    'return',
    'static',
    'switch',
    'throw',
    'trait',
    'true',
    'try',
    'unset',
    'use',
    'var',
    'while',
    'yield',
    'enum',
    'int',
    'string',
    'float',
    'bool',
    'void',
    'mixed',
    'never',
    'self',
    'parent',
  ],
  ruby: [
    'BEGIN',
    'END',
    'alias',
    'and',
    'begin',
    'break',
    'case',
    'class',
    'def',
    'do',
    'else',
    'elsif',
    'end',
    'ensure',
    'false',
    'for',
    'if',
    'in',
    'module',
    'next',
    'nil',
    'not',
    'or',
    'redo',
    'rescue',
    'retry',
    'return',
    'self',
    'super',
    'then',
    'true',
    'undef',
    'unless',
    'until',
    'when',
    'while',
    'yield',
    'raise',
    'require',
    'include',
    'extend',
    'puts',
    'print',
    'p',
    'lambda',
    'proc',
    'private',
    'protected',
    'public',
    'attr_accessor',
    'attr_reader',
    'attr_writer',
  ],
  dart: [
    'abstract',
    'as',
    'assert',
    'async',
    'await',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'covariant',
    'default',
    'deferred',
    'do',
    'dynamic',
    'else',
    'enum',
    'export',
    'extends',
    'extension',
    'external',
    'factory',
    'false',
    'final',
    'finally',
    'for',
    'Function',
    'get',
    'hide',
    'if',
    'implements',
    'import',
    'in',
    'interface',
    'is',
    'late',
    'library',
    'mixin',
    'new',
    'null',
    'on',
    'operator',
    'part',
    'required',
    'rethrow',
    'return',
    'sealed',
    'set',
    'show',
    'static',
    'super',
    'switch',
    'sync',
    'this',
    'throw',
    'true',
    'try',
    'typedef',
    'var',
    'void',
    'while',
    'with',
    'yield',
    'int',
    'double',
    'String',
    'bool',
    'List',
    'Map',
    'Set',
    'Future',
    'Stream',
    'num',
    'Object',
    'Never',
    'Null',
    'Type',
  ],
  sql: [
    'SELECT',
    'FROM',
    'WHERE',
    'INSERT',
    'INTO',
    'UPDATE',
    'DELETE',
    'CREATE',
    'ALTER',
    'DROP',
    'TABLE',
    'DATABASE',
    'INDEX',
    'VIEW',
    'JOIN',
    'LEFT',
    'RIGHT',
    'INNER',
    'OUTER',
    'CROSS',
    'FULL',
    'ON',
    'AND',
    'OR',
    'NOT',
    'NULL',
    'IS',
    'LIKE',
    'IN',
    'BETWEEN',
    'AS',
    'ORDER',
    'BY',
    'GROUP',
    'HAVING',
    'LIMIT',
    'OFFSET',
    'UNION',
    'ALL',
    'DISTINCT',
    'COUNT',
    'SUM',
    'AVG',
    'MIN',
    'MAX',
    'PRIMARY',
    'KEY',
    'FOREIGN',
    'REFERENCES',
    'UNIQUE',
    'DEFAULT',
    'CHECK',
    'CONSTRAINT',
    'CASCADE',
    'SET',
    'VALUES',
    'RETURNING',
    'EXISTS',
    'CASE',
    'WHEN',
    'THEN',
    'ELSE',
    'END',
    'CAST',
    'WITH',
    'RECURSIVE',
    'OVER',
    'PARTITION',
    'BEGIN',
    'COMMIT',
    'ROLLBACK',
    'TRANSACTION',
    'TRIGGER',
    'FUNCTION',
    'PROCEDURE',
    'DECLARE',
    'TYPE',
    'INTEGER',
    'TEXT',
    'VARCHAR',
    'BOOLEAN',
    'TIMESTAMP',
    'DATE',
    'SERIAL',
    'BIGINT',
    'FLOAT',
    'DOUBLE',
    'PRECISION',
    'CHAR',
    'UUID',
    'JSONB',
    'JSON',
    'ARRAY',
    'TRUNCATE',
    'RENAME',
    'ADD',
    'COLUMN',
    'GRANT',
    'REVOKE',
    'EXPLAIN',
    'ANALYZE',
    'ROW_NUMBER',
    'RANK',
    'DENSE_RANK',
    'LAG',
    'LEAD',
    'FIRST_VALUE',
    'LAST_VALUE',
    'WINDOW',
    'ROWS',
    'RANGE',
    'UNBOUNDED',
    'PRECEDING',
    'FOLLOWING',
    'CURRENT',
  ],
  react: [
    'const',
    'let',
    'var',
    'function',
    'async',
    'await',
    'return',
    'if',
    'else',
    'for',
    'while',
    'do',
    'switch',
    'case',
    'break',
    'continue',
    'try',
    'catch',
    'finally',
    'throw',
    'new',
    'class',
    'extends',
    'import',
    'export',
    'default',
    'from',
    'as',
    'typeof',
    'instanceof',
    'this',
    'super',
    'static',
    'get',
    'set',
    'delete',
    'void',
    'yield',
    'in',
    'of',
    'with',
    'debugger',
  ],
  lua: [
    'and',
    'break',
    'do',
    'else',
    'elseif',
    'end',
    'false',
    'for',
    'function',
    'goto',
    'if',
    'in',
    'local',
    'nil',
    'not',
    'or',
    'repeat',
    'return',
    'then',
    'true',
    'until',
    'while',
  ],
  r: [
    'if',
    'else',
    'repeat',
    'while',
    'function',
    'for',
    'in',
    'next',
    'break',
    'TRUE',
    'FALSE',
    'NULL',
    'Inf',
    'NaN',
    'NA',
    'library',
    'require',
    'source',
    'return',
    'invisible',
  ],
  scala: [
    'abstract',
    'case',
    'catch',
    'class',
    'def',
    'do',
    'else',
    'extends',
    'false',
    'final',
    'finally',
    'for',
    'if',
    'implicit',
    'import',
    'lazy',
    'match',
    'new',
    'null',
    'object',
    'override',
    'package',
    'private',
    'protected',
    'return',
    'sealed',
    'super',
    'this',
    'throw',
    'trait',
    'true',
    'try',
    'type',
    'val',
    'var',
    'while',
    'with',
    'yield',
    'given',
    'using',
    'enum',
    'then',
    'export',
    'end',
    'extension',
    'opaque',
  ],
  bash: [
    'if',
    'then',
    'else',
    'elif',
    'fi',
    'case',
    'esac',
    'for',
    'while',
    'until',
    'do',
    'done',
    'in',
    'function',
    'select',
    'echo',
    'printf',
    'read',
    'declare',
    'local',
    'export',
    'readonly',
    'unset',
    'shift',
    'exit',
    'return',
    'break',
    'continue',
    'eval',
    'exec',
    'source',
    'set',
    'trap',
    'wait',
    'kill',
    'test',
    'true',
    'false',
  ],
  haskell: [
    'as',
    'case',
    'class',
    'data',
    'default',
    'deriving',
    'do',
    'else',
    'forall',
    'foreign',
    'hiding',
    'if',
    'import',
    'in',
    'infix',
    'infixl',
    'infixr',
    'instance',
    'let',
    'module',
    'newtype',
    'of',
    'qualified',
    'then',
    'type',
    'where',
    'True',
    'False',
    'Nothing',
    'Just',
    'Left',
    'Right',
  ],
  perl: [
    'my',
    'our',
    'local',
    'use',
    'no',
    'require',
    'package',
    'sub',
    'if',
    'elsif',
    'else',
    'unless',
    'while',
    'for',
    'foreach',
    'until',
    'do',
    'last',
    'next',
    'redo',
    'return',
    'die',
    'warn',
    'print',
    'say',
    'chomp',
    'push',
    'pop',
    'shift',
    'unshift',
    'sort',
    'keys',
    'values',
    'each',
    'exists',
    'delete',
    'defined',
    'undef',
    'bless',
    'ref',
    'and',
    'or',
    'not',
    'eq',
    'ne',
    'lt',
    'gt',
    'le',
    'ge',
  ],
  elixir: [
    'def',
    'defp',
    'defmodule',
    'defmacro',
    'defstruct',
    'defimpl',
    'defprotocol',
    'case',
    'cond',
    'if',
    'else',
    'unless',
    'when',
    'do',
    'end',
    'fn',
    'raise',
    'rescue',
    'try',
    'catch',
    'after',
    'for',
    'in',
    'with',
    'import',
    'use',
    'alias',
    'require',
    'and',
    'or',
    'not',
    'true',
    'false',
    'nil',
  ],
  objectivec: [
    'self',
    'super',
    'nil',
    'YES',
    'NO',
    'NULL',
    'true',
    'false',
    'if',
    'else',
    'for',
    'while',
    'do',
    'switch',
    'case',
    'break',
    'continue',
    'return',
    'goto',
    'typedef',
    'struct',
    'enum',
    'union',
    'static',
    'extern',
    'const',
    'volatile',
    'auto',
    'register',
    'void',
    'int',
    'long',
    'short',
    'char',
    'float',
    'double',
    'signed',
    'unsigned',
    'sizeof',
    'id',
    'BOOL',
  ],
};

// ==================== Built-in Functions ====================
const BUILTIN_FUNCTIONS: Record<string, string[]> = {
  javascript: [
    'console',
    'log',
    'error',
    'warn',
    'info',
    'Math',
    'Date',
    'Array',
    'Object',
    'String',
    'Number',
    'Boolean',
    'JSON',
    'parse',
    'stringify',
    'parseInt',
    'parseFloat',
    'isNaN',
    'isFinite',
    'setTimeout',
    'setInterval',
    'clearTimeout',
    'clearInterval',
    'Promise',
    'then',
    'catch',
    'fetch',
    'Map',
    'Set',
    'WeakMap',
    'WeakSet',
    'Symbol',
    'Proxy',
    'Reflect',
    'RegExp',
    'Error',
    'require',
    'module',
    'exports',
  ],
  typescript: [
    'console',
    'log',
    'error',
    'warn',
    'Math',
    'Date',
    'Array',
    'Object',
    'String',
    'Number',
    'Boolean',
    'JSON',
    'parse',
    'stringify',
    'parseInt',
    'parseFloat',
    'Promise',
    'Record',
    'Partial',
    'Required',
    'Pick',
    'Omit',
    'Exclude',
    'Extract',
    'NonNullable',
    'ReturnType',
    'Parameters',
    'Awaited',
    'Readonly',
    'Map',
    'Set',
    'fetch',
  ],
  react: [
    'useState',
    'useEffect',
    'useCallback',
    'useMemo',
    'useRef',
    'useContext',
    'useReducer',
    'useLayoutEffect',
    'useId',
    'React',
    'Component',
    'Fragment',
    'Suspense',
    'lazy',
    'memo',
    'forwardRef',
    'createContext',
    'createElement',
    'createPortal',
    'console',
    'log',
    'Math',
    'Date',
    'Array',
    'Object',
    'String',
    'Number',
    'Boolean',
    'JSON',
    'Promise',
    'fetch',
    'Map',
    'Set',
  ],
  python: [
    'print',
    'len',
    'range',
    'input',
    'int',
    'str',
    'float',
    'bool',
    'list',
    'dict',
    'set',
    'tuple',
    'open',
    'map',
    'filter',
    'sum',
    'min',
    'max',
    'abs',
    'round',
    'sorted',
    'enumerate',
    'zip',
    'type',
    'isinstance',
    'hasattr',
    'getattr',
    'setattr',
    'super',
    'property',
    'staticmethod',
    'classmethod',
    'any',
    'all',
    'next',
    'iter',
    'reversed',
    'hex',
    'oct',
    'bin',
    'ord',
    'chr',
    'repr',
    'format',
    'hash',
    'id',
    'dir',
    'vars',
    'eval',
    'exec',
  ],
  java: [
    'System',
    'out',
    'println',
    'print',
    'printf',
    'Scanner',
    'Math',
    'String',
    'Integer',
    'Double',
    'Boolean',
    'ArrayList',
    'HashMap',
    'HashSet',
    'Collections',
    'Arrays',
    'List',
    'Map',
    'Set',
    'Queue',
    'Stack',
    'LinkedList',
    'Optional',
    'Stream',
    'Collectors',
    'StringBuilder',
    'Thread',
    'File',
    'Exception',
  ],
  cpp: [
    'std',
    'cout',
    'cin',
    'endl',
    'cerr',
    'vector',
    'string',
    'map',
    'set',
    'pair',
    'make_pair',
    'sort',
    'find',
    'push_back',
    'pop_back',
    'size',
    'length',
    'begin',
    'end',
    'unordered_map',
    'unordered_set',
    'queue',
    'stack',
    'deque',
    'priority_queue',
    'list',
    'array',
    'shared_ptr',
    'unique_ptr',
    'make_shared',
    'make_unique',
    'move',
    'swap',
    'min',
    'max',
    'abs',
    'pow',
    'sqrt',
    'to_string',
    'getline',
    'ifstream',
    'ofstream',
    'stringstream',
  ],
  c: [
    'printf',
    'scanf',
    'fprintf',
    'fscanf',
    'sprintf',
    'sscanf',
    'malloc',
    'calloc',
    'realloc',
    'free',
    'memcpy',
    'memset',
    'memmove',
    'strcmp',
    'strncmp',
    'strcpy',
    'strncpy',
    'strlen',
    'strcat',
    'strncat',
    'strstr',
    'strchr',
    'strrchr',
    'atoi',
    'atof',
    'atol',
    'strtol',
    'strtod',
    'fopen',
    'fclose',
    'fread',
    'fwrite',
    'fgets',
    'fputs',
    'fseek',
    'ftell',
    'rewind',
    'abs',
    'pow',
    'sqrt',
    'sin',
    'cos',
    'tan',
    'log',
    'exp',
    'ceil',
    'floor',
    'rand',
    'srand',
    'exit',
    'assert',
    'sizeof',
  ],
  csharp: [
    'Console',
    'WriteLine',
    'Write',
    'ReadLine',
    'String',
    'Int32',
    'Double',
    'Boolean',
    'List',
    'Dictionary',
    'Array',
    'Length',
    'Count',
    'Add',
    'Remove',
    'Contains',
    'ToList',
    'ToArray',
    'Select',
    'Where',
    'FirstOrDefault',
    'Any',
    'All',
    'OrderBy',
    'Task',
    'StringBuilder',
    'DateTime',
    'Math',
    'Convert',
    'File',
    'Path',
    'Stream',
    'HttpClient',
  ],
  go: [
    'fmt',
    'Println',
    'Printf',
    'Sprintf',
    'Errorf',
    'Print',
    'Scan',
    'len',
    'cap',
    'make',
    'new',
    'append',
    'copy',
    'delete',
    'close',
    'panic',
    'recover',
    'error',
    'string',
    'int',
    'int8',
    'int16',
    'int32',
    'int64',
    'uint',
    'float32',
    'float64',
    'byte',
    'rune',
    'bool',
    'os',
    'io',
    'bufio',
    'strings',
    'strconv',
    'math',
    'sort',
    'sync',
    'context',
    'http',
    'json',
    'log',
    'time',
  ],
  rust: [
    'println',
    'print',
    'eprintln',
    'eprint',
    'format',
    'panic',
    'assert',
    'assert_eq',
    'assert_ne',
    'todo',
    'unimplemented',
    'vec',
    'Vec',
    'String',
    'str',
    'Box',
    'Rc',
    'Arc',
    'Cell',
    'RefCell',
    'Mutex',
    'Option',
    'Some',
    'None',
    'Result',
    'Ok',
    'Err',
    'HashMap',
    'HashSet',
    'BTreeMap',
    'BTreeSet',
    'VecDeque',
    'Iterator',
    'Clone',
    'Copy',
    'Debug',
    'Display',
    'Default',
    'Drop',
    'From',
    'Into',
    'Send',
    'Sync',
    'Sized',
    'i8',
    'i16',
    'i32',
    'i64',
    'i128',
    'isize',
    'u8',
    'u16',
    'u32',
    'u64',
    'u128',
    'usize',
    'f32',
    'f64',
  ],
  swift: [
    'print',
    'debugPrint',
    'fatalError',
    'precondition',
    'assert',
    'abs',
    'min',
    'max',
    'stride',
    'zip',
    'Array',
    'Dictionary',
    'Set',
    'String',
    'Int',
    'Double',
    'Float',
    'Bool',
    'Character',
    'Optional',
    'Result',
    'Error',
    'Codable',
    'Hashable',
    'Equatable',
    'Task',
    'URLSession',
    'URL',
    'Data',
    'JSONEncoder',
    'JSONDecoder',
    'FileManager',
    'DispatchQueue',
  ],
  kotlin: [
    'println',
    'print',
    'readLine',
    'readln',
    'TODO',
    'error',
    'require',
    'check',
    'listOf',
    'mutableListOf',
    'arrayOf',
    'mapOf',
    'mutableMapOf',
    'setOf',
    'mutableSetOf',
    'emptyList',
    'with',
    'apply',
    'also',
    'let',
    'run',
    'takeIf',
    'repeat',
    'Pair',
    'Triple',
    'Result',
    'fold',
    'map',
    'filter',
    'reduce',
    'forEach',
    'flatMap',
    'groupBy',
    'sortedBy',
    'any',
    'all',
    'first',
    'last',
    'find',
    'count',
    'sum',
    'average',
    'max',
    'min',
    'String',
    'Int',
    'Long',
    'Double',
    'Float',
    'Boolean',
    'Char',
    'Unit',
    'Nothing',
    'Any',
    'launch',
    'async',
    'runBlocking',
    'withContext',
    'delay',
    'flow',
    'collect',
    'emit',
  ],
  php: [
    'echo',
    'print',
    'var_dump',
    'print_r',
    'die',
    'exit',
    'isset',
    'unset',
    'empty',
    'is_null',
    'is_array',
    'is_string',
    'is_int',
    'array',
    'array_push',
    'array_pop',
    'array_map',
    'array_filter',
    'array_merge',
    'array_keys',
    'array_values',
    'in_array',
    'count',
    'sort',
    'strlen',
    'strpos',
    'substr',
    'str_replace',
    'strtolower',
    'strtoupper',
    'trim',
    'explode',
    'implode',
    'sprintf',
    'json_encode',
    'json_decode',
    'file_get_contents',
    'date',
    'time',
    'preg_match',
    'preg_replace',
    'Exception',
    'PDO',
  ],
  ruby: [
    'puts',
    'print',
    'p',
    'gets',
    'chomp',
    'to_s',
    'to_i',
    'to_f',
    'length',
    'size',
    'count',
    'each',
    'map',
    'select',
    'reject',
    'reduce',
    'find',
    'any?',
    'all?',
    'include?',
    'empty?',
    'nil?',
    'push',
    'pop',
    'shift',
    'unshift',
    'sort',
    'reverse',
    'uniq',
    'flatten',
    'compact',
    'freeze',
    'dup',
    'clone',
    'respond_to?',
    'is_a?',
    'kind_of?',
    'new',
    'initialize',
    'Array',
    'Hash',
    'String',
    'Integer',
    'Float',
    'Symbol',
    'Range',
    'Regexp',
    'File',
    'IO',
    'Dir',
    'Enumerable',
  ],
  dart: [
    'print',
    'debugPrint',
    'main',
    'runApp',
    'setState',
    'initState',
    'dispose',
    'build',
    'createState',
    'List',
    'Map',
    'Set',
    'Future',
    'Stream',
    'Duration',
    'DateTime',
    'Uri',
    'RegExp',
    'Widget',
    'StatelessWidget',
    'StatefulWidget',
    'State',
    'BuildContext',
    'Container',
    'Column',
    'Row',
    'Stack',
    'ListView',
    'Scaffold',
    'AppBar',
    'Text',
    'Icon',
    'Image',
    'ElevatedButton',
    'TextButton',
    'TextField',
    'Form',
    'Navigator',
    'MaterialApp',
    'ThemeData',
    'Colors',
    'EdgeInsets',
    'Padding',
    'Center',
    'SizedBox',
    'Expanded',
    'Flexible',
    'MediaQuery',
    'FutureBuilder',
    'StreamBuilder',
    'Provider',
  ],
  lua: [
    'print',
    'type',
    'tostring',
    'tonumber',
    'error',
    'assert',
    'pcall',
    'xpcall',
    'select',
    'unpack',
    'pairs',
    'ipairs',
    'setmetatable',
    'getmetatable',
    'require',
    'table',
    'string',
    'math',
    'io',
    'os',
    'coroutine',
    'insert',
    'remove',
    'sort',
    'concat',
    'format',
    'find',
    'match',
    'gmatch',
    'gsub',
    'sub',
    'len',
    'lower',
    'upper',
    'reverse',
    'abs',
    'ceil',
    'floor',
    'max',
    'min',
    'sqrt',
    'random',
    'sin',
    'cos',
  ],
  r: [
    'print',
    'cat',
    'paste',
    'paste0',
    'sprintf',
    'message',
    'c',
    'vector',
    'list',
    'matrix',
    'data.frame',
    'factor',
    'length',
    'nrow',
    'ncol',
    'dim',
    'names',
    'head',
    'tail',
    'str',
    'summary',
    'table',
    'which',
    'seq',
    'rep',
    'rev',
    'sum',
    'mean',
    'median',
    'var',
    'sd',
    'min',
    'max',
    'range',
    'abs',
    'sqrt',
    'log',
    'round',
    'ceiling',
    'floor',
    'sort',
    'order',
    'unique',
    'apply',
    'sapply',
    'lapply',
    'subset',
    'merge',
    'rbind',
    'cbind',
    'ifelse',
    'read.csv',
    'write.csv',
    'ggplot',
    'aes',
    'mutate',
    'select',
    'filter',
    'arrange',
    'group_by',
    'summarise',
  ],
  scala: [
    'println',
    'print',
    'List',
    'Map',
    'Set',
    'Seq',
    'Vector',
    'Array',
    'Option',
    'Some',
    'None',
    'Either',
    'Left',
    'Right',
    'Try',
    'Success',
    'Failure',
    'Future',
    'Promise',
    'Iterator',
    'Int',
    'Long',
    'Double',
    'Float',
    'Boolean',
    'Char',
    'String',
    'Unit',
    'Nothing',
    'Null',
    'Any',
    'AnyRef',
    'AnyVal',
    'map',
    'flatMap',
    'filter',
    'foreach',
    'reduce',
    'fold',
    'head',
    'tail',
    'last',
    'take',
    'drop',
    'zip',
    'groupBy',
    'sortBy',
    'distinct',
    'flatten',
    'exists',
    'forall',
    'count',
    'sum',
    'min',
    'max',
    'mkString',
    'toList',
    'toMap',
    'toSet',
  ],
  bash: [
    'echo',
    'printf',
    'read',
    'cat',
    'grep',
    'sed',
    'awk',
    'sort',
    'uniq',
    'wc',
    'cut',
    'tr',
    'head',
    'tail',
    'find',
    'xargs',
    'ls',
    'cd',
    'pwd',
    'mkdir',
    'rm',
    'cp',
    'mv',
    'chmod',
    'chown',
    'touch',
    'which',
    'export',
    'env',
    'set',
    'source',
    'eval',
    'exec',
    'test',
    'expr',
    'declare',
    'local',
    'shift',
    'trap',
    'ps',
    'kill',
    'curl',
    'wget',
    'ssh',
    'git',
    'docker',
  ],
  haskell: [
    'putStrLn',
    'putStr',
    'print',
    'show',
    'read',
    'readLn',
    'getLine',
    'getChar',
    'map',
    'filter',
    'foldl',
    'foldr',
    'head',
    'tail',
    'last',
    'init',
    'take',
    'drop',
    'zip',
    'elem',
    'null',
    'length',
    'reverse',
    'and',
    'or',
    'any',
    'all',
    'sum',
    'product',
    'maximum',
    'minimum',
    'concat',
    'concatMap',
    'return',
    'pure',
    'fmap',
    'sequence',
    'mapM',
    'when',
    'unless',
    'IO',
    'Maybe',
    'Either',
    'Int',
    'Integer',
    'Float',
    'Double',
    'Char',
    'String',
    'Bool',
    'Map',
    'Set',
    'Text',
    'ByteString',
  ],
  perl: [
    'print',
    'say',
    'warn',
    'die',
    'exit',
    'chomp',
    'chop',
    'length',
    'substr',
    'index',
    'sort',
    'push',
    'pop',
    'shift',
    'unshift',
    'join',
    'split',
    'grep',
    'map',
    'keys',
    'values',
    'each',
    'exists',
    'delete',
    'defined',
    'ref',
    'bless',
    'open',
    'close',
    'read',
    'write',
  ],
  elixir: [
    'IO',
    'puts',
    'inspect',
    'gets',
    'Enum',
    'map',
    'filter',
    'reduce',
    'each',
    'find',
    'sort',
    'count',
    'sum',
    'min',
    'max',
    'take',
    'drop',
    'join',
    'uniq',
    'reverse',
    'List',
    'Map',
    'String',
    'Integer',
    'Float',
    'Atom',
    'Tuple',
    'Range',
    'Stream',
    'Task',
    'Agent',
    'GenServer',
    'Supervisor',
    'File',
    'Path',
    'System',
    'Logger',
    'Mix',
    'is_atom',
    'is_binary',
    'is_boolean',
    'is_float',
    'is_integer',
    'is_list',
    'is_map',
    'is_nil',
    'is_number',
    'is_tuple',
    'hd',
    'tl',
    'length',
    'elem',
    'div',
    'rem',
    'abs',
    'round',
  ],
  objectivec: [
    'NSLog',
    'NSString',
    'NSArray',
    'NSMutableArray',
    'NSDictionary',
    'NSMutableDictionary',
    'NSNumber',
    'NSObject',
    'NSInteger',
    'CGFloat',
    'CGRect',
    'CGPoint',
    'CGSize',
    'UIView',
    'UIViewController',
    'UILabel',
    'UIButton',
    'UIImage',
    'UIColor',
    'UIFont',
    'UIScreen',
    'UIApplication',
    'NSError',
    'NSData',
    'NSURL',
    'NSURLSession',
    'dispatch_async',
    'dispatch_get_main_queue',
    'alloc',
    'init',
    'new',
    'copy',
    'release',
    'dealloc',
  ],
};

// Comment style helpers
const HASH_COMMENT_LANGS = new Set([
  'python',
  'ruby',
  'perl',
  'bash',
  'shell',
  'sh',
  'r',
  'yaml',
  'toml',
  'elixir',
]);
const DASH_COMMENT_LANGS = new Set(['sql', 'lua', 'haskell']);
const TRIPLE_QUOTE_LANGS = new Set(['python']);

/**
 * تحليل وتلوين الكود حسب اللغة
 */
export function tokenizeCode(code: string, languageInput: string): Token[] {
  const language = normalizeLanguage(languageInput);

  if (
    language === 'markup' ||
    language === 'html' ||
    language === 'xml' ||
    language === 'svg'
  ) {
    return tokenizeMarkup(code);
  }
  if (language === 'css' || language === 'scss' || language === 'less') {
    return tokenizeCSS(code);
  }
  if (language === 'json' || language === 'jsonc') {
    return tokenizeJSON(code);
  }
  if (language === 'yaml' || language === 'yml') {
    return tokenizeYAML(code);
  }

  // ✅ Fallback ذكي: لأي لغة بدون keywords نستخدم مجموعة عامة
  const keywords = KEYWORDS[language] || buildFallbackKeywords();
  const builtins = BUILTIN_FUNCTIONS[language] || [];
  const useHash = HASH_COMMENT_LANGS.has(language);
  const useDash = DASH_COMMENT_LANGS.has(language);
  const useTriple = TRIPLE_QUOTE_LANGS.has(language);

  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Whitespace
    if (/\s/.test(code[i])) {
      const start = i;
      while (i < code.length && /\s/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'default' });
      continue;
    }

    // Python triple-quote strings
    if (
      useTriple &&
      (code.slice(i, i + 3) === '"""' || code.slice(i, i + 3) === "'''")
    ) {
      const quote = code.slice(i, i + 3);
      const start = i;
      i += 3;
      while (i < code.length - 2 && code.slice(i, i + 3) !== quote) i++;
      if (code.slice(i, i + 3) === quote) i += 3;
      tokens.push({ content: code.slice(start, i), type: 'string' });
      continue;
    }

    // Line comments
    if (code.slice(i, i + 2) === '//' && !useDash) {
      const start = i;
      while (i < code.length && code[i] !== '\n') i++;
      tokens.push({ content: code.slice(start, i), type: 'comment' });
      continue;
    }
    if (useHash && code[i] === '#') {
      const start = i;
      while (i < code.length && code[i] !== '\n') i++;
      tokens.push({ content: code.slice(start, i), type: 'comment' });
      continue;
    }
    if (useDash && code.slice(i, i + 2) === '--') {
      const start = i;
      while (i < code.length && code[i] !== '\n') i++;
      tokens.push({ content: code.slice(start, i), type: 'comment' });
      continue;
    }

    // Block comments /* */
    if (code.slice(i, i + 2) === '/*') {
      const start = i;
      i += 2;
      while (i < code.length - 1 && code.slice(i, i + 2) !== '*/') i++;
      if (code.slice(i, i + 2) === '*/') i += 2;
      tokens.push({ content: code.slice(start, i), type: 'comment' });
      continue;
    }

    // Lua block comments
    if (language === 'lua' && code.slice(i, i + 4) === '--[[') {
      const start = i;
      i += 4;
      while (i < code.length - 1 && code.slice(i, i + 2) !== ']]') i++;
      if (code.slice(i, i + 2) === ']]') i += 2;
      tokens.push({ content: code.slice(start, i), type: 'comment' });
      continue;
    }

    // Haskell block comments {- -}
    if (language === 'haskell' && code.slice(i, i + 2) === '{-') {
      const start = i;
      i += 2;
      while (i < code.length - 1 && code.slice(i, i + 2) !== '-}') i++;
      if (code.slice(i, i + 2) === '-}') i += 2;
      tokens.push({ content: code.slice(start, i), type: 'comment' });
      continue;
    }

    // PHP variables ($var)
    if (language === 'php' && code[i] === '$') {
      const start = i;
      i++;
      while (i < code.length && /[\w]/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'variable' });
      continue;
    }

    // Objective-C directives (@interface, etc.)
    if (language === 'objectivec' && code[i] === '@') {
      const start = i;
      i++;
      while (i < code.length && /[\w]/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'keyword' });
      continue;
    }

    // Ruby/Elixir symbols (:symbol)
    if (
      (language === 'ruby' || language === 'elixir') &&
      code[i] === ':' &&
      i + 1 < code.length &&
      /[a-zA-Z_]/.test(code[i + 1])
    ) {
      const start = i;
      i++;
      while (i < code.length && /[\w?!]/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'constant' });
      continue;
    }

    // Rust lifetime annotations ('a)
    if (
      language === 'rust' &&
      code[i] === "'" &&
      i + 1 < code.length &&
      /[a-zA-Z_]/.test(code[i + 1])
    ) {
      const start = i;
      i++;
      while (i < code.length && /[\w]/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'attribute' });
      continue;
    }

    // Strings
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      const start = i;
      i++;
      while (i < code.length) {
        if (code[i] === '\\') {
          i += 2;
        } else if (code[i] === quote) {
          i++;
          break;
        } else if (code[i] === '\n' && quote !== '`') {
          break;
        } else {
          i++;
        }
      }
      tokens.push({ content: code.slice(start, i), type: 'string' });
      continue;
    }

    // Template strings
    if (code[i] === '`') {
      const start = i;
      i++;
      while (i < code.length) {
        if (code[i] === '\\') {
          i += 2;
        } else if (code[i] === '`') {
          i++;
          break;
        } else {
          i++;
        }
      }
      tokens.push({ content: code.slice(start, i), type: 'string' });
      continue;
    }

    // Numbers
    if (
      /\d/.test(code[i]) ||
      (code[i] === '.' && i + 1 < code.length && /\d/.test(code[i + 1]))
    ) {
      const start = i;
      if (code[i] === '0' && i + 1 < code.length) {
        const next = code[i + 1];
        if (next === 'x' || next === 'X') {
          i += 2;
          while (i < code.length && /[\da-fA-F_]/.test(code[i])) i++;
        } else if (next === 'b' || next === 'B') {
          i += 2;
          while (i < code.length && /[01_]/.test(code[i])) i++;
        } else if (next === 'o' || next === 'O') {
          i += 2;
          while (i < code.length && /[0-7_]/.test(code[i])) i++;
        } else {
          while (i < code.length && /[\d._]/.test(code[i])) i++;
        }
      } else {
        while (i < code.length && /[\d._]/.test(code[i])) i++;
      }
      if (i < code.length && (code[i] === 'e' || code[i] === 'E')) {
        i++;
        if (i < code.length && (code[i] === '+' || code[i] === '-')) i++;
        while (i < code.length && /\d/.test(code[i])) i++;
      }
      while (i < code.length && /[a-zA-Z]/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'number' });
      continue;
    }

    // Decorators/Annotations (@something) - not for Objective-C (handled above)
    if (
      code[i] === '@' &&
      language !== 'objectivec' &&
      i + 1 < code.length &&
      /[a-zA-Z_]/.test(code[i + 1])
    ) {
      const start = i;
      i++;
      while (i < code.length && /[\w.]/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'attribute' });
      continue;
    }

    // Identifiers (keywords, functions, variables)
    if (/[a-zA-Z_$]/.test(code[i])) {
      const start = i;
      while (i < code.length && /[\w$?!]/.test(code[i])) i++;
      const word = code.slice(start, i);

      // Rust macros
      if (language === 'rust' && i < code.length && code[i] === '!') {
        i++;
        tokens.push({ content: code.slice(start, i), type: 'function' });
        continue;
      }

      const isKeyword =
        language === 'sql'
          ? keywords.some((kw) => kw.toLowerCase() === word.toLowerCase())
          : keywords.includes(word);
      const isBuiltin = builtins.includes(word);

      let j = i;
      while (j < code.length && /\s/.test(code[j])) j++;
      const isFunction = code[j] === '(';
      const isClassName = /^[A-Z][a-z]/.test(word) && !isKeyword;
      const isConstant = /^[A-Z][A-Z0-9_]+$/.test(word) && word.length > 1;

      const boolValues = [
        'true',
        'false',
        'null',
        'undefined',
        'None',
        'True',
        'False',
        'nil',
        'NULL',
        'NaN',
        'Infinity',
      ];

      let type: TokenType = 'default';
      if (isKeyword) type = 'keyword';
      else if (boolValues.includes(word)) type = 'boolean';
      else if (isBuiltin) type = 'function';
      else if (isFunction) type = 'function';
      else if (isConstant) type = 'constant';
      else if (isClassName && !['python', 'ruby', 'r'].includes(language))
        type = 'className';
      else type = 'variable';

      tokens.push({ content: word, type });
      continue;
    }

    // Multi-char operators
    const operators = [
      '>>>=',
      '>>>',
      '<<=',
      '>>=',
      '===',
      '!==',
      '**=',
      '&&=',
      '||=',
      '??=',
      '<=>',
      '..=',
      '...',
      '==',
      '!=',
      '<=',
      '>=',
      '=>',
      '->',
      '::',
      '??',
      '**',
      '<<',
      '>>',
      '++',
      '--',
      '&&',
      '||',
      '+=',
      '-=',
      '*=',
      '/=',
      '%=',
      '&=',
      '|=',
      '^=',
      '..',
      '|>',
    ];
    let matched = false;
    for (const op of operators) {
      if (code.slice(i, i + op.length) === op) {
        tokens.push({ content: op, type: 'operator' });
        i += op.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    if (/[+\-*/%<>=!&|^~?:]/.test(code[i])) {
      tokens.push({ content: code[i], type: 'operator' });
      i++;
      continue;
    }

    if (/[{}()\[\];,.]/.test(code[i])) {
      tokens.push({ content: code[i], type: 'punctuation' });
      i++;
      continue;
    }

    // نص غير ASCII (العربية مثلاً) يُجمع كتلة واحدة: عنصر لكل حرف يمنع وصل الحروف العربية
    if (code.charCodeAt(i) > 0x7f) {
      const start = i;
      while (i < code.length && code.charCodeAt(i) > 0x7f) i++;
      tokens.push({ content: code.slice(start, i), type: 'default' });
      continue;
    }

    tokens.push({ content: code[i], type: 'default' });
    i++;
  }

  return tokens;
}

/** Fallback keywords for unknown languages */
function buildFallbackKeywords(): string[] {
  return [
    'if',
    'else',
    'for',
    'while',
    'do',
    'switch',
    'case',
    'break',
    'continue',
    'return',
    'try',
    'catch',
    'finally',
    'throw',
    'function',
    'class',
    'interface',
    'struct',
    'enum',
    'type',
    'var',
    'let',
    'const',
    'static',
    'public',
    'private',
    'protected',
    'abstract',
    'virtual',
    'override',
    'final',
    'import',
    'export',
    'from',
    'as',
    'package',
    'module',
    'use',
    'require',
    'include',
    'using',
    'new',
    'this',
    'self',
    'super',
    'extends',
    'implements',
    'and',
    'or',
    'not',
    'in',
    'is',
    'typeof',
    'instanceof',
    'true',
    'false',
    'null',
    'nil',
    'None',
    'void',
    'async',
    'await',
    'yield',
    'int',
    'float',
    'double',
    'string',
    'bool',
    'char',
    'byte',
    'long',
    'short',
    'boolean',
    'number',
    'any',
    'object',
    'delete',
    'sizeof',
    'default',
    'def',
    'fn',
    'func',
    'val',
  ];
}

// ==================== HTML/XML Tokenizer ====================
function tokenizeMarkup(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    if (code.slice(i, i + 4) === '<!--') {
      const start = i;
      i += 4;
      while (i < code.length - 2 && code.slice(i, i + 3) !== '-->') i++;
      if (code.slice(i, i + 3) === '-->') i += 3;
      tokens.push({ content: code.slice(start, i), type: 'comment' });
      continue;
    }

    if (code.slice(i, i + 9).toUpperCase() === '<!DOCTYPE') {
      const start = i;
      while (i < code.length && code[i] !== '>') i++;
      if (code[i] === '>') i++;
      tokens.push({ content: code.slice(start, i), type: 'keyword' });
      continue;
    }

    if (code[i] === '<') {
      const start = i;
      i++;
      if (code[i] === '/') i++;
      while (i < code.length && /[a-zA-Z0-9-]/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'tag' });

      while (
        i < code.length &&
        code[i] !== '>' &&
        code.slice(i, i + 2) !== '/>'
      ) {
        if (/\s/.test(code[i])) {
          tokens.push({ content: code[i], type: 'default' });
          i++;
        } else if (/[a-zA-Z-]/.test(code[i])) {
          const attrStart = i;
          while (i < code.length && /[a-zA-Z0-9-]/.test(code[i])) i++;
          tokens.push({ content: code.slice(attrStart, i), type: 'attribute' });
        } else if (code[i] === '=') {
          tokens.push({ content: '=', type: 'operator' });
          i++;
          if (code[i] === '"' || code[i] === "'") {
            const quote = code[i];
            const strStart = i;
            i++;
            while (i < code.length && code[i] !== quote) i++;
            if (code[i] === quote) i++;
            tokens.push({ content: code.slice(strStart, i), type: 'string' });
          }
        } else {
          tokens.push({ content: code[i], type: 'default' });
          i++;
        }
      }

      if (code.slice(i, i + 2) === '/>') {
        tokens.push({ content: '/>', type: 'tag' });
        i += 2;
      } else if (code[i] === '>') {
        tokens.push({ content: '>', type: 'tag' });
        i++;
      }
      continue;
    }

    const textStart = i;
    while (i < code.length && code[i] !== '<') i++;
    if (i > textStart) {
      tokens.push({ content: code.slice(textStart, i), type: 'default' });
    }
  }

  return tokens;
}

// ==================== CSS Tokenizer ====================
function tokenizeCSS(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    if (code.slice(i, i + 2) === '/*') {
      const start = i;
      i += 2;
      while (i < code.length - 1 && code.slice(i, i + 2) !== '*/') i++;
      if (code.slice(i, i + 2) === '*/') i += 2;
      tokens.push({ content: code.slice(start, i), type: 'comment' });
      continue;
    }

    if (code.slice(i, i + 2) === '//') {
      const start = i;
      while (i < code.length && code[i] !== '\n') i++;
      tokens.push({ content: code.slice(start, i), type: 'comment' });
      continue;
    }

    if (/\s/.test(code[i])) {
      const start = i;
      while (i < code.length && /\s/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'default' });
      continue;
    }

    if (code[i] === '@') {
      const start = i;
      i++;
      while (i < code.length && /[a-zA-Z-]/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'keyword' });
      continue;
    }

    if (
      (code[i] === '.' || code[i] === '#') &&
      /[a-zA-Z_-]/.test(code[i + 1] || '')
    ) {
      const start = i;
      i++;
      while (i < code.length && /[a-zA-Z0-9_-]/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'className' });
      continue;
    }

    if (code[i] === ':' && /[a-zA-Z]/.test(code[i + 1] || '')) {
      const start = i;
      if (code[i + 1] === ':') i++;
      i++;
      while (i < code.length && /[a-zA-Z-]/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'keyword' });
      continue;
    }

    if (/[a-zA-Z-]/.test(code[i])) {
      const start = i;
      while (i < code.length && /[a-zA-Z0-9-]/.test(code[i])) i++;
      const word = code.slice(start, i);

      let j = i;
      while (j < code.length && /\s/.test(code[j])) j++;

      if (code[j] === ':' && code[j + 1] !== ':') {
        tokens.push({ content: word, type: 'property' });
      } else if (code[j] === '(') {
        tokens.push({ content: word, type: 'function' });
      } else if (/^[a-z]/.test(word)) {
        tokens.push({ content: word, type: 'tag' });
      } else {
        tokens.push({ content: word, type: 'default' });
      }
      continue;
    }

    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      const start = i;
      i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\') i += 2;
        else i++;
      }
      if (code[i] === quote) i++;
      tokens.push({ content: code.slice(start, i), type: 'string' });
      continue;
    }

    if (/[\d.]/.test(code[i])) {
      const start = i;
      while (i < code.length && /[\d.]/.test(code[i])) i++;
      while (i < code.length && /[a-z%]/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'number' });
      continue;
    }

    if (code[i] === '#' && /[\da-fA-F]/.test(code[i + 1] || '')) {
      const start = i;
      i++;
      while (i < code.length && /[\da-fA-F]/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'number' });
      continue;
    }

    if (/[{}();:,>+~*]/.test(code[i])) {
      tokens.push({ content: code[i], type: 'punctuation' });
      i++;
      continue;
    }

    // نص غير ASCII (العربية مثلاً) يُجمع كتلة واحدة: عنصر لكل حرف يمنع وصل الحروف العربية
    if (code.charCodeAt(i) > 0x7f) {
      const start = i;
      while (i < code.length && code.charCodeAt(i) > 0x7f) i++;
      tokens.push({ content: code.slice(start, i), type: 'default' });
      continue;
    }

    tokens.push({ content: code[i], type: 'default' });
    i++;
  }

  return tokens;
}

// ==================== JSON Tokenizer ====================
function tokenizeJSON(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    if (/\s/.test(code[i])) {
      const start = i;
      while (i < code.length && /\s/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'default' });
      continue;
    }

    if (code.slice(i, i + 2) === '//') {
      const start = i;
      while (i < code.length && code[i] !== '\n') i++;
      tokens.push({ content: code.slice(start, i), type: 'comment' });
      continue;
    }
    if (code.slice(i, i + 2) === '/*') {
      const start = i;
      i += 2;
      while (i < code.length - 1 && code.slice(i, i + 2) !== '*/') i++;
      if (code.slice(i, i + 2) === '*/') i += 2;
      tokens.push({ content: code.slice(start, i), type: 'comment' });
      continue;
    }

    if (code[i] === '"') {
      const start = i;
      i++;
      while (i < code.length && code[i] !== '"') {
        if (code[i] === '\\') i += 2;
        else i++;
      }
      if (code[i] === '"') i++;

      let j = i;
      while (j < code.length && /\s/.test(code[j])) j++;
      const isKey = code[j] === ':';

      tokens.push({
        content: code.slice(start, i),
        type: isKey ? 'property' : 'string',
      });
      continue;
    }

    if (/[\d-]/.test(code[i])) {
      const start = i;
      if (code[i] === '-') i++;
      while (i < code.length && /[\d.eE+-]/.test(code[i])) i++;
      tokens.push({ content: code.slice(start, i), type: 'number' });
      continue;
    }

    const remaining = code.slice(i);
    if (remaining.startsWith('true')) {
      tokens.push({ content: 'true', type: 'boolean' });
      i += 4;
      continue;
    }
    if (remaining.startsWith('false')) {
      tokens.push({ content: 'false', type: 'boolean' });
      i += 5;
      continue;
    }
    if (remaining.startsWith('null')) {
      tokens.push({ content: 'null', type: 'boolean' });
      i += 4;
      continue;
    }

    if (/[{}[\]:,]/.test(code[i])) {
      tokens.push({ content: code[i], type: 'punctuation' });
      i++;
      continue;
    }

    // نص غير ASCII (العربية مثلاً) يُجمع كتلة واحدة: عنصر لكل حرف يمنع وصل الحروف العربية
    if (code.charCodeAt(i) > 0x7f) {
      const start = i;
      while (i < code.length && code.charCodeAt(i) > 0x7f) i++;
      tokens.push({ content: code.slice(start, i), type: 'default' });
      continue;
    }

    tokens.push({ content: code[i], type: 'default' });
    i++;
  }

  return tokens;
}

// ==================== YAML Tokenizer ====================
function tokenizeYAML(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split('\n');

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    if (lineIdx > 0) tokens.push({ content: '\n', type: 'default' });

    let i = 0;

    // Leading whitespace
    while (i < line.length && /\s/.test(line[i])) i++;
    if (i > 0) tokens.push({ content: line.slice(0, i), type: 'default' });

    // Comment
    if (line[i] === '#') {
      tokens.push({ content: line.slice(i), type: 'comment' });
      continue;
    }

    // Document markers
    if (line.slice(i) === '---' || line.slice(i) === '...') {
      tokens.push({ content: line.slice(i), type: 'keyword' });
      continue;
    }

    // List marker
    if (line[i] === '-' && (i + 1 >= line.length || line[i + 1] === ' ')) {
      tokens.push({ content: '-', type: 'punctuation' });
      i++;
      if (i < line.length && line[i] === ' ') {
        tokens.push({ content: ' ', type: 'default' });
        i++;
      }
    }

    // Key: value
    const colonIdx = line.indexOf(':', i);
    if (colonIdx !== -1) {
      const key = line.slice(i, colonIdx);
      if (key && /^[\w.-]+$/.test(key.trim())) {
        tokens.push({ content: key, type: 'property' });
        tokens.push({ content: ':', type: 'punctuation' });
        i = colonIdx + 1;

        if (i < line.length) {
          const value = line.slice(i);
          const trimmed = value.trim();
          if (trimmed.startsWith('#')) {
            const ci = value.indexOf('#');
            tokens.push({ content: value.slice(0, ci), type: 'default' });
            tokens.push({ content: value.slice(ci), type: 'comment' });
          } else if (/^(true|false|yes|no|on|off)$/i.test(trimmed)) {
            tokens.push({ content: value, type: 'boolean' });
          } else if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
            tokens.push({ content: value, type: 'number' });
          } else if (/^(null|~)$/i.test(trimmed)) {
            tokens.push({ content: value, type: 'boolean' });
          } else {
            tokens.push({ content: value, type: 'string' });
          }
        }
        continue;
      }
    }

    if (i < line.length) {
      tokens.push({ content: line.slice(i), type: 'default' });
    }
  }

  return tokens;
}

// ==================== Language Normalization ====================
function normalizeLanguage(lang: string): string {
  const normalized = lang.toLowerCase().trim();

  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'react',
    tsx: 'react',
    ts: 'typescript',
    py: 'python',
    'c++': 'cpp',
    'c#': 'csharp',
    cs: 'csharp',
    rb: 'ruby',
    rs: 'rust',
    kt: 'kotlin',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    pl: 'perl',
    hs: 'haskell',
    ex: 'elixir',
    exs: 'elixir',
    m: 'objectivec',
    objc: 'objectivec',
    'objective-c': 'objectivec',
    yml: 'yaml',
    html: 'markup',
    xml: 'markup',
    svg: 'markup',
    htm: 'markup',
    jsonc: 'json',
    json5: 'json',
    sass: 'css',
    scss: 'css',
    less: 'css',
    text: 'default',
    txt: 'default',
    plain: 'default',
    plaintext: 'default',
    markdown: 'default',
    md: 'default',
  };

  return map[normalized] || normalized;
}
