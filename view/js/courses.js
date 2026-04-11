const API = "http://localhost:3000/courses";

async function loadCourses() {
  try {
    const res = await fetch(`${API}/all`);
    const courses = await res.json();

    console.log("DATA:", courses); // debug

    const container = document.getElementById("courseList");
    container.innerHTML = "";

    courses.forEach(course => {
      const div = document.createElement("div");
      div.className = "course";

      // render schedule an toàn
      let scheduleHTML = "";

      if (course.schedule && Array.isArray(course.schedule)) {
        course.schedule.forEach(s => {
          scheduleHTML += `
            <li>
              ${s.type ? s.type + " - " : ""}
              ${s.dayOfWeek} | ${s.startTime} - ${s.endTime} | ${s.location}
            </li>
          `;
        });
      }

      div.innerHTML = `
        <h3>${course.courseName}</h3>
        <p><b>Mã:</b> ${course.courseCode}</p>
        <p><b>Giảng viên:</b> ${course.instructor}</p>
        <p><b>Loại:</b> ${course.courseType}</p>
        <p><b>Sĩ số:</b> ${course.currentEnrollment}/${course.maxCapacity}</p>

        <ul>${scheduleHTML}</ul>

        <button onclick="deleteCourse('${course.courseCode}')">🗑 Xóa</button>
        <button onclick="goEdit('${course.courseCode}')">✏️ Sửa</button>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error("Lỗi loadCourses:", err);
    alert("Không load được dữ liệu!");
  }
}

// DELETE
async function deleteCourse(code) {
  if (!confirm("Bạn chắc chắn muốn xóa?")) return;

  try {
    await fetch(`${API}/delete/${code}`, {
      method: "DELETE"
    });

    alert("Đã xóa!");
    loadCourses();
  } catch (err) {
    console.error(err);
    alert("Xóa thất bại!");
  }
}

// chuyển sang trang edit
function goEdit(code) {
  window.location.href = `edit-course.html?code=${code}`;
}

// load khi mở trang
loadCourses();