import { useState } from "react";

const LAU_GREEN = "#1a6b3c";
const LAU_GREEN_DARK = "#145430";
const LAU_GREEN_LIGHT = "#f0f7f3";
const LAU_GREEN_BORDER = "#d4e8db";

const styles = {
  page: {
    minHeight: "100vh",
    background: LAU_GREEN_LIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    fontFamily: "Segoe UI, sans-serif",
  },
  wrapper: {
    width: "100%",
    maxWidth: "420px",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  logoRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "6px",
  },
  logoBox: {
    width: "36px",
    height: "36px",
    background: LAU_GREEN,
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: "22px",
    fontWeight: "500",
    color: LAU_GREEN,
  },
  subtitle: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
  },
  card: {
    background: "#fff",
    borderRadius: "14px",
    border: `0.5px solid ${LAU_GREEN_BORDER}`,
    overflow: "hidden",
  },
  tabRow: {
    display: "flex",
    borderBottom: "0.5px solid #eee",
  },
  tabBtn: (active) => ({
    background: "none",
    border: "none",
    borderBottom: active ? `2px solid ${LAU_GREEN}` : "2px solid transparent",
    padding: "10px 32px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    color: active ? LAU_GREEN : "#888",
    transition: "all 0.2s",
  }),
  body: {
    padding: "24px",
  },
  hint: {
    fontSize: "13px",
    color: "#666",
    margin: "0 0 20px",
  },
  label: {
    fontSize: "13px",
    color: "#555",
    display: "block",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 14px",
    border: "0.5px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "14px",
    background: "#fff",
    color: "#222",
    outline: "none",
    fontFamily: "inherit",
  },
  forgotRow: {
    textAlign: "right",
    marginTop: "-8px",
    marginBottom: "16px",
  },
  forgotLink: {
    fontSize: "13px",
    color: LAU_GREEN,
    textDecoration: "none",
  },
  submitBtn: {
    width: "100%",
    padding: "11px",
    background: LAU_GREEN,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "16px 0",
    color: "#aaa",
    fontSize: "13px",
  },
  socialBtn: {
    width: "100%",
    padding: "10px",
    border: "0.5px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    fontSize: "14px",
    cursor: "pointer",
    color: "#333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: "inherit",
  },
  footer: {
    textAlign: "center",
    fontSize: "12px",
    color: "#aaa",
    marginTop: "16px",
  },
  policyText: {
    fontSize: "12px",
    color: "#aaa",
    textAlign: "center",
    marginTop: "14px",
    marginBottom: 0,
  },
};

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.2 33.6 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l6.1-6.1C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-7.9 19.7-20 0-1.3-.1-2.7-.2-4z"/>
      <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3 0 5.7 1.1 7.8 2.9l6.1-6.1C34.3 6.1 29.4 4 24 4 16.1 4 9.3 8.4 6.3 14.7z"/>
      <path fill="#FBBC05" d="M24 44c5.3 0 10.1-1.8 13.8-4.9l-6.4-5.2C29.5 35.6 26.9 36.5 24 36.5c-5.6 0-10.4-3.8-12.1-9l-6.9 5.3C8.7 39.3 15.8 44 24 44z"/>
      <path fill="#EA4335" d="M43.6 20H24v8.5h11.3c-.9 2.5-2.6 4.6-4.9 6l6.4 5.2C40.8 36.4 44 30.7 44 24c0-1.3-.1-2.7-.4-4z"/>
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 17L7 10L10 14L13 8L17 17H3Z" fill="white" opacity="0.9"/>
      <circle cx="14" cy="5" r="2.5" fill="white"/>
    </svg>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("major", data.user.major);
        window.location.href = "/planner";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      alert("Server error. Please try again.");
    }
  };

  return (
    <>
      <p style={styles.hint}>Welcome back. Sign in to your DegreeMap account.</p>

      <label style={styles.label}>University email</label>
      <input
        style={styles.input}
        type="email"
        placeholder="firstname.lastname@lau.edu.lb"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label style={styles.label}>Password</label>
      <input
        style={styles.input}
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div style={styles.forgotRow}>
        <a href="/forgot-password" style={styles.forgotLink}>Forgot password?</a>
      </div>

      <button style={styles.submitBtn} onClick={handleLogin}>
        Sign in
      </button>

      <div style={styles.divider}>
        <span style={{ flex: 1, height: "0.5px", background: "#ddd" }} />
        or
        <span style={{ flex: 1, height: "0.5px", background: "#ddd" }} />
      </div>

      <button style={styles.socialBtn}>
        <GoogleIcon />
        Continue with Google (LAU SSO)
      </button>
    </>
  );
}

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !major || !password) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, major, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("major", data.user.major);
        window.location.href = "/planner";
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      alert("Server error. Please try again.");
    }
  };

  return (
    <>
      <p style={styles.hint}>Create your account to start planning your degree.</p>

      <label style={styles.label}>Full name</label>
      <input
        style={styles.input}
        type="text"
        placeholder="e.g. Ahmad Khalil"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label style={styles.label}>University email</label>
      <input
        style={styles.input}
        type="email"
        placeholder="firstname.lastname@lau.edu.lb"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label style={styles.label}>Major</label>
      <select
        style={styles.input}
        value={major}
        onChange={(e) => setMajor(e.target.value)}
      >
        <option value="">Select your major</option>
        <option value="COE">Computer Engineering</option>
        <option value="ELE">Electrical Engineering</option>
        <option value="MCE">Mechatronics Engineering</option>
      </select>

      <label style={styles.label}>Password</label>
      <input
        style={styles.input}
        type="password"
        placeholder="Min. 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={styles.submitBtn} onClick={handleRegister}>
        Create account
      </button>

      <p style={styles.policyText}>
        By registering you agree to LAU's academic use policy.
      </p>
    </>
  );
}

export default function LoginPage() {
  const [tab, setTab] = useState("login");

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>

        <div style={styles.header}>
          <div style={styles.logoRow}>
            <div style={styles.logoBox}>
              <LogoIcon />
            </div>
            <span style={styles.logoText}>DegreeMap</span>
          </div>
          <p style={styles.subtitle}>Lebanese American University — Course Planner</p>
        </div>

        <div style={styles.card}>
          <div style={styles.tabRow}>
            <button style={styles.tabBtn(tab === "login")} onClick={() => setTab("login")}>
              Sign in
            </button>
            <button style={styles.tabBtn(tab === "register")} onClick={() => setTab("register")}>
              Register
            </button>
          </div>

          <div style={styles.body}>
            {tab === "login" ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>

        <p style={styles.footer}>Lebanese American University © 2026</p>
      </div>
    </div>
  );
}