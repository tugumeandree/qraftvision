// Courses functionality

document.addEventListener('DOMContentLoaded', function() {
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  loadCourses();
  setupFilters();
  setupModal();
});

function loadCourses(filter = { category: 'all', phase: 'all' }) {
  const coursesGrid = document.getElementById('coursesGrid');
  const courses = getAllCourses();
  const user = auth.getCurrentUser();
  
  let filteredCourses = courses;
  
  // Apply filters
  if (filter.category !== 'all') {
    filteredCourses = filteredCourses.filter(c => c.category === filter.category);
  }
  
  if (filter.phase !== 'all') {
    filteredCourses = filteredCourses.filter(c => c.phase == filter.phase);
  }
  
  if (filteredCourses.length === 0) {
    coursesGrid.innerHTML = '<p class="no-results">No courses found matching your filters</p>';
    return;
  }
  
  let html = '';
  filteredCourses.forEach(course => {
    const isEnrolled = user.enrolled && user.enrolled.includes(course.id);
    const isCompleted = user.completedCourses && user.completedCourses.includes(course.id);
    const progress = user.progress && user.progress[course.id] ? user.progress[course.id] : 0;
    
    let statusBadge = '';
    if (isCompleted) {
      statusBadge = '<span class="badge completed">✓ Completed</span>';
    } else if (isEnrolled) {
      statusBadge = '<span class="badge enrolled">Enrolled</span>';
    }
    
    html += `
      <div class="course-card">
        <div class="course-header">
          <span class="course-phase">Phase ${course.phase} - Week ${course.week}</span>
          ${statusBadge}
        </div>
        <h3>${course.title}</h3>
        <p class="course-category">${getCategoryName(course.category)}</p>
        <p class="course-description">${course.description}</p>
        <div class="course-meta">
          <span>⏱️ ${course.duration} min</span>
          <span>📚 ${course.lessons ? course.lessons.length : 0} lessons</span>
        </div>
        ${isEnrolled ? `
          <div class="course-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <span>${progress}% Complete</span>
          </div>
        ` : ''}
        <div class="course-actions">
          ${isCompleted ? 
            `<button class="cta-button secondary" onclick="viewCourse('${course.id}')">Review Course</button>` :
            isEnrolled ? 
            `<button class="cta-button primary" onclick="continueCourse('${course.id}')">Continue Learning</button>` :
            `<button class="cta-button primary" onclick="enrollCourse('${course.id}')">Enroll Now</button>`
          }
          <button class="cta-button secondary" onclick="showCourseDetail('${course.id}')">View Details</button>
        </div>
      </div>
    `;
  });
  
  coursesGrid.innerHTML = html;
}

function setupFilters() {
  const categoryFilter = document.getElementById('categoryFilter');
  const phaseFilter = document.getElementById('phaseFilter');
  
  const applyFilters = () => {
    loadCourses({
      category: categoryFilter.value,
      phase: phaseFilter.value
    });
  };
  
  categoryFilter.addEventListener('change', applyFilters);
  phaseFilter.addEventListener('change', applyFilters);
}

function setupModal() {
  const modal = document.getElementById('courseModal');
  const span = modal.querySelector('.close');
  
  span.onclick = function() {
    modal.style.display = 'none';
  };
  
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
}

function showCourseDetail(courseId) {
  const course = getAllCourses().find(c => c.id === courseId);
  if (!course) return;
  
  const user = auth.getCurrentUser();
  const isEnrolled = user.enrolled && user.enrolled.includes(courseId);
  const isCompleted = user.completedCourses && user.completedCourses.includes(courseId);
  
  let lessonsHtml = '';
  if (course.lessons) {
    lessonsHtml = '<div class="lessons-list"><h3>Course Content</h3>';
    course.lessons.forEach((lesson, index) => {
      lessonsHtml += `
        <div class="lesson-item">
          <span class="lesson-number">${index + 1}</span>
          <div class="lesson-info">
            <h4>${lesson.title}</h4>
            <span class="lesson-meta">${getLessonTypeIcon(lesson.type)} ${lesson.duration} min</span>
          </div>
        </div>
      `;
    });
    lessonsHtml += '</div>';
  }
  
  const modalContent = `
    <div class="course-detail">
      <span class="course-phase-large">Phase ${course.phase} - Week ${course.week}</span>
      <h2>${course.title}</h2>
      <p class="course-category-large">${getCategoryName(course.category)}</p>
      <p class="course-description-large">${course.description}</p>
      
      <div class="course-stats">
        <div class="stat">
          <span class="stat-icon">⏱️</span>
          <div>
            <strong>${course.duration} minutes</strong>
            <p>Total Duration</p>
          </div>
        </div>
        <div class="stat">
          <span class="stat-icon">📚</span>
          <div>
            <strong>${course.lessons ? course.lessons.length : 0} lessons</strong>
            <p>Course Content</p>
          </div>
        </div>
        <div class="stat">
          <span class="stat-icon">🎓</span>
          <div>
            <strong>Certificate</strong>
            <p>Upon Completion</p>
          </div>
        </div>
      </div>
      
      ${lessonsHtml}
      
      <div class="course-actions-large">
        ${isCompleted ? 
          `<button class="cta-button secondary large" onclick="viewCourse('${course.id}')">Review Course</button>` :
          isEnrolled ? 
          `<button class="cta-button primary large" onclick="continueCourse('${course.id}')">Continue Learning</button>` :
          `<button class="cta-button primary large" onclick="enrollCourse('${course.id}')">Enroll in this Course</button>`
        }
      </div>
    </div>
  `;
  
  document.getElementById('courseDetailContent').innerHTML = modalContent;
  document.getElementById('courseModal').style.display = 'block';
}

