'use client'

import { Task, Action } from '@/lib/types'
import styles from './TaskCard.module.css'
import { HiOutlineChevronRight, HiOutlineBars3 } from 'react-icons/hi2'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TaskCardProps {
    task: Task
    actions: Action[]
    isSelected: boolean
    onClick: () => void
}

export default function TaskCard({ task, actions, isSelected, onClick }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
        opacity: isDragging ? 0.5 : 1,
    }

    const completedActions = actions.filter(a => a.completed).length
    const totalActions = actions.length
    const progress = totalActions > 0 ? (completedActions / totalActions) * 100 : 0

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${styles.cardWrap} ${isDragging ? styles.dragging : ''}`}
        >
            <button
                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                onClick={onClick}
                data-priority={task.priority}
            >
                <div className={styles.dragHandle} {...attributes} {...listeners}>
                    <HiOutlineBars3 />
                </div>
                <div className={styles.content}>
                    <div className={styles.header}>
                        {task.priority && (
                            <span className={styles.priorityBadge}>
                                {task.priority.toUpperCase()}
                            </span>
                        )}
                        <h3 className={styles.title}>{task.title}</h3>
                    </div>

                    {task.outcome && (
                        <p className={styles.outcome}>{task.outcome}</p>
                    )}

                    {totalActions > 0 && (
                        <div className={styles.progressWrap}>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className={styles.progressText}>
                                {completedActions}/{totalActions}
                            </span>
                        </div>
                    )}
                </div>
                <HiOutlineChevronRight className={styles.chevron} />
            </button>
        </div>
    )
}
