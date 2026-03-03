'use client'

import { Task, Action } from '@/lib/types'
import styles from './TaskCard.module.css'
import { HiOutlineChevronRight } from 'react-icons/hi2'

interface TaskCardProps {
    task: Task
    actions: Action[]
    isSelected: boolean
    onClick: () => void
}

export default function TaskCard({ task, actions, isSelected, onClick }: TaskCardProps) {
    const completedActions = actions.filter(a => a.completed).length
    const totalActions = actions.length
    const progress = totalActions > 0 ? (completedActions / totalActions) * 100 : 0

    return (
        <button
            className={`${styles.card} ${isSelected ? styles.selected : ''}`}
            onClick={onClick}
        >
            <div className={styles.content}>
                <h3 className={styles.title}>{task.title}</h3>
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
    )
}
