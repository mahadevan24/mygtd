'use client'

import { useEffect, useState } from 'react'
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
        const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
        const initialTheme = savedTheme || systemTheme

        setTheme(initialTheme)
        document.documentElement.setAttribute('data-theme', initialTheme)
        document.body.setAttribute('data-theme', initialTheme)
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
        document.body.setAttribute('data-theme', newTheme)
    }

    if (!mounted) return null

    return (
        <button
            className={styles.toggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <HiOutlineSun className={styles.icon} />
            ) : (
                <HiOutlineMoon className={styles.icon} />
            )}
        </button>
    )
}
