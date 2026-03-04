'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Task, Action, TaskStatus as TStatus } from '@/lib/types'
import Sidebar from '@/components/Sidebar'
import QuickCapture from '@/components/QuickCapture'
import TaskList from '@/components/TaskList'
import TaskDetail from '@/components/TaskDetail'
import GoalList from '@/components/GoalList'
import AreaList from '@/components/AreaList'
import GraphView from '@/components/GraphView'
import UserMenu from '@/components/UserMenu'
import ThemeToggle from '@/components/ThemeToggle'
import { HiOutlineBars3 } from 'react-icons/hi2'
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
  const [activeFilter, setActiveFilter] = useState<TStatus | 'goals' | 'areas' | 'graph'>('inbox')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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

  // Sort priority helper
  const sortTasks = (tasks: Task[]) => {
    const priorityMap = { p1: 1, p2: 2, p3: 3, null: 4 }
    return [...tasks].sort((a, b) => {
      const pA = priorityMap[a.priority as keyof typeof priorityMap || 'null']
      const pB = priorityMap[b.priority as keyof typeof priorityMap || 'null']
      if (pA !== pB) return pA - pB
      return a.sort_order - b.sort_order
    })
  }

  // Load tasks
  const loadTasks = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('priority', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (data) setTasks(sortTasks(data as Task[]))
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
  const filteredTasks = sortTasks(tasks.filter((t) => t.status === activeFilter))

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
      setTasks((prev) => sortTasks([data as Task, ...prev]))
      setActiveFilter('inbox')
    }
  }

  // Task update
  const handleTaskUpdate = (updated: Task) => {
    setTasks((prev) => sortTasks(prev.map((t) => (t.id === updated.id ? updated : t))))
    setSelectedTask(updated)
  }

  // Task delete
  // Task delete
  const handleTaskDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setActions((prev) => prev.filter((a) => a.task_id !== taskId))
    setSelectedTask(null)
  }

  // Task reorder
  const handleReorder = async (taskIds: string[]) => {
    // Update local state immediately
    const tasksMap = new Map(tasks.map((t) => [t.id, t]))
    const reorderedTasks = taskIds.map((id, index) => {
      const task = tasksMap.get(id)!
      return { ...task, sort_order: index }
    })
    setTasks(sortTasks(reorderedTasks))

    // Save to DB
    const updates = taskIds.map((id, index) =>
      supabase.from('tasks').update({ sort_order: index }).eq('id', id)
    )
    await Promise.all(updates)
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
          setIsSidebarOpen(false)
        }}
        counts={counts}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className={styles.main}>
        <div className={styles.topBar}>
          <div className={styles.titleSection}>
            <button
              className={styles.menuBtn}
              onClick={() => setIsSidebarOpen(true)}
            >
              <HiOutlineBars3 />
            </button>
            <div>
              <h1 className={styles.pageTitle}>
                {activeFilter === 'goals' ? 'Goals' : activeFilter === 'areas' ? 'Areas' : activeFilter === 'graph' ? 'Graph View' : filterLabels[activeFilter as TStatus]}
              </h1>
              {activeFilter !== 'goals' && activeFilter !== 'areas' && activeFilter !== 'graph' && (
                <p className={styles.pageCount}>
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'item' : 'items'}
                </p>
              )}
            </div>
          </div>
          <div className={styles.topActions}>
            <ThemeToggle />
            <UserMenu email={user?.email || ''} />
          </div>
        </div>

        {activeFilter === 'goals' ? (
          <GoalList />
        ) : activeFilter === 'areas' ? (
          <AreaList />
        ) : activeFilter === 'graph' ? (
          <GraphView onSelectNode={(id: string) => {
            const task = tasks.find(t => t.id === id);
            if (task) setSelectedTask(task);
          }} />
        ) : (
          <>
            <div className={styles.captureWrap}>
              <QuickCapture onCapture={handleCapture} />
            </div>

            <div className={styles.content}>
              <TaskList
                tasks={filteredTasks}
                actionsMap={actionsMap}
                selectedTaskId={selectedTask?.id || null}
                onSelectTask={(task) => setSelectedTask(task)}
                onReorder={handleReorder}
              />
            </div>
          </>
        )}
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
