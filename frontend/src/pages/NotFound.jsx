import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-500">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2">The page you are looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
          Go Back Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound