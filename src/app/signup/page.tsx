'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from '../login/login.module.css'
import { HiOutlineSparkles } from 'react-icons/hi2'

export default function SignupPage() {
    const [mounted, setMounted] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setTimeout(() => {
                router.push('/')
                router.refresh()
            }, 1500)
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
                <p className={styles.subtitle}>Create your account and start organizing.</p>

                {success ? (
                    <div style={{
                        padding: '16px',
                        background: 'hsla(160, 70%, 50%, 0.12)',
                        border: '1px solid hsla(160, 70%, 50%, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        color: 'hsl(160, 70%, 65%)',
                        fontSize: '14px',
                        textAlign: 'center',
                    }}>
                        ✓ Account created! Redirecting...
                    </div>
                ) : (
                    <form onSubmit={handleSignup} className={styles.form}>
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
                                placeholder="At least 6 characters"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? <span className={styles.spinner} /> : 'Create Account'}
                        </button>
                    </form>
                )}

                <p className={styles.switchText}>
                    Already have an account? <a href="/login">Sign in</a>
                </p>
            </div>
        </div>
    )
}
