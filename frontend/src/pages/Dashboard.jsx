import Layout from '../components/Layout'
import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

function Dashboard() {

  const socket = useSocket();

  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {

    if (!socket) return;

    socket.emit("join-room", "project-room");

    socket.on("task-created", (task) => {

      console.log("🔥 New realtime task received:", task);

      setTasks((prevTasks) => [task, ...prevTasks]);

      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `🔔 New Task: ${task.title}`,
        },
        ...prev
      ]);

    });

    socket.on("task-updated", (task) => {
      console.log("🔥 Task updated:", task);

      setTasks((prev) => prev.map((t) => t.id === task.id ? task : t));

      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `🔄 Task updated: ${task.title}`,
        },
        ...prev
      ]);
    });

    socket.on("task-updated", (updatedTask) => {

      console.log("🔥 Task updated:", updatedTask);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id
            ? updatedTask
            : task
        )
      );

    });

    socket.on("task-deleted", (taskId) => {

      console.log("🔥 Task deleted:", taskId);

      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskId)
      );

    });

    socket.on("online-users", (users) => {

      console.log("🟢 Online users:", users);

      setOnlineUsers(users);

    });

    socket.on("user-typing", (username) => {

      setTypingUser(`${username} is typing...`);

      setTimeout(() => {
        setTypingUser("");
      }, 2000);

    });

    return () => {
      socket.off("task-created");
      socket.off("task-updated");
    };

  }, [socket]);

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

        <div className="mb-6">

          <h2 className="text-lg font-bold mb-2">
            Online Users
          </h2>

          <div className="bg-green-100 text-green-700 p-3 rounded shadow">

            🟢 {onlineUsers.length} User(s) Online

          </div>

        </div>

        <div className="mb-6">

          <h2 className="text-lg font-bold mb-2">
            Notifications
          </h2>

          {notifications.map((notification) => (

            <div
              key={notification.id}
              className="bg-blue-100 text-blue-800 p-3 rounded mb-2 shadow"
            >
              {notification.message}
            </div>

          ))}

        </div>

        <div className="mb-6">

          <input
            type="text"
            placeholder="Type something..."
            className="border p-2 rounded w-full"

            onChange={() => {
              socket.emit("typing", "User");
            }}
          />

          {typingUser && (
            <p className="text-sm text-gray-500 mt-2">
              {typingUser}
            </p>
          )}

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

              {tasks.map((task) => (

                <tr key={task.id} className="border-b py-3">

                  <td className="py-3">{task.title}</td>

                  <td>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {task.status}
                    </span>
                  </td>

                  <td>
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                      {task.priority}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard