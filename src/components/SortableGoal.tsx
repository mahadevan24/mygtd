'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Goal, Area } from '@/lib/types'
import { HiOutlineFlag, HiOutlineTrash, HiOutlineBars3 } from 'react-icons/hi2'
import styles from './GoalList.module.css'

interface SortableGoalProps {
    goal: Goal
    areas: Area[]
    onDelete: (id: string) => void
}

export function SortableGoal({ goal, areas, onDelete }: SortableGoalProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: goal.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
        opacity: isDragging ? 0.5 : 1,
    }

    const areaName = areas.find(a => a.id === goal.area_id)?.title

    return (
        <div ref={setNodeRef} style={style} className={styles.cardWrap}>
            <div className={styles.card} data-priority={goal.priority}>
                <div className={styles.dragHandle} {...attributes} {...listeners}>
                    <HiOutlineBars3 />
                </div>
                <HiOutlineFlag className={styles.goalIcon} />
                <div className={styles.goalInfo}>
                    <div className={styles.goalHeader}>
                        {goal.priority && (
                            <span className={styles.priorityBadge}>{goal.priority.toUpperCase()}</span>
                        )}
                        <h3 className={styles.goalTitle}>{goal.title}</h3>
                    </div>
                    {areaName && (
                        <span className={styles.areaTag}>{areaName}</span>
                    )}
                </div>
                <button className={styles.deleteBtn} onClick={() => onDelete(goal.id)}>
                    <HiOutlineTrash />
                </button>
            </div>
        </div>
    )
}
