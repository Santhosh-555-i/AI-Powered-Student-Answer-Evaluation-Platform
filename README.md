This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Overview

This application allows a teacher to upload (or paste) a question paper, study material, and student answer sheet. Text fields accept plain `.txt` files or can be manually populated. An AI model (or a simple keyword fallback) analyzes each question, searches the study material for a matching answer, and compares it with the student's response. The system then grades each answer, generates an answer key, and allows the teacher to download a corrected sheet and the answer key as text files.

### Usage Notes

1. **Entering data**: Either click the `Choose File` button to load a `.txt` file, or paste text directly into the textarea. Each question or answer should ideally begin with a number (e.g., `1.`) to be recognized properly.
2. **Grading**: Click "Grade Paper". If you have set `OPENAI_API_KEY`, the AI will craft answers and grade intelligently. Without a key, a simplistic matching algorithm runs instead.
3. **Results**: A table will display each question, student answer, score, and comment. Download links become available for the answer key and the corrected answer sheet.


## Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Configure AI key**

Create a `.env.local` file in the project root with:

```ini
OPENAI_API_KEY=your_api_key_here
```

If you omit the key, the system will fallback to a very simple keyword-based grading mode so you can try the app without an OpenAI account, but results will be rudimentary.

3. **Run the development server**

```bash
npm run dev
# or
# yarn dev
# pnpm dev
# bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