function enrollCourse(courseId) {
  const user = auth.getCurrentUser();
  
  if (!user.enrolled) user.enrolled = [];
  if (!user.progress) user.progress = {};
  
  if (!user.enrolled.includes(courseId)) {
    user.enrolled.push(courseId);
    user.progress[courseId] = 0;
    
    auth.updateUser(user.id, {
      enrolled: user.enrolled,
      progress: user.progress
    });
    
    addActivity(user.id, 'course_start', `Enrolled in course: ${getAllCourses().find(c => c.id === courseId).title}`);
    
    alert('Successfully enrolled in the course!');
    loadCourses();
    document.getElementById('courseModal').style.display = 'none';
  }
}

function continueCourse(courseId) {
  window.location.href = `course-view.html?id=${courseId}`;
}

function viewCourse(courseId) {
  window.location.href = `course-view.html?id=${courseId}`;
}

function getCategoryName(category) {
  const categories = {
    productivity: 'Productivity',
    wellbeing: 'Wellbeing',
    leadership: 'Leadership',
    management: 'Management',
    digital: 'Digital Skills',
    financial: 'Financial Literacy'
  };
  return categories[category] || category;
}

function getLessonTypeIcon(type) {
  const icons = {
    video: '🎥',
    exercise: '✏️',
    quiz: '❓',
    reading: '📖',
    project: '🎯'
  };
  return icons[type] || '📄';
}

function getAllCourses() {
  const courses = localStorage.getItem('courses');
  if (courses) return JSON.parse(courses);
  
  // Return default courses if none exist
  return getDefaultCourses();
}

