// Authentication and User Management

class Auth {
  constructor() {
    this.currentUser = this.getCurrentUser();
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // Login user
  login(email, password) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUser = user;
      return { success: true, user };
    }
    
    return { success: false, message: 'Invalid credentials' };
  }

  // Register new user
  register(username, email, password) {
    const users = this.getAllUsers();
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already registered' };
    }

    const newUser = {
      id: 'user_' + Date.now(),
      fullName: username,
      username: username,
      email: email,
      password: password,
      role: 'user',
      userType: 'employee',
      enrolled: [],
      completedCourses: [],
      progress: {},
      interests: '',
      goals: '',
      joinedDate: new Date().toISOString(),
      currentWeek: 1
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return { success: true, user: newUser };
  }

  // Logout
  logout() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    window.location.href = 'login.html';
  }

  // Get all users
  getAllUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  // Update user
  updateUser(userId, updates) {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user if it's the same
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = users[index];
        localStorage.setItem('currentUser', JSON.stringify(users[index]));
      }
      
      return true;
    }
    
    return false;
  }

  // Check if user is admin
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }
}

// Initialize auth
const auth = new Auth();

// Redirect to login if not authenticated (except on public pages)
const publicPages = ['login.html', 'index.html', 'workmasters.html', '90-days-accelerator.html'];
const currentPage = window.location.pathname.split('/').pop();

if (!publicPages.includes(currentPage) && !auth.isLoggedIn()) {
  window.location.href = 'login.html';
}

// Logout button handler
document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        auth.logout();
      }
    });
  }
});

// Initialize default demo users if they don't exist
function initializeDemoUsers() {
  const users = auth.getAllUsers();
  
  // Create demo regular user
  if (!users.find(u => u.email === 'demo@example.com')) {
    const demoUser = {
      id: 'user_demo_001',
      fullName: 'Demo User',
      username: 'Demo User',
      email: 'demo@example.com',
      password: 'password',
      role: 'user',
      userType: 'employee',
      enrolled: [],
      completedCourses: [],
      progress: {},
      interests: 'Professional Development, Digital Skills',
      goals: 'Complete the 90-day program and land a better job',
      joinedDate: new Date().toISOString(),
      currentWeek: 1
    };
    users.push(demoUser);
  }
  
  // Create admin user
  if (!users.find(u => u.email === 'admin@example.com')) {
    const adminUser = {
      id: 'admin_001',
      fullName: 'Admin User',
      username: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      userType: 'administrator',
      enrolled: [],
      completedCourses: [],
      progress: {},
      joinedDate: new Date().toISOString(),
      currentWeek: 1
    };
    users.push(adminUser);
  }
  
  localStorage.setItem('users', JSON.stringify(users));
}

initializeDemoUsers();
