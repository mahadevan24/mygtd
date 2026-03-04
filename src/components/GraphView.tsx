'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { Area, Task, Goal } from '@/lib/types'
import styles from './GraphView.module.css'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className={styles.loading}>Initializing canvas...</div>
})

interface GraphNode {
    id: string
    name: string
    val: number
    color: string
    type: 'area' | 'goal' | 'task'
    status?: string
}

interface GraphLink {
    source: string
    target: string
}

interface GraphData {
    nodes: GraphNode[]
    links: GraphLink[]
}

interface GraphViewProps {
    onSelectNode: (id: string) => void
}

export default function GraphView({ onSelectNode }: GraphViewProps) {
    const supabase = createClient()
    const [data, setData] = useState<GraphData>({ nodes: [], links: [] })
    const [loading, setLoading] = useState(true)
    const [hoverNode, setHoverNode] = useState<GraphNode | null>(null)
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Initial theme
        const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'dark'
        setTheme(currentTheme)

        // Observe theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    const newTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark'
                    setTheme(newTheme)
                }
            })
        })

        observer.observe(document.documentElement, { attributes: true })
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const [areasRes, goalsRes, tasksRes] = await Promise.all([
                supabase.from('areas').select('*').eq('user_id', user.id),
                supabase.from('goals').select('*').eq('user_id', user.id),
                supabase.from('tasks').select('*').eq('user_id', user.id)
            ])

            const areas = (areasRes.data || []) as Area[]
            const goals = (goalsRes.data || []) as Goal[]
            const tasks = (tasksRes.data || []) as Task[]

            const nodes: GraphNode[] = []
            const links: GraphLink[] = []

            // Add Areas (Large nodes)
            areas.forEach(area => {
                nodes.push({
                    id: area.id,
                    name: area.title,
                    val: 20,
                    color: '#0ea5e9', // Vibrant Sky Blue
                    type: 'area'
                })
            })

            // Add Goals (Medium nodes)
            goals.forEach(goal => {
                nodes.push({
                    id: goal.id,
                    name: goal.title,
                    val: 12,
                    color: '#d946ef', // Vibrant Fuchsia
                    type: 'goal'
                })
                if (goal.area_id) {
                    links.push({ source: goal.area_id, target: goal.id })
                }
            })

            // Add Tasks (Small nodes)
            tasks.forEach(task => {
                let color = '#facc15' // Bright Yellow (Active)
                if (task.status === 'done') color = '#22c55e' // Vivid Green
                else if (task.priority === 'p1') color = '#ff0000' // Pure Red

                nodes.push({
                    id: task.id,
                    name: task.title,
                    val: 6,
                    color: color,
                    type: 'task',
                    status: task.status
                })

                if (task.goal_id) {
                    links.push({ source: task.goal_id, target: task.id })
                } else if (task.area_id) {
                    links.push({ source: task.area_id, target: task.id })
                }
            })

            setData({ nodes, links })
            setLoading(false)
        }

        fetchData()
    }, [])

    const fgRef = useRef<any>(null)

    const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.name
        const fontSize = 12 / globalScale
        ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
        const textWidth = ctx.measureText(label).width
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2)

        // Node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, Math.sqrt(node.val) * 2, 0, 2 * Math.PI, false)
        ctx.fillStyle = node.color
        ctx.fill()

        // Hover effect / Glow
        if (node === hoverNode) {
            ctx.shadowBlur = 15
            ctx.shadowColor = node.color
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 2 / globalScale
            ctx.stroke()
            ctx.shadowBlur = 0
        }

        // Label
        if (globalScale > 1.5 || node === hoverNode || node.type === 'area') {
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
            ctx.fillStyle = textColor
            ctx.fillText(label, node.x, node.y + (Math.sqrt(node.val) * 2) + fontSize)
        }
    }

    const bgColor = theme === 'dark' ? '#000000' : '#ffffff'
    const linkColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'

    if (loading) {
        return <div className={styles.graphContainer} style={{ background: bgColor }}><div className={styles.loading}>Generating your universe...</div></div>
    }

    return (
        <div className={styles.graphContainer} style={{ background: bgColor }} ref={containerRef}>
            <ForceGraph2D
                ref={fgRef}
                graphData={data}
                nodeRelSize={4}
                nodeCanvasObject={paintNode}
                nodePointerAreaPaint={(node, color, ctx) => {
                    ctx.fillStyle = color
                    const size = Math.sqrt(node.val) * 2
                    ctx.beginPath()
                    ctx.arc(node.x ?? 0, node.y ?? 0, size, 0, 2 * Math.PI, false)
                    ctx.fill()
                }}
                onNodeHover={(node) => setHoverNode(node as GraphNode)}
                onNodeClick={(node: any) => onSelectNode(node.id)}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                linkColor={() => linkColor}
                backgroundColor={bgColor}
                cooldownTicks={100}
            />

            {hoverNode && (
                <div
                    className={styles.tooltip}
                    style={{
                        left: '20px',
                        top: '20px',
                        opacity: 1
                    }}
                >
                    <h3>{hoverNode.name}</h3>
                    <p>Type: {hoverNode.type.charAt(0).toUpperCase() + hoverNode.type.slice(1)}</p>
                    {hoverNode.status && <p>Status: {hoverNode.status}</p>}
                </div>
            )}

            <div className={styles.controls}>
                <button className={styles.controlBtn} onClick={() => fgRef.current?.zoomToFit(400)}>Reset View</button>
            </div>
        </div>
    )
}
