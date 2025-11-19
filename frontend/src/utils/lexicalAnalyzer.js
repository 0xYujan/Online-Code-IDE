// Lexical Analysis Algorithm (Tokenizer)
// This tokenizer analyzes code and breaks it into tokens

export class LexicalAnalyzer {
    constructor() {
        // Token types
        this.TOKEN_TYPES = {
            KEYWORD: "KEYWORD",
            IDENTIFIER: "IDENTIFIER",
            OPERATOR: "OPERATOR",
            LITERAL: "LITERAL",
            NUMBER: "NUMBER",
            STRING: "STRING",
            COMMENT: "COMMENT",
            PUNCTUATION: "PUNCTUATION",
            WHITESPACE: "WHITESPACE",
            HTML_TAG: "HTML_TAG",
            CSS_PROPERTY: "CSS_PROPERTY",
            CSS_VALUE: "CSS_VALUE",
            UNKNOWN: "UNKNOWN",
        };

        // JavaScript Keywords
        this.jsKeywords = new Set([
            "break",
            "case",
            "catch",
            "class",
            "const",
            "continue",
            "debugger",
            "default",
            "delete",
            "do",
            "else",
            "export",
            "extends",
            "finally",
            "for",
            "function",
            "if",
            "import",
            "in",
            "instanceof",
            "let",
            "new",
            "return",
            "super",
            "switch",
            "this",
            "throw",
            "try",
            "typeof",
            "var",
            "void",
            "while",
            "with",
            "yield",
            "async",
            "await",
            "of",
        ]);

        // JavaScript Operators
        this.operators = new Set([
            "+",
            "-",
            "*",
            "/",
            "%",
            "=",
            "==",
            "===",
            "!=",
            "!==",
            "<",
            ">",
            "<=",
            ">=",
            "&&",
            "||",
            "!",
            "&",
            "|",
            "^",
            "~",
            "<<",
            ">>",
            ">>>",
            "++",
            "--",
            "+=",
            "-=",
            "*=",
            "/=",
            "%=",
            "&=",
            "|=",
            "^=",
            "<<=",
            ">>=",
            ">>>=",
            "?",
            ":",
        ]);

        // Punctuation
        this.punctuation = new Set(["(", ")", "{", "}", "[", "]", ";", ",", ".", ":", "?"]);

        // HTML Tags
        this.htmlTags = new Set([
            "div",
            "span",
            "p",
            "a",
            "img",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "ul",
            "ol",
            "li",
            "table",
            "tr",
            "td",
            "th",
            "form",
            "input",
            "button",
            "select",
            "option",
            "textarea",
            "label",
            "header",
            "footer",
            "nav",
            "section",
            "article",
            "main",
            "aside",
        ]);

        // CSS Properties
        this.cssProperties = new Set([
            "color",
            "background",
            "background-color",
            "font-size",
            "margin",
            "padding",
            "border",
            "display",
            "position",
            "width",
            "height",
            "flex",
            "grid",
            "justify-content",
            "align-items",
            "opacity",
        ]);
    }

