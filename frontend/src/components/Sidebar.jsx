import { Link } from 'react-router-dom'

function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 min-h-screen p-4">
      <ul className="space-y-2">
        <li>
          <Link to="/dashboard" className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-3 rounded-lg">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/tasks" className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-3 rounded-lg">
            Tasks
          </Link>
        </li>
        <li>
          <Link to="/profile" className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-3 rounded-lg">
            Profile
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Sidebar