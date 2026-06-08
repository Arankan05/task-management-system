function Card({ title, value, color = "blue" }) {
  const colors = {
    blue: "text-blue-600",
    yellow: "text-yellow-500",
    green: "text-green-500",
    red: "text-red-500",
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  )
}

export default Card