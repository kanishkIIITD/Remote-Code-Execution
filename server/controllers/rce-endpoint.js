const { executeCodeInDocker } = require("../docker/executeCodeInDocker");
const validateCodeSyntax = require("../utils/validateCodeSyntax");
const MAX_CODE_SIZE = 10000; // Set a limit (e.g., 10,000 characters)

exports.executeCode = async (job, done) => {
  const { code, language } = job.data;

  if (!code || code.trim() === "") {
    done(new Error("Code is required"));
  }

  if (code.length > MAX_CODE_SIZE) {
    done(
      new Error(`Code exceeds the maximum size of ${MAX_CODE_SIZE} characters.`)
    );
  }

  const validationError = validateCodeSyntax(code, language);
  if (validationError.isValid !== true) {
    console.log("Syntax error:", validationError);
    return done(new Error(`Syntax error: ${validationError.message}`));
  } else {
    console.log("Code is valid");
  }

  try {
    // const result = await executeCodeInDocker(code, language);
    const result = await Promise.race([
      executeCodeInDocker(code, language),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Code execution timeout")), 60000)
      ), // 60 seconds timeout
    ]);
    done(null, result);
  } catch (error) {
    console.log("Error during code execution:", error);

    done(new Error(`Error during code execution: ${error.message}`));
  }
};
