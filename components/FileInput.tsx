"use client";
import { ChangeEvent } from "react";

interface FileInputProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
}

export default function FileInput({ label, value, onChange }: FileInputProps) {
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      onChange(text);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <label className="block font-semibold">{label}</label>
      <input type="file" accept=".txt" onChange={handleFile} className="mb-2" />
      <textarea
        className="w-full h-32 p-2 border"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
