import { useState } from "react";
import { Link } from "react-router-dom";
import Brand from "../../components/afterhack/Brand";
import AnswerFormDialog from "../../components/afterhack/AnswerFormDialog";
import Toast from "../../components/afterhack/Toast";
import { QUESTIONS } from "../../lib/afterhack/questions";

export default function Write() {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  return (
    <section className="compose">
      <header className="topbar">
        <Brand />
        <Link to="/activities/14th-hackathon/board/1" className="outline">
          회고 보러가기 ↗
        </Link>
      </header>

      <main>
        <div className="eyebrow">BEFORE WE LOOK BACK</div>
        <h1>당신의 이야기를 남겨주세요.</h1>
        <p className="lead">
          완벽한 답변이 아니어도 괜찮아요.
          <br />
          질문을 고르고, 우리 팀과 나의 경험을 짧게 적어주세요.
        </p>

        <div className="cards">
          {QUESTIONS.map((q) => (
            <button
              key={q.id}
              type="button"
              className="qcard"
              onClick={() => setActiveQuestion(q)}
            >
              <span className="number">QUESTION 0{q.id}</span>
              <span className="circle-arrow" aria-hidden>
                ↗
              </span>
              <h2>{q.title}</h2>
              <p>{q.full}</p>
            </button>
          ))}
        </div>

        <div className="compose-foot">
          <span>이름은 받지 않아요. 남겨준 이야기는 팀 색상의 포스트잇으로 모여요.</span>
          <Link to="/activities/14th-hackathon" className="textbutton">
            처음으로 돌아가기 ↗
          </Link>
        </div>
      </main>

      <AnswerFormDialog
        question={activeQuestion}
        onClose={() => setActiveQuestion(null)}
        onSaved={(message) => setToastMessage(message)}
      />
      <Toast message={toastMessage} onDismiss={() => setToastMessage("")} />
    </section>
  );
}
