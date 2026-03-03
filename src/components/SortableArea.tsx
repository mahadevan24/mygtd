'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Area } from '@/lib/types'
import { HiOutlineBriefcase, HiOutlineTrash, HiOutlineBars3 } from 'react-icons/hi2'
import styles from './AreaList.module.css'

interface SortableAreaProps {
    area: Area
    onDelete: (id: string) => void
}

export function SortableArea({ area, onDelete }: SortableAreaProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: area.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} className={styles.cardWrap}>
            <div className={styles.card}>
                <div className={styles.dragHandle} {...attributes} {...listeners}>
                    <HiOutlineBars3 />
                </div>
                <div className={styles.cardHeader}>
                    <HiOutlineBriefcase className={styles.cardIcon} />
                    <span className={styles.cardTitle}>{area.title}</span>
                    <button className={styles.deleteBtn} onClick={() => onDelete(area.id)}>
                        <HiOutlineTrash />
                    </button>
                </div>
            </div>
        </div>
    )
}
