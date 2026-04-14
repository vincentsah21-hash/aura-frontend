"use client";

import { useState } from "react";

export default function Home() {

  // ✅ FIX: production-safe API config
  const API =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://aura-backend-ftvs.onrender.com";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string>("");

  const [cv, setCv] = useState("");
  const [job, setJob] = useState("");
  const [result, setResult] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  // ---------------- LOGIN ----------------
  const login = async () => {
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        setToken(data.access_token);
        localStorage.setItem("token", data.access_token);
        alert("Login successful");
      } else {
        alert(data.detail || "Login failed");
      }
    } catch (err) {
      alert("Network error during login");
    }
  };

  // ---------------- REGISTER ----------------
  const register = async () => {
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("User created. Now login.");
      } else {
        alert(data.detail || "Registration failed");
      }
    } catch (err) {
      alert("Network error during registration");
    }
  };

  // ---------------- UPLOAD CV ----------------
  const uploadCV = async () => {
    if (!file) {
      alert("Please select a CV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/upload-cv`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.cv_text) {
        setCv(data.cv_text);
        alert("CV uploaded successfully");
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      alert("Upload error");
    }
  };

  // ---------------- ANALYZE CV ----------------
  const analyzeCV = async () => {
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const res = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          cv_text: cv,
          job_description: job,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Analysis failed");
    }
  };

  // ---------------- HISTORY ----------------
  const getHistory = async () => {
    if (!token) {
      alert("Login first");
      return;
    }

    try {
      const res = await fetch(`${API}/history`, {
        headers: {
          token: token,
        },
      });

      const data = await res.json();
      console.log("History:", data);
      alert("History printed in console");
    } catch (err) {
      alert("Failed to load history");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* LOGIN SECTION */}
      <div className="bg-white/10 p-4 rounded-xl mb-6">
        <h2 className="text-xl font-bold">Login / Register</h2>

        <input
          placeholder="Email"
          className="block mt-2 p-2 text-black"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          className="block mt-2 p-2 text-black"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={login}
            className="bg-green-500 px-4 py-2 rounded cursor-pointer"
          >
            Login
          </button>

          <button
            onClick={register}
            className="bg-blue-500 px-4 py-2 rounded cursor-pointer"
          >
            Register
          </button>
        </div>

        {token && (
          <p className="text-green-400 mt-2">Logged in ✔</p>
        )}
      </div>

      {/* CV UPLOAD */}
      <div className="bg-white/10 p-4 rounded-xl mb-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={uploadCV}
          className="bg-purple-500 px-4 py-2 ml-2 rounded"
        >
          Upload CV
        </button>
      </div>

      {/* CV TEXT */}
      <textarea
        className="w-full h-32 p-2 text-black"
        placeholder="CV text"
        value={cv}
        onChange={(e) => setCv(e.target.value)}
      />

      {/* JOB DESCRIPTION */}
      <textarea
        className="w-full h-32 p-2 text-black mt-2"
        placeholder="Job description"
        onChange={(e) => setJob(e.target.value)}
      />

      {/* ANALYZE BUTTON */}
      <button
        onClick={analyzeCV}
        className="bg-red-500 px-4 py-2 mt-2 rounded"
      >
        Analyze CV
      </button>

      {/* HISTORY BUTTON */}
      <button
        onClick={getHistory}
        className="bg-yellow-500 px-4 py-2 mt-2 ml-2 rounded"
      >
        View History
      </button>

      {/* RESULTS */}
      {result && (
        <div className="mt-6 bg-white/10 p-4 rounded-xl">
          <h2 className="text-xl font-bold">AI Result</h2>

          <p>Match Score: {result.match_score}</p>

          <p>
            Missing Skills: {result.missing_skills?.join(", ")}
          </p>

          <p>Suggestions:</p>

          <ul className="list-disc ml-6">
            {result.suggestions?.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}