'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Goal, Area } from '@/lib/types'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineFlag } from 'react-icons/hi2'
import styles from './GoalList.module.css'

export default function GoalList() {
    const supabase = createClient()
    const [goals, setGoals] = useState<Goal[]>([])
    const [areas, setAreas] = useState<Area[]>([])
    const [title, setTitle] = useState('')
    const [selectedAreaId, setSelectedAreaId] = useState<string>('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [goalsRes, areasRes] = await Promise.all([
            supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('areas').select('*').eq('user_id', user.id).order('title', { ascending: true })
        ])

        if (goalsRes.data) setGoals(goalsRes.data)
        if (areasRes.data) setAreas(areasRes.data)
        setLoading(false)
    }

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('goals')
            .insert({
                title: title.trim(),
                user_id: user.id,
                area_id: selectedAreaId || null
            })
            .select()
            .single()

        if (!error && data) {
            setGoals([data, ...goals])
            setTitle('')
            setSelectedAreaId('')
        }
    }

    const handleDeleteGoal = async (id: string) => {
        if (!confirm('Delete this goal?')) return
        const { error } = await supabase.from('goals').delete().eq('id', id)
        if (!error) {
            setGoals(goals.filter(g => g.id !== id))
        }
    }

    if (loading) return <div className={styles.loading}>Loading goals...</div>

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Goals</h1>
                <p className={styles.subtitle}>Larger outcomes you're working towards (6-24 months).</p>
            </header>

            <form className={styles.addForm} onSubmit={handleAddGoal}>
                <div className={styles.inputsRow}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="What's the goal?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <select
                        className={styles.select}
                        value={selectedAreaId}
                        onChange={(e) => setSelectedAreaId(e.target.value)}
                    >
                        <option value="">No Area</option>
                        {areas.map(a => (
                            <option key={a.id} value={a.id}>{a.title}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className={styles.addBtn} disabled={!title.trim()}>
                    <HiOutlinePlus /> Add Goal
                </button>
            </form>

            <div className={styles.list}>
                {goals.map(goal => (
                    <div key={goal.id} className={styles.card}>
                        <div className={styles.cardContent}>
                            <HiOutlineFlag className={styles.goalIcon} />
                            <div className={styles.goalInfo}>
                                <h3 className={styles.goalTitle}>{goal.title}</h3>
                                {goal.area_id && (
                                    <span className={styles.areaTag}>
                                        {areas.find(a => a.id === goal.area_id)?.title || 'Area'}
                                    </span>
                                )}
                            </div>
                            <button className={styles.deleteBtn} onClick={() => handleDeleteGoal(goal.id)}>
                                <HiOutlineTrash />
                            </button>
                        </div>
                    </div>
                ))}
                {goals.length === 0 && (
                    <div className={styles.empty}>
                        No goals set yet. Define what you want to achieve.
                    </div>
                )}
            </div>
        </div>
    )
}
