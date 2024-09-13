const esprima = require("esprima");
const { spawnSync } = require("child_process");
const fs = require("fs");

const validators = {
  javascript: (code) => {
    try {
      esprima.parseScript(code);
      return { isValid: true };
    } catch (e) {
      return { isValid: false, message: e.message };
    }
  },
  // python: (code) => {
  //   const result = spawnSync(
  //     "python3",
  //     ["-c", `import ast; ast.parse('''${code}''')`],
  //     { encoding: "utf-8" }
  //   );
  //   if (result.status !== 0) {
  //     return { isValid: false, message: result.stderr.trim() };
  //   }
  //   return { isValid: true };
  // },
  // cpp: (code) => {
  //   const result = spawnSync("g++", ["-x", "c++", "-", "-fsyntax-only"], {
  //     input: code,
  //     encoding: "utf-8",
  //   });
  //   if (result.status !== 0) {
  //     return { isValid: false, message: result.stderr.trim() };
  //   }
  //   return { isValid: true };
  // },
  // java: (code) => {
  //   const tempFilePath = "/tmp/Main.java";
  //   fs.writeFileSync(tempFilePath, code);

  //   const result = spawnSync("javac", [tempFilePath], { encoding: "utf-8" });
  //   if (result.status !== 0) {
  //     return { isValid: false, message: result.stderr.trim() };
  //   }
  //   return { isValid: true };
  // },
};

const validateCodeSyntax = (code, language) => {
  const validator = validators[language];
  if (validator) {
    return validator(code);
  }
  return { isValid: true }; // If no validator, assume valid
};

module.exports = validateCodeSyntax;
