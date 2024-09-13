const express = require("express");
const router = express.Router();
require("dotenv").config();

const Queue = require("bull");
const executeQueue = new Queue(
  "code-execution",
  process.env.REDIS_URL || "redis://127.0.0.1:6379"
);
const concurrentJobs = 10;

const { executeCode } = require("../controllers/rce-endpoint");

// Add jobs to the queue
router.post("/execute", async (req, res) => {
  const { code, language } = req.body;

  // Add the code execution job to the queue
  const job = await executeQueue.add(
    { code, language },
    {
      attempts: 3,
      backoff: 5000,
      timeout: 60000,
      // TODO: remove on success and failure functionality
    }
  );

  res.status(200).json({ jobId: job.id, status: "queued" });
});

executeQueue.process(concurrentJobs, executeCode);

executeQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed with result ${result}`);
});

executeQueue.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed with error ${err.message}`);
});

router.get("/job-status/:jobId", async (req, res) => {
  const { jobId } = req.params;

  try {
    // Retrieve the job using its ID
    const job = await executeQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const jobState = await job.getState();
    if (jobState === "completed") {
      const result = await job.finished();
      return res.status(200).json({ status: "completed", result });
    } else if (jobState === "failed") {
      const failedReason = job.failedReason;
      return res.status(200).json({ status: "failed", error: failedReason });
    }

    return res.status(200).json({ status: jobState }); // For other states like 'waiting', 'active'
  } catch (error) {
    res.status(500).json({ error: "Error checking job status" });
  }
});

module.exports = router;
