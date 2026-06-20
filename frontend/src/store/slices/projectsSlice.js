import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as projectService from '../../services/projectService'
import { logout, loginUser } from './authSlice'

const initialState = {
  items: [],
  active: null,
  stats: null,
  labels: [],
  loading: false,
  error: null,
}

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async ({ workspaceId, ...params }, { rejectWithValue }) => {
    try {
      return await projectService.getProjects(workspaceId, params)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch projects')
    }
  }
)

export const createProject = createAsyncThunk(
  'projects/create',
  async ({ workspaceId, ...payload }, { rejectWithValue }) => {
    try {
      return await projectService.createProject(workspaceId, payload)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create project')
    }
  }
)

export const fetchProjectStats = createAsyncThunk(
  'projects/fetchStats',
  async (projectId, { rejectWithValue }) => {
    try {
      return await projectService.getProjectStats(projectId)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats')
    }
  }
)

export const fetchLabels = createAsyncThunk(
  'projects/fetchLabels',
  async (projectId, { rejectWithValue }) => {
    try {
      return await projectService.getLabels(projectId)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch labels')
    }
  }
)

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setActiveProject: (state, action) => {
      state.active = action.payload
    },
    clearProjects: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      .addCase(loginUser.fulfilled, () => initialState)
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(fetchProjectStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
      .addCase(fetchLabels.fulfilled, (state, action) => {
        state.labels = action.payload
      })
  },
})

export const { setActiveProject, clearProjects } = projectsSlice.actions
export default projectsSlice.reducer
