export type TaskStatus = 'inbox' | 'active' | 'waiting' | 'someday' | 'done'
export type Priority = 'p1' | 'p2' | 'p3' | null

export interface Area {
    id: string
    user_id: string
    title: string
    sort_order: number
    created_at: string
    updated_at: string
}

export interface Goal {
    id: string
    user_id: string
    area_id: string | null
    title: string
    description: string | null
    status: 'active' | 'done' | 'on_hold'
    priority: Priority
    sort_order: number
    created_at: string
    updated_at: string
}

export interface Task {
    id: string
    user_id: string
    area_id: string | null
    goal_id: string | null
    title: string
    outcome: string | null
    status: TaskStatus
    priority: Priority
    sort_order: number
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
