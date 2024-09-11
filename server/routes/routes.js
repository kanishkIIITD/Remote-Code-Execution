const express = require("express");
const router = express.Router();

const Queue = require("bull");
const executeQueue = new Queue("code-execution", "redis://127.0.0.1:6379");
// const concurrentJobs = 5;

const { executeCode } = require("../controllers/rce-endpoint");

// router.post("/execute", executeCode);
// Add jobs to the queue
router.post("/execute", async (req, res) => {
  const { code, language } = req.body;

  // Add the code execution job to the queue
  const job = await executeQueue.add({ code, language });

  res.status(200).json({ jobId: job.id, status: "queued" });
});

executeQueue.process(executeCode);

router.get("/job-status/:jobId", async (req, res) => {
  const { jobId } = req.params;

  try {
    // Retrieve the job using its ID
    const job = await executeQueue.getJob(jobId);
    // console.log(job);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const jobStatus = job
      .finished() // Returns a promise that resolves when the job is completed
      .then((result) => {
        return res.status(200).json({ status: "completed", result });
      })
      .catch((error) => {
        return res.status(200).json({ status: "failed", error: error.message });
      });

    if (jobStatus) {
      return; // Do nothing, response has already been sent
    }

    // If the job is still in progress, return the current status
    res.status(200).json({ status: job.getState() }); // e.g., 'waiting', 'active'
  } catch (error) {
    res.status(500).json({ error: "Error checking job status" });
  }
});

module.exports = router;
