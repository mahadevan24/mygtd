'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Goal, Area, Priority } from '@/lib/types'
import { HiOutlinePlus } from 'react-icons/hi2'
import styles from './GoalList.module.css'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableGoal } from './SortableGoal'

export default function GoalList() {
    const supabase = createClient()
    const [goals, setGoals] = useState<Goal[]>([])
    const [areas, setAreas] = useState<Area[]>([])
    const [title, setTitle] = useState('')
    const [selectedAreaId, setSelectedAreaId] = useState<string>('')
    const [priority, setPriority] = useState<Priority>(null)
    const [loading, setLoading] = useState(true)

    const sortGoals = (goals: Goal[]) => {
        const priorityMap = { p1: 1, p2: 2, p3: 3, null: 4 }
        return [...goals].sort((a, b) => {
            const pA = priorityMap[a.priority as keyof typeof priorityMap || 'null']
            const pB = priorityMap[b.priority as keyof typeof priorityMap || 'null']
            if (pA !== pB) return pA - pB
            return a.sort_order - b.sort_order
        })
    }

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [goalsRes, areasRes] = await Promise.all([
            supabase.from('goals').select('*').eq('user_id', user.id).order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
            supabase.from('areas').select('*').eq('user_id', user.id).order('sort_order', { ascending: true }).order('title', { ascending: true })
        ])

        if (goalsRes.data) setGoals(sortGoals(goalsRes.data as Goal[]))
        if (areasRes.data) setAreas(areasRes.data)
        setLoading(false)
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const oldIndex = goals.findIndex((g) => g.id === active.id)
            const newIndex = goals.findIndex((g) => g.id === over.id)
            const newGoals = arrayMove(goals, oldIndex, newIndex)

            // Update local state
            const updatedGoals = newGoals.map((goal, index) => ({
                ...goal,
                sort_order: index
            }))
            setGoals(sortGoals(updatedGoals))

            // Persist to DB
            const updates = updatedGoals.map((goal, index) =>
                supabase.from('goals').update({ sort_order: index }).eq('id', goal.id)
            )
            await Promise.all(updates)
        }
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
                area_id: selectedAreaId || null,
                priority,
                sort_order: goals.length
            })
            .select()
            .single()

        if (!error && data) {
            setGoals(sortGoals([data, ...goals]))
            setTitle('')
            setSelectedAreaId('')
            setPriority(null)
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
                    <select
                        className={styles.select}
                        value={priority || ''}
                        onChange={(e) => setPriority(e.target.value as Priority || null)}
                    >
                        <option value="">No Priority</option>
                        <option value="p1">P1 (High)</option>
                        <option value="p2">P2 (Medium)</option>
                        <option value="p3">P3 (Low)</option>
                    </select>
                </div>
                <button type="submit" className={styles.addBtn} disabled={!title.trim()}>
                    <HiOutlinePlus /> Add Goal
                </button>
            </form>

            <div className={styles.list}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={goals.map(g => g.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {goals.map(goal => (
                            <SortableGoal
                                key={goal.id}
                                goal={goal}
                                areas={areas}
                                onDelete={handleDeleteGoal}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
                {goals.length === 0 && (
                    <div className={styles.empty}>
                        No goals set yet. Define what you want to achieve.
                    </div>
                )}
            </div>
        </div>
    )
}
