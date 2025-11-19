# How to Test the Lexical Analysis Algorithm

## Step-by-Step Testing Guide

### 1. **Access Your Application**
   - Frontend: http://localhost:5173 (or 5174)
   - Backend: http://localhost:3000

### 2. **Login and Open a Project**
   - Login to your account
   - Open any existing project or create a new one
   - You'll see the code editor

### 3. **Test the Lexical Analyzer**

#### **Option A: Using the UI (Easiest)**
1. Write some code in the editor (HTML, CSS, or JavaScript)
2. Look for the **green code icon** (📊) in the toolbar (top right)
3. Click it to open the Code Analysis panel
4. Explore the 4 tabs:
   - **Statistics** - See token counts
   - **Tokens** - View all tokens with types
   - **Syntax Errors** - Check for errors
   - **Identifiers** - See all variable names

#### **Option B: Using Browser Console**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Test the tokenizer directly:

```javascript
// Import the analyzer (run this in console)
import('./utils/lexicalAnalyzer.js').then(module => {
    const LexicalAnalyzer = module.LexicalAnalyzer;
    const analyzer = new LexicalAnalyzer();
    
    // Test 1: JavaScript tokenization
    const jsCode = 'const x = 5 + 3;';
    const tokens = analyzer.tokenize(jsCode, 'javascript');
    console.log('Tokens:', tokens);
    
    // Test 2: Get statistics
    const stats = analyzer.analyzeCode(jsCode, 'javascript');
    console.log('Statistics:', stats);
    
    // Test 3: Find errors
    const badCode = 'if (x > 5 { console.log("missing paren"); }';
    const errors = analyzer.findSyntaxErrors(badCode, 'javascript');
    console.log('Errors:', errors);
});
```

### 4. **Test Cases**

#### **Test Case 1: JavaScript Keywords**
```javascript
const sum = 10;
let result = sum + 20;
function hello() {
    return "world";
}
```
**Expected**: Keywords: const, let, function, return

---

#### **Test Case 2: Operators**
```javascript
let a = 5 + 3;
let b = a * 2;
let c = (a === 5) ? true : false;
```
**Expected**: Operators: =, +, *, ===, ?

---

#### **Test Case 3: Syntax Errors**
```javascript
if (x > 5 {
    console.log("missing paren");
}
```
**Expected**: Error: "Unmatched parentheses"

---

#### **Test Case 4: HTML Tokenization**
```html
<div class="container">
    <h1>Hello World</h1>
    <p>This is a paragraph</p>
</div>
```
**Expected**: HTML_TAG tokens for div, h1, p

---

#### **Test Case 5: CSS Tokenization**
```css
body {
    background-color: #f4f4f4;
    font-size: 16px;
    margin: 0;
}
```
**Expected**: CSS_PROPERTY tokens for background-color, font-size, margin

---

### 5. **What to Look For**

✅ **Correct Token Types:**
- KEYWORD: if, while, const, let, function
- IDENTIFIER: variable names, function names
- OPERATOR: +, -, *, /, ==, ===
- NUMBER: 123, 45.6
- STRING: "hello", 'world'
- COMMENT: // comment, /* comment */
- PUNCTUATION: {, }, (, ), [, ]

✅ **Statistics Should Show:**
- Total tokens count
- Keywords count
- Identifiers count
- Numbers count
- Lines count
- Characters count

✅ **Error Detection Should Find:**
- Unmatched braces: { }
- Unmatched parentheses: ( )
- Unmatched brackets: [ ]

---

### 6. **Quick Visual Test**

**Step 1:** Write this in JavaScript tab:
```javascript
const x = 5;
let y = x + 10;
console.log(y);
```

**Step 2:** Click the green Code Analysis icon

**Step 3:** You should see:
- **Statistics Tab**: 
  - Total Tokens: ~20
  - Keywords: 2 (const, let)
  - Identifiers: 4 (x, y, console, log)
  - Operators: 2 (+, =)
  - Numbers: 2 (5, 10)

---

### 7. **Advanced Testing**

Test complex code to see the tokenizer in action:

```javascript
// Complex example
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
    }
}

const users = ["Alice", "Bob", "Charlie"];
users.forEach(user => console.log(user));
```

This should produce:
- Keywords: async, function, try, const, await, catch, return
- Identifiers: fetchData, url, response, data, error, users, user
- Comments: 1
- Strings: 3 ("Error:", "Alice", "Bob", "Charlie")

---

### 8. **Verify Algorithm is Working**

The algorithm is working correctly if:
- ✅ Different token types are color-coded
- ✅ Token counts match your code
- ✅ Syntax errors are detected (try missing braces)
- ✅ All identifiers are listed
- ✅ Comments are recognized
- ✅ Strings are properly captured

---

## Troubleshooting

**If Code Analysis button doesn't appear:**
- Clear browser cache and refresh
- Check if FaCode icon is imported
- Verify showCodeAnalysis state exists

**If panel doesn't open:**
- Check browser console for errors
- Verify CodeAnalysis.jsx is in components folder
- Verify lexicalAnalyzer.js is in utils folder

**If tokens seem wrong:**
- The tokenizer is basic - it won't catch all edge cases
- It's designed for learning and demonstration
- For production, use specialized parsers like Babel, ESLint

---

## Screenshots to Look For

When you click the Code Analysis button, you should see a modal with:
1. **Header**: "Code Analysis - Lexical Tokenizer"
2. **4 Tabs**: Statistics, Tokens, Syntax Errors, Identifiers
3. **Color-coded tokens** in the Tokens tab
4. **Charts and counts** in the Statistics tab

---

## Next Steps

After verifying the algorithm works:
1. Try different types of code
2. Test with intentional syntax errors
3. Compare HTML, CSS, and JavaScript tokenization
4. See how it handles edge cases

**The lexical analyzer is a fundamental algorithm used in:**
- Compilers
- Code editors
- Syntax highlighters
- Linters
- Code formatters
