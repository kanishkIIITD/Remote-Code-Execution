const { executeCodeInDocker } = require("../docker/executeCodeInDocker");
const MAX_CODE_SIZE = 10000; // Set a limit (e.g., 10,000 characters)

exports.executeCode = async (job, done) => {
  const { code, language } = job.data;

  // TODO: for now, assume only javascript is supported
  if (language !== "javascript") {
    // return res.status(400).json({ message: "Only javascript is supported" });
    done(new Error("Only javascript is supported"));
  }

  if (!code || code.trim() === "") {
    // return res.status(400).json({ message: "Code is required" });
    done(new Error("Code is required"));
  }

  if (code.length > MAX_CODE_SIZE) {
    // return res.status(400).json({
    //   error: `Code exceeds the maximum size of ${MAX_CODE_SIZE} characters.`,
    // });
    done(
      new Error(`Code exceeds the maximum size of ${MAX_CODE_SIZE} characters.`)
    );
  }

  // TODO: validate code format, we can use this using simple syntax check. For javascript we can use esprima. After adding more languages, find a way to generalize this

  try {
    const resutlt = await executeCodeInDocker(code);
    // res.json(resutlt);
    done(null, resutlt);
  } catch (error) {
    console.log("Error during code execution:", error);
    // return res.status(500).json({ message: "Error during code execution" });
    done(new Error("Error during code execution"));
  }
};
