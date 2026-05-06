import React, { useEffect, useState } from "react";
import axios from "axios";

const LAU_GREEN = "#1a6b3c";
const LAU_GREEN_LIGHT = "#f0f7f3";
const LAU_GREEN_BORDER = "#d4e8db";

const styles = {
  page: {
    minHeight: "100vh",
    background: LAU_GREEN_LIGHT,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    borderRadius: "14px",
    border: `1px solid ${LAU_GREEN_BORDER}`,
    padding: "24px",
    boxSizing: "border-box",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)", // 🔥 NEW
  },

  title: {
    textAlign: "center",
    color: LAU_GREEN,
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "10px",
    background: LAU_GREEN,
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "15px",
    transition: "0.2s", // 🔥 smooth hover
  },

  section: {
    marginTop: "20px", // 🔥 spacing fix
  },

  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
  },
};

function App() {
  const [courses, setCourses] = useState([]);
  const [completed, setCompleted] = useState([]);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("");
  const [department, setDepartment] = useState("");

  const [search, setSearch] = useState("");

  const loadCourses = async () => {
    const res = await axios.get("http://localhost:5000/available");
    setCourses(res.data);
  };

  const loadCompleted = async () => {
    const res = await axios.get("http://localhost:5000/completed");
    setCompleted(res.data);
  };

  useEffect(() => {
    loadCourses();
    loadCompleted();
  }, []);

  const addCourse = async () => {
    if (!code.trim() || !name.trim()) {
      alert("Code and Name are required!");
      return;
    }

    await axios.post("http://localhost:5000/add-course", {
      code,
      name,
      credits,
      department,
    });

    setCode("");
    setName("");
    setCredits("");
    setDepartment("");

    loadCourses();
    loadCompleted();
  };

  const completeCourse = async (code) => {
    await axios.post(`http://localhost:5000/complete/${code}`);
    loadCourses();
    loadCompleted();
  };

  const deleteCourse = async (code) => {
    await axios.delete(`http://localhost:5000/delete/${code}`);
    loadCourses();
    loadCompleted();
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h2 style={styles.title}>DegreeMap Planner</h2>

        <input
          style={styles.input}
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Credits"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />

        <button
          style={styles.button}
          onClick={addCourse}
          onMouseOver={(e) => e.target.style.background = "#145c32"}
          onMouseOut={(e) => e.target.style.background = LAU_GREEN}
        >
          Add Course
        </button>

        <input
          style={styles.input}
          placeholder="Search by code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={styles.section}>
          <h3>Available Courses</h3>

          {courses
            .filter((c) =>
              c.code.toLowerCase().includes(search.toLowerCase())
            )
            .map((c) => (
              <div key={c.code} style={styles.listItem}>
                {c.code} - {c.name}

                <div>
                  <button
                    onClick={() => completeCourse(c.code)}
                    style={{
                      marginRight: "5px",
                      background: "green",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Complete
                  </button>

                  <button
                    onClick={() => deleteCourse(c.code)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div style={styles.section}>
          <h3>Completed Courses</h3>

          {completed.map((c) => (
            <div key={c.code}>
              {c.code} - {c.name}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;