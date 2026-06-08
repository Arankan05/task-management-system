function Alert({ message, type = "success" }) {
  const styles = {
    success: "bg-green-100 text-green-700 border border-green-400",
    error: "bg-red-100 text-red-700 border border-red-400",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-400",
  }

  return (
    <div className={`${styles[type]} px-4 py-3 rounded-lg mb-4`}>
      {message}
    </div>
  )
}

export default Alert