const API = "http://localhost:3000/courses";

const params = new URLSearchParams(window.location.search);
const code = params.get("code");

// format time
function formatTime(time) {
  if (!time) return "";

  if (/^\d{2}:\d{2}$/.test(time)) return time;

  const d = new Date(time);
  if (!isNaN(d)) return d.toTimeString().slice(0, 5);

  return "";
}

// load
async function loadCourse() {
  const res = await fetch(`${API}/${code}`);
  const data = await res.json();

  document.getElementById("code").value = data.courseCode;
  document.getElementById("name").value = data.courseName;
  document.getElementById("teacher").value = data.instructor;
  document.getElementById("type").value = data.courseType;
  document.getElementById("capacity").value = data.maxCapacity;
  document.getElementById("status").value = data.status;

  if (data.schedule && data.schedule.length > 0) {
    const s = data.schedule[0];

    document.getElementById("scheduleType").value = s.type;
    document.getElementById("day").value = s.dayOfWeek;
    document.getElementById("startTime").value = formatTime(s.startTime);
    document.getElementById("endTime").value = formatTime(s.endTime);
    document.getElementById("location").value = s.location;
  }
}

// validate
function validateTime(start, end) {
  const errorEl = document.getElementById("timeError");

  if (!start || !end) {
    errorEl.innerText = "⚠️ Phải nhập đủ giờ bắt đầu và kết thúc";
    return false;
  }

  if (start >= end) {
    errorEl.innerText = "⚠️ Giờ kết thúc phải lớn hơn giờ bắt đầu";
    return false;
  }

  errorEl.innerText = "";
  return true;
}

// submit
document.getElementById("form").onsubmit = async (e) => {
  e.preventDefault();

  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  if (!validateTime(startTime, endTime)) return;

  const updated = {
    courseName: document.getElementById("name").value,
    instructor: document.getElementById("teacher").value,
    courseType: document.getElementById("type").value,
    maxCapacity: Number(document.getElementById("capacity").value),
    status: document.getElementById("status").value,

    schedule: [
      {
        type: document.getElementById("scheduleType").value,
        dayOfWeek: document.getElementById("day").value,
        startTime: startTime,
        endTime: endTime,
        location: document.getElementById("location").value
      }
    ]
  };

  const res = await fetch(`${API}/update/${code}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated)
  });

  const result = await res.json();

  if (!res.ok) {
    alert("Lỗi: " + result.message);
    return;
  }

  alert("Cập nhật thành công");
  window.location.href = "courses.html";
};

loadCourse();