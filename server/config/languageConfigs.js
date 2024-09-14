// Define the mappings for supported languages
const LANGUAGE_CONFIGS = {
  javascript: {
    image: "node:14",
    cmd: (code) => ["node", "-e", code], // Command to execute Node.js code
  },
  python: {
    image: "python:3.9",
    cmd: (code) => ["python", "-c", code], // Command to execute Python code
  },

  java: {
    // image: "openjdk:17-jre-slim", //"openjdk:11-jre-slim", // or
    image: "openjdk:latest", // Using the OpenJDK Docker image
    cmd: (fileName, className) => [
      "sh",
      "-c",
      `javac ${fileName} && java -cp /tmp ${className}`,
    ], // Compile and run Java
    needsFile: true,
    getFileName: () => "/tmp/Main.java", // Save code as Main.java
    getClassName: () => "Main", // Java class name to execute
  },

  cpp: {
    image: "gcc:11", // or "gcc:10"
    // image: "gcc:latest", // Using the GCC image which includes g++
    cmd: (fileName) => [
      "sh",
      "-c",
      `g++ -O3 ${fileName} -o /tmp/a.out && /tmp/a.out`,
    ], // Compile and execute C++
    needsFile: true, // C++ needs the code to be saved as a file before compilation
  },
};

module.exports = LANGUAGE_CONFIGS;
