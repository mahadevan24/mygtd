'use client'

import { Task, Action } from '@/lib/types'
import TaskCard from './TaskCard'
import styles from './TaskList.module.css'
import { HiOutlineInboxArrowDown } from 'react-icons/hi2'

interface TaskListProps {
    tasks: Task[]
    actionsMap: Record<string, Action[]>
    selectedTaskId: string | null
    onSelectTask: (task: Task) => void
}

const filterLabels: Record<string, string> = {
    inbox: 'Inbox',
    active: 'Active',
    waiting: 'Waiting For',
    someday: 'Someday / Maybe',
    done: 'Done',
}

export default function TaskList({ tasks, actionsMap, selectedTaskId, onSelectTask }: TaskListProps) {
    if (tasks.length === 0) {
        const status = 'inbox' // fallback
        return (
            <div className={styles.empty}>
                <HiOutlineInboxArrowDown className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>No items here</p>
                <p className={styles.emptyText}>
                    Use the capture bar above to quickly add new items to your inbox.
                </p>
            </div>
        )
    }

    return (
        <div className={styles.list}>
            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    actions={actionsMap[task.id] || []}
                    isSelected={selectedTaskId === task.id}
                    onClick={() => onSelectTask(task)}
                />
            ))}
        </div>
    )
}
