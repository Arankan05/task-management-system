function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="text-xl font-bold text-blue-600">
        TaskManager
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-600 text-sm">Welcome, User</span>
        <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar