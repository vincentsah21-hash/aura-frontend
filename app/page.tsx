"use client";

import { useState } from "react";

export default function Home() {
  // API CONFIG (Render backend)
  const API =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://aura-backend-ftvs.onrender.com";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const [cv, setCv] = useState("");
  const [job, setJob] = useState("");
  const [result, setResult] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  // ---------------- LOGIN ----------------
  const login = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Login failed");

      setToken(data.access_token);
      localStorage.setItem("token", data.access_token);
      alert("Login successful");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- REGISTER ----------------
  const register = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Registration failed");

      alert("User created successfully. Now login.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPLOAD CV ----------------
  const uploadCV = async () => {
    if (!file) return alert("Please select a CV file");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/upload-cv`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Upload failed");

      setCv(data.cv_text);
      alert("CV uploaded successfully");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ANALYZE ----------------
  const analyzeCV = async () => {
    if (!token) return alert("Please login first");

    setLoading(true);

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

      if (!res.ok) throw new Error("Analysis failed");

      setResult(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- HISTORY ----------------
  const getHistory = async () => {
    if (!token) return alert("Login first");

    try {
      const res = await fetch(`${API}/history`, {
        headers: { token },
      });

      const data = await res.json();
      console.log("History:", data);
      alert("History loaded in console");
    } catch {
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
          className="block mt-2 p-2 text-black w-full"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          className="block mt-2 p-2 text-black w-full"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={login}
            disabled={loading}
            className="bg-green-500 px-4 py-2 rounded"
          >
            Login
          </button>

          <button
            onClick={register}
            disabled={loading}
            className="bg-blue-500 px-4 py-2 rounded"
          >
            Register
          </button>
        </div>

        {token && <p className="text-green-400 mt-2">Logged in ✔</p>}
      </div>

      {/* UPLOAD */}
      <div className="bg-white/10 p-4 rounded-xl mb-4">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

        <button
          onClick={uploadCV}
          disabled={loading}
          className="bg-purple-500 px-4 py-2 ml-2 rounded"
        >
          Upload CV
        </button>
      </div>

      {/* INPUTS */}
      <textarea
        className="w-full h-32 p-2 text-black"
        placeholder="CV text"
        value={cv}
        onChange={(e) => setCv(e.target.value)}
      />

      <textarea
        className="w-full h-32 p-2 text-black mt-2"
        placeholder="Job description"
        onChange={(e) => setJob(e.target.value)}
      />

      {/* ACTIONS */}
      <button
        onClick={analyzeCV}
        disabled={loading}
        className="bg-red-500 px-4 py-2 mt-2 rounded"
      >
        Analyze CV
      </button>

      <button
        onClick={getHistory}
        className="bg-yellow-500 px-4 py-2 mt-2 ml-2 rounded"
      >
        View History
      </button>

      {/* RESULT */}
      {result && (
        <div className="mt-6 bg-white/10 p-4 rounded-xl">
          <h2 className="text-xl font-bold">AI Result</h2>

          <p>Match Score: {result.match_score}</p>
          <p>Missing Skills: {result.missing_skills?.join(", ")}</p>

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