function getDefaultCourses() {
  const defaultCourses = [
    {
      id: 'course_1',
      title: 'Introduction to Growth Mindset',
      category: 'productivity',
      phase: 1,
      week: 1,
      description: 'Learn how to develop a growth mindset for professional success. This course covers the fundamentals of mindset transformation and how it impacts your career.',
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
      description: 'Master the art of setting and achieving SMART goals. Learn practical techniques to set specific, measurable, achievable, relevant, and time-bound goals.',
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
      description: 'Develop professional communication skills for the workplace. Learn business writing, active listening, and digital communication etiquette.',
      duration: 90,
      lessons: [
        { id: 'lesson_3_1', title: 'Business Writing Basics', duration: 30, type: 'video' },
        { id: 'lesson_3_2', title: 'Active Listening Techniques', duration: 30, type: 'video' },
        { id: 'lesson_3_3', title: 'Digital Communication Etiquette', duration: 30, type: 'video' }
      ]
    },
    {
      id: 'course_4',
      title: 'Emotional Intelligence at Work',
      category: 'wellbeing',
      phase: 1,
      week: 3,
      description: 'Understand and develop your emotional intelligence for better workplace relationships and professional success.',
      duration: 75,
      lessons: [
        { id: 'lesson_4_1', title: 'Understanding EQ', duration: 25, type: 'video' },
        { id: 'lesson_4_2', title: 'Self-Awareness Exercises', duration: 25, type: 'exercise' },
        { id: 'lesson_4_3', title: 'Managing Workplace Emotions', duration: 25, type: 'video' }
      ]
    },
    {
      id: 'course_5',
      title: 'Personal Branding Essentials',
      category: 'productivity',
      phase: 1,
      week: 4,
      description: 'Build a powerful personal brand that opens doors. Learn LinkedIn optimization, elevator pitches, and professional networking.',
      duration: 80,
      lessons: [
        { id: 'lesson_5_1', title: 'What is Personal Branding?', duration: 20, type: 'video' },
        { id: 'lesson_5_2', title: 'LinkedIn Profile Optimization', duration: 30, type: 'exercise' },
        { id: 'lesson_5_3', title: 'Crafting Your Elevator Pitch', duration: 30, type: 'exercise' }
      ]
    },
    {
      id: 'course_6',
      title: 'Mastering Digital Tools',
      category: 'digital',
      phase: 2,
      week: 5,
      description: 'Become proficient in essential productivity and collaboration software used in modern workplaces.',
      duration: 120,
      lessons: [
        { id: 'lesson_6_1', title: 'Google Workspace Essentials', duration: 40, type: 'video' },
        { id: 'lesson_6_2', title: 'Microsoft Office Productivity', duration: 40, type: 'video' },
        { id: 'lesson_6_3', title: 'Collaboration Tools', duration: 40, type: 'video' }
      ]
    },
    {
      id: 'course_7',
      title: 'Digital Marketing Fundamentals',
      category: 'digital',
      phase: 2,
      week: 6,
      description: 'Learn how to market yourself or your business online effectively. Cover social media, SEO basics, and content marketing.',
      duration: 100,
      lessons: [
        { id: 'lesson_7_1', title: 'Social Media Marketing', duration: 35, type: 'video' },
        { id: 'lesson_7_2', title: 'SEO Basics', duration: 35, type: 'video' },
        { id: 'lesson_7_3', title: 'Content Marketing Strategy', duration: 30, type: 'video' }
      ]
    },
    {
      id: 'course_8',
      title: 'Financial Literacy for Professionals',
      category: 'financial',
      phase: 2,
      week: 7,
      description: 'Master personal finance basics including budgeting, saving, credit management, and cash flow.',
      duration: 90,
      lessons: [
        { id: 'lesson_8_1', title: 'Budgeting Fundamentals', duration: 30, type: 'video' },
        { id: 'lesson_8_2', title: 'Credit and Debt Management', duration: 30, type: 'video' },
        { id: 'lesson_8_3', title: 'Building an Emergency Fund', duration: 30, type: 'video' }
      ]
    },
    {
      id: 'course_9',
      title: 'Introduction to Investing',
      category: 'financial',
      phase: 2,
      week: 8,
      description: 'Learn the basics of investing including stocks, bonds, mutual funds, and retirement planning.',
      duration: 95,
      lessons: [
        { id: 'lesson_9_1', title: 'Investment Basics', duration: 35, type: 'video' },
        { id: 'lesson_9_2', title: 'Understanding Risk and Return', duration: 30, type: 'video' },
        { id: 'lesson_9_3', title: 'Retirement Planning 101', duration: 30, type: 'video' }
      ]
    },
    {
      id: 'course_10',
      title: 'Problem Solving & Critical Thinking',
      category: 'leadership',
      phase: 3,
      week: 9,
      description: 'Develop analytical thinking skills and learn problem-solving frameworks used by top professionals.',
      duration: 85,
      lessons: [
        { id: 'lesson_10_1', title: 'Critical Thinking Skills', duration: 30, type: 'video' },
        { id: 'lesson_10_2', title: 'Problem-Solving Frameworks', duration: 30, type: 'video' },
        { id: 'lesson_10_3', title: 'Case Study Practice', duration: 25, type: 'exercise' }
      ]
    },
    {
      id: 'course_11',
      title: 'Resume Writing & Interview Skills',
      category: 'productivity',
      phase: 3,
      week: 10,
      description: 'Create a compelling resume and master interview techniques to land your dream job.',
      duration: 110,
      lessons: [
        { id: 'lesson_11_1', title: 'Writing a Powerful Resume', duration: 40, type: 'exercise' },
        { id: 'lesson_11_2', title: 'Interview Preparation', duration: 35, type: 'video' },
        { id: 'lesson_11_3', title: 'Mock Interview Practice', duration: 35, type: 'exercise' }
      ]
    },
    {
      id: 'course_12',
      title: 'Negotiation Skills',
      category: 'leadership',
      phase: 3,
      week: 11,
      description: 'Learn negotiation techniques for salary discussions, client agreements, and professional contracts.',
      duration: 80,
      lessons: [
        { id: 'lesson_12_1', title: 'Negotiation Fundamentals', duration: 25, type: 'video' },
        { id: 'lesson_12_2', title: 'Salary Negotiation Tactics', duration: 30, type: 'video' },
        { id: 'lesson_12_3', title: 'Practice Scenarios', duration: 25, type: 'exercise' }
      ]
    }
  ];
  
  localStorage.setItem('courses', JSON.stringify(defaultCourses));
  return defaultCourses;
}
