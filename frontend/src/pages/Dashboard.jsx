import Layout from '../components/Layout'

function Dashboard() {
  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Total Tasks</h3>
            <p className="text-3xl font-bold text-blue-600">12</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-500">5</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Completed</h3>
            <p className="text-3xl font-bold text-green-500">7</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Tasks</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Task</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b py-3">
                <td className="py-3">Design Login Page</td>
                <td><span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">Completed</span></td>
                <td><span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">High</span></td>
              </tr>
              <tr className="border-b py-3">
                <td className="py-3">Setup React Router</td>
                <td><span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">In Progress</span></td>
                <td><span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">Medium</span></td>
              </tr>
              <tr className="py-3">
                <td className="py-3">Create Dashboard UI</td>
                <td><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">To Do</span></td>
                <td><span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">Low</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard