import React, { useState, useEffect, useRef, useCallback } from 'react'
import { theme, baseBtn } from './theme'

interface TaskNote {
  text: string
  createdAt: string
}

type TaskStatus = 'todo' | 'in_progress' | 'done' | 'deferred'

interface Task {
  id: string
  title: string
  status: TaskStatus
  notes: TaskNote[]
  createdAt: string
  updatedAt: string
}

type View = 'chat' | 'board'

interface TheoTaskAPI {
  listTasks: () => Promise<Task[]>
  createTask: (title: string) => Promise<Task>
  updateTask: (task: Task) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  addTaskNote: (taskId: string, text: string) => Promise<Task>
}

function getApi(): TheoTaskAPI {
  return (window as unknown as { theo: TheoTaskAPI }).theo
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const STATUS_CONFIG: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'todo', label: 'Todo', color: theme.warning },
  { key: 'in_progress', label: 'In Progress', color: theme.primary },
  { key: 'done', label: 'Done', color: theme.success },
  { key: 'deferred', label: 'Deferred', color: theme.textMuted },
]

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
  deferred: 'Deferred',
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: theme.warning,
  in_progress: theme.primary,
  done: theme.success,
  deferred: theme.textMuted,
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'deferred',
  deferred: 'todo',
}

// ─── Main Component ─────────────────────────────────────────────────────

export function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<View>('chat')
  const [input, setInput] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const t = await getApi().listTasks()
    setTasks(t)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    await getApi().createTask(text)
    setInput('')
    await load()
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    await getApi().updateTask({ ...task, status })
    await load()
  }

  const handleDelete = async (id: string) => {
    await getApi().deleteTask(id)
    if (expandedId === id) setExpandedId(null)
    await load()
  }

  const handleAddNote = async (taskId: string) => {
    const text = noteInput.trim()
    if (!text) return
    await getApi().addTaskNote(taskId, text)
    setNoteInput('')
    await load()
  }

  const todoCount = tasks.filter((t) => t.status === 'todo').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* View switcher + counts */}
      <div style={topBarStyle}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            style={{ ...viewBtn, ...(view === 'chat' ? viewBtnActive : {}) }}
            onClick={() => setView('chat')}
          >
            Chat
          </button>
          <button
            style={{ ...viewBtn, ...(view === 'board' ? viewBtnActive : {}) }}
            onClick={() => setView('board')}
          >
            Board
          </button>
        </div>
        <div style={countStyle}>
          {todoCount > 0 && <span style={badgeTodo}>{todoCount} todo</span>}
          {inProgressCount > 0 && <span style={badgeProgress}>{inProgressCount} active</span>}
        </div>
      </div>

      {/* Content */}
      <div ref={listRef} style={contentStyle}>
        {view === 'chat' ? (
          <ChatView
            tasks={tasks}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            noteInput={noteInput}
            onNoteInputChange={setNoteInput}
            onAddNote={handleAddNote}
          />
        ) : (
          <BoardView
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} style={inputBarStyle}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Capture a task or idea..."
          style={inputStyle}
        />
        <button type="submit" style={sendBtn} disabled={!input.trim()}>
          +
        </button>
      </form>
    </div>
  )
}

// ─── Chat View ──────────────────────────────────────────────────────────

function ChatView({
  tasks, expandedId, onToggle, onStatusChange, onDelete,
  noteInput, onNoteInputChange, onAddNote,
}: {
  tasks: Task[]
  expandedId: string | null
  onToggle: (id: string) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
  onDelete: (id: string) => void
  noteInput: string
  onNoteInputChange: (v: string) => void
  onAddNote: (taskId: string) => void
}) {
  if (tasks.length === 0) {
    return (
      <div style={emptyStyle}>
        No tasks yet. Type below to capture your first idea.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          expanded={expandedId === task.id}
          onToggle={() => onToggle(task.id)}
          onStatusChange={(s) => onStatusChange(task, s)}
          onDelete={() => onDelete(task.id)}
          noteInput={expandedId === task.id ? noteInput : ''}
          onNoteInputChange={onNoteInputChange}
          onAddNote={() => onAddNote(task.id)}
        />
      ))}
    </div>
  )
}

// ─── Task Card ──────────────────────────────────────────────────────────

