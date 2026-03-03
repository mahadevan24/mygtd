'use client'

import { useState, useEffect, useRef } from 'react'
import { Task, Action, TaskStatus as TStatus } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import ActionItem from './ActionItem'
import styles from './TaskDetail.module.css'
import {
    HiOutlineXMark,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineLightBulb,
    HiOutlineBriefcase,
    HiOutlineFlag,
    HiOutlineExclamationCircle,
} from 'react-icons/hi2'
import { Area, Goal, Priority } from '@/lib/types'

interface TaskDetailProps {
    task: Task
    actions: Action[]
    onClose: () => void
    onTaskUpdate: (task: Task) => void
    onTaskDelete: (taskId: string) => void
    onActionsChange: () => void
}

const statusOptions: { key: TStatus; label: string; color: string }[] = [
    { key: 'inbox', label: 'Inbox', color: 'var(--status-inbox)' },
    { key: 'active', label: 'Active', color: 'var(--status-active)' },
    { key: 'waiting', label: 'Waiting For', color: 'var(--status-waiting)' },
    { key: 'someday', label: 'Someday', color: 'var(--status-someday)' },
    { key: 'done', label: 'Done', color: 'var(--status-done)' },
]

const priorityOptions: { key: Priority; label: string; color: string }[] = [
    { key: 'p1', label: 'P1', color: '#ff4d4d' },
    { key: 'p2', label: 'P2', color: '#ffa500' },
    { key: 'p3', label: 'P3', color: '#4dabf7' },
    { key: 'p3', label: 'None', color: 'var(--text-tertiary)' }, // actually null
]