    // Main tokenization method
    tokenize(code, language = "javascript") {
        const tokens = [];
        let current = 0;

        while (current < code.length) {
            let char = code[current];

            // Whitespace
            if (/\s/.test(char)) {
                let value = "";
                while (current < code.length && /\s/.test(code[current])) {
                    value += code[current];
                    current++;
                }
                tokens.push({
                    type: this.TOKEN_TYPES.WHITESPACE,
                    value: value,
                    position: current - value.length,
                });
                continue;
            }

            // Comments
            if (language === "javascript" && char === "/" && code[current + 1] === "/") {
                let value = "";
                while (current < code.length && code[current] !== "\n") {
                    value += code[current];
                    current++;
                }
                tokens.push({
                    type: this.TOKEN_TYPES.COMMENT,
                    value: value,
                    position: current - value.length,
                });
                continue;
            }

            // Multi-line comments
            if (language === "javascript" && char === "/" && code[current + 1] === "*") {
                let value = "";
                while (current < code.length) {
                    value += code[current];
                    if (code[current] === "*" && code[current + 1] === "/") {
                        value += code[++current];
                        current++;
                        break;
                    }
                    current++;
                }
                tokens.push({
                    type: this.TOKEN_TYPES.COMMENT,
                    value: value,
                    position: current - value.length,
                });
                continue;
            }

            // CSS Comments
            if (language === "css" && char === "/" && code[current + 1] === "*") {
                let value = "";
                while (current < code.length) {
                    value += code[current];
                    if (code[current] === "*" && code[current + 1] === "/") {
                        value += code[++current];
                        current++;
                        break;
                    }
                    current++;
                }
                tokens.push({
                    type: this.TOKEN_TYPES.COMMENT,
                    value: value,
                    position: current - value.length,
                });
                continue;
            }

            // HTML Comments
            if (language === "html" && char === "<" && code.substr(current, 4) === "<!--") {
                let value = "";
                while (current < code.length) {
                    value += code[current];
                    if (code.substr(current, 3) === "-->") {
                        value += code[++current];
                        value += code[++current];
                        current++;
                        break;
                    }
                    current++;
                }
                tokens.push({
                    type: this.TOKEN_TYPES.COMMENT,
                    value: value,
                    position: current - value.length,
                });
                continue;
            }

            // String literals
            if (char === '"' || char === "'" || char === "`") {
                let value = "";
                const quote = char;
                value += code[current++];

                while (current < code.length && code[current] !== quote) {
                    if (code[current] === "\\") {
                        value += code[current++];
                    }
                    if (current < code.length) {
                        value += code[current++];
                    }
                }

                if (current < code.length) {
                    value += code[current++];
                }

                tokens.push({
                    type: this.TOKEN_TYPES.STRING,
                    value: value,
                    position: current - value.length,
                });
                continue;
            }

            // Numbers
            if (/[0-9]/.test(char)) {
                let value = "";
                while (current < code.length && /[0-9.]/.test(code[current])) {
                    value += code[current];
                    current++;
                }
                tokens.push({
                    type: this.TOKEN_TYPES.NUMBER,
                    value: value,
                    position: current - value.length,
                });
                continue;
            }

            // HTML Tags
            if (language === "html" && char === "<") {
                let value = "";
                while (current < code.length && code[current] !== ">") {
                    value += code[current];
                    current++;
                }
                if (current < code.length) {
                    value += code[current++];
                }
                tokens.push({
                    type: this.TOKEN_TYPES.HTML_TAG,
                    value: value,
                    position: current - value.length,
                });
                continue;
            }

            // Identifiers and Keywords
            if (/[a-zA-Z_$]/.test(char)) {
                let value = "";
                while (current < code.length && /[a-zA-Z0-9_$-]/.test(code[current])) {
                    value += code[current];
                    current++;
                }

                let tokenType = this.TOKEN_TYPES.IDENTIFIER;

                if (language === "javascript" && this.jsKeywords.has(value)) {
                    tokenType = this.TOKEN_TYPES.KEYWORD;
                } else if (language === "css" && this.cssProperties.has(value)) {
                    tokenType = this.TOKEN_TYPES.CSS_PROPERTY;
                } else if (language === "html" && this.htmlTags.has(value.toLowerCase())) {
                    tokenType = this.TOKEN_TYPES.HTML_TAG;
                }

                tokens.push({
                    type: tokenType,
                    value: value,
                    position: current - value.length,
                });
                continue;
            }

            // Operators
            let operatorFound = false;
            for (let len = 3; len > 0; len--) {
                const possibleOp = code.substr(current, len);
                if (this.operators.has(possibleOp)) {
                    tokens.push({
                        type: this.TOKEN_TYPES.OPERATOR,
                        value: possibleOp,
                        position: current,
                    });
                    current += len;
                    operatorFound = true;
                    break;
                }
            }
            if (operatorFound) continue;

            // Punctuation
            if (this.punctuation.has(char)) {
                tokens.push({
                    type: this.TOKEN_TYPES.PUNCTUATION,
                    value: char,
                    position: current,
                });
                current++;
                continue;
            }

            // Unknown character
            tokens.push({
                type: this.TOKEN_TYPES.UNKNOWN,
                value: char,
                position: current,
            });
            current++;
        }

        return tokens;
    }

