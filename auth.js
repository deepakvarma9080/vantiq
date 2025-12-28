/* ================= SIGNUP ================= */
async function signupUser() {
  const fullname = document.getElementById("fullname").value;
  const contact = document.getElementById("contact").value;
  const password = document.getElementById("signupPassword").value;

  const res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullname, contact, password })
  });

  const data = await res.json();
  alert(data.msg);

  if (res.ok) window.location.href = "login.html";
  return false;
}

/* ================= LOGIN ================= */
async function loginUser() {
  const contact = document.getElementById("loginContact").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact, password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.msg);
    return false;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  window.location.href = "index.html";
  return false;
}

/* ================= RESET PASSWORD ================= */
async function resetPassword() {
  const contact = document.getElementById("email").value;
  const newPassword = document.getElementById("newPassword").value;

  const res = await fetch("http://localhost:5000/api/auth/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact, newPassword })
  });

  const data = await res.json();
  alert(data.msg);

  if (res.ok) window.location.href = "login.html";
  return false;
}
