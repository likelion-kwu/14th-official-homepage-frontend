export default function StickyNote({ note, rotate, dy, onClick }) {
  return (
    <button
      type="button"
      className="note"
      onClick={() => onClick(note)}
      aria-label={`${note.team} 답변 전체 보기: ${note.text.slice(0, 35)}`}
      style={{ "--note-color": note.color, "--rot": `${rotate}deg`, "--dy": `${dy}px` }}
    >
      <span className="clamp">{note.text}</span>
    </button>
  );
}
