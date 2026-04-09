import { useRef } from "react";
import { LETTER_VALUES } from "../types";

export function RackInput({
  letters,
  onSetLetter,
  onClear,
}: {
  letters: string[];
  onSetLetter: (index: number, value: string) => void;
  onClear: () => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (index: number, value: string) => {
    const ch = value.slice(-1);
    if (ch && !/^[a-zA-Z?]$/.test(ch)) return;

    const upper = ch.toUpperCase();
    onSetLetter(index, upper);

    if (upper && index < 6) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (letters[index] === "" && index > 0) {
        e.preventDefault();
        onSetLetter(index - 1, "");
        inputRefs.current[index - 1]?.focus();
      } else {
        onSetLetter(index, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 6) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const hasLetters = letters.some((l) => l !== "");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 justify-center">
        {letters.map((letter, i) => {
          const pts = letter && letter !== "?" ? LETTER_VALUES[letter] : null;
          return (
            <div key={i} className="relative">
              <input
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                value={letter}
                onChange={(e) => handleInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                maxLength={2}
                className={`h-14 w-14 rounded-lg border-2 text-center font-mono text-2xl font-bold outline-none transition-colors ${
                  letter
                    ? "border-amber-400 bg-amber-50 text-amber-900"
                    : "border-gray-300 bg-white text-gray-400"
                } focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100`}
                placeholder={letter === "?" ? "?" : ""}
              />
              {pts !== null && (
                <span className="absolute bottom-1 right-1.5 text-[9px] font-medium text-amber-600 pointer-events-none">
                  {pts}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-3">
        <p className="text-xs text-gray-400 self-center">
          Type letters or <span className="font-mono font-bold">?</span> for blank
        </p>
        {hasLetters && (
          <button
            onClick={onClear}
            className="rounded-md px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
