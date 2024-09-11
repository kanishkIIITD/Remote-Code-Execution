import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios"; // For making API calls

const Home = () => {
  const [language, setLanguage] = useState("javascript"); // Default language
  const [code, setCode] = useState(""); // Code from editor
  const [output, setOutput] = useState(""); // Store output from API
  const [jobId, setJobId] = useState(null);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleEditorChange = (newValue) => {
    setCode(newValue);
    // console.log("Code changed:", code);
  };

  const handleSubmit = async () => {
    try {
      const baseUrl = process.env.REACT_APP_BASE_URL;
      const response = await axios.post(`${baseUrl}/execute`, {
        code,
        language,
      });

      // console.log(response);

      if (response.data.jobId) {
        setJobId(response.data.jobId); // Store the jobId to poll later
        setOutput("Job submitted, waiting for result...");
        pollJobStatus(jobId); // Start polling for status
      } else {
        setOutput("Error: No job ID returned");
      }

      // setOutput(response.data.stdout || response.data.stderr); //for the time being we are just displaying the stdout
      // setOutput(response.data);
    } catch (error) {
      setOutput("Error during execution");
      console.error(error);
    }
  };

  const pollJobStatus = async (jobId) => {
    const intervalId = setInterval(async () => {
      try {
        const baseUrl = process.env.REACT_APP_BASE_URL;
        const response = await axios.get(`${baseUrl}/job-status/${jobId}`);
        // console.log(response);

        if (response.data.status === "completed") {
          setOutput(response.data.result); // Display the result once job is done
          clearInterval(intervalId); // Stop polling
        } else if (response.data.status === "failed") {
          setOutput("Job failed");
          clearInterval(intervalId); // Stop polling
        } else {
          setOutput(`Job is ${response.data.status}...`); // Update job status
        }
      } catch (error) {
        setOutput("Error checking job status");
        clearInterval(intervalId); // Stop polling on error
        console.error(error);
      }
    }, 500); // Poll every 0.5 seconds
  };

  return (
    <div>
      <h1>Remote Code Execution</h1>
      <label htmlFor="language-select">Select Language:</label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
      >
        <option value="javascript">JavaScript</option>
        {/* Add more language options as needed */}
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
      </select>

      <Editor
        height="50vh"
        defaultLanguage="javascript"
        language={language}
        defaultValue="// some comment "
        value={code}
        id="editor"
        name="editor"
        theme="vs-dark"
        onChange={handleEditorChange}
      />

      <button onClick={handleSubmit}>Submit</button>

      <h2>Output:</h2>
      {/* <h2>Job Status:</h2> */}
      {/* {jobId && <p>Job ID: {jobId}</p>} */}
      <pre>{output}</pre>
    </div>
  );
};

export default Home;
