import React, { useState, useCallback } from 'react';
import './ActionsPage.css';

// ── Types ──────────────────────────────────────────────────────────────
type Priority = 'high' | 'medium' | 'low';
type ActionStatus = 'todo' | 'doing' | 'done';

interface AlignedAction {
  id: string;
  text: string;
  goal: string;
  priority: Priority;
  status: ActionStatus;
  dueDate?: string;
  note?: string;
  createdAt: string;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  high:   '#ef4444',
  medium: '#fbbf24',
  low:    '#22c55e',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low',
};

// ── Seed data ──────────────────────────────────────────────────────────
const SEED_ACTIONS: AlignedAction[] = [
  { id: '1', text: 'Write 500 words toward my manuscript',       goal: 'Publish my book',     priority: 'high',   status: 'doing', createdAt: new Date().toISOString() },
  { id: '2', text: 'Send 3 outreach emails to potential clients',goal: 'Financial freedom',   priority: 'high',   status: 'todo',  createdAt: new Date().toISOString() },
  { id: '3', text: '30-minute workout — no excuses',             goal: 'Optimal health',      priority: 'medium', status: 'todo',  createdAt: new Date().toISOString() },
  { id: '4', text: 'Read 20 pages of a skill-building book',     goal: 'Continuous learning', priority: 'low',    status: 'done',  createdAt: new Date().toISOString() },
  { id: '5', text: 'Schedule dentist appointment',               goal: 'Health',              priority: 'low',    status: 'todo',  createdAt: new Date().toISOString() },
];

const COLUMNS: { status: ActionStatus; label: string; emoji: string }[] = [
  { status: 'todo',  label: 'To Do',      emoji: '📋' },
  { status: 'doing', label: 'In Progress', emoji: '⚡' },
  { status: 'done',  label: 'Done',        emoji: '✅' },
];

let nextId = 100;

