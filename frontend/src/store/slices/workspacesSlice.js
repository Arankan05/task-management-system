import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as workspaceService from '../../services/workspaceService'
import { logout, loginUser } from './authSlice'

const initialState = {
  items: [],
  active: null,
  loading: false,
  error: null,
}

export const fetchWorkspaces = createAsyncThunk('workspaces/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await workspaceService.getWorkspaces()
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch workspaces')
  }
})

export const createWorkspace = createAsyncThunk('workspaces/create', async (payload, { rejectWithValue }) => {
  try {
    return await workspaceService.createWorkspace(payload)
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create workspace')
  }
})

const workspacesSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    setActiveWorkspace: (state, action) => {
      state.active = action.payload
    },
    clearWorkspaces: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      .addCase(loginUser.fulfilled, () => initialState)
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
  },
})

export const { setActiveWorkspace, clearWorkspaces } = workspacesSlice.actions
export default workspacesSlice.reducer
