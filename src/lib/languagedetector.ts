export type ProgrammingLanguage =
    | 'text'
    | 'javascript'
    | 'typescript'
    | 'python'
    | 'java'
    | 'go'
    | 'rust'
    | 'php'
    | 'ruby'
    | 'html'
    | 'css'
    | 'c'
    | 'cpp'
    | 'csharp'
    | 'swift'
    | 'kotlin'
    | 'scala'
    | 'haskell'
    | 'lua'
    | 'perl';

export const SUPPORTED_LANGUAGES: Record<ProgrammingLanguage, string> = {
    text: 'Plain Text',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    go: 'Go',
    rust: 'Rust',
    php: 'PHP',
    ruby: 'Ruby',
    html: 'HTML',
    css: 'CSS',
    c: 'C',
    cpp: 'C++',
    csharp: 'C#',
    swift: 'Swift',
    kotlin: 'Kotlin',
    scala: 'Scala',
    haskell: 'Haskell',
    lua: 'Lua',
    perl: 'Perl',
};

const LANGUAGE_PATTERNS: Record<ProgrammingLanguage, { keywords: string[]; patterns: RegExp[]; uniqueFeatures: RegExp[] }> = {
    text: { keywords: [], patterns: [/.*/], uniqueFeatures: [] },
    typescript: {
        keywords: ['function', 'const', 'let', 'var', 'import', 'export', 'class', 'extends', 'async', 'interface', 'type', 'namespace', 'enum', 'as', 'implements'],
        patterns: [
            /:\s*(string|number|boolean|any)\b/,
            /<[A-Z]\w+>/,
            /interface\s+\w+/,
            /type\s+\w+\s*=/
        ],
        uniqueFeatures: [
            /:\s*(string|number|boolean|any)\[\]/,
            /as\s+(const|string|number|boolean|any)/,
            /<T.*?>/,
            /keyof\s+\w+/,
            /readonly\s+\w+:/
        ]
    },
    javascript: {
        keywords: ['function', 'const', 'let', 'var', 'import', 'export', 'class', 'extends', 'async', 'await'],
        patterns: [
            /\b(function|class)\s+\w+/,
            /\b(const|let|var)\s+\w+\s*=/,
            /=>\s*{/,
            /import\s+.*\s+from/,
            /export\s+(default\s+)?(function|class|const|let|var)/
        ],
        uniqueFeatures: [
            /console\.log\(/,
            /document\.querySelector\(/,
            /window\./,
            /setTimeout\(/,
            /Promise\.resolve\(/
        ]
    },
    python: {
        keywords: ['def', 'class', 'import', 'from', 'if', 'elif', 'else', 'try', 'except', 'finally', 'with'],
        patterns: [
            /def\s+\w+\s*\(/,
            /class\s+\w+(\s*$$.*$$)?:/,
            /import\s+\w+(\s*,\s*\w+)*(\s+as\s+\w+)?/,
            /from\s+\w+\s+import/,
            /if\s+.*:/
        ],
        uniqueFeatures: [
            /:\s*$/m,
            /print\(/,
            /__init__\(/,
            /self\./,
            /lambda\s+/
        ]
    },
    java: {
        keywords: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static', 'final'],
        patterns: [
            /public\s+class\s+\w+/,
            /(public|private|protected)\s+\w+\s+\w+\s*\(/,
            /import\s+[\w.]+;/,
            /@\w+/
        ],
        uniqueFeatures: [
            /System\.out\.println\(/,
            /new\s+\w+\(/,
            /throws\s+\w+/,
            /@Override/,
            /super\(/
        ]
    },
    go: {
        keywords: ['func', 'package', 'import', 'var', 'const', 'type', 'struct', 'interface', 'defer', 'go'],
        patterns: [
            /func\s+\w+\s*\(/,
            /package\s+\w+/,
            /import\s+($$[\s\S]*?$$|\S+)/,
            /type\s+\w+\s+(struct|interface)/
        ],
        uniqueFeatures: [
            /fmt\.Println\(/,
            /:\=/, // Short variable declaration
            /make\(/,
            /go\s+func\(/,
            /defer\s+/
        ]
    },
    rust: {
        keywords: ['fn', 'let', 'mut', 'impl', 'struct', 'enum', 'trait', 'use', 'pub', 'mod'],
        patterns: [
            /fn\s+\w+/,
            /let\s+mut\s+\w+/,
            /impl\s+\w+(\s+for\s+\w+)?/,
            /(struct|enum|trait)\s+\w+/,
            /use\s+[\w:]+;/
        ],
        uniqueFeatures: [
            /println!\(/,
            /->\s*\w+/,
            /&mut\s+/,
            /#\[derive\(/,
            /Result<.*>/
        ]
    },
    php: {
        keywords: ['function', 'class', 'public', 'private', 'protected', 'echo', 'print', 'require', 'include'],
        patterns: [
            /<\?php/,
            /function\s+\w+\s*\(/,
            /class\s+\w+(\s+extends\s+\w+)?(\s+implements\s+\w+)?/,
            /\$\w+\s*=/
        ],
        uniqueFeatures: [
            /\$_GET\[/,
            /\$_POST\[/,
            /\$_SESSION\[/,
            /mysqli_/,
            /->query\(/
        ]
    },
    ruby: {
        keywords: ['def', 'class', 'module', 'attr_', 'require', 'include', 'extend', 'puts', 'yield'],
        patterns: [
            /def\s+\w+/,
            /class\s+\w+(\s*<\s*\w+)?/,
            /module\s+\w+/,
            /attr_(reader|writer|accessor)/,
            /require\s+['"][\w\/]+['"]/
        ],
        uniqueFeatures: [
            /puts\s+/,
            /\w+\.each\s+do\s+\|/,
            /\bdo\b.*\|.*\|/,
            /@\w+\s*=/,
            /:\w+\s*=>/
        ]
    },
    html: {
        keywords: ['html', 'head', 'body', 'div', 'span', 'script', 'style', 'link', 'meta'],
        patterns: [
            /<!DOCTYPE\s+html>/i,
            /<html.*?>/i,
            /<(head|body|div|span|script|style|link|meta)[\s>]/i
        ],
        uniqueFeatures: [
            /<\/\w+>/,
            /<img\s+.*?src=/,
            /<a\s+.*?href=/,
            /<input\s+.*?type=/,
            /<form\s+.*?action=/
        ]
    },
    css: {
        keywords: ['body', 'div', 'class', 'id', 'margin', 'padding', 'color', 'background', 'font'],
        patterns: [
            /[\w-]+\s*:\s*[^;]+;/,
            /@media\s+/,
            /\.[.\w-]+\s*{/,
            /#[\w-]+\s*{/
        ],
        uniqueFeatures: [
            /!important/,
            /@keyframes/,
            /display:\s*flex/,
            /:\s*hover/,
            /rgba\(/
        ]
    },
    c: {
        keywords: ['int', 'char', 'float', 'double', 'void', 'struct', 'union', 'typedef', 'enum', 'const'],
        patterns: [
            /#include\s+<[\w.]+>/,
            /\b(int|char|float|double)\s+\w+\s*\(/,
            /struct\s+\w+\s*{/,
            /typedef\s+struct/
        ],
        uniqueFeatures: [
            /printf\(/,
            /scanf\(/,
            /malloc\(/,
            /free\(/,
            /\*\w+\s*=/
        ]
    },
    cpp: {
        keywords: ['class', 'template', 'namespace', 'public', 'private', 'protected', 'virtual', 'inline', 'const'],
        patterns: [
            /#include\s+<[\w.]+>/,
            /class\s+\w+/,
            /template\s*<.*>/,
            /namespace\s+\w+/,
            /std::\w+/
        ],
        uniqueFeatures: [
            /cout\s*<</,
            /cin\s*>>/,
            /new\s+\w+/,
            /delete\s+/,
            /std::vector</
        ]
    },
    csharp: {
        keywords: ['using', 'namespace', 'class', 'public', 'private', 'protected', 'static', 'async', 'await', 'var'],
        patterns: [
            /using\s+[\w.]+;/,
            /namespace\s+[\w.]+/,
            /class\s+\w+(\s*:\s*\w+)?/,
            /\basync\s+\w+/
        ],
        uniqueFeatures: [
            /Console\.WriteLine\(/,
            /\bvar\s+\w+\s*=/,
            /\bList<\w+>/,
            /\bTask\.Run\(/,
            /\[Attribute\]/
        ]
    },
    swift: {
        keywords: ['func', 'var', 'let', 'class', 'struct', 'enum', 'protocol', 'extension', 'guard', 'if let'],
        patterns: [
            /func\s+\w+\s*\(/,
            /(var|let)\s+\w+\s*:/,
            /class\s+\w+(\s*:\s*\w+)?/,
            /struct\s+\w+/,
            /enum\s+\w+/
        ],
        uniqueFeatures: [
            /print\(/,
            /\??\./,
            /guard\s+let/,
            /\$\d+/,
            /@objc/
        ]
    },
    kotlin: {
        keywords: ['fun', 'val', 'var', 'class', 'object', 'interface', 'when', 'is', 'in', 'companion'],
        patterns: [
            /fun\s+\w+\s*\(/,
            /(val|var)\s+\w+\s*:/,
            /class\s+\w+(\s*:\s*\w+)?/,
            /object\s+\w+/,
            /companion\s+object/
        ],
        uniqueFeatures: [
            /println\(/,
            /\?:/,
            /\w+\?\./,
            /\w+::class/,
            /@JvmStatic/
        ]
    },
    scala: {
        keywords: ['def', 'val', 'var', 'class', 'object', 'trait', 'extends', 'with', 'case class', 'implicit'],
        patterns: [
            /def\s+\w+\s*\(/,
            /(val|var)\s+\w+\s*:/,
            /class\s+\w+(\s*$$.*$$)?(\s+extends\s+\w+)?/,
            /object\s+\w+/,
            /trait\s+\w+/
        ],
        uniqueFeatures: [
            /println\(/,
            /=>/,
            /\w+:\s*_\s*=/,
            /implicit\s+/,
            /case\s+\w+\s*=>/
        ]
    },
    haskell: {
        keywords: ['module', 'import', 'data', 'type', 'newtype', 'class', 'instance', 'where', 'let', 'in'],
        patterns: [
            /module\s+\w+/,
            /import\s+(qualified\s+)?\w+/,
            /data\s+\w+/,
            /type\s+\w+/,
            /\w+\s+::\s+/
        ],
        uniqueFeatures: [
            /->/,
            /=>/,
            /\$\s*\w+/,
            /\w+\s+<-\s+/,
            /\|\|\s+/
        ]
    },
    lua: {
        keywords: ['function', 'local', 'if', 'then', 'else', 'elseif', 'for', 'while', 'repeat', 'until'],
        patterns: [
            /function\s+\w+\s*\(/,
            /local\s+\w+\s*=/,
            /if\s+.*\s+then/,
            /for\s+\w+\s*=.*do/,
            /while\s+.*\s+do/
        ],
        uniqueFeatures: [
            /print\(/,
            /\.\./,
            /#\w+/,
            /\[=*\[/,
            /\]=*\]/
        ]
    },
    perl: {
        keywords: ['sub', 'my', 'use', 'package', 'if', 'else', 'elsif', 'for', 'foreach', 'while'],
        patterns: [
            /sub\s+\w+/,
            /my\s+\$\w+/,
            /use\s+\w+/,
            /package\s+\w+/,
            /\$\w+\s*=>/
        ],

        uniqueFeatures: [
            /print\s+/,
            /\$_/,
            /=~/,
            /\w+::\w+/,
            /qw\(/
        ]
    },
};

export function detectLanguage(code: string): ProgrammingLanguage {
    const languageScores = Object.entries(LANGUAGE_PATTERNS).map(([language, { keywords, patterns, uniqueFeatures }]) => {
        let score = 0;

        // Check for keywords
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            const matches = (code.match(regex) || []).length;
            score += matches;
        });

        // Check for patterns
        patterns.forEach(pattern => {
            const matches = (code.match(pattern) || []).length;
            score += matches * 2; // Patterns are weighted more heavily
        });

        // Check for unique features
        uniqueFeatures.forEach(feature => {
            const matches = (code.match(feature) || []).length;
            score += matches * 3; // Unique features are weighted even more heavily
        });

        return { language, score };
    });

    // Sort languages by score in descending order
    languageScores.sort((a, b) => b.score - a.score);

    // Return the language with the highest score, or 'text' if no language was detected
    return (languageScores[0].score > 0 ? languageScores[0].language : 'text') as ProgrammingLanguage;
}

// Helper function to test the language detection
export function testLanguageDetection(code: string): void {
    const detectedLanguage = detectLanguage(code);
    console.log(`Detected language: ${SUPPORTED_LANGUAGES[detectedLanguage]}`);

    // Print scores for all languages
    const scores = Object.entries(LANGUAGE_PATTERNS).map(([lang, { keywords, patterns, uniqueFeatures }]) => {
        let score = 0;
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            score += (code.match(regex) || []).length;
        });
        patterns.forEach(pattern => {
            score += (code.match(pattern) || []).length * 2;
        });
        uniqueFeatures.forEach(feature => {
            score += (code.match(feature) || []).length * 3;
        });
        return { lang, score };
    }).sort((a, b) => b.score - a.score);

    console.log('Language scores:');
    scores.forEach(({ lang, score }) => {
        console.log(`${SUPPORTED_LANGUAGES[lang as ProgrammingLanguage]}: ${score}`);
    });
}