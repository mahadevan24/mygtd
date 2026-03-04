'use client'

import { useState } from 'react'
import styles from './QuickCapture.module.css'
import { HiOutlinePlus } from 'react-icons/hi2'

interface QuickCaptureProps {
    onCapture: (title: string) => void
}

export default function QuickCapture({ onCapture }: QuickCaptureProps) {
    const [value, setValue] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = value.trim()
        if (!trimmed) return
        onCapture(trimmed)
        setValue('')
    }

    return (
        <form className={styles.capture} onSubmit={handleSubmit}>
            <HiOutlinePlus className={styles.icon} />
            <input
                type="text"
                className={styles.input}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="What's on your mind?"
            />
            <button type="submit" className={styles.btn} disabled={!value.trim()}>
                Add
            </button>
        </form>
    )
}
