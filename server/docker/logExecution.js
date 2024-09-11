const logExecution = async (code, output) => {
  const executionLog = {
    code,
    output,
    timestamp: new Date(),
  };
  // Save the log to your database (e.g., MongoDB)
  // await db.collection('executions').insertOne(executionLog);
  console.log("Execution logged:", executionLog);
};

module.exports = { logExecution };
