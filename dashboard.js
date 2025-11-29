// Dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  const user = auth.getCurrentUser();
  loadDashboard(user);
});

function loadDashboard(user) {
  // Display user name
  document.getElementById('userName').textContent = user.fullName;

  // Show admin link if user is admin
  if (auth.isAdmin()) {
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
      adminLink.style.display = 'block';
    }
  }

  // Load stats
  loadStats(user);

  // Load current week
  loadCurrentWeek(user);

  // Load continue learning courses
  loadContinueCourses(user);

  // Load upcoming events
  loadUpcomingEvents();

  // Load recent activity
  loadRecentActivity(user);
}

function loadStats(user) {
  const courses = getAllCourses();
  const enrolled = user.enrolled || [];
  const completed = user.completedCourses || [];
  
  document.getElementById('enrolledCourses').textContent = enrolled.length;
  document.getElementById('completedCourses').textContent = completed.length;
  
  // Calculate overall progress
  let totalProgress = 0;
  enrolled.forEach(courseId => {
    const progress = user.progress[courseId] || 0;
    totalProgress += progress;
  });
  
  const averageProgress = enrolled.length > 0 ? Math.round(totalProgress / enrolled.length) : 0;
  document.getElementById('progressPercent').textContent = averageProgress + '%';
  
  document.getElementById('certificatesEarned').textContent = completed.length;
}

function loadCurrentWeek(user) {
  const weekNumber = user.currentWeek || 1;
  const weekData = getWeekData(weekNumber);
  
  document.getElementById('weekNumber').textContent = weekNumber;
  document.getElementById('weekTitle').textContent = weekData.title;
  document.getElementById('weekDescription').textContent = weekData.description;
  
  // Get week progress
  const weekCourses = getAllCourses().filter(c => c.week === weekNumber);
  let completedInWeek = 0;
  
  weekCourses.forEach(course => {
    if (user.completedCourses && user.completedCourses.includes(course.id)) {
      completedInWeek++;
    }
  });
  
  const weekProgress = weekCourses.length > 0 ? Math.round((completedInWeek / weekCourses.length) * 100) : 0;
  document.getElementById('weekProgress').style.width = weekProgress + '%';
  document.getElementById('weekProgressText').textContent = weekProgress + '% Complete';
}

function loadContinueCourses(user) {
  const container = document.getElementById('continueCoursesContainer');
  const courses = getAllCourses();
  const enrolled = user.enrolled || [];
  
  if (enrolled.length === 0) {
    container.innerHTML = '<p>You haven\'t enrolled in any courses yet. <a href="courses.html">Browse courses</a></p>';
    return;
  }
  
  let html = '';
  enrolled.slice(0, 3).forEach(courseId => {
    const course = courses.find(c => c.id === courseId);
    if (course && !user.completedCourses.includes(courseId)) {
      const progress = user.progress[courseId] || 0;
      html += `
        <div class="course-card-small">
          <h4>${course.title}</h4>
          <p>${course.category}</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <p class="progress-text">${progress}% Complete</p>
          <a href="course-view.html?id=${course.id}" class="cta-button small">Continue</a>
        </div>
      `;
    }
  });
  
  container.innerHTML = html || '<p>No courses in progress</p>';
}

