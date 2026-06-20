import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as taskService from '../../services/taskService'
import { logout, loginUser } from './authSlice'

const initialState = {
  items: [],
  selected: null,
  loading: false,
  actionLoading: false,
  error: null,
  lastFetched: null,
}

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await taskService.getTasks()
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks')
  }
})

export const fetchTaskById = createAsyncThunk('tasks/fetchOne', async (id, { rejectWithValue }) => {
  try {
    return await taskService.getTaskById(id)
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Task not found')
  }
})

export const createTask = createAsyncThunk('tasks/create', async (payload, { rejectWithValue }) => {
  try {
    return await taskService.createTask(payload)
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create task')
  }
})

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

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasks: () => initialState,
    clearTaskError: (state) => {
      state.error = null
    },
    clearSelectedTask: (state) => {
      state.selected = null
    },
    upsertTask: (state, action) => {
      const task = action.payload
      const idx = state.items.findIndex((t) => t.id === task.id)
      if (idx >= 0) {
        state.items[idx] = task
      } else {
        state.items.unshift(task)
      }
      if (state.selected?.id === task.id) {
        state.selected = task
      }
    },
    removeTask: (state, action) => {
      state.items = state.items.filter((t) => t.id !== action.payload)
      if (state.selected?.id === action.payload) {
        state.selected = null
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      .addCase(loginUser.fulfilled, (state) => {
        state.items = []
        state.selected = null
        state.lastFetched = null
        state.error = null
      })
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false
        state.selected = action.payload
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createTask.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.actionLoading = false
        state.items.unshift(action.payload)
      })
      .addCase(createTask.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })
      .addCase(updateTask.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.actionLoading = false
        const idx = state.items.findIndex((t) => t.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload)
        if (state.selected?.id === action.payload) state.selected = null
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
  },
})

export const { clearTasks, clearTaskError, clearSelectedTask, upsertTask, removeTask } = tasksSlice.actions
export default tasksSlice.reducer
