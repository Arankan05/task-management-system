import { Search, RotateCcw } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setFilter, resetFilters } from '../../store/slices/filtersSlice'
import { TASK_STATUSES, TASK_PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from '../../utils/constants'

function TaskFilters({ assignees = [] }) {
  const dispatch = useDispatch()
  const filters = useSelector((state) => state.filters)

  const handleChange = (key, value) => {
    dispatch(setFilter({ key, value }))
  }

  return (
    <div className="glass-card p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="relative xl:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by title..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="input-field pl-9"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="input-field"
        >
          <option value="">All Statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
          className="input-field"
        >
          <option value="">All Priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </select>

        <select
          value={filters.assigneeId}
          onChange={(e) => handleChange('assigneeId', e.target.value)}
          className="input-field"
        >
          <option value="">All Assignees</option>
          {assignees.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleChange('dateFrom', e.target.value)}
          className="input-field"
          title="From date"
        />

        <div className="flex gap-2 sm:col-span-2 xl:col-span-1">
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleChange('dateTo', e.target.value)}
            className="input-field flex-1"
            title="To date"
          />
          <button
            onClick={() => dispatch(resetFilters())}
            className="btn-secondary px-3 shrink-0"
            title="Reset filters"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskFilters
