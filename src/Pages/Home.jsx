import React, { useCallback, useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios"; // For making API calls

const Home = () => {
  const [language, setLanguage] = useState("javascript"); // Default language
  const [code, setCode] = useState(""); // Code from editor
  const [output, setOutput] = useState(""); // Store output from API
  const [jobId, setJobId] = useState(null);

  const baseUrl = process.env.REACT_APP_BASE_URL;

  const handleLanguageChange = useCallback((e) => {
    setLanguage(e.target.value);
  }, []);

  const handleEditorChange = useCallback((newValue) => {
    setCode(newValue);
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${baseUrl}/execute`, {
        code,
        language,
      });

      if (response.data.jobId) {
        const newJobId = response.data.jobId;
        setJobId(newJobId); // Store the jobId to poll later
        setOutput("Job submitted, waiting for result...");
        pollJobStatus(newJobId); // Start polling for status
      } else {
        setOutput("Error: No job ID returned");
      }
    } catch (error) {
      setOutput("Error during execution");
      console.error(error);
    }
  };

  const pollJobStatus = async (jobId) => {
    let isPolling = true;
    const intervalId = setInterval(async () => {
      if (!isPolling) return; // Stop polling if not needed
      isPolling = false;
      try {
        const response = await axios.get(`${baseUrl}/job-status/${jobId}`);

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
      isPolling = true;
    }, 1000); // Poll every 1 seconds
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
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
        {/* <option value="ruby">ruby</option> */}
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

      <button onClick={handleSubmit} disabled={!code.trim()}>
        Submit
      </button>

      <h2>Output:</h2>

      <pre>{output}</pre>
    </div>
  );
};

export default Home;
