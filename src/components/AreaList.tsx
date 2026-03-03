'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Area } from '@/lib/types'
import { HiOutlinePlus } from 'react-icons/hi2'
import styles from './AreaList.module.css'
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
import { SortableArea } from './SortableArea'

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
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true })

        if (data) setAreas(data)
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
            const oldIndex = areas.findIndex((a) => a.id === active.id)
            const newIndex = areas.findIndex((a) => a.id === over.id)
            const newAreas = arrayMove(areas, oldIndex, newIndex)

            const updatedAreas = newAreas.map((area, index) => ({
                ...area,
                sort_order: index
            }))
            setAreas(updatedAreas)

            const updates = updatedAreas.map((area, index) =>
                supabase.from('areas').update({ sort_order: index }).eq('id', area.id)
            )
            await Promise.all(updates)
        }
    }

    const handleAddArea = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newAreaTitle.trim()) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('areas')
            .insert({
                title: newAreaTitle.trim(),
                user_id: user.id,
                sort_order: areas.length
            })
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
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={areas.map(a => a.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {areas.map(area => (
                            <SortableArea
                                key={area.id}
                                area={area}
                                onDelete={handleDeleteArea}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
                {areas.length === 0 && (
                    <div className={styles.empty}>
                        No areas defined yet. Start by adding one above.
                    </div>
                )}
            </div>
        </div>
    )
}

