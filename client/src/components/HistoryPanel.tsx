import type { GenerationSession, GenerationStep } from "../lib/refinementPipeline";

type Props = {
  session: GenerationSession | null;
  selectedStepId: number;
  onSelectStep: (stepId: number) => void;
};

function phaseLabel(step: GenerationStep): string {
  switch (step.phase) {
    case "approved":
      return "принято";
    case "needs_fix":
      return "нужны правки";
    case "reviewing":
      return "проверка";
    case "generating":
      return "генерация";
    case "cancelled":
      return "отменено";
    default:
      return step.phase;
  }
}

export default function HistoryPanel({
  session,
  selectedStepId,
  onSelectStep,
}: Props) {
  if (!session?.steps.length) {
    return null;
  }

  return (
    <section className="history-panel">
      <div className="history-head">
        <h2>История улучшений</h2>
        <p>{session.statusText}</p>
      </div>

      <div className="history-steps">
        {session.steps.map((step) => (
          <button
            key={step.id}
            type="button"
            className={`history-step ${selectedStepId === step.id ? "active" : ""} phase-${step.phase}`}
            onClick={() => onSelectStep(step.id)}
          >
            <span className="history-step-title">{step.label}</span>
            <span className="history-step-meta">{phaseLabel(step)}</span>
          </button>
        ))}
      </div>

      {session.steps
        .filter((step) => step.id === selectedStepId)
        .map((step) =>
          step.reviewSummary || step.reviewIssues?.length ? (
            <div key={`review-${step.id}`} className="history-review">
              {step.reviewSummary && <p>{step.reviewSummary}</p>}
              {step.reviewIssues?.length ? (
                <ul>
                  {step.reviewIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null,
        )}
    </section>
  );
}
