import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, CheckCircle2, ClipboardList, RefreshCw, Send, ShieldCheck, Sparkles, BarChart3 } from 'lucide-react';

const emptyAnswers = {};

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(emptyAnswers);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('survey');

  const answeredCount = useMemo(() => questions.filter(q => (answers[q._id] || '').trim()).length, [questions, answers]);

  async function loadQuestions() {
    setLoading(true); setError(''); setSuccess(''); setAnswers({});
    try {
      const response = await fetch('/api/questions/random');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load questions.');
      setQuestions(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function loadStats() {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (response.ok) setStats(data);
    } catch { /* Statistics are optional. */ }
  }

  useEffect(() => { loadQuestions(); loadStats(); }, []);

  function updateAnswer(id, value) {
    setAnswers(current => ({ ...current, [id]: value }));
  }

  async function submitSurvey(event) {
    event.preventDefault();
    if (answeredCount !== 5) {
      setError('Please answer all 5 questions before submitting.');
      return;
    }
    setSubmitting(true); setError('');
    try {
      const payload = {
        respondentName: name.trim() || 'Anonymous',
        answers: questions.map(q => ({ questionId: q._id, answer: answers[q._id] }))
      };
      const response = await fetch('/api/responses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Submission failed.');
      setSuccess(data.message);
      setView('success');
      loadStats();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => setView('survey')}>
          <span className="brand-mark"><Activity size={21} /></span>
          <span>pulse<span className="brand-light">survey</span></span>
        </a>
        <nav>
          <button className={view === 'survey' ? 'nav-link active' : 'nav-link'} onClick={() => setView('survey')}>Take survey</button>
          <button className={view === 'stats' ? 'nav-link active' : 'nav-link'} onClick={() => { setView('stats'); loadStats(); }}>Overview</button>
        </nav>
        <span className="secure-label"><ShieldCheck size={15} /> Your voice matters</span>
      </header>

      <main>
        {view === 'survey' && (
          <>
            <section className="hero">
              <div className="eyebrow"><Sparkles size={15} /> QUICK COMMUNITY CHECK-IN</div>
              <h1>A few questions.<br /><span>A better experience.</span></h1>
              <p>Your feedback helps us understand what works and what we can improve. Every survey gives you a fresh set of five questions.</p>
              <div className="hero-meta"><span><ClipboardList size={16} /> 5 random questions</span><span><Activity size={16} /> About 2 minutes</span></div>
            </section>

            <section className="survey-card">
              <div className="survey-heading">
                <div><div className="section-kicker">YOUR SURVEY</div><h2>Share your thoughts</h2></div>
                <div className="question-count">{answeredCount}<span> / 5 answered</span></div>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${answeredCount / 5 * 100}%` }} /></div>

              {loading ? <div className="state-message"><span className="spinner" /> Finding your questions...</div> : (
                <form onSubmit={submitSurvey}>
                  <label className="name-label" htmlFor="respondent">Your name <span>(optional)</span></label>
                  <input id="respondent" className="name-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name or stay anonymous" maxLength={80} />

                  {questions.map((question, index) => (
                    <article className="question" key={question._id}>
                      <div className="question-top"><span className="question-number">0{index + 1}</span><span className="category">{question.category || 'GENERAL'}</span></div>
                      <h3>{question.text}</h3>
                      {question.type === 'multiple-choice' ? (
                        <div className="options">
                          {question.options.map(option => (
                            <label className={`option ${answers[question._id] === option ? 'selected' : ''}`} key={option}>
                              <input type="radio" name={question._id} value={option} checked={answers[question._id] === option} onChange={() => updateAnswer(question._id, option)} />
                              <span className="radio-custom" /><span>{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea className="answer-textarea" rows="3" maxLength={1000} placeholder="Write your answer here..." value={answers[question._id] || ''} onChange={e => updateAnswer(question._id, e.target.value)} />
                      )}
                    </article>
                  ))}

                  {error && <div className="alert error">{error}</div>}
                  <div className="form-footer">
                    <button type="button" className="text-button" onClick={loadQuestions} disabled={submitting}><RefreshCw size={16} /> Get different questions</button>
                    <button className="submit-button" type="submit" disabled={submitting || loading}>{submitting ? 'Submitting...' : 'Submit answers'} <Send size={16} /></button>
                  </div>
                </form>
              )}
              {loading && error && <div className="alert error">{error}<button onClick={loadQuestions}>Try again</button></div>}
            </section>
          </>
        )}

        {view === 'success' && (
          <section className="success-card">
            <div className="success-icon"><CheckCircle2 size={42} /></div>
            <div className="eyebrow">RESPONSE RECEIVED</div>
            <h1>Thank you for<br /><span>sharing your voice.</span></h1>
            <p>{success || 'Your answers have been saved successfully.'} Your feedback helps make things better.</p>
            <button className="submit-button" onClick={() => { setView('survey'); loadQuestions(); }}>Take another survey <ArrowRight size={17} /></button>
          </section>
        )}

        {view === 'stats' && (
          <section className="survey-card stats-card">
            <div className="section-kicker">COMMUNITY FEEDBACK</div><h2>Survey overview</h2>
            <p className="stats-intro">A quick look at participation in this survey.</p>
            {stats ? <div className="stats-grid">
              <div className="stat-box"><BarChart3 /><strong>{stats.totalResponses}</strong><span>Total submissions</span></div>
              <div className="stat-box"><ClipboardList /><strong>{stats.totalQuestions}</strong><span>Questions in bank</span></div>
              <div className="stat-box"><CheckCircle2 /><strong>{stats.questionsPerSurvey}</strong><span>Questions per survey</span></div>
            </div> : <div className="state-message">Loading statistics...</div>}
            <button className="submit-button" onClick={() => setView('survey')}>Back to survey <ArrowRight size={17} /></button>
          </section>
        )}
      </main>
      <footer><span>© {new Date().getFullYear()} Pulse Survey</span><span>Built for better feedback, one answer at a time.</span></footer>
    </div>
  );
}
