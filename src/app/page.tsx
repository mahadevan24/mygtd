'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Task, Action, TaskStatus as TStatus } from '@/lib/types'
import Sidebar from '@/components/Sidebar'
import QuickCapture from '@/components/QuickCapture'
import TaskList from '@/components/TaskList'
import TaskDetail from '@/components/TaskDetail'
import UserMenu from '@/components/UserMenu'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './page.module.css'

const filterLabels: Record<TStatus, string> = {
  inbox: 'Inbox',
  active: 'Active',
  waiting: 'Waiting For',
  someday: 'Someday / Maybe',
  done: 'Done',
}

export default function Home() {
  const supabase = createClient()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [activeFilter, setActiveFilter] = useState<TStatus>('inbox')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auth check
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser({ id: user.id, email: user.email || '' })
      setLoading(false)
    }
    checkUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load tasks
  const loadTasks = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setTasks(data as Task[])
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load actions
  const loadActions = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('actions')
      .select('*, tasks!inner(user_id)')
      .eq('tasks.user_id', user.id)
      .order('sort_order', { ascending: true })

    if (data) setActions(data as Action[])
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) {
      loadTasks()
      loadActions()
    }
  }, [user, loadTasks, loadActions])

  // Grouped actions
  const actionsMap: Record<string, Action[]> = {}
  actions.forEach((a) => {
    if (!actionsMap[a.task_id]) actionsMap[a.task_id] = []
    actionsMap[a.task_id].push(a)
  })

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => t.status === activeFilter)

  // Counts
  const counts: Record<TStatus, number> = {
    inbox: tasks.filter((t) => t.status === 'inbox').length,
    active: tasks.filter((t) => t.status === 'active').length,
    waiting: tasks.filter((t) => t.status === 'waiting').length,
    someday: tasks.filter((t) => t.status === 'someday').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  // Quick capture
  const handleCapture = async (title: string) => {
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .insert({ title, user_id: user.id, status: 'inbox' })
      .select()
      .single()

    if (data) {
      setTasks((prev) => [data as Task, ...prev])
      setActiveFilter('inbox')
    }
  }

  // Task update
  const handleTaskUpdate = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setSelectedTask(updated)
  }

  // Task delete
  const handleTaskDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setActions((prev) => prev.filter((a) => a.task_id !== taskId))
    setSelectedTask(null)
  }

  if (!mounted || loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={(f) => {
          setActiveFilter(f)
          setSelectedTask(null)
        }}
        counts={counts}
      />

      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>{filterLabels[activeFilter]}</h1>
            <p className={styles.pageCount}>
              {filteredTasks.length} {filteredTasks.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <div className={styles.topActions}>
            <ThemeToggle />
            <UserMenu email={user?.email || ''} />
          </div>
        </div>

        <div className={styles.captureWrap}>
          <QuickCapture onCapture={handleCapture} />
        </div>

        <div className={styles.content}>
          <TaskList
            tasks={filteredTasks}
            actionsMap={actionsMap}
            selectedTaskId={selectedTask?.id || null}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        </div>
      </main>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          actions={actionsMap[selectedTask.id] || []}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onActionsChange={() => {
            loadActions()
          }}
        />
      )}
    </div>
  )
}
