import React, { useCallback, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios"; // For making API calls

import defaultCodes from "../utils/defaultCode.json";

const Home = () => {
  const [language, setLanguage] = useState("cpp"); // Default language
  const [code, setCode] = useState(""); // Code from editor
  const [output, setOutput] = useState(""); // Store output from API
  const [jobId, setJobId] = useState(null);

  const [leftWidth, setLeftWidth] = useState(window.innerWidth / 2); // Initial left pane width
  const [isDragging, setIsDragging] = useState(false); // Track dragging state

  const baseUrl = process.env.REACT_APP_BASE_URL;

  const [codeSnippet, setCodeSnippet] = useState(defaultCodes[language]);
  const [showEditor, setShowEditor] = useState(true); // Control when to show the editor

  useEffect(() => {
    // Update the code snippet when the language changes
    setCodeSnippet(defaultCodes[language]);
    setCode(defaultCodes[language]); // Update the editor content
  }, [language]);

  const handleMouseDown = (e) => {
    e.preventDefault(); // Prevent default behavior
    setIsDragging(true);
  };

  useEffect(() => {
    // Mouse event listeners for resizing
    const handleMouseMove = (e) => {
      if (isDragging) {
        // const newLeftWidth = e.clientX; // Set left pane width to the current mouse position
        // setLeftWidth(newLeftWidth);
        const newLeftWidth =
          e.clientX -
          document.querySelector(".flex").getBoundingClientRect().left;
        if (newLeftWidth > 300 && newLeftWidth < window.innerWidth - 300) {
          // Set boundaries
          setLeftWidth(newLeftWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleLanguageChange = useCallback((e) => {
    setLanguage(e.target.value);
    setCodeSnippet(defaultCodes[e.target.value]);
    // Unmount the editor briefly to ensure proper remount
    setShowEditor(false);
    setTimeout(() => {
      setShowEditor(true);
    }, 100); // Small delay to ensure clean remount
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
    <div className="flex flex-col items-center h-full gap-4">
      <h1 className="text-3xl font-bold">Remote Code Execution</h1>
      <div className="flex gap-2 items-center">
        {/* <label htmlFor="language-select" className="text-xl font-semibold">
          Select Language:
        </label> */}
        <select
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
          className="border-2 border-black rounded-lg p-1 cursor-pointer"
        >
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="python 3">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
        <button
          onClick={handleSubmit}
          disabled={!code.trim()}
          className="border-2 border-black h-fit rounded-lg p-1 cursor-pointer"
        >
          Submit
        </button>
      </div>

      <div className="flex h-fit w-full p-10 bg-[#0F0F0F]">
        <div className="h-full " style={{ width: leftWidth }}>
          {showEditor && (
            <Editor
              height="70vh"
              width={"100%"}
              language={language}
              value={code}
              id="editor"
              name="editor"
              theme="vs-dark"
              onChange={handleEditorChange}
            />
          )}
        </div>

        {/* divider */}
        <div
          onMouseDown={handleMouseDown}
          className="w-2 h-[70vh] bg-[#0F0F0F] cursor-col-resize hover:bg-[#191919] flex flex-col items-center justify-center gap-1"
        >
          <div className="flex gap-[2px]">
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
          </div>
          <div className="flex gap-[2px]">
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
          </div>
          <div className="flex gap-[2px]">
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
          </div>
          <div className="flex gap-[2px]">
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
          </div>
          <div className="flex gap-[2px]">
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
          </div>
          <div className="flex gap-[2px]">
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
          </div>
          <div className="flex gap-[2px]">
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
            <div className="bg-white h-[2px] w-[2px] rounded-full"></div>
          </div>
        </div>

        <div
          className="h-[70vh] overflow-auto  gap-3 p-5 bg-[#1E1E1E] relative"
          style={{ width: `calc(100% - ${leftWidth}px)` }}
        >
          <h2 className="text-xl font-semibold absolute top-0 left-5 text-white bg-[#111111] px-2 pb-1 rounded-lg rounded-t-none">
            Output
          </h2>

          <pre className="mt-5 text-[#8F949F]">
            {output || "Your Output Will Be Displayed Here ..."}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Home;
