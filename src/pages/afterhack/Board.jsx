import { Fragment, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Brand from "../../components/afterhack/Brand";
import StickyNote from "../../components/afterhack/StickyNote";
import AnswerDetailDialog from "../../components/afterhack/AnswerDetailDialog";
import AnswerFormDialog from "../../components/afterhack/AnswerFormDialog";
import Toast from "../../components/afterhack/Toast";
import { QUESTIONS, getQuestion } from "../../lib/afterhack/questions";
import { TEAMS, getTeamByName } from "../../lib/afterhack/teams";
import { shuffleById, NOTE_ROTATIONS, NOTE_OFFSETS } from "../../lib/afterhack/noteOrder";
import { wait } from "../../lib/afterhack/motion";

const BASE = "/activities/14th-hackathon";

export default function Board() {
  const { qid: qidParam } = useParams();
  const qid = Number(qidParam);
  const question = getQuestion(qid);

  if (!question) {
    return <Navigate to={`${BASE}/board/1`} replace />;
  }

  // key={qid} 로 질문이 바뀔 때마다 아래 컴포넌트를 통째로 새로 마운트한다.
  // 칠판 입장 애니메이션이 매번 다시 재생되고, 로딩/전환 상태도 자연히 초기화된다.
  return (
    <section className="session">
      <BoardContent key={qid} qid={qid} question={question} />
    </section>
  );
}

function BoardContent({ qid, question }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [answers, setAnswers] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [exiting, setExiting] = useState(false);
  const busyRef = useRef(false);

  function fetchAnswers() {
    return fetch(`/api/answers?questionId=${qid}`).then((res) => {
      if (!res.ok) throw new Error("failed");
      return res.json();
    });
  }

  useEffect(() => {
    let cancelled = false;
    fetchAnswers()
      .then((data) => {
        if (cancelled) return;
        setAnswers(data.answers ?? []);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qid]);

  function retry() {
    setStatus("loading");
    fetchAnswers()
      .then((data) => {
        setAnswers(data.answers ?? []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  async function goTo(href) {
    if (busyRef.current) return;
    busyRef.current = true;
    setExiting(true);
    await wait(560);
    navigate(href);
  }

  const notes = shuffleById(answers).map((a) => {
    const team = getTeamByName(a.team);
    return { id: a.id, team: a.team, text: a.text, color: team?.color ?? "#eee" };
  });

  return (
    <>
      <header className="topbar">
        <Brand />
        <nav className="stepbar" aria-label="질문 이동">
          {QUESTIONS.map((q, i) => (
            <Fragment key={q.id}>
              {i > 0 && <span />}
              <button
                type="button"
                className={`step ${q.id === qid ? "active" : ""}`}
                aria-label={`질문 ${q.id}`}
                aria-current={q.id === qid ? "step" : undefined}
                onClick={() => q.id !== qid && goTo(`${BASE}/board/${q.id}`)}
              >
                {q.id}
              </button>
            </Fragment>
          ))}
        </nav>
      </header>

      <main className={`board board-enter ${exiting ? "board-exit" : ""}`}>
        <div className="board-head">
          <div className="board-label">
            QUESTION 0{qid} / 0{QUESTIONS.length}
          </div>
          <h1>{question.short}</h1>
          <p>{question.full}</p>
        </div>

        <div className="notes">
          {status === "loading" && (
            <div className="state-msg">
              <p>이야기를 불러오고 있어요.</p>
            </div>
          )}
          {status === "error" && (
            <div className="state-msg">
              <p>이야기를 불러오지 못했어요.</p>
              <button type="button" className="outline" onClick={retry}>
                다시 시도
              </button>
            </div>
          )}
          {status === "ready" && notes.length === 0 && (
            <div className="empty">
              <p>아직 도착한 이야기가 없어요.</p>
              <button type="button" className="outline" onClick={() => setAddOpen(true)}>
                첫 이야기 남기기
              </button>
            </div>
          )}
          {status === "ready" &&
            notes.map((note, i) => (
              <StickyNote
                key={note.id}
                note={note}
                rotate={NOTE_ROTATIONS[i % NOTE_ROTATIONS.length]}
                dy={NOTE_OFFSETS[i % NOTE_OFFSETS.length]}
                onClick={setActiveNote}
              />
            ))}
        </div>

        <div className="board-add">
          <button type="button" className="outline" onClick={() => setAddOpen(true)}>
            ＋ 이야기 추가
          </button>
        </div>
      </main>

      <footer className="session-footer">
        <div className="legend" aria-label="팀별 포스트잇 색상">
          {TEAMS.map((t) => (
            <span key={t.name}>
              <b style={{ background: t.color }} />
              {t.name}
            </span>
          ))}
        </div>
        <div className="footer-actions">
          {qid > 1 && (
            <button type="button" className="textbutton" onClick={() => goTo(`${BASE}/board/${qid - 1}`)}>
              ← 이전 질문
            </button>
          )}
          <button
            type="button"
            className="pill"
            onClick={() => goTo(qid === QUESTIONS.length ? BASE : `${BASE}/board/${qid + 1}`)}
          >
            {qid === QUESTIONS.length ? "회고 마치기" : "다음 질문"} <span>→</span>
          </button>
        </div>
      </footer>
      <p className="hint">포스트잇을 누르면 이야기를 크게 볼 수 있어요.</p>

      <AnswerDetailDialog note={activeNote} onClose={() => setActiveNote(null)} />
      <AnswerFormDialog
        question={addOpen ? question : null}
        onClose={() => setAddOpen(false)}
        onSaved={(message) => {
          setToastMessage(message);
          retry();
        }}
      />
      <Toast message={toastMessage} onDismiss={() => setToastMessage("")} />
    </>
  );
}