function TaskCard({
  task, expanded, onToggle, onStatusChange, onDelete,
  noteInput, onNoteInputChange, onAddNote,
}: {
  task: Task
  expanded: boolean
  onToggle: () => void
  onStatusChange: (s: TaskStatus) => void
  onDelete: () => void
  noteInput: string
  onNoteInputChange: (v: string) => void
  onAddNote: () => void
}) {
  const isDone = task.status === 'done'
  const isDeferred = task.status === 'deferred'

  return (
    <div style={{
      ...cardStyle,
      borderLeftColor: STATUS_COLORS[task.status],
      opacity: isDone || isDeferred ? 0.6 : 1,
    }}>
      <div style={cardHeaderStyle} onClick={onToggle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            ...cardTitleStyle,
            textDecoration: isDone ? 'line-through' : 'none',
          }}>
            {task.title}
          </div>
          <div style={cardMetaStyle}>{timeAgo(task.updatedAt)}</div>
        </div>
        <button
          style={{
            ...statusChip,
            background: STATUS_COLORS[task.status] + '22',
            color: STATUS_COLORS[task.status],
            borderColor: STATUS_COLORS[task.status] + '44',
          }}
          onClick={(e) => { e.stopPropagation(); onStatusChange(NEXT_STATUS[task.status]) }}
          title={`Click to move to ${STATUS_LABELS[NEXT_STATUS[task.status]]}`}
        >
          {STATUS_LABELS[task.status]}
        </button>
      </div>

      {expanded && (
        <div style={expandedStyle}>
          {task.notes.length > 0 && (
            <div style={notesListStyle}>
              {task.notes.map((note, i) => (
                <div key={i} style={noteStyle}>
                  <div style={noteTextStyle}>{note.text}</div>
                  <div style={noteTimeStyle}>{timeAgo(note.createdAt)}</div>
                </div>
              ))}
            </div>
          )}

          <div style={noteInputRow}>
            <input
              type="text"
              value={noteInput}
              onChange={(e) => onNoteInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onAddNote() }}
              placeholder="Add a note..."
              style={noteInputStyle}
              autoFocus
            />
          </div>

          {/* Status selector */}
          <div style={statusSelectorRow}>
            {STATUS_CONFIG.map((s) => (
              <button
                key={s.key}
                style={{
                  ...statusSelectBtn,
                  background: task.status === s.key ? s.color + '33' : 'transparent',
                  color: task.status === s.key ? s.color : theme.textDim,
                  borderColor: task.status === s.key ? s.color + '66' : theme.border,
                }}
                onClick={() => onStatusChange(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={actionsRow}>
            <button
              style={{ ...baseBtn, background: theme.danger + '22', color: theme.danger, fontSize: 11 }}
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Board View (Vertical Accordions) ───────────────────────────────────

function BoardView({
  tasks, onStatusChange, onDelete,
}: {
  tasks: Task[]
  onStatusChange: (task: Task, status: TaskStatus) => void
  onDelete: (id: string) => void
}) {
  const [collapsed, setCollapsed] = useState<Record<TaskStatus, boolean>>({
    todo: false,
    in_progress: false,
    done: true,      // done collapsed by default
    deferred: true,  // deferred collapsed by default
  })

  const toggle = (key: TaskStatus) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {STATUS_CONFIG.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key)
        const isOpen = !collapsed[col.key]

        return (
          <div key={col.key} style={accordionStyle}>
            {/* Accordion Header */}
            <button
              style={accordionHeaderStyle}
              onClick={() => toggle(col.key)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  ...accordionArrow,
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                }}>
                  &#9656;
                </span>
                <span style={{
                  ...accordionDot,
                  background: col.color,
                }} />
                <span style={accordionLabel}>{col.label}</span>
              </div>
              <span style={accordionCount}>{colTasks.length}</span>
            </button>

            {/* Accordion Body */}
            {isOpen && (
              <div style={accordionBody}>
                {colTasks.length === 0 ? (
                  <div style={emptyAccordion}>No tasks</div>
                ) : (
                  colTasks.map((task) => (
                    <div key={task.id} style={boardItemStyle}>
                      <div style={boardItemTitle}>{task.title}</div>
                      <div style={boardItemBottom}>
                        <span style={boardItemMeta}>
                          {timeAgo(task.updatedAt)}
                          {task.notes.length > 0 && (
                            <span style={{
                              ...noteCountBadge,
                              background: col.color + '22',
                              color: col.color,
                            }}>
                              {task.notes.length}
                            </span>
                          )}
                        </span>
                        <div style={boardItemActions}>
                          {col.key !== 'todo' && (
                            <button
                              style={boardMoveBtn}
                              onClick={() => {
                                const prev = STATUS_CONFIG.findIndex((s) => s.key === col.key)
                                if (prev > 0) onStatusChange(task, STATUS_CONFIG[prev - 1].key)
                              }}
                              title={`Move to ${STATUS_CONFIG[STATUS_CONFIG.findIndex((s) => s.key === col.key) - 1]?.label}`}
                            >
                              &#9650;
                            </button>
                          )}
                          {col.key !== 'deferred' && (
                            <button
                              style={boardMoveBtn}
                              onClick={() => {
                                const next = STATUS_CONFIG.findIndex((s) => s.key === col.key)
                                if (next < STATUS_CONFIG.length - 1) onStatusChange(task, STATUS_CONFIG[next + 1].key)
                              }}
                              title={`Move to ${STATUS_CONFIG[STATUS_CONFIG.findIndex((s) => s.key === col.key) + 1]?.label}`}
                            >
                              &#9660;
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────

const topBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
}

const viewBtn: React.CSSProperties = {
  ...baseBtn,
  background: theme.surface,
  color: theme.textMuted,
  fontSize: 11,
  padding: '4px 10px',
}

const viewBtnActive: React.CSSProperties = {
  background: theme.primary + '22',
  color: theme.primary,
}

const countStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  fontSize: 10,
}

const badgeTodo: React.CSSProperties = {
  background: theme.warning + '22',
  color: theme.warning,
  padding: '2px 6px',
  borderRadius: 4,
}

const badgeProgress: React.CSSProperties = {
  background: theme.primary + '22',
  color: theme.primary,
  padding: '2px 6px',
  borderRadius: 4,
}

const contentStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  minHeight: 0,
}

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  color: theme.textMuted,
  marginTop: 40,
  fontSize: 12,
  lineHeight: 1.6,
}

// Card styles
const cardStyle: React.CSSProperties = {
  background: theme.surface,
  borderRadius: theme.radius,
  borderLeft: '3px solid',
  padding: '10px 12px',
  cursor: 'pointer',
  transition: 'background 0.1s',
}

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const cardTitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: theme.text,
  lineHeight: 1.4,
  wordBreak: 'break-word',
}

const cardMetaStyle: React.CSSProperties = {
  fontSize: 10,
  color: theme.textDim,
  marginTop: 2,
}

const statusChip: React.CSSProperties = {
  fontSize: 9,
  fontFamily: theme.font,
  padding: '3px 8px',
  borderRadius: 10,
  border: '1px solid',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}

const expandedStyle: React.CSSProperties = {
  marginTop: 10,
  paddingTop: 10,
  borderTop: `1px solid ${theme.border}`,
}

const notesListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  marginBottom: 8,
}

const noteStyle: React.CSSProperties = {
  background: theme.bg,
  borderRadius: 4,
  padding: '6px 8px',
}

const noteTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: theme.text,
  lineHeight: 1.4,
  wordBreak: 'break-word',
}

const noteTimeStyle: React.CSSProperties = {
  fontSize: 9,
  color: theme.textDim,
  marginTop: 2,
}

const noteInputRow: React.CSSProperties = {
  marginBottom: 8,
}

const noteInputStyle: React.CSSProperties = {
  width: '100%',
  background: theme.bg,
  border: `1px solid ${theme.border}`,
  borderRadius: 4,
  padding: '6px 8px',
  color: theme.text,
  fontSize: 12,
  fontFamily: theme.font,
  outline: 'none',
  boxSizing: 'border-box',
}

const statusSelectorRow: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  marginBottom: 8,
  flexWrap: 'wrap',
}

const statusSelectBtn: React.CSSProperties = {
  fontSize: 9,
  fontFamily: theme.font,
  padding: '3px 8px',
  borderRadius: 4,
  border: '1px solid',
  cursor: 'pointer',
  background: 'transparent',
}

const actionsRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
}

// Input bar
const inputBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  padding: '10px 0 0',
  borderTop: `1px solid ${theme.border}`,
  marginTop: 8,
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: theme.surface,
  border: `1px solid ${theme.border}`,
  borderRadius: theme.radius,
  padding: '8px 12px',
  color: theme.text,
  fontSize: 13,
  fontFamily: theme.font,
  outline: 'none',
}

const sendBtn: React.CSSProperties = {
  ...baseBtn,
  background: theme.primary,
  color: '#fff',
  fontSize: 18,
  padding: '6px 14px',
  lineHeight: 1,
}

// Accordion Board styles
const accordionStyle: React.CSSProperties = {
  background: theme.surface,
  borderRadius: theme.radius,
  overflow: 'hidden',
}

const accordionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: '10px 12px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: theme.text,
  fontFamily: theme.font,
  fontSize: 12,
  fontWeight: 600,
}

const accordionArrow: React.CSSProperties = {
  fontSize: 10,
  color: theme.textMuted,
  transition: 'transform 0.15s',
  display: 'inline-block',
}

const accordionDot: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
}

const accordionLabel: React.CSSProperties = {
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  fontSize: 11,
}

const accordionCount: React.CSSProperties = {
  background: theme.bg,
  padding: '2px 8px',
  borderRadius: 10,
  fontSize: 10,
  color: theme.textMuted,
}

const accordionBody: React.CSSProperties = {
  padding: '0 10px 10px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}

const emptyAccordion: React.CSSProperties = {
  color: theme.textDim,
  fontSize: 11,
  padding: '8px 4px',
}

const boardItemStyle: React.CSSProperties = {
  background: theme.bg,
  borderRadius: 4,
  padding: '8px 10px',
}

const boardItemTitle: React.CSSProperties = {
  fontSize: 12,
  color: theme.text,
  lineHeight: 1.3,
  wordBreak: 'break-word',
}

const boardItemBottom: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 6,
}

const boardItemMeta: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 9,
  color: theme.textDim,
}

const noteCountBadge: React.CSSProperties = {
  padding: '1px 5px',
  borderRadius: 3,
  fontSize: 9,
}

const boardItemActions: React.CSSProperties = {
  display: 'flex',
  gap: 2,
}

const boardMoveBtn: React.CSSProperties = {
  background: 'none',
  border: `1px solid ${theme.border}`,
  borderRadius: 3,
  color: theme.textMuted,
  cursor: 'pointer',
  padding: '1px 6px',
  fontSize: 9,
  lineHeight: 1,
}
