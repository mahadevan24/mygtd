'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Area } from '@/lib/types'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineBriefcase } from 'react-icons/hi2'
import styles from './AreaList.module.css'

export default function AreaList() {
    const supabase = createClient()
    const [areas, setAreas] = useState<Area[]>([])
    const [newAreaTitle, setNewAreaTitle] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAreas()
    }, [])

    const loadAreas = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('areas')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })

        if (data) setAreas(data)
        setLoading(false)
    }

    const handleAddArea = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newAreaTitle.trim()) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('areas')
            .insert({ title: newAreaTitle.trim(), user_id: user.id })
            .select()
            .single()

        if (!error && data) {
            setAreas([...areas, data])
            setNewAreaTitle('')
        }
    }

    const handleDeleteArea = async (id: string) => {
        if (!confirm('Delete this area? This will unlink it from any tasks or goals.')) return
        const { error } = await supabase.from('areas').delete().eq('id', id)
        if (!error) {
            setAreas(areas.filter(a => a.id !== id))
        }
    }

    if (loading) return <div className={styles.loading}>Loading areas...</div>

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Areas of Focus</h1>
                <p className={styles.subtitle}>Broad areas of responsibility and interest in your life.</p>
            </header>

            <form className={styles.addForm} onSubmit={handleAddArea}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Add a new area (e.g., Work, Health, Personal)..."
                    value={newAreaTitle}
                    onChange={(e) => setNewAreaTitle(e.target.value)}
                />
                <button type="submit" className={styles.addBtn} disabled={!newAreaTitle.trim()}>
                    <HiOutlinePlus /> Add Area
                </button>
            </form>

            <div className={styles.grid}>
                {areas.map(area => (
                    <div key={area.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <HiOutlineBriefcase className={styles.cardIcon} />
                            <span className={styles.cardTitle}>{area.title}</span>
                            <button className={styles.deleteBtn} onClick={() => handleDeleteArea(area.id)}>
                                <HiOutlineTrash />
                            </button>
                        </div>
                    </div>
                ))}
                {areas.length === 0 && (
                    <div className={styles.empty}>
                        No areas defined yet. Start by adding one above.
                    </div>
                )}
            </div>
        </div>
    )
}
