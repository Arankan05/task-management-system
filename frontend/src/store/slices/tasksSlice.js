import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as taskService from '../../services/taskService'
import { logout, loginUser } from './authSlice'

const initialState = {
  items: [],
  selected: null,
  activeProjectId: null,
  loading: false,
  actionLoading: false,
  error: null,
}

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async ({ workspaceId, projectId, ...params }, { rejectWithValue }) => {
    try {
      if (workspaceId) {
        const { getWorkspaceTasks } = await import('../../services/workspaceService')
        return await getWorkspaceTasks(workspaceId, params)
      }
      return await taskService.getTasks(projectId, params)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks')
    }
  }
)

export const fetchTaskById = createAsyncThunk('tasks/fetchOne', async (id, { rejectWithValue }) => {
  try {
    return await taskService.getTaskById(id)
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Task not found')
  }
})

export const createTask = createAsyncThunk(
  'tasks/create',
  async ({ workspaceId, projectId, ...payload }, { rejectWithValue }) => {
    try {
      if (workspaceId) {
        const { createWorkspaceTask } = await import('../../services/workspaceService')
        return await createWorkspaceTask(workspaceId, payload)
      }
      return await taskService.createTask(projectId, payload)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create task')
    }
  }
)

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await taskService.updateTask(id, payload)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update task')
    }
  }
)

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await taskService.deleteTask(id)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete task')
  }
})

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await taskService.updateTaskStatus(id, status)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update status')
    }
  }
)

export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, content }, { rejectWithValue }) => {
    try {
      return await taskService.addComment(taskId, content)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add comment')
    }
  }
)

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setActiveProjectId: (state, action) => {
      if (state.activeProjectId !== action.payload) {
        state.items = []
        state.selected = null
      }
      state.activeProjectId = action.payload
    },
    clearTasks: () => initialState,
    clearSelectedTask: (state) => {
      state.selected = null
    },
    upsertTask: (state, action) => {
      const task = action.payload
      if (state.activeProjectId && task.projectId !== state.activeProjectId) return
      const idx = state.items.findIndex((t) => t.id === task.id)
      if (idx >= 0) state.items[idx] = task
      else state.items.unshift(task)
      if (state.selected?.id === task.id) state.selected = { ...state.selected, ...task }
    },
    removeTask: (state, action) => {
      state.items = state.items.filter((t) => t.id !== action.payload)
      if (state.selected?.id === action.payload) state.selected = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      .addCase(loginUser.fulfilled, () => initialState)
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false
        state.selected = action.payload
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.actionLoading = false
        state.items.unshift(action.payload)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.actionLoading = false
        const idx = state.items.findIndex((t) => t.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload)
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.selected?.id === action.payload.taskId) {
          state.selected.comments = [...(state.selected.comments || []), action.payload]
        }
      })
  },
})

export const { setActiveProjectId, clearTasks, clearSelectedTask, upsertTask, removeTask } = tasksSlice.actions
export default tasksSlice.reducer
