const API = "http://localhost:3000";
let currentStudent = null;
let allCourses = [];

// Tải danh sách sinh viên
async function loadStudents() {
  try {
    const res = await fetch(`${API}/students`);
    const students = await res.json();
    const select = document.getElementById("studentSelect");
    select.innerHTML = '<option value="">-- Chọn sinh viên --</option>';
    students.forEach((s) => {
      const option = document.createElement("option");
      option.value = s._id;
      option.textContent = `${s.studentId} - ${s.fullName} (${s.major})`;
      select.appendChild(option);
    });
    select.onchange = () => {
      const selectedId = select.value;
      if (selectedId) {
        currentStudent = students.find((s) => s._id === selectedId);
        document.getElementById("studentDetail").innerHTML =
          `Đang đăng ký cho: <strong>${currentStudent.fullName}</strong> (${currentStudent.studentId})<br>Email: ${currentStudent.email} | Ngành: ${currentStudent.major}`;
        loadAvailableCourses();
        loadEnrolledCourses();
      } else {
        currentStudent = null;
        document.getElementById("courseList").innerHTML = "";
        document.getElementById("enrolledCourses").innerHTML = "";
        document.getElementById("totalCredits").innerHTML = "";
      }
    };
  } catch (err) {
    console.error(err);
  }
}

// Lấy danh sách môn chưa đăng ký
async function loadAvailableCourses() {
  if (!currentStudent) return;
  try {
    const coursesRes = await fetch(`${API}/courses`);
    allCourses = await coursesRes.json();
    const enrolledRes = await fetch(
      `${API}/enrollments?studentId=${currentStudent._id}`,
    );
    const enrollments = await enrolledRes.json();
    const enrolledIds = enrollments.map((e) => e.course._id);
    const available = allCourses.filter((c) => !enrolledIds.includes(c._id));
    renderAvailableCourses(available);
  } catch (err) {
    console.error(err);
  }
}

function renderAvailableCourses(courses) {
  const container = document.getElementById("courseList");
  if (courses.length === 0) {
    container.innerHTML = "<p>🎉 Bạn đã đăng ký tất cả các môn hiện có.</p>";
    return;
  }

  // Nhóm môn học theo courseType
  const grouped = courses.reduce((acc, c) => {
    const type = c.courseType || "Khác";
    if (!acc[type]) acc[type] = [];
    acc[type].push(c);
    return acc;
  }, {});

  container.innerHTML = Object.keys(grouped)
    .map(
      (type) => `
    <h3>${type}</h3>
    ${grouped[type]
      .map(
        (c) => `
    <div class="course-item">
      <strong>${c.courseCode} - ${c.courseName}</strong><br>
      Tín chỉ: ${c.credits} | GV: ${c.instructor}<br>
      Lịch: ${Array.isArray(c.schedule) ? c.schedule.map(s => `${s.dayOfWeek} ${s.startTime}-${s.endTime} (${s.location})`).join(', ') : 'Chưa có'} | Chỗ: ${c.maxCapacity - c.enrolledCount}/${c.maxCapacity}
      <br><button class="btn-reg" data-id="${c._id}" data-credits="${c.credits}">➕ Đăng ký</button>
    </div>
  `,
      )
      .join("")}
  `,
    )
    .join("");

  // Gắn sự kiện cho từng nút
  document.querySelectorAll(".btn-reg").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const courseId = btn.dataset.id;
      await enrollCourse(courseId);
    });
  });
}

async function enrollCourse(courseId) {
  try {
    const res = await fetch(`${API}/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student: currentStudent._id, course: courseId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alert("✅ Đăng ký thành công!");
    // Refresh lại danh sách
    loadAvailableCourses();
    loadEnrolledCourses();
  } catch (err) {
    alert("❌ Lỗi: " + err.message);
  }
}

async function loadEnrolledCourses() {
  if (!currentStudent) return;
  try {
    const res = await fetch(`${API}/enrollments?studentId=${currentStudent._id}`);
    const enrollments = await res.json();
    renderEnrolledCourses(enrollments);
    calculateTotalCredits(enrollments);
  } catch (err) {
    console.error(err);
  }
}

function renderEnrolledCourses(enrollments) {
  const container = document.getElementById("enrolledCourses");
  if (enrollments.length === 0) {
    container.innerHTML = "<p>Chưa đăng ký môn nào.</p>";
    return;
  }
  container.innerHTML = enrollments
    .map(
      (e) => `
    <div class="course-item">
      <strong>${e.course.courseCode} - ${e.course.courseName}</strong><br>
      Tín chỉ: ${e.course.credits} | Lịch: ${Array.isArray(e.course.schedule) ? e.course.schedule.map(s => `${s.dayOfWeek} ${s.startTime}-${s.endTime} (${s.location})`).join(', ') : 'Chưa có'}
      <br><button class="btn-reg btn-cancel" data-enroll="${e._id}">❌ Hủy đăng ký</button>
    </div>
  `,
    )
    .join("");
  // Gắn sự kiện hủy
  document.querySelectorAll(".btn-cancel").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const enrollId = btn.dataset.enroll;
      if (confirm("Bạn có chắc muốn hủy môn này?")) {
        await cancelEnrollment(enrollId);
      }
    });
  });
}

async function cancelEnrollment(enrollId) {
  try {
    const res = await fetch(`${API}/enrollments/${enrollId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Hủy thất bại");
    alert("🗑️ Đã hủy đăng ký");
    loadAvailableCourses();
    loadEnrolledCourses();
  } catch (err) {
    alert(err.message);
  }
}

function calculateTotalCredits(enrollments) {
  const total = enrollments.reduce((sum, e) => sum + e.course.credits, 0);
  document.getElementById("totalCredits").innerHTML =
    `📊 Tổng số tín chỉ đã đăng ký: ${total}`;
}

// Khởi chạy
loadStudents();
