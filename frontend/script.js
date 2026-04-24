const API_URL = 'https://ciht-smart-portal.onrender.com/api';
let currentUser = null;
let currentPage = 'dashboard';

// Login Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showDashboard();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
});

function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    // Show appropriate menu based on role
    document.getElementById('adminMenu').style.display = currentUser.role === 'admin' ? 'block' : 'none';
    document.getElementById('teacherMenu').style.display = currentUser.role === 'teacher' ? 'block' : 'none';
    document.getElementById('studentMenu').style.display = currentUser.role === 'student' ? 'block' : 'none';
    
    document.getElementById('userName').innerHTML = 
        `<i class="fas fa-user-circle"></i> ${currentUser.name || currentUser.username}`;
    
    // 🔥 FIX: attach events AFTER menu visible
    attachSidebarEvents();
    
    loadPage('dashboard');
}

// Navigation
// ✅ ADD THIS
function attachSidebarEvents() {
    document.querySelectorAll('.sidebar-nav a[data-page]').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            console.log("Clicked:", page);
            loadPage(page);
        };
    });
}
// Load Page Content
async function loadPage(page) {
    currentPage = page;
    const contentArea = document.getElementById('contentArea');
    
    switch(page) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'branches':
            await loadBranches();
            break;
        case 'students':
            await loadStudents();
            break;
        case 'teachers':
            await loadTeachers();
            break;
        case 'attendance':
            await loadAttendance();
            break;
        case 'marks':
            await loadMarks();
            break;
        case 'notices':
            await loadNotices();
            break;
        case 'timetable':
            await loadTimeTable();
            break;
        case 'reports':
            await loadReports();
            break;
        case 'profile':
            await loadProfile();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    const contentArea = document.getElementById('contentArea');
    
    if (currentUser.role === 'admin') {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const stats = await response.json();
        
        contentArea.innerHTML = `
            <h2>Dashboard</h2>
            <div class="stats-grid">
                <div class="stat-card" onclick="loadPage('branches')">
                    <i class="fas fa-code-branch"></i>
                    <h3>Total Branches</h3>
                    <div class="stat-value">${stats.totalBranches || 0}</div>
                </div>
                <div class="stat-card" onclick="loadPage('students')">
                    <i class="fas fa-user-graduate"></i>
                    <h3>Total Students</h3>
                    <div class="stat-value">${stats.totalStudents || 0}</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-calendar-check"></i>
                    <h3>Attendance Average</h3>
                    <div class="stat-value">${stats.attendanceAverage || 0}%</div>
                </div>
            </div>
        `;
    } else if (currentUser.role === 'teacher') {
        const response = await fetch(`${API_URL}/teacher/stats`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const stats = await response.json();
        
        contentArea.innerHTML = `
            <h2>Teacher Dashboard</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-user-graduate"></i>
                    <h3>Total Students</h3>
                    <div class="stat-value">${stats.totalStudents || 0}</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-calendar-check"></i>
                    <h3>Today's Attendance</h3>
                    <div class="stat-value">${stats.todayAttendance || 0}</div>
                </div>
            </div>
        `;
    } else if (currentUser.role === 'student') {
        const attendanceResponse = await fetch(`${API_URL}/student/attendance`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const attendance = await attendanceResponse.json();
        
        contentArea.innerHTML = `
            <h2>Student Dashboard</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-calendar-check"></i>
                    <h3>Attendance Percentage</h3>
                    <div class="stat-value ${attendance.percentage < 75 ? 'attendance-warning' : ''}">
                        ${attendance.percentage}%
                    </div>
                    ${attendance.percentage < 75 ? '<div class="attendance-warning">⚠️ Low Attendance Warning!</div>' : ''}
                </div>
                <div class="stat-card">
                    <i class="fas fa-chart-line"></i>
                    <h3>Total Lectures</h3>
                    <div class="stat-value">${attendance.totalLectures}</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-user-check"></i>
                    <h3>Present Days</h3>
                    <div class="stat-value">${attendance.present}</div>
                </div>
            </div>
        `;
    }
}

// Load Students
async function loadStudents() {
    const endpoint = currentUser.role === 'admin' ? '/admin/students' : '/teacher/students';
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const students = await response.json();
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2>Student Management</h2>
            <button class="btn-primary" onclick="showAddStudentModal()">Add Student</button>
        </div>
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Roll Number</th>
                        <th>Name</th>
                        <th>Branch</th>
                        <th>Semester</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => `
                        <tr>
                            <td>${student.rollNumber}</td>
                            <td>${student.name}</td>
                            <td>${student.branch}</td>
                            <td>${student.semester}</td>
                            <td>${student.phone}</td>
                            <td>
                                <button class="btn-primary" onclick="editStudent('${student._id}')">Edit</button>
                                <button class="btn-danger" onclick="deleteStudent('${student._id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Show Add Student Modal
function showAddStudentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add Student</h3>
            <form id="addStudentForm">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" name="name" required class="form-control">
                </div>
                <div class="form-group">
                    <label>Roll Number</label>
                    <input type="text" name="rollNumber" required class="form-control">
                </div>
                <div class="form-group">
                    <label>Branch</label>
                    <select name="branch" required class="form-control">
                        <option value="CSE">CSE</option>
                        <option value="EE">EE</option>
                        <option value="ME">ME</option>
                        <option value="Tool and Die">Tool and Die</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Semester</label>
                    <input type="number" name="semester" required class="form-control">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="text" name="phone" required class="form-control">
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <textarea name="address" required class="form-control"></textarea>
                </div>
                <button type="submit" class="btn-success">Submit</button>
                <button type="button" class="btn-danger" onclick="this.closest('.modal').remove()">Cancel</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        const endpoint = currentUser.role === 'admin' ? '/admin/students' : '/teacher/students';
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            modal.remove();
            loadStudents();
            alert('Student added successfully! Login credentials: Username = Roll Number, Password = Roll Number@123');
        } else {
            const error = await response.json();
            alert(error.message || 'Error adding student');
        }
    });
}

// Delete Student
async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        const endpoint = currentUser.role === 'admin' ? '/admin/students' : '/teacher/students';
        const response = await fetch(`${API_URL}${endpoint}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
            loadStudents();
            alert('Student deleted successfully');
        } else {
            alert('Error deleting student');
        }
    }
}

