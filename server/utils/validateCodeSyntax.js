const esprima = require("esprima");
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const validators = {
  javascript: (code) => {
    try {
      esprima.parseScript(code);
      return { isValid: true };
    } catch (e) {
      return { isValid: false, message: e.message };
    }
  },
  python: (code) => {
    // Try both 'python3' and 'python' for compatibility
    let result = spawnSync(
      process.platform === "win32" ? "python" : "python3",
      ["-c", `import ast; ast.parse('''${code.replace(/'/g, "\\'")}''')`],
      { encoding: "utf-8" }
    );
    if (result.status !== 0) {
      return { isValid: false, message: result.stderr.trim() };
    }
    return { isValid: true };
  },
  cpp: (code) => {
    const result = spawnSync("g++", ["-x", "c++", "-", "-fsyntax-only"], {
      input: code,
      encoding: "utf-8",
    });
    if (result.status !== 0) {
      return { isValid: false, message: result.stderr.trim() };
    }
    return { isValid: true };
  },
  java: (code) => {
    // Use a temp file for Java code
    const tempFilePath = path.join(os.tmpdir(), "Main.java");
    try {
      fs.writeFileSync(tempFilePath, code);
      const result = spawnSync("javac", [tempFilePath], { encoding: "utf-8" });
      if (result.status !== 0) {
        return { isValid: false, message: result.stderr.trim() };
      }
      return { isValid: true };
    } catch (e) {
      return { isValid: false, message: e.message };
    } finally {
      try { fs.unlinkSync(tempFilePath); } catch {}
    }
  },
};

const validateCodeSyntax = (code, language) => {
  const validator = validators[language];
  if (validator) {
    return validator(code);
  }
  return { isValid: true }; // If no validator, assume valid
};

module.exports = validateCodeSyntax;
