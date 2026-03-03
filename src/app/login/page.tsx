'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './login.module.css'
import { HiOutlineSparkles } from 'react-icons/hi2'

export default function LoginPage() {
    const [mounted, setMounted] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    if (!mounted) return <div className={styles.container} />

    return (
        <div className={styles.container}>
            <div className={styles.bgOrbs}>
                <div className={styles.orb1} />
                <div className={styles.orb2} />
                <div className={styles.orb3} />
            </div>
            <div className={styles.card}>
                <div className={styles.logo}>
                    <HiOutlineSparkles className={styles.logoIcon} />
                    <h1>FlowGTD</h1>
                </div>
                <p className={styles.subtitle}>Welcome back. Let&apos;s get things done.</p>

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? <span className={styles.spinner} /> : 'Sign In'}
                    </button>
                </form>

                <p className={styles.switchText}>
                    Don&apos;t have an account? <a href="/signup">Create one</a>
                </p>
            </div>
        </div>
    )
}