export default function TaskDetail({
    task,
    actions,
    onClose,
    onTaskUpdate,
    onTaskDelete,
    onActionsChange,
}: TaskDetailProps) {
    const supabase = createClient()
    const [title, setTitle] = useState(task.title)
    const [outcome, setOutcome] = useState(task.outcome || '')
    const [areas, setAreas] = useState<Area[]>([])
    const [goals, setGoals] = useState<Goal[]>([])
    const [newAction, setNewAction] = useState('')
    const titleTimeout = useRef<NodeJS.Timeout | null>(null)
    const outcomeTimeout = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        loadMetadata()
    }, [])

    const loadMetadata = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [areasRes, goalsRes] = await Promise.all([
            supabase.from('areas').select('*').eq('user_id', user.id).order('title', { ascending: true }),
            supabase.from('goals').select('*').eq('user_id', user.id).order('title', { ascending: true })
        ])

        if (areasRes.data) setAreas(areasRes.data)
        if (goalsRes.data) setGoals(goalsRes.data)
    }

    useEffect(() => {
        setTitle(task.title)
        setOutcome(task.outcome || '')
    }, [task.id, task.title, task.outcome])

    const updateTask = async (updates: Partial<Task>) => {
        const { data, error } = await supabase
            .from('tasks')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', task.id)
            .select()
            .single()

        if (!error && data) {
            onTaskUpdate(data as Task)
        }
    }

    const handleTitleChange = (val: string) => {
        setTitle(val)
        if (titleTimeout.current) clearTimeout(titleTimeout.current)
        titleTimeout.current = setTimeout(() => {
            if (val.trim()) updateTask({ title: val.trim() })
        }, 500)
    }

    const handleOutcomeChange = (val: string) => {
        setOutcome(val)
        if (outcomeTimeout.current) clearTimeout(outcomeTimeout.current)
        outcomeTimeout.current = setTimeout(() => {
            updateTask({ outcome: val || null })
        }, 500)
    }

    const handleStatusChange = (status: TStatus) => {
        updateTask({ status })
    }

    const handleAddAction = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = newAction.trim()
        if (!trimmed) return

        const maxSort = actions.length > 0
            ? Math.max(...actions.map(a => a.sort_order)) + 1
            : 0

        await supabase.from('actions').insert({
            task_id: task.id,
            title: trimmed,
            sort_order: maxSort,
        })

        setNewAction('')
        onActionsChange()
    }

    const handleToggleAction = async (id: string, completed: boolean) => {
        await supabase.from('actions').update({ completed }).eq('id', id)
        onActionsChange()
    }

    const handleUpdateAction = async (id: string, title: string) => {
        await supabase.from('actions').update({ title }).eq('id', id)
        onActionsChange()
    }

    const handleDeleteAction = async (id: string) => {
        await supabase.from('actions').delete().eq('id', id)
        onActionsChange()
    }

    const handleDeleteTask = async () => {
        if (!confirm('Delete this task and all its actions?')) return
        await supabase.from('tasks').delete().eq('id', task.id)
        onTaskDelete(task.id)
    }

    const completedCount = actions.filter(a => a.completed).length

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>Task Detail</h2>
                <button className={styles.closeBtn} onClick={onClose}>
                    <HiOutlineXMark />
                </button>
            </div>

            <div className={styles.body}>
                {/* Title */}
                <div className={styles.section}>
                    <input
                        className={styles.titleInput}
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Task title"
                    />
                </div>

                {/* Status */}
                <div className={styles.section}>
                    <label className={styles.label}>Status</label>
                    <div className={styles.statusRow}>
                        {statusOptions.map((s) => (
                            <button
                                key={s.key}
                                className={`${styles.statusChip} ${task.status === s.key ? styles.statusActive : ''}`}
                                style={{
                                    '--chip-color': s.color,
                                } as React.CSSProperties}
                                onClick={() => handleStatusChange(s.key)}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority */}
                <div className={styles.section}>
                    <label className={styles.label}>
                        <HiOutlineExclamationCircle className={styles.labelIcon} /> Priority
                    </label>
                    <div className={styles.priorityRow}>
                        {(['p1', 'p2', 'p3', null] as Priority[]).map((p) => (
                            <button
                                key={p || 'none'}
                                className={`${styles.priorityChip} ${task.priority === p ? styles.priorityActive : ''}`}
                                data-priority={p}
                                onClick={() => updateTask({ priority: p })}
                            >
                                {p ? p.toUpperCase() : 'None'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Area & Goal Selectors */}
                <div className={styles.metaGrid}>
                    <div className={styles.section}>
                        <label className={styles.label}>
                            <HiOutlineBriefcase className={styles.labelIcon} /> Area of Focus
                        </label>
                        <select
                            className={styles.select}
                            value={task.area_id || ''}
                            onChange={(e) => updateTask({ area_id: e.target.value || null })}
                        >
                            <option value="">None</option>
                            {areas.map(a => (
                                <option key={a.id} value={a.id}>{a.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.section}>
                        <label className={styles.label}>
                            <HiOutlineFlag className={styles.labelIcon} /> Goal
                        </label>
                        <select
                            className={styles.select}
                            value={task.goal_id || ''}
                            onChange={(e) => updateTask({ goal_id: e.target.value || null })}
                        >
                            <option value="">None</option>
                            {goals.map(g => (
                                <option key={g.id} value={g.id}>{g.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Outcome */}
                <div className={styles.section}>
                    <label className={styles.label}>
                        <HiOutlineLightBulb className={styles.labelIcon} />
                        Desired Outcome
                    </label>
                    <textarea
                        className={styles.outcomeInput}
                        value={outcome}
                        onChange={(e) => handleOutcomeChange(e.target.value)}
                        placeholder="What does 'done' look like? Describe the successful outcome..."
                        rows={3}
                    />
                </div>

                {/* Actions */}
                <div className={styles.section}>
                    <div className={styles.actionsHeader}>
                        <label className={styles.label}>
                            Next Actions
                            {actions.length > 0 && (
                                <span className={styles.actionCount}>
                                    {completedCount}/{actions.length}
                                </span>
                            )}
                        </label>
                    </div>

                    <div className={styles.actionsList}>
                        {actions
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((action) => (
                                <ActionItem
                                    key={action.id}
                                    id={action.id}
                                    title={action.title}
                                    completed={action.completed}
                                    onToggle={handleToggleAction}
                                    onUpdate={handleUpdateAction}
                                    onDelete={handleDeleteAction}
                                />
                            ))}
                    </div>

                    <form className={styles.addAction} onSubmit={handleAddAction}>
                        <HiOutlinePlus className={styles.addIcon} />
                        <input
                            className={styles.addInput}
                            value={newAction}
                            onChange={(e) => setNewAction(e.target.value)}
                            placeholder="Add a next action..."
                        />
                    </form>
                </div>
            </div>

            <div className={styles.footer}>
                <button className={styles.deleteBtn} onClick={handleDeleteTask}>
                    <HiOutlineTrash />
                    Delete Task
                </button>
            </div>
        </div>
    )
}
