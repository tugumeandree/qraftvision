// Admin Panel functionality

document.addEventListener('DOMContentLoaded', function() {
  if (!auth.isLoggedIn() || !auth.isAdmin()) {
    alert('Access denied. Admin privileges required.');
    window.location.href = 'dashboard.html';
    return;
  }

  setupTabs();
  loadDashboardStats();
  loadUsersTable();
  loadCoursesTable();
  loadForumPosts();
  setupCourseForm();
});

function setupTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const sections = document.querySelectorAll('.admin-section');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      this.classList.add('active');
      const sectionId = this.getAttribute('data-section');
      document.getElementById(sectionId).classList.add('active');
    });
  });
}

function loadDashboardStats() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  const enrollments = JSON.parse(localStorage.getItem('enrollments')) || [];
  const forumPosts = JSON.parse(localStorage.getItem('forumPosts')) || [];
  
  document.getElementById('totalUsers').textContent = users.length;
  document.getElementById('totalCourses').textContent = courses.length;
  document.getElementById('totalEnrollments').textContent = enrollments.length;
  document.getElementById('activePosts').textContent = forumPosts.length;
  
  loadRecentActivity();
  loadRevenueChart();
}

function loadRecentActivity() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const activityList = document.getElementById('recentActivityList');
  
  let activities = [];
  users.forEach(user => {
    const userActivities = localStorage.getItem('activities_' + user.id);
    if (userActivities) {
      const parsed = JSON.parse(userActivities);
      activities = activities.concat(parsed.map(a => ({...a, username: user.username})));
    }
  });
  
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  activities = activities.slice(0, 10);
  
  if (activities.length === 0) {
    activityList.innerHTML = '<li>No recent activity</li>';
    return;
  }
  
  let html = '';
  activities.forEach(activity => {
    html += `
      <li>
        <strong>${activity.username}</strong> ${activity.description}
        <small>${formatDate(activity.date)}</small>
      </li>
    `;
  });
  
  activityList.innerHTML = html;
}

function loadRevenueChart() {
  const enrollments = JSON.parse(localStorage.getItem('enrollments')) || [];
  const revenue = enrollments.length * 300;
  document.getElementById('totalRevenue').textContent = '$' + revenue.toLocaleString();
}

function loadUsersTable() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const tbody = document.querySelector('#usersTable tbody');
  
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No users found</td></tr>';
    return;
  }
  
  let html = '';
  users.forEach(user => {
    const enrollments = JSON.parse(localStorage.getItem('enrollments')) || [];
    const userEnrollments = enrollments.filter(e => e.userId === user.id).length;
    
    html += `
      <tr>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td><span class="role-badge ${user.role}">${user.role}</span></td>
        <td>${userEnrollments} courses</td>
        <td>
          <button class="action-btn edit" onclick="editUser('${user.id}')">Edit</button>
          ${user.role !== 'admin' ? 
            `<button class="action-btn delete" onclick="deleteUser('${user.id}')">Delete</button>` : 
            '<button class="action-btn" disabled>Admin</button>'
          }
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

function editUser(userId) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.id === userId);
  
  if (!user) return;
  
  const newRole = prompt(`Change role for ${user.username}:\nCurrent: ${user.role}\nEnter new role (user/admin):`, user.role);
  
  if (newRole && (newRole === 'user' || newRole === 'admin')) {
    user.role = newRole;
    localStorage.setItem('users', JSON.stringify(users));
    loadUsersTable();
    alert('User role updated successfully');
  }
}

function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return;
  }
  
  let users = JSON.parse(localStorage.getItem('users')) || [];
  users = users.filter(u => u.id !== userId);
  localStorage.setItem('users', JSON.stringify(users));
  
  let enrollments = JSON.parse(localStorage.getItem('enrollments')) || [];
  enrollments = enrollments.filter(e => e.userId !== userId);
  localStorage.setItem('enrollments', JSON.stringify(enrollments));
  
  localStorage.removeItem('activities_' + userId);
  localStorage.removeItem('courseProgress_' + userId);
  
  loadUsersTable();
  loadDashboardStats();
  alert('User deleted successfully');
}

function loadCoursesTable() {
  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  const tbody = document.querySelector('#coursesTable tbody');
  
  if (courses.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">No courses found</td></tr>';
    return;
  }
  
  let html = '';
  courses.forEach(course => {
    const enrollments = JSON.parse(localStorage.getItem('enrollments')) || [];
    const enrollmentCount = enrollments.filter(e => e.courseId === course.id).length;
    
    html += `
      <tr>
        <td><strong>${course.title}</strong></td>
        <td>Phase ${course.phase}, Week ${course.week}</td>
        <td>${course.format}</td>
        <td>${course.duration}</td>
        <td>${enrollmentCount} students</td>
        <td>
          <button class="action-btn edit" onclick="editCourse('${course.id}')">Edit</button>
          <button class="action-btn delete" onclick="deleteCourse('${course.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

function setupCourseForm() {
  const form = document.getElementById('createCourseForm');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const courseData = {
      id: 'course_' + Date.now(),
      title: document.getElementById('courseTitle').value,
      phase: parseInt(document.getElementById('coursePhase').value),
      week: parseInt(document.getElementById('courseWeek').value),
      description: document.getElementById('courseDescription').value,
      format: document.getElementById('courseFormat').value,
      duration: document.getElementById('courseDuration').value,
      instructor: document.getElementById('courseInstructor').value,
      objectives: document.getElementById('courseObjectives').value.split('\n').filter(o => o.trim()),
      modules: []
    };
    
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    courses.push(courseData);
    localStorage.setItem('courses', JSON.stringify(courses));
    
    alert('Course created successfully!');
    form.reset();
    loadCoursesTable();
    loadDashboardStats();
  });
}