// Load Attendance
async function loadAttendance() {
    if (currentUser.role === 'teacher') {
        const response = await fetch(`${API_URL}/teacher/students`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const students = await response.json();
        
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <h2>Mark Attendance</h2>
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Roll Number</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(student => `
                            <tr>
                                <td>${student.rollNumber}</td>
                                <td>${student.name}</td>
                                <td>
                                    <select id="status_${student._id}">
                                        <option value="present">Present</option>
                                        <option value="absent">Absent</option>
                                    </select>
                                </td>
                                <td>
                                    <button class="btn-primary" onclick="markAttendance('${student._id}')">Mark</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (currentUser.role === 'student') {
        const response = await fetch(`${API_URL}/student/attendance`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const attendance = await response.json();
        
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <h2>My Attendance</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Lectures</h3>
                    <div class="stat-value">${attendance.totalLectures}</div>
                </div>
                <div class="stat-card">
                    <h3>Present</h3>
                    <div class="stat-value">${attendance.present}</div>
                </div>
                <div class="stat-card">
                    <h3>Percentage</h3>
                    <div class="stat-value ${attendance.percentage < 75 ? 'attendance-warning' : ''}">
                        ${attendance.percentage}%
                    </div>
                </div>
            </div>
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Subject</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${attendance.attendance.map(record => `
                            <tr>
                                <td>${new Date(record.date).toLocaleDateString()}</td>
                                <td>${record.subject || 'General'}</td>
                                <td>${record.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Mark Attendance
async function markAttendance(studentId) {
    const status = document.getElementById(`status_${studentId}`).value;
    const date = new Date().toISOString().split('T')[0];
    
    const response = await fetch(`${API_URL}/teacher/attendance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, date, status })
    });
    
    if (response.ok) {
        alert('Attendance marked successfully');
    } else {
        alert('Error marking attendance');
    }
}

// Load Marks
async function loadMarks() {
    if (currentUser.role === 'teacher') {
        const studentsResponse = await fetch(`${API_URL}/teacher/students`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const students = await studentsResponse.json();
        
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <h2>Enter Marks</h2>
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Subject</th>
                            <th>Exam Type</th>
                            <th>Marks</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(student => `
                            <tr>
                                <td>${student.name} (${student.rollNumber})</td>
                                <td><input type="text" id="subject_${student._id}" placeholder="Subject" class="form-control"></td>
                                <td>
                                    <select id="examType_${student._id}">
                                        <option value="mst">MST</option>
                                        <option value="semester">Semester</option>
                                    </select>
                                </td>
                                <td><input type="number" id="marks_${student._id}" placeholder="Marks" class="form-control"></td>
                                <td><button class="btn-primary" onclick="addMarks('${student._id}')">Add</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (currentUser.role === 'student') {
        const response = await fetch(`${API_URL}/student/marks`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const marks = await response.json();
        
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <h2>My Marks</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>MST Average</h3>
                    <div class="stat-value">
                        ${marks.mstMarks.length ? (marks.mstMarks.reduce((a,b) => a + b.marks, 0) / marks.mstMarks.length).toFixed(2) : 0}%
                    </div>
                </div>
                <div class="stat-card">
                    <h3>Semester Average</h3>
                    <div class="stat-value">
                        ${marks.semesterMarks.length ? (marks.semesterMarks.reduce((a,b) => a + b.marks, 0) / marks.semesterMarks.length).toFixed(2) : 0}%
                    </div>
                </div>
            </div>
            <div class="data-table">
                <h3>MST Marks</h3>
                <table>
                    <thead>
                        <tr><th>Subject</th><th>Marks</th></tr>
                    </thead>
                    <tbody>
                        ${marks.mstMarks.map(m => `<tr><td>${m.subject}</td><td>${m.marks}</td></tr>`).join('')}
                    </tbody>
                </table>
                
                <h3 style="margin-top: 20px;">Semester Marks</h3>
                <table>
                    <thead>
                        <tr><th>Subject</th><th>Marks</th></tr>
                    </thead>
                    <tbody>
                        ${marks.semesterMarks.map(m => `<tr><td>${m.subject}</td><td>${m.marks}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Add Marks
async function addMarks(studentId) {
    const subject = document.getElementById(`subject_${studentId}`).value;
    const examType = document.getElementById(`examType_${studentId}`).value;
    const marks = document.getElementById(`marks_${studentId}`).value;
    
    if (!subject || !marks) {
        alert('Please fill all fields');
        return;
    }
    
    const response = await fetch(`${API_URL}/teacher/marks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, subject, examType, marks: parseInt(marks) })
    });
    
    if (response.ok) {
        alert('Marks added successfully');
        loadMarks();
    } else {
        alert('Error adding marks');
    }
}

// Load Notices
async function loadNotices() {
    let endpoint = '';
    if (currentUser.role === 'admin') endpoint = '/admin/notices';
    else if (currentUser.role === 'teacher') endpoint = '/teacher/notices';
    else endpoint = '/student/notices';
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const notices = await response.json();
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2>Notices & Updates</h2>
            ${currentUser.role === 'admin' ? '<button class="btn-primary" onclick="showAddNoticeModal()">Post Notice</button>' : ''}
        </div>
        <div class="notices-list">
            ${notices.map(notice => `
                <div class="stat-card" style="margin-bottom: 15px;">
                    <h3>${notice.title}</h3>
                    <p>${notice.message}</p>
                    <small>Posted on: ${new Date(notice.createdAt).toLocaleDateString()} by ${notice.postedBy}</small>
                    ${notice.fileUrl ? `<br><a href="${notice.fileUrl}" target="_blank">Download Attachment</a>` : ''}
                    ${currentUser.role === 'admin' ? `<br><button class="btn-danger" onclick="deleteNotice('${notice._id}')" style="margin-top: 10px;">Delete</button>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Show Add Notice Modal
function showAddNoticeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Post Notice</h3>
            <form id="addNoticeForm">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" required class="form-control">
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea name="message" required class="form-control"></textarea>
                </div>
                <div class="form-group">
                    <label>Branch (Optional)</label>
                    <select name="branch" class="form-control">
                        <option value="all">All Branches</option>
                        <option value="CSE">CSE</option>
                        <option value="EE">EE</option>
                        <option value="ME">ME</option>
                    </select>
                </div>
                <button type="submit" class="btn-success">Post</button>
                <button type="button" class="btn-danger" onclick="this.closest('.modal').remove()">Cancel</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    document.getElementById('addNoticeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        data.postedBy = currentUser.username;
        
        const response = await fetch(`${API_URL}/admin/notices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            modal.remove();
            loadNotices();
            alert('Notice posted successfully');
        } else {
            alert('Error posting notice');
        }
    });
}

// Delete Notice
async function deleteNotice(id) {
    if (confirm('Are you sure you want to delete this notice?')) {
        const response = await fetch(`${API_URL}/admin/notices/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
            loadNotices();
            alert('Notice deleted successfully');
        } else {
            alert('Error deleting notice');
        }
    }
}

// Load Time Table
async function loadTimeTable() {
    let endpoint = '';
    if (currentUser.role === 'admin') endpoint = '/admin/timetable';
    else if (currentUser.role === 'teacher') endpoint = '/teacher/timetable';
    else endpoint = '/student/timetable';
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2>Time Table</h2>
        ${currentUser.role === 'teacher' ? `
            <button class="btn-primary" onclick="uploadTimeTable()">Upload Time Table</button>
        ` : ''}
        <div id="timetableView"></div>
    `;
    
    if (currentUser.role !== 'admin') {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const timetable = await response.json();
        
        if (timetable && timetable.fileUrl) {
            document.getElementById('timetableView').innerHTML = `
                <div class="stat-card">
                    <h3>Current Time Table</h3>
                    <iframe src="${timetable.fileUrl}" width="100%" height="500px" style="border: none;"></iframe>
                    <a href="${timetable.fileUrl}" download class="btn-primary" style="display: inline-block; margin-top: 10px;">Download PDF</a>
                </div>
            `;
        } else {
            document.getElementById('timetableView').innerHTML = '<p>No time table uploaded yet.</p>';
        }
    }
}

// Upload Time Table
function uploadTimeTable() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Upload Time Table</h3>
            <form id="uploadTimetableForm" enctype="multipart/form-data">
                <div class="form-group">
                    <label>Semester</label>
                    <input type="number" name="semester" required class="form-control">
                </div>
                <div class="form-group">
                    <label>PDF File</label>
                    <input type="file" name="file" accept=".pdf" required class="form-control">
                </div>
                <button type="submit" class="btn-success">Upload</button>
                <button type="button" class="btn-danger" onclick="this.closest('.modal').remove()">Cancel</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    document.getElementById('uploadTimetableForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append('uploadedBy', currentUser.username);
        
        // First upload file
        const uploadResponse = await fetch(`${API_URL}/upload/timetable`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        
        const uploadData = await uploadResponse.json();
        
        if (uploadResponse.ok) {
            // Then save timetable info
            const response = await fetch(`${API_URL}/teacher/timetable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    semester: parseInt(formData.get('semester')),
                    fileUrl: uploadData.fileUrl,
                    uploadedBy: currentUser.username
                })
            });
            
            if (response.ok) {
                modal.remove();
                loadTimeTable();
                alert('Time table uploaded successfully');
            } else {
                alert('Error saving timetable');
            }
        } else {
            alert('Error uploading file');
        }
    });
}

// Load Branches (Admin only)
async function loadBranches() {
    const response = await fetch(`${API_URL}/admin/branches`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const branches = await response.json();
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2>Branch Management</h2>
            <button class="btn-primary" onclick="showAddBranchModal()">Add Branch</button>
        </div>
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Branch Name</th>
                        <th>Code</th>
                        <th>Years</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${branches.map(branch => `
                        <tr>
                            <td>${branch.name}</td>
                            <td>${branch.code}</td>
                            <td>${branch.years.join(', ')}</td>
                            <td>
                                <button class="btn-primary" onclick="editBranch('${branch._id}')">Edit</button>
                                <button class="btn-danger" onclick="deleteBranch('${branch._id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Show Add Branch Modal
function showAddBranchModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add Branch</h3>
            <form id="addBranchForm">
                <div class="form-group">
                    <label>Branch Name</label>
                    <input type="text" name="name" required class="form-control">
                </div>
                <div class="form-group">
                    <label>Branch Code</label>
                    <input type="text" name="code" required class="form-control">
                </div>
                <div class="form-group">
                    <label>Years (comma-separated)</label>
                    <input type="text" name="years" placeholder="1,2,3,4" required class="form-control">
                </div>
                <button type="submit" class="btn-success">Add</button>
                <button type="button" class="btn-danger" onclick="this.closest('.modal').remove()">Cancel</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    document.getElementById('addBranchForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            code: formData.get('code'),
            years: formData.get('years').split(',').map(y => parseInt(y.trim()))
        };
        
        const response = await fetch(`${API_URL}/admin/branches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            modal.remove();
            loadBranches();
            alert('Branch added successfully');
        } else {
            alert('Error adding branch');
        }
    });
}

// Delete Branch
async function deleteBranch(id) {
    if (confirm('Are you sure you want to delete this branch?')) {
        const response = await fetch(`${API_URL}/admin/branches/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
            loadBranches();
            alert('Branch deleted successfully');
        } else {
            alert('Error deleting branch');
        }
    }
}

// Load Teachers (Admin only)
async function loadTeachers() {
    const response = await fetch(`${API_URL}/admin/teachers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const teachers = await response.json();
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2>Teacher Management</h2>
            <button class="btn-primary" onclick="showAddTeacherModal()">Add Teacher</button>
        </div>
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Branch</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${teachers.map(teacher => `
                        <tr>
                            <td>${teacher.name}</td>
                            <td>${teacher.email}</td>
                            <td>${teacher.phone}</td>
                            <td>${teacher.branch}</td>
                            <td>
                                <button class="btn-primary" onclick="editTeacher('${teacher._id}')">Edit</button>
                                <button class="btn-danger" onclick="deleteTeacher('${teacher._id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Show Add Teacher Modal
function showAddTeacherModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add Teacher</h3>
            <form id="addTeacherForm">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" name="name" required class="form-control">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required class="form-control">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="text" name="phone" required class="form-control">
                </div>
                <div class="form-group">
                    <label>Branch</label>
                    <select name="branch" required class="form-control">
                        <option value="CSE">CSE</option>
                        <option value="EE">EE</option>
                        <option value="ME">ME</option>
                        <option value="Tool and Die">Tool and Die</option>
                    </select>
                </div>
                <button type="submit" class="btn-success">Add</button>
                <button type="button" class="btn-danger" onclick="this.closest('.modal').remove()">Cancel</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    document.getElementById('addTeacherForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        const response = await fetch(`${API_URL}/admin/teachers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            modal.remove();
            loadTeachers();
            alert('Teacher added successfully! Login credentials: Username = email prefix, Password = teacher@123');
        } else {
            alert('Error adding teacher');
        }
    });
}

// Delete Teacher
async function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        const response = await fetch(`${API_URL}/admin/teachers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
            loadTeachers();
            alert('Teacher deleted successfully');
        } else {
            alert('Error deleting teacher');
        }
    }
}

// Load Reports
async function loadReports() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2>Generate Reports</h2>
        <div class="stats-grid">
            <div class="stat-card" onclick="generateStudentReport()">
                <i class="fas fa-file-pdf"></i>
                <h3>Download Student Report</h3>
                <div class="stat-value">PDF Report</div>
            </div>
            <div class="stat-card" onclick="printReport()">
                <i class="fas fa-print"></i>
                <h3>Print Report</h3>
                <div class="stat-value">Print</div>
            </div>
        </div>
        <div id="reportContent" style="margin-top: 30px;"></div>
    `;
}

// Generate Student Report
async function generateStudentReport() {
    if (currentUser.role === 'student') {
        const profileResponse = await fetch(`${API_URL}/student/profile`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const profile = await profileResponse.json();
        
        const attendanceResponse = await fetch(`${API_URL}/student/attendance`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const attendance = await attendanceResponse.json();
        
        const marksResponse = await fetch(`${API_URL}/student/marks`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const marks = await marksResponse.json();
        
        const reportHTML = `
            <div id="reportToPrint" style="padding: 20px; background: white;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2>CIHT Smart Portal</h2>
                    <h3>Student Progress Report</h3>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <h4>Student Information</h4>
                    <p><strong>Name:</strong> ${profile.name}</p>
                    <p><strong>Roll Number:</strong> ${profile.rollNumber}</p>
                    <p><strong>Branch:</strong> ${profile.branch}</p>
                    <p><strong>Semester:</strong> ${profile.semester}</p>
                    <p><strong>Phone:</strong> ${profile.phone}</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <h4>Attendance Summary</h4>
                    <p><strong>Total Lectures:</strong> ${attendance.totalLectures}</p>
                    <p><strong>Present:</strong> ${attendance.present}</p>
                    <p><strong>Percentage:</strong> ${attendance.percentage}%</p>
                    ${attendance.percentage < 75 ? '<p style="color: red;">⚠️ Low Attendance Warning!</p>' : ''}
                </div>
                <div style="margin-bottom: 20px;">
                    <h4>Marks Summary</h4>
                    <h5>MST Marks</h5>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f2f2f2;">
                            <th style="padding: 8px; border: 1px solid #ddd;">Subject</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Marks</th>
                        </tr>
                        ${marks.mstMarks.map(m => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">${m.subject}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${m.marks}</td>
                            </tr>
                        `).join('')}
                    </table>
                    <h5 style="margin-top: 15px;">Semester Marks</h5>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f2f2f2;">
                            <th style="padding: 8px; border: 1px solid #ddd;">Subject</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Marks</th>
                        </tr>
                        ${marks.semesterMarks.map(m => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">${m.subject}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${m.marks}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
                <div style="margin-top: 30px; text-align: center;">
                    <p>CIHT Smart Portal - Developed by Jaskaran Singh Aasi</p>
                </div>
            </div>
        `;
        
        document.getElementById('reportContent').innerHTML = reportHTML;
        
        // Use html2pdf to download
        const element = document.getElementById('reportToPrint');
        html2pdf().from(element).save('student_report.pdf');
    }
}

// Print Report
function printReport() {
    const printContent = document.getElementById('reportToPrint').innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    location.reload();
}

// Load Profile (Student)
async function loadProfile() {
    const response = await fetch(`${API_URL}/student/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const profile = await response.json();
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2>My Profile</h2>
        <div class="stat-card">
            <div style="text-align: center;">
                ${profile.photo ? `<img src="${profile.photo}" style="width: 150px; height: 150px; border-radius: 50%; margin-bottom: 20px;">` : '<i class="fas fa-user-circle" style="font-size: 100px; color: #667eea;"></i>'}
                <h3>${profile.name}</h3>
                <p>Roll Number: ${profile.rollNumber}</p>
                <p>Branch: ${profile.branch}</p>
                <p>Semester: ${profile.semester}</p>
                <p>Phone: ${profile.phone}</p>
                <p>Address: ${profile.address}</p>
            </div>
        </div>
    `;
}

// Check if user is already logged in
window.addEventListener('load', () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        showDashboard();
    }
});
