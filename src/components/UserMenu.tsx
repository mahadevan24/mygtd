'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './UserMenu.module.css'
import { HiOutlineArrowRightOnRectangle, HiOutlineUser } from 'react-icons/hi2'

interface UserMenuProps {
    email: string
}

export default function UserMenu({ email }: UserMenuProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    return (
        <div className={styles.wrapper} ref={ref}>
            <button className={styles.trigger} onClick={() => setOpen(!open)} aria-label="User menu">
                <span className={styles.avatar}>
                    <HiOutlineUser />
                </span>
            </button>

            {open && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownEmail}>{email}</div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <HiOutlineArrowRightOnRectangle />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    )
}
