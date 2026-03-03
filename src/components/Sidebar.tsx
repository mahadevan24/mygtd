'use client'

import { TaskStatus } from '@/lib/types'
import styles from './Sidebar.module.css'
import { HiOutlineSparkles } from 'react-icons/hi2'
import {
    HiOutlineInboxArrowDown,
    HiOutlineBolt,
    HiOutlineClock,
    HiOutlineCloud,
    HiOutlineCheckCircle,
} from 'react-icons/hi2'

interface SidebarProps {
    activeFilter: TaskStatus
    onFilterChange: (filter: TaskStatus) => void
    counts: Record<TaskStatus, number>
}

const filters: { key: TaskStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'inbox', label: 'Inbox', icon: <HiOutlineInboxArrowDown /> },
    { key: 'active', label: 'Active', icon: <HiOutlineBolt /> },
    { key: 'waiting', label: 'Waiting For', icon: <HiOutlineClock /> },
    { key: 'someday', label: 'Someday / Maybe', icon: <HiOutlineCloud /> },
    { key: 'done', label: 'Done', icon: <HiOutlineCheckCircle /> },
]

export default function Sidebar({ activeFilter, onFilterChange, counts }: SidebarProps) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.brand}>
                <HiOutlineSparkles className={styles.brandIcon} />
                <span className={styles.brandName}>FlowGTD</span>
            </div>

            <nav className={styles.nav}>
                <span className={styles.navLabel}>Categories</span>
                {filters.map((f) => (
                    <button
                        key={f.key}
                        className={`${styles.navItem} ${activeFilter === f.key ? styles.active : ''}`}
                        onClick={() => onFilterChange(f.key)}
                        data-status={f.key}
                    >
                        <span className={styles.navIcon}>{f.icon}</span>
                        <span className={styles.navText}>{f.label}</span>
                        {counts[f.key] > 0 && (
                            <span className={styles.badge}>{counts[f.key]}</span>
                        )}
                    </button>
                ))}
            </nav>

            <div className={styles.sidebarFooter}>
                <div className={styles.footerGlow} />
            </div>
        </aside>
    )
}
