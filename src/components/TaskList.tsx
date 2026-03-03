'use client'

import { Task, Action } from '@/lib/types'
import TaskCard from './TaskCard'
import styles from './TaskList.module.css'
import { HiOutlineInboxArrowDown } from 'react-icons/hi2'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'

interface TaskListProps {
    tasks: Task[]
    actionsMap: Record<string, Action[]>
    selectedTaskId: string | null
    onSelectTask: (task: Task) => void
    onReorder: (taskIds: string[]) => void
}

const filterLabels: Record<string, string> = {
    inbox: 'Inbox',
    active: 'Active',
    waiting: 'Waiting For',
    someday: 'Someday / Maybe',
    done: 'Done',
}

export default function TaskList({
    tasks,
    actionsMap,
    selectedTaskId,
    onSelectTask,
    onReorder,
}: TaskListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const oldIndex = tasks.findIndex((t) => t.id === active.id)
            const newIndex = tasks.findIndex((t) => t.id === over.id)
            const newTasks = arrayMove(tasks, oldIndex, newIndex)
            onReorder(newTasks.map((t) => t.id))
        }
    }

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
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            actions={actionsMap[task.id] || []}
                            isSelected={selectedTaskId === task.id}
                            onClick={() => onSelectTask(task)}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    )
}
