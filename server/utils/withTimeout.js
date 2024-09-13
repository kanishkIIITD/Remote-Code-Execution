const withTimeout = (promise, timeout, container) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(async () => {
      try {
        await container.stop();
        reject(new Error("Code execution timed out"));
      } catch (err) {
        reject(new Error("Failed to stop container after timeout"));
      }
    }, timeout);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
};

module.exports = withTimeout;
