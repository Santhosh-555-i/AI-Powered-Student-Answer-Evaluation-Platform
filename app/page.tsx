"use client";

import { useState } from "react";
import FileInput from "../components/FileInput";

interface Result {
  question: string;
  correctAnswer: string;
  studentAnswer: string;
  score: number;
  gradeText: string;
}

export default function Home() {
  const [questionPaper, setQuestionPaper] = useState("");
  const [studyMaterial, setStudyMaterial] = useState("");
  const [studentAnswers, setStudentAnswers] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [answerKeyLink, setAnswerKeyLink] = useState<string>("");
  const [correctedLink, setCorrectedLink] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const grade = async () => {
    setError("");
    
    // Validate inputs
    if (!questionPaper.trim()) {
      setError("Please enter the question paper");
      return;
    }
    if (!studyMaterial.trim()) {
      setError("Please enter the study material");
      return;
    }
    if (!studentAnswers.trim()) {
      setError("Please enter the student answers");
      return;
    }
    
    setLoading(true);
    setResults([]);
    setTotalScore(null);
    setAnswerKeyLink("");
    setCorrectedLink("");

    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionPaper, studyMaterial, studentAnswers }),
      });
      
      const data = await res.json();
      
      if (!res.ok || data.error) {
        setError(data.error || `Error: ${res.status}`);
      } else {
        setResults(data.results);
        setTotalScore(data.totalScore);
        // generate download links
        const keyBlob = new Blob([data.answerKey.join("\n\n")], { type: "text/plain" });
        setAnswerKeyLink(URL.createObjectURL(keyBlob));
        const corBlob = new Blob([data.correctedSheet], { type: "text/plain" });
        setCorrectedLink(URL.createObjectURL(corBlob));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <h1 className="text-2xl font-bold mb-4">AI-assisted Grading</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <FileInput
          label="Question Paper"
          value={questionPaper}
          onChange={setQuestionPaper}
        />
        <FileInput
          label="Study Material"
          value={studyMaterial}
          onChange={setStudyMaterial}
        />
        <FileInput
          label="Student Answers"
          value={studentAnswers}
          onChange={setStudentAnswers}
        />
        <button
          onClick={grade}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Grading..." : "Grade Paper"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Results</h2>
          <table className="w-full text-left border">
            <thead>
              <tr>
                <th className="border px-2">#</th>
                <th className="border px-2">Question</th>
                <th className="border px-2">Student Answer</th>
                <th className="border px-2">Score</th>
                <th className="border px-2">Comment</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx} className="align-top">
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">{r.question}</td>
                  <td className="border px-2 py-1">{r.studentAnswer}</td>
                  <td className="border px-2 py-1">{r.score.toFixed(2)}</td>
                  <td className="border px-2 py-1">{r.gradeText}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 font-bold">Total Score: {totalScore}</p>
          <div className="mt-4 space-x-4">
            {answerKeyLink && (
              <a
                href={answerKeyLink}
                download="answer_key.txt"
                className="text-blue-600 underline"
              >
                Download Answer Key
              </a>
            )}
            {correctedLink && (
              <a
                href={correctedLink}
                download="corrected_sheet.txt"
                className="text-blue-600 underline"
              >
                Download Corrected Sheet
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
