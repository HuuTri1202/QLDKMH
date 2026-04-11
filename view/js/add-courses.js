const API = "http://localhost:3000/courses";

document.getElementById("form").onsubmit = async (e) => {
  e.preventDefault();

  const data = {
    courseCode: document.getElementById("code").value,
    courseName: document.getElementById("name").value,
    instructor: document.getElementById("teacher").value,
    courseType: document.getElementById("type").value,
    schedule: [
      {
        type: "Lý thuyết",
        dayOfWeek: "Thứ 2",
        startTime: "07:00",
        endTime: "09:00",
        location: "B1.01"
      }
    ],
    maxCapacity: 40
  };

  const res = await fetch(`${API}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message || "Tạo thành công");

  window.location.href = "courses.html";
};