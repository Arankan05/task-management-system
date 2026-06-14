import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  search: '',
  status: '',
  priority: '',
  assigneeId: '',
  dateFrom: '',
  dateTo: '',
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload
      state[key] = value
    },
    setFilters: (state, action) => {
      Object.assign(state, action.payload)
    },
    resetFilters: () => initialState,
  },
})

export const { setFilter, setFilters, resetFilters } = filtersSlice.actions
export default filtersSlice.reducer
