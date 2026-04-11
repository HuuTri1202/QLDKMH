const API = "http://localhost:3000/courses";

const params = new URLSearchParams(window.location.search);
const code = params.get("code");

async function loadCourse() {
  const res = await fetch(`${API}/${code}`);
  const data = await res.json();

  document.getElementById("name").value = data.courseName;
  document.getElementById("teacher").value = data.instructor;
}

document.getElementById("form").onsubmit = async (e) => {
  e.preventDefault();

  const updated = {
    courseName: document.getElementById("name").value,
    instructor: document.getElementById("teacher").value
  };

  await fetch(`${API}/update/${code}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated)
  });

  alert("Cập nhật thành công");
  window.location.href = "courses.html";
};

loadCourse();