    // Analyze code and return statistics
    analyzeCode(code, language = "javascript") {
        const tokens = this.tokenize(code, language);

        const stats = {
            totalTokens: tokens.length,
            keywords: 0,
            identifiers: 0,
            operators: 0,
            literals: 0,
            numbers: 0,
            strings: 0,
            comments: 0,
            lines: code.split("\n").length,
            characters: code.length,
            tokenBreakdown: {},
        };

        tokens.forEach((token) => {
            if (token.type === this.TOKEN_TYPES.KEYWORD) stats.keywords++;
            if (token.type === this.TOKEN_TYPES.IDENTIFIER) stats.identifiers++;
            if (token.type === this.TOKEN_TYPES.OPERATOR) stats.operators++;
            if (token.type === this.TOKEN_TYPES.NUMBER) stats.numbers++;
            if (token.type === this.TOKEN_TYPES.STRING) stats.strings++;
            if (token.type === this.TOKEN_TYPES.COMMENT) stats.comments++;

            stats.tokenBreakdown[token.type] = (stats.tokenBreakdown[token.type] || 0) + 1;
        });

        return stats;
    }

    // Find syntax errors
    findSyntaxErrors(code, language = "javascript") {
        const tokens = this.tokenize(code, language);
        const errors = [];

        if (language === "javascript") {
            let braceCount = 0;
            let parenCount = 0;
            let bracketCount = 0;
            let parenStack = [];
            let braceStack = [];
            let bracketStack = [];

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];

                if (token.value === "{") {
                    braceCount++;
                    braceStack.push({position: token.position, line: this.getLineNumber(code, token.position)});
                }
                if (token.value === "}") {
                    braceCount--;
                    if (braceStack.length > 0) {
                        braceStack.pop();
                    }
                }
                if (token.value === "(") {
                    parenCount++;
                    parenStack.push({position: token.position, line: this.getLineNumber(code, token.position)});
                }
                if (token.value === ")") {
                    parenCount--;
                    if (parenStack.length > 0) {
                        parenStack.pop();
                    }
                }
                if (token.value === "[") {
                    bracketCount++;
                    bracketStack.push({position: token.position, line: this.getLineNumber(code, token.position)});
                }
                if (token.value === "]") {
                    bracketCount--;
                    if (bracketStack.length > 0) {
                        bracketStack.pop();
                    }
                }

                if (braceCount < 0) {
                    errors.push({
                        type: "Syntax Error: Unmatched closing brace }",
                        position: token.position,
                        line: this.getLineNumber(code, token.position),
                        message: `Extra closing brace at line ${this.getLineNumber(code, token.position)}`,
                    });
                    braceCount = 0; // Reset to avoid multiple errors
                }
                if (parenCount < 0) {
                    errors.push({
                        type: "Syntax Error: Unmatched closing parenthesis )",
                        position: token.position,
                        line: this.getLineNumber(code, token.position),
                        message: `Extra closing parenthesis at line ${this.getLineNumber(code, token.position)}`,
                    });
                    parenCount = 0;
                }
                if (bracketCount < 0) {
                    errors.push({
                        type: "Syntax Error: Unmatched closing bracket ]",
                        position: token.position,
                        line: this.getLineNumber(code, token.position),
                        message: `Extra closing bracket at line ${this.getLineNumber(code, token.position)}`,
                    });
                    bracketCount = 0;
                }
            }

            // Check for unclosed brackets at the end
            if (braceCount > 0) {
                braceStack.forEach((item) => {
                    errors.push({
                        type: "Syntax Error: Missing closing brace }",
                        count: braceCount,
                        line: item.line,
                        message: `Opening brace at line ${item.line} is never closed`,
                    });
                });
            }
            if (parenCount > 0) {
                parenStack.forEach((item) => {
                    errors.push({
                        type: "Syntax Error: Missing closing parenthesis )",
                        count: parenCount,
                        line: item.line,
                        message: `Opening parenthesis at line ${item.line} is never closed`,
                    });
                });
            }
            if (bracketCount > 0) {
                bracketStack.forEach((item) => {
                    errors.push({
                        type: "Syntax Error: Missing closing bracket ]",
                        count: bracketCount,
                        line: item.line,
                        message: `Opening bracket at line ${item.line} is never closed`,
                    });
                });
            }
        }

        return errors;
    }

    // Get line number from position
    getLineNumber(code, position) {
        return code.substring(0, position).split("\n").length;
    }

    // Get unique identifiers (variable names, function names)
    getIdentifiers(code, language = "javascript") {
        const tokens = this.tokenize(code, language);
        const identifiers = new Set();

        tokens.forEach((token) => {
            if (token.type === this.TOKEN_TYPES.IDENTIFIER) {
                identifiers.add(token.value);
            }
        });

        return Array.from(identifiers);
    }
}

export default LexicalAnalyzer;
