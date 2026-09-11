import { useEffect, useRef, useState } from "react";
import { TEAMS } from "../../lib/afterhack/teams";

const MAX_LENGTH = 1000;

export default function AnswerFormDialog({ question, onClose, onSaved }) {
  const dialogRef = useRef(null);
  const [team, setTeam] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | error
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleNativeClose() {
      setTeam("");
      setText("");
      setStatus("idle");
      setError("");
      onClose();
    }
    dialog.addEventListener("close", handleNativeClose);

    function handleBackdropClick(e) {
      if (e.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) dialog.close();
    }
    dialog.addEventListener("click", handleBackdropClick);

    return () => {
      dialog.removeEventListener("close", handleNativeClose);
      dialog.removeEventListener("click", handleBackdropClick);
    };
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (question && !dialog.open) dialog.showModal();
    if (!question && dialog.open) dialog.close();
  }, [question]);

  async function handleSubmit(e) {
    e.preventDefault();
    const value = text.trim();
    if (!value) {
      setError("이야기를 한 글자 이상 적어주세요.");
      return;
    }
    if (!team) {
      setError("팀을 선택해주세요.");
      return;
    }

    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, team, text: value }),
      });
      if (!res.ok) throw new Error("save failed");
      setStatus("idle");
      dialogRef.current?.close();
      onSaved?.("이야기를 저장했어요. 회고 시간에 만나요!");
    } catch {
      setStatus("error");
      setError("저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  }

  return (
    <dialog ref={dialogRef} aria-labelledby="write-title">
      {question && (
        <div className="modal-inner">
          <div className="modal-top">
            QUESTION 0{question.id}
            <button
              type="button"
              className="close"
              aria-label="닫기"
              onClick={() => dialogRef.current?.close()}
            >
              ×
            </button>
          </div>
          <h2 id="write-title">{question.title}</h2>
          <p className="modal-question">{question.full}</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="team">우리 팀</label>
            <select
              id="team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              required
            >
              <option value="" disabled>
                팀을 선택해주세요
              </option>
              {TEAMS.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>

            <label htmlFor="answer">나의 이야기</label>
            <textarea
              id="answer"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="어떤 일이 있었고, 무엇을 느꼈나요?"
              maxLength={MAX_LENGTH}
              required
            />
            <div className="field-meta">
              <span>이름 없이, 익명으로 저장돼요.</span>
              <span>
                {text.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
              </span>
            </div>

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="pill save" disabled={status === "saving"}>
              {status === "saving" ? "저장 중…" : "저장하기"} <span>↗</span>
            </button>
          </form>
        </div>
      )}
    </dialog>
  );
}
