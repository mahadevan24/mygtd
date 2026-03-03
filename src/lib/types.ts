export type TaskStatus = 'inbox' | 'active' | 'waiting' | 'someday' | 'done'

export interface Task {
    id: string
    user_id: string
    title: string
    outcome: string | null
    status: TaskStatus
    created_at: string
    updated_at: string
}

export interface Action {
    id: string
    task_id: string
    title: string
    completed: boolean
    sort_order: number
    created_at: string
}
