// Utility function to create a temporary file for languages like Go
const createTempFile = async (code, language) => {
  const fs = require("fs").promises;
  const os = require("os");
  const path = require("path");
  const ext = language === "go" ? "go" : language;
  const fileName = path.join(os.tmpdir(), `code.${ext}`);
  await fs.writeFile(fileName, code);
  return fileName;
};

module.exports = createTempFile;
