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
} from 'react-icons/hi2'

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
    const [newAction, setNewAction] = useState('')
    const titleTimeout = useRef<NodeJS.Timeout | null>(null)
    const outcomeTimeout = useRef<NodeJS.Timeout | null>(null)

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
