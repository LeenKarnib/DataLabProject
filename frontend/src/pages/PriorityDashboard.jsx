import React, { useEffect, useMemo, useState } from "react";
import PriorityQueue from "../utils/PriorityQueue";
import "./PriorityDashboard.css";

function PriorityDashboard() {
  const [tasks, setTasks] = useState(() => {
  const savedTasks = localStorage.getItem("priorityTasks");
  return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    deadline: "",
  });
  useEffect(() => {
  localStorage.setItem("priorityTasks", JSON.stringify(tasks));
  }, [tasks]);

  const priorityQueue = useMemo(() => {
    const queue = new PriorityQueue();

    tasks.forEach((task) => {
      if (task.status !== "Completed") {
        queue.enqueue(task);
      }
    });

    return queue;
  }, [tasks]);

  const sortedTasks = priorityQueue.toArray();
  const nextTask = priorityQueue.peek();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddTask = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.deadline) {
      alert("Please enter a title and deadline.");
      return;
    }

    const newTask = {
      id: Date.now(),
      ...formData,
    };

    setTasks((previous) => [...previous, newTask]);

    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      status: "Pending",
      deadline: "",
    });
  };

  const updateStatus = (taskId, newStatus) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks((previous) => previous.filter((task) => task.id !== taskId));
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Critical":
        return "priority-badge critical";
      case "High":
        return "priority-badge high";
      case "Medium":
        return "priority-badge medium";
      case "Low":
        return "priority-badge low";
      default:
        return "priority-badge";
    }
  };

  return (
    <div className="priority-dashboard">
      <div className="priority-header">
        <h1>Priority Dashboard</h1>
        <p>Tasks are ordered using a priority queue based on priority level and deadline.</p>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Tasks</span>
          <strong>{tasks.length}</strong>
        </div>

        <div className="summary-card">
          <span>Active Tasks</span>
          <strong>{sortedTasks.length}</strong>
        </div>

        <div className="summary-card">
          <span>Highest Priority</span>
          <strong>{nextTask ? nextTask.title : "None"}</strong>
        </div>
      </div>

      <form className="priority-form" onSubmit={handleAddTask}>
        <input
          type="text"
          name="title"
          placeholder="Task title"
          value={formData.title}
          onChange={handleChange}
        />

        <input
          type="text"
          name="description"
          placeholder="Task description"
          value={formData.description}
          onChange={handleChange}
        />

        <select name="priority" value={formData.priority} onChange={handleChange}>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
        />

        <button type="submit">Add Task</button>
      </form>

      <div className="priority-list">
        <h2>Priority Queue</h2>

        {sortedTasks.length === 0 ? (
          <p className="empty-state">No active tasks yet.</p>
        ) : (
          sortedTasks.map((task, index) => (
            <div className="priority-task-card" key={task.id}>
              <div className="task-main">
                <h3>
                  #{index + 1} {task.title}
                </h3>

                <p>{task.description || "No description provided."}</p>

                <div className="task-meta">
                  <span className={getPriorityClass(task.priority)}>
                    {task.priority}
                  </span>
                  <span className="status-badge">{task.status}</span>
                  <span className="deadline-badge">Deadline: {task.deadline}</span>
                </div>
              </div>

              <div className="task-actions">
                <button type="button" onClick={() => updateStatus(task.id, "In Progress")}>
                  Start
                </button>

                <button type="button" onClick={() => updateStatus(task.id, "Completed")}>
                  Complete
                </button>

                <button type="button" onClick={() => deleteTask(task.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PriorityDashboard;