import Layout from '../components/Layout'

function Profile() {
  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>

        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              U
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">User Name</h2>
              <p className="text-gray-500">user@example.com</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
            <input
              type="text"
              placeholder="Your role"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>

          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
            Update Profile
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default Profile