function editCourse(courseId) {
  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  const course = courses.find(c => c.id === courseId);
  
  if (!course) return;
  
  document.getElementById('courseTitle').value = course.title;
  document.getElementById('coursePhase').value = course.phase;
  document.getElementById('courseWeek').value = course.week;
  document.getElementById('courseDescription').value = course.description;
  document.getElementById('courseFormat').value = course.format;
  document.getElementById('courseDuration').value = course.duration;
  document.getElementById('courseInstructor').value = course.instructor;
  document.getElementById('courseObjectives').value = course.objectives.join('\n');
  
  const courseIndex = courses.findIndex(c => c.id === courseId);
  courses.splice(courseIndex, 1);
  localStorage.setItem('courses', JSON.stringify(courses));
  
  loadCoursesTable();
  
  document.querySelector('.admin-tab[data-section="manageCoursesSection"]').click();
}

function deleteCourse(courseId) {
  if (!confirm('Are you sure you want to delete this course? All enrollments will be removed.')) {
    return;
  }
  
  let courses = JSON.parse(localStorage.getItem('courses')) || [];
  courses = courses.filter(c => c.id !== courseId);
  localStorage.setItem('courses', JSON.stringify(courses));
  
  let enrollments = JSON.parse(localStorage.getItem('enrollments')) || [];
  enrollments = enrollments.filter(e => e.courseId !== courseId);
  localStorage.setItem('enrollments', JSON.stringify(enrollments));
  
  loadCoursesTable();
  loadDashboardStats();
  alert('Course deleted successfully');
}

function loadForumPosts() {
  const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
  const container = document.getElementById('moderationPosts');
  
  if (posts.length === 0) {
    container.innerHTML = '<p>No forum posts to moderate</p>';
    return;
  }
  
  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let html = '';
  sortedPosts.forEach(post => {
    const flagged = post.flagged || false;
    
    html += `
      <div class="moderation-item ${flagged ? 'flagged' : ''}">
        <div class="post-header">
          <strong>${post.username}</strong>
          <span class="post-date">${formatDate(post.date)}</span>
          ${flagged ? '<span class="flag-badge">⚠️ Flagged</span>' : ''}
        </div>
        <h4>${post.title}</h4>
        <p>${truncateText(post.content, 200)}</p>
        <div class="moderation-actions">
          <button class="action-btn" onclick="viewFullPost('${post.id}')">View Full</button>
          ${!flagged ? 
            `<button class="action-btn" onclick="flagPost('${post.id}')">Flag</button>` :
            `<button class="action-btn" onclick="unflagPost('${post.id}')">Unflag</button>`
          }
          <button class="action-btn delete" onclick="deletePost('${post.id}')">Delete</button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function viewFullPost(postId) {
  const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
  const post = posts.find(p => p.id === postId);
  
  if (!post) return;
  
  alert(`Title: ${post.title}\n\nAuthor: ${post.username}\n\nContent:\n${post.content}\n\nReplies: ${post.replies ? post.replies.length : 0}`);
}

function flagPost(postId) {
  const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
  const post = posts.find(p => p.id === postId);
  
  if (!post) return;
  
  post.flagged = true;
  localStorage.setItem('forumPosts', JSON.stringify(posts));
  loadForumPosts();
}

function unflagPost(postId) {
  const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
  const post = posts.find(p => p.id === postId);
  
  if (!post) return;
  
  post.flagged = false;
  localStorage.setItem('forumPosts', JSON.stringify(posts));
  loadForumPosts();
}

function deletePost(postId) {
  if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
    return;
  }
  
  let posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
  posts = posts.filter(p => p.id !== postId);
  localStorage.setItem('forumPosts', JSON.stringify(posts));
  
  loadForumPosts();
  loadDashboardStats();
  alert('Post deleted successfully');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString();
}

function truncateText(text, length) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
