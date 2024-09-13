const Docker = require("dockerode");
const { logExecution } = require("./logExecution");
const LANGUAGE_CONFIGS = require("../config/languageConfigs");
const createTempFile = require("../utils/createTempFile");
const ensureImageExists = require("../utils/ensureImageExists");
const withTimeout = require("../utils/withTimeout");
const docker = new Docker();
// const path = require("path");
// const seccompProfilePath = path.resolve(__dirname, "security", "seccomp.json");

const executeCodeInDocker = async (code, language) => {
  const timeout = 5000; // 5 seconds limit
  // console.log(seccompProfilePath);

  if (!LANGUAGE_CONFIGS[language]) {
    throw new Error(`Language ${language} is not supported.`);
  }

  const { image, cmd, needsFile, getFileName, getClassName } =
    LANGUAGE_CONFIGS[language];

  try {
    await ensureImageExists(docker, image);

    let container;

    if (needsFile) {
      // Special handling if the language requires a code file (e.g., Java)
      const fileName =
        language === "java" ? getFileName() : `/tmp/code.${language}`;
      // const fileName = `/tmp/code.${language}`;
      // const fileName = getFileName();
      const className = language === "java" ? getClassName() : "";
      const codeFile = await createTempFile(code, language);

      // Create the Docker container with the code mounted as a file
      container = await docker.createContainer({
        Image: image,
        Cmd: cmd(fileName, className),
        Tty: false,
        HostConfig: {
          Memory: 512 * 1024 * 1024, // 512MB memory limit
          CpuShares: 512, // CPU limit
          Binds: [`${codeFile}:${fileName}`], // Bind the temp file into the container
        },
      });
    } else {
      // Create a Docker container that runs the code without needing a file
      container = await docker.createContainer({
        Image: image,
        Cmd: cmd(code), // Dynamic command based on the language
        Tty: false,
        HostConfig: {
          Memory: 512 * 1024 * 1024, // 512MB memory limit
          CpuShares: 512, // CPU limit
        },
      });
    }

    // start the container
    await container.start();

    // Wait for the output and cleanup
    const output = await withTimeout(
      containerLogs(container),
      timeout,
      container
    );

    // remove the container
    await container.remove();

    await logExecution(code, output);

    return output;
  } catch (error) {
    console.error("Execution error:", error.message, "\nStack:", error.stack);
    throw new Error("Execution failed due to an error.");
  }
};

const containerLogs = async (container) => {
  return new Promise((resolve, reject) => {
    let output = "";
    let metadataLength = 8; // Example length of metadata prefix (adjust as needed)
    container.logs(
      {
        follow: true,
        stdout: true,
        stderr: true,
      },
      (err, stream) => {
        if (err) {
          return reject(err);
        }
        stream.on("data", (data) => {
          let chuckStr = data.toString("utf8");

          if (chuckStr.length > metadataLength) {
            chuckStr = data.slice(metadataLength).toString("utf8");
          }

          chuckStr = chuckStr.replace(/[^\x20-\x7E\n\r]/g, "");

          output += chuckStr;
        });
        stream.on("end", () => {
          resolve(output);
        });
      }
    );
  });
};

module.exports = { executeCodeInDocker };
