function Button({ text, onClick, type = "button", color = "blue", fullWidth = false }) {
  const colors = {
    blue: "bg-blue-500 hover:bg-blue-600",
    red: "bg-red-500 hover:bg-red-600",
    green: "bg-green-500 hover:bg-green-600",
    gray: "bg-gray-500 hover:bg-gray-600",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${colors[color]} text-white py-2 px-4 rounded-lg ${fullWidth ? "w-full" : ""}`}
    >
      {text}
    </button>
  )
}

export default Button