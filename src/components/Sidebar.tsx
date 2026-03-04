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
    HiOutlineBriefcase,
    HiOutlineShare,
    HiOutlineXMark,
} from 'react-icons/hi2'

interface SidebarProps {
    activeFilter: TaskStatus | 'goals' | 'areas' | 'graph'
    onFilterChange: (filter: TaskStatus | 'goals' | 'areas' | 'graph') => void
    counts: Record<TaskStatus, number>
    isOpen: boolean
    onClose: () => void
}

const filters: { key: TaskStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'inbox', label: 'Inbox', icon: <HiOutlineInboxArrowDown /> },
    { key: 'active', label: 'Active', icon: <HiOutlineBolt /> },
    { key: 'waiting', label: 'Waiting For', icon: <HiOutlineClock /> },
    { key: 'someday', label: 'Someday / Maybe', icon: <HiOutlineCloud /> },
    { key: 'done', label: 'Done', icon: <HiOutlineCheckCircle /> },
]

export default function Sidebar({ activeFilter, onFilterChange, counts, isOpen, onClose }: SidebarProps) {
    return (
        <>
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
                onClick={onClose}
            />
            <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.brand}>
                    <div className={styles.brandMain}>
                        <HiOutlineSparkles className={styles.brandIcon} />
                        <span className={styles.brandName}>FlowGTD</span>
                    </div>
                    <button className={styles.mobileClose} onClick={onClose}>
                        <HiOutlineXMark />
                    </button>
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

                    <span className={styles.navLabel} style={{ marginTop: '20px' }}>Vertical View</span>
                    <button
                        className={`${styles.navItem} ${activeFilter === 'goals' ? styles.active : ''}`}
                        onClick={() => onFilterChange('goals')}
                    >
                        <span className={styles.navIcon}><HiOutlineCloud /></span>
                        <span className={styles.navText}>Goals</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeFilter === 'areas' ? styles.active : ''}`}
                        onClick={() => onFilterChange('areas')}
                    >
                        <span className={styles.navIcon}><HiOutlineBriefcase /></span>
                        <span className={styles.navText}>Areas of Focus</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeFilter === 'graph' ? styles.active : ''}`}
                        onClick={() => onFilterChange('graph')}
                    >
                        <span className={styles.navIcon}><HiOutlineShare /></span>
                        <span className={styles.navText}>Graph View</span>
                    </button>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.footerGlow} />
                </div>
            </aside>
        </>
    )
}