function loadUpcomingEvents() {
  const container = document.getElementById('upcomingEvents');
  const events = getUpcomingEvents();
  
  if (events.length === 0) {
    container.innerHTML = '<p>No upcoming events scheduled</p>';
    return;
  }
  
  let html = '';
  events.slice(0, 3).forEach(event => {
    const date = new Date(event.date);
    html += `
      <div class="event-card">
        <div class="event-date">
          <span class="day">${date.getDate()}</span>
          <span class="month">${date.toLocaleString('default', { month: 'short' })}</span>
        </div>
        <div class="event-info">
          <h4>${event.title}</h4>
          <p>${event.description}</p>
          <p class="event-time">${event.time}</p>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function loadRecentActivity(user) {
  const container = document.getElementById('recentActivity');
  const activities = getUserActivities(user.id);
  
  if (activities.length === 0) {
    container.innerHTML = '<p>No recent activity</p>';
    return;
  }
  
  let html = '';
  activities.slice(0, 5).forEach(activity => {
    const date = new Date(activity.date);
    const timeAgo = getTimeAgo(date);
    html += `
      <div class="activity-item">
        <div class="activity-icon">${getActivityIcon(activity.type)}</div>
        <div class="activity-content">
          <p>${activity.description}</p>
          <span class="activity-time">${timeAgo}</span>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Helper functions
function getWeekData(weekNumber) {
  const weeks = {
    1: { title: 'Growth Mindset & Goal Setting', description: 'Vision setting, SMART goals, accountability' },
    2: { title: 'Communication Mastery', description: 'Business writing, active listening, digital etiquette' },
    3: { title: 'EQ & Professionalism', description: 'Conflict resolution, time management, workplace ethics' },
    4: { title: 'Personal Branding & Networking', description: 'LinkedIn optimization, elevator pitches, mentorship' },
    5: { title: 'Core Digital Tools', description: 'Productivity and collaboration software mastery' },
    6: { title: 'Digital Marketing & SEO', description: 'Promoting self/business online effectively' },
    7: { title: 'Financial Literacy', description: 'Budgeting, credit, cash flow management' },
    8: { title: 'Introduction to Investing', description: 'Stocks, bonds, retirement funds' },
    9: { title: 'Problem Solving & Critical Thinking', description: 'Applied frameworks and case studies' },
    10: { title: 'Job/Business Development', description: 'Resumes, interviews, proposals' },
    11: { title: 'Negotiation & Contracts', description: 'Salary negotiation, client agreements' },
    12: { title: 'Capstone Project', description: 'Apply all skills to a real project' }
  };
  
  return weeks[weekNumber] || weeks[1];
}

function getAllCourses() {
  const courses = localStorage.getItem('courses');
  return courses ? JSON.parse(courses) : getDefaultCourses();
}

function getDefaultCourses() {
  const defaultCourses = [
    {
      id: 'course_1',
      title: 'Introduction to Growth Mindset',
      category: 'productivity',
      phase: 1,
      week: 1,
      description: 'Learn how to develop a growth mindset for professional success',
      duration: 45,
      lessons: [
        { id: 'lesson_1_1', title: 'What is Growth Mindset?', duration: 15, type: 'video' },
        { id: 'lesson_1_2', title: 'Fixed vs Growth Mindset', duration: 20, type: 'video' },
        { id: 'lesson_1_3', title: 'Growth Mindset Quiz', duration: 10, type: 'quiz' }
      ]
    },
    {
      id: 'course_2',
      title: 'SMART Goal Setting',
      category: 'productivity',
      phase: 1,
      week: 1,
      description: 'Master the art of setting and achieving SMART goals',
      duration: 60,
      lessons: [
        { id: 'lesson_2_1', title: 'Understanding SMART Goals', duration: 20, type: 'video' },
        { id: 'lesson_2_2', title: 'Creating Your Goals', duration: 30, type: 'exercise' },
        { id: 'lesson_2_3', title: 'Goal Tracking Strategies', duration: 10, type: 'video' }
      ]
    },
    {
      id: 'course_3',
      title: 'Effective Communication Skills',
      category: 'productivity',
      phase: 1,
      week: 2,
      description: 'Develop professional communication skills for the workplace',
      duration: 90,
      lessons: [
        { id: 'lesson_3_1', title: 'Business Writing Basics', duration: 30, type: 'video' },
        { id: 'lesson_3_2', title: 'Active Listening Techniques', duration: 30, type: 'video' },
        { id: 'lesson_3_3', title: 'Digital Communication Etiquette', duration: 30, type: 'video' }
      ]
    }
  ];
  
  localStorage.setItem('courses', JSON.stringify(defaultCourses));
  return defaultCourses;
}

function getUpcomingEvents() {
  const events = localStorage.getItem('events');
  if (events) return JSON.parse(events);
  
  const defaultEvents = [
    {
      id: 'event_1',
      title: 'Weekly Mastermind: Building Your Brand',
      description: 'Interactive session on personal branding strategies',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      time: '2:00 PM - 3:30 PM',
      type: 'mastermind'
    },
    {
      id: 'event_2',
      title: 'Guest Speaker: Financial Planning',
      description: 'Learn from an expert about smart financial decisions',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      time: '6:00 PM - 7:00 PM',
      type: 'workshop'
    }
  ];
  
  localStorage.setItem('events', JSON.stringify(defaultEvents));
  return defaultEvents;
}

function getUserActivities(userId) {
  const activities = localStorage.getItem('activities_' + userId);
  return activities ? JSON.parse(activities) : [];
}

function addActivity(userId, type, description) {
  const activities = getUserActivities(userId);
  activities.unshift({
    id: 'activity_' + Date.now(),
    type,
    description,
    date: new Date().toISOString()
  });
  localStorage.setItem('activities_' + userId, JSON.stringify(activities));
}

function getActivityIcon(type) {
  const icons = {
    course_complete: '✅',
    course_start: '📚',
    post_create: '💬',
    job_apply: '💼',
    achievement: '🏆',
    login: '👋'
  };
  return icons[type] || '📌';
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return 'Just now';
}
