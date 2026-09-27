import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// we will create the OpenAI client lazily inside request handler when needed
function makeClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

// naive splitting function
function splitQuestions(text: string) {
  const lines = text.split(/\r?\n/);
  const questions: string[] = [];
  let current = '';
  for (const line of lines) {
    if (/^\d+\.?\s/.test(line)) {
      if (current) questions.push(current.trim());
      current = line;
    } else {
      current += ' ' + line;
    }
  }
  if (current) questions.push(current.trim());
  return questions;
}

export async function POST(request: Request) {
  try {
    const { questionPaper, studyMaterial, studentAnswers } = await request.json();

    const questions = splitQuestions(questionPaper);
    const studentAnsList = splitQuestions(studentAnswers);

    interface SingleResult {
      question: string;
      correctAnswer: string;
      studentAnswer: string;
      score: number;
      gradeText: string;
    }
    const results: SingleResult[] = [];
    let totalScore = 0;

    const openaiClient = makeClient();
    const useAI = Boolean(openaiClient);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const studentAns = studentAnsList[i] || '';

      let correctAnswer = '';
      let gradeText = '';
      let score = 0;

      if (useAI && openaiClient) {
        // generate correct answer using AI
        const answerResp = await openaiClient.responses.create({
          model: 'gpt-4.1-mini',
          input: `You are an expert teacher. Use the study material below to craft a concise correct answer to the question. If the exact answer cannot be found in the material, rely on your general knowledge while still indicating that the material did not contain it.

Study Material:\n${studyMaterial}\n\nQuestion:\n${q}`,
        });
        // openai.responses returns `output_text` which aggregates text content
        correctAnswer = answerResp.output_text ?? '';

        // grade the student's answer
        const gradeResp = await openaiClient.responses.create({
          model: 'gpt-4.1-mini',
          input: `You are an impartial grader. Compare the student's answer to the correct answer and provide a score between 0 and 1 along with a concise justification. Try to be lenient if the student answer is close.

Correct Answer:\n${correctAnswer}\n
Student Answer:\n${studentAns}`,
        });
        gradeText = gradeResp.output_text ?? '';
        // parse score from text
        const scoreMatch = gradeText.match(/([0-1](?:\.\d+)?)/);
        score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
      } else {
        // fallback without AI: simple keyword match
        const keyword = q.match(/\b\w+\b/)?.[0] || '';
        correctAnswer = studyMaterial.includes(keyword) ? `See material: contains ${keyword}` : "(no material)";
        score = studentAns.includes(keyword) ? 1 : 0;
        gradeText = score ? "Contains keyword" : "Missing keyword";
      }

      totalScore += score;

      results.push({
        question: q,
        correctAnswer,
        studentAnswer: studentAns,
        score,
        gradeText,
      });
    }

    const answerKey = results.map((r) => r.correctAnswer);
    const correctedSheet = results
      .map((r, idx) => `Q${idx + 1}: ${r.studentAnswer}\nScore: ${r.score}\nComment: ${r.gradeText}\n`)
      .join('\n');

    return NextResponse.json({ results, totalScore, answerKey, correctedSheet });
  } catch (err: unknown) {
    console.error(err);
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
