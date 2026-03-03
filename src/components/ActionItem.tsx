'use client'

import { useState } from 'react'
import styles from './ActionItem.module.css'
import { HiOutlineTrash } from 'react-icons/hi2'

interface ActionItemProps {
    id: string
    title: string
    completed: boolean
    onToggle: (id: string, completed: boolean) => void
    onUpdate: (id: string, title: string) => void
    onDelete: (id: string) => void
}

export default function ActionItem({ id, title, completed, onToggle, onUpdate, onDelete }: ActionItemProps) {
    const [editing, setEditing] = useState(false)
    const [editValue, setEditValue] = useState(title)

    const handleBlur = () => {
        setEditing(false)
        const trimmed = editValue.trim()
        if (trimmed && trimmed !== title) {
            onUpdate(id, trimmed)
        } else {
            setEditValue(title)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur()
        }
        if (e.key === 'Escape') {
            setEditValue(title)
            setEditing(false)
        }
    }

    return (
        <div className={`${styles.item} ${completed ? styles.completed : ''}`}>
            <button
                className={styles.checkbox}
                onClick={() => onToggle(id, !completed)}
                aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
            >
                {completed && <span className={styles.checkmark}>✓</span>}
            </button>

            {editing ? (
                <input
                    className={styles.editInput}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
            ) : (
                <span
                    className={styles.title}
                    onDoubleClick={() => setEditing(true)}
                >
                    {title}
                </span>
            )}

            <button
                className={styles.deleteBtn}
                onClick={() => onDelete(id)}
                aria-label="Delete action"
            >
                <HiOutlineTrash />
            </button>
        </div>
    )
}
