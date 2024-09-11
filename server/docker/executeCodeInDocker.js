const Docker = require("dockerode");
const { logExecution } = require("./logExecution");
const docker = new Docker();
// const path = require("path");
// const seccompProfilePath = path.resolve(__dirname, "security", "seccomp.json");

const executeCodeInDocker = async (code) => {
  const timeout = 5000; // 5 seconds limit
  // console.log(seccompProfilePath);
  try {
    // create a docker container that runs node.js
    const container = await docker.createContainer({
      Image: "node:14", // Use Node.js 14 Docker image
      Cmd: ["node", "-e", code], // Execute the JavaScript code
      Tty: false,
      HostConfig: {
        //AutoRemove: true, // Automatically remove the container after execution
        Memory: 512 * 1024 * 1024, // 512MB memory limit
        CpuShares: 512, // CPU limit
        // SecurityOpt: [`seccomp=${seccompProfilePath}`], // Set seccomp profile
        // SecurityOpt: ["apparmor=rce-apparmor-profile"], // Attach the AppArmor profile
      },
    });

    // start the container
    await container.start();

    // capture the output of the container
    const outputPromise = await containerLogs(container);

    // Timeout logic to stop containers running too long
    let timeoutHandle;
    try {
      timeoutHandle = setTimeout(async () => {
        try {
          const updatedInfo = await container.inspect();
          if (updatedInfo.State.Running) {
            await container.stop(); // Stop the container after the timeout
          }
        } catch (stopError) {
          if (stopError.statusCode === 404) {
            console.log("Container not found at stop attempt.");
          } else {
            console.error("Error stopping container:", stopError);
          }
        }
      }, timeout);
    } catch (inspectError) {
      if (inspectError.statusCode === 404) {
        console.log("Container not found at inspect attempt.");
      } else {
        console.error("Error inspecting container:", inspectError);
      }
    }

    // Wait for the output and cleanup
    const output = await outputPromise;

    // Clear the timeout if the container has stopped before timeout
    clearTimeout(timeoutHandle);

    // remove the container
    await container.remove();

    await logExecution(code, output);

    return output;
  } catch (error) {
    console.error("Execution error:", error);
    throw new Error("Execution failed");
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