// ── Component ──────────────────────────────────────────────────────────
const ActionsPage: React.FC = () => {
  const [actions, setActions] = useState<AlignedAction[]>(SEED_ACTIONS);
  const [newText, setNewText]       = useState('');
  const [newGoal, setNewGoal]       = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newDue, setNewDue]         = useState('');
  const [formOpen, setFormOpen]     = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editNote, setEditNote]     = useState('');
  const [filter, setFilter]         = useState<Priority | 'all'>('all');
  const [searchQ, setSearchQ]       = useState('');

  const addAction = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const action: AlignedAction = {
      id: String(nextId++),
      text: newText.trim(),
      goal: newGoal.trim() || 'General',
      priority: newPriority,
      status: 'todo',
      dueDate: newDue || undefined,
      createdAt: new Date().toISOString(),
    };
    setActions(prev => [action, ...prev]);
    setNewText(''); setNewGoal(''); setNewDue(''); setNewPriority('medium');
    setFormOpen(false);
  }, [newText, newGoal, newPriority, newDue]);

  const moveAction = useCallback((id: string, status: ActionStatus) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }, []);

  const deleteAction = useCallback((id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
  }, []);

  const saveNote = useCallback((id: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, note: editNote } : a));
    setEditingId(null);
  }, [editNote]);

  const filtered = actions.filter(a => {
    if (filter !== 'all' && a.priority !== filter) return false;
    if (searchQ && !a.text.toLowerCase().includes(searchQ.toLowerCase()) &&
        !a.goal.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const doneCount = actions.filter(a => a.status === 'done').length;
  const totalCount = actions.length;
  const completionPct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="actions-page">
      {/* Header */}
      <section className="actions-header" aria-labelledby="actions-heading">
        <div className="actions-header__inner">
          <h1 id="actions-heading" className="actions-header__title">
            ⚡ Aligned Action Board
          </h1>
          <p className="actions-header__subtitle">
            Your vision without action is a daydream. These are the 100% controllable steps that build your desired life.
          </p>

          {/* Progress ring */}
          <div
            className="actions-header__progress"
            role="progressbar"
            aria-valuenow={completionPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Overall completion: ${completionPct}%`}
          >
            <svg viewBox="0 0 80 80" className="actions-header__ring" aria-hidden="true">
              <circle className="actions-header__ring-bg" cx="40" cy="40" r="34"/>
              <circle
                className="actions-header__ring-fill"
                cx="40" cy="40" r="34"
                style={{ strokeDashoffset: 213.62 * (1 - completionPct / 100) }}
              />
            </svg>
            <div className="actions-header__ring-label">
              <span className="actions-header__ring-pct">{completionPct}%</span>
              <span className="actions-header__ring-sub">done</span>
            </div>
          </div>

          <div className="actions-header__stats" aria-live="polite">
            <span>{doneCount} completed</span>
            <span aria-hidden="true">·</span>
            <span>{totalCount - doneCount} remaining</span>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="actions-toolbar">
        <label className="sr-only" htmlFor="actions-search">Search actions</label>
        <input
          id="actions-search"
          className="actions-toolbar__search"
          type="search"
          placeholder="Search actions or goals…"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          aria-label="Search actions"
        />

        {/* Priority filter */}
        <div className="actions-toolbar__filters" role="group" aria-label="Filter by priority">
          {(['all', 'high', 'medium', 'low'] as const).map(p => (
            <button
              key={p}
              className={`actions-toolbar__filter ${filter === p ? 'is-active' : ''}`}
              onClick={() => setFilter(p)}
              aria-pressed={filter === p}
              aria-label={`Filter: ${p}`}
            >
              {p === 'all' ? 'All' : PRIORITY_LABELS[p as Priority]}
            </button>
          ))}
        </div>

        <button
          className="actions-toolbar__add-btn"
          onClick={() => setFormOpen(v => !v)}
          aria-expanded={formOpen}
          aria-controls="new-action-form"
        >
          {formOpen ? '✕ Cancel' : '+ New Action'}
        </button>
      </div>

      {/* Add action form */}
      {formOpen && (
        <form
          id="new-action-form"
          className="actions-form"
          onSubmit={addAction}
          aria-label="Add new aligned action"
        >
          <div className="actions-form__row">
            <div className="actions-form__field actions-form__field--wide">
              <label htmlFor="new-action-text">Action (100% in your control)</label>
              <input
                id="new-action-text"
                type="text"
                className="actions-form__input"
                placeholder='e.g. "Write 500 words for my book"'
                value={newText}
                onChange={e => setNewText(e.target.value)}
                required
                aria-required="true"
              />
            </div>
            <div className="actions-form__field">
              <label htmlFor="new-action-goal">Aligned Goal</label>
              <input
                id="new-action-goal"
                type="text"
                className="actions-form__input"
                placeholder='e.g. "Publish my book"'
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
              />
            </div>
          </div>
          <div className="actions-form__row">
            <div className="actions-form__field">
              <label htmlFor="new-action-priority">Priority</label>
              <select
                id="new-action-priority"
                className="actions-form__select"
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as Priority)}
                aria-label="Priority"
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div className="actions-form__field">
              <label htmlFor="new-action-due">Due Date (optional)</label>
              <input
                id="new-action-due"
                type="date"
                className="actions-form__input"
                value={newDue}
                onChange={e => setNewDue(e.target.value)}
              />
            </div>
            <div className="actions-form__field actions-form__field--submit">
              <button type="submit" className="actions-form__submit" aria-label="Add action to board">
                Add Action ✓
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Kanban board */}
      <div className="actions-board" role="main" aria-label="Action board columns">
        {COLUMNS.map(col => {
          const colItems = filtered.filter(a => a.status === col.status);
          return (
            <section
              key={col.status}
              className={`actions-col actions-col--${col.status}`}
              aria-labelledby={`col-heading-${col.status}`}
            >
              <h2 id={`col-heading-${col.status}`} className="actions-col__heading">
                <span aria-hidden="true">{col.emoji}</span>
                {col.label}
                <span className="actions-col__count" aria-label={`${colItems.length} items`}>
                  {colItems.length}
                </span>
              </h2>

              <div className="actions-col__cards" role="list">
                {colItems.length === 0 && (
                  <div className="actions-col__empty" role="listitem" aria-label="Empty column">
                    <span aria-hidden="true">🪐</span>
                    <span>Empty</span>
                  </div>
                )}
                {colItems.map(action => (
                  <article
                    key={action.id}
                    className={`action-card action-card--${action.priority}`}
                    role="listitem"
                    aria-label={`${action.text}, priority ${action.priority}`}
                  >
                    {/* Priority dot */}
                    <div
                      className="action-card__priority-dot"
                      style={{ background: PRIORITY_COLORS[action.priority] }}
                      aria-hidden="true"
                    />

                    <div className="action-card__body">
                      <p className="action-card__text">{action.text}</p>
                      <span className="action-card__goal">→ {action.goal}</span>
                      {action.dueDate && (
                        <span className="action-card__due" aria-label={`Due: ${action.dueDate}`}>
                          📅 {action.dueDate}
                        </span>
                      )}
                      {action.note && (
                        <p className="action-card__note">{action.note}</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="action-card__actions" role="group" aria-label="Card actions">
                      {/* Move controls */}
                      {action.status !== 'todo' && (
                        <button
                          className="action-card__btn"
                          onClick={() => moveAction(action.id, action.status === 'doing' ? 'todo' : 'doing')}
                          aria-label="Move back"
                          title="Move back"
                        >◀</button>
                      )}
                      {action.status !== 'done' && (
                        <button
                          className="action-card__btn action-card__btn--advance"
                          onClick={() => moveAction(action.id, action.status === 'todo' ? 'doing' : 'done')}
                          aria-label={action.status === 'todo' ? 'Start action' : 'Mark done'}
                          title={action.status === 'todo' ? 'Start' : 'Done'}
                        >
                          {action.status === 'todo' ? '▶' : '✓'}
                        </button>
                      )}
                      <button
                        className="action-card__btn action-card__btn--note"
                        onClick={() => { setEditingId(action.id); setEditNote(action.note || ''); }}
                        aria-label="Add note"
                        title="Note"
                      >📝</button>
                      <button
                        className="action-card__btn action-card__btn--delete"
                        onClick={() => deleteAction(action.id)}
                        aria-label={`Delete action: ${action.text}`}
                        title="Delete"
                      >🗑</button>
                    </div>

                    {/* Inline note editor */}
                    {editingId === action.id && (
                      <div className="action-card__note-editor">
                        <label className="sr-only" htmlFor={`note-${action.id}`}>Note</label>
                        <textarea
                          id={`note-${action.id}`}
                          className="action-card__note-input"
                          rows={2}
                          value={editNote}
                          onChange={e => setEditNote(e.target.value)}
                          placeholder="Add a note…"
                          aria-label="Note content"
                        />
                        <div className="action-card__note-controls">
                          <button onClick={() => saveNote(action.id)} aria-label="Save note">Save</button>
                          <button onClick={() => setEditingId(null)} aria-label="Cancel note">Cancel</button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Inspiration footer */}
      <div className="actions-inspiration" role="note" aria-label="Inspiration quote">
        <p>"You don't rise to the level of your goals. You fall to the level of your systems." — James Clear</p>
        <span>Make your actions so small and controllable that skipping them feels worse than doing them.</span>
      </div>
    </div>
  );
};

export default ActionsPage;
