import { useEffect, useRef } from "react";

export default function AnswerDetailDialog({ note, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleNativeClose() {
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
    if (note && !dialog.open) dialog.showModal();
    if (!note && dialog.open) dialog.close();
  }, [note]);

  return (
    <dialog ref={dialogRef} className="detail" aria-label="답변 전체 보기">
      {note && (
        <>
          <button
            type="button"
            className="close"
            aria-label="닫기"
            onClick={() => dialogRef.current?.close()}
          >
            ×
          </button>
          <div className="large-note" style={{ "--note-color": note.color }}>
            {note.text}
          </div>
        </>
      )}
    </dialog>
  );
}
