// Marketplace/Job Board functionality

document.addEventListener('DOMContentLoaded', function() {
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  setupTabs();
  setupFilters();
  setupModal();
  loadOpportunities('jobs');
});

function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      const tabType = this.getAttribute('data-tab');
      loadOpportunities(tabType);
    });
  });
}

function setupFilters() {
  const searchInput = document.getElementById('searchJobs');
  const locationFilter = document.getElementById('locationFilter');
  const experienceFilter = document.getElementById('experienceFilter');
  
  const applyFilters = () => {
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    loadOpportunities(activeTab);
  };
  
  searchInput.addEventListener('input', applyFilters);
  locationFilter.addEventListener('change', applyFilters);
  experienceFilter.addEventListener('change', applyFilters);
}

function setupModal() {
  const modal = document.getElementById('opportunityModal');
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

function loadOpportunities(type) {
  const container = document.getElementById('opportunitiesGrid');
  let opportunities = getAllOpportunities().filter(o => o.type === type);
  
  // Apply filters
  const searchTerm = document.getElementById('searchJobs').value.toLowerCase();
  const locationFilter = document.getElementById('locationFilter').value;
  const experienceFilter = document.getElementById('experienceFilter').value;
  
  if (searchTerm) {
    opportunities = opportunities.filter(o => 
      o.title.toLowerCase().includes(searchTerm) ||
      o.company.toLowerCase().includes(searchTerm) ||
      o.description.toLowerCase().includes(searchTerm)
    );
  }
  
  if (locationFilter !== 'all') {
    opportunities = opportunities.filter(o => o.location === locationFilter);
  }
  
  if (experienceFilter !== 'all') {
    opportunities = opportunities.filter(o => o.experience === experienceFilter);
  }
  
  if (opportunities.length === 0) {
    container.innerHTML = '<p class="no-results">No opportunities found matching your criteria</p>';
    return;
  }
  
  let html = '';
  opportunities.forEach(opp => {
    const user = auth.getCurrentUser();
    const hasApplied = opp.applicants && opp.applicants.includes(user.id);
    
    html += `
      <div class="opportunity-card">
        <div class="opp-header">
          <div class="company-logo">${opp.company.charAt(0)}</div>
          <div class="company-info">
            <h3>${opp.company}</h3>
            <span class="location-badge">${getLocationIcon(opp.location)} ${opp.location}</span>
          </div>
        </div>
        
        <h3 class="opp-title">${opp.title}</h3>
        <p class="opp-description">${truncateText(opp.description, 120)}</p>
        
        <div class="opp-meta">
          <span class="experience-badge">${opp.experience} level</span>
          ${opp.salary ? `<span class="salary-badge">💰 ${opp.salary}</span>` : ''}
        </div>
        
        <div class="opp-actions">
          ${hasApplied ? 
            '<button class="cta-button secondary" disabled>Applied ✓</button>' :
            `<button class="cta-button primary" onclick="applyForOpportunity('${opp.id}')">Apply Now</button>`
          }
          <button class="cta-button secondary" onclick="showOpportunityDetail('${opp.id}')">View Details</button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function showOpportunityDetail(oppId) {
  const opp = getAllOpportunities().find(o => o.id === oppId);
  if (!opp) return;
  
  const user = auth.getCurrentUser();
  const hasApplied = opp.applicants && opp.applicants.includes(user.id);
  
  const modalContent = `
    <div class="opportunity-detail">
      <div class="opp-header-large">
        <div class="company-logo large">${opp.company.charAt(0)}</div>
        <div class="company-info">
          <h2>${opp.title}</h2>
          <h3>${opp.company}</h3>
          <div class="opp-badges">
            <span class="location-badge">${getLocationIcon(opp.location)} ${opp.location}</span>
            <span class="experience-badge">${opp.experience} level</span>
            <span class="type-badge">${getTypeLabel(opp.type)}</span>
          </div>
        </div>
      </div>
      
      ${opp.salary ? `<div class="salary-large">💰 ${opp.salary}</div>` : ''}
      
      <div class="opp-section">
        <h3>Job Description</h3>
        <p>${opp.description}</p>
      </div>
      
      ${opp.requirements ? `
        <div class="opp-section">
          <h3>Requirements</h3>
          <ul>
            ${opp.requirements.map(req => `<li>${req}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${opp.benefits ? `
        <div class="opp-section">
          <h3>Benefits</h3>
          <ul>
            ${opp.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <div class="opp-actions-large">
        ${hasApplied ? 
          '<button class="cta-button secondary large" disabled>Already Applied ✓</button>' :
          `<button class="cta-button primary large" onclick="applyForOpportunity('${opp.id}')">Apply for this ${getTypeLabel(opp.type)}</button>`
        }
      </div>
    </div>
  `;
  
  document.getElementById('opportunityDetailContent').innerHTML = modalContent;
  document.getElementById('opportunityModal').style.display = 'block';
}

function applyForOpportunity(oppId) {
  const user = auth.getCurrentUser();
  const opportunities = getAllOpportunities();
  const oppIndex = opportunities.findIndex(o => o.id === oppId);
  
  if (oppIndex === -1) return;
  
  if (!opportunities[oppIndex].applicants) {
    opportunities[oppIndex].applicants = [];
  }
  
  if (!opportunities[oppIndex].applicants.includes(user.id)) {
    opportunities[oppIndex].applicants.push(user.id);
    localStorage.setItem('opportunities', JSON.stringify(opportunities));
    
    addActivity(user.id, 'job_apply', `Applied for: ${opportunities[oppIndex].title} at ${opportunities[oppIndex].company}`);
    
    alert('Application submitted successfully! The employer will contact you soon.');
    loadOpportunities(opportunities[oppIndex].type);
    document.getElementById('opportunityModal').style.display = 'none';
  }
}

function getAllOpportunities() {
  const opportunities = localStorage.getItem('opportunities');
  if (opportunities) return JSON.parse(opportunities);
  
  return getDefaultOpportunities();
}

function getDefaultOpportunities() {
  const defaultOpportunities = [
    {
      id: 'opp_1',
      title: 'Junior Software Developer',
      company: 'Tech Solutions Ltd',
      type: 'jobs',
      location: 'remote',
      experience: 'entry',
      salary: '$40,000 - $55,000',
      description: 'We are seeking a motivated Junior Software Developer to join our growing team. You will work on exciting projects using modern technologies and have mentorship opportunities.',
      requirements: [
        'Basic programming knowledge (JavaScript, Python, or similar)',
        'Strong problem-solving skills',
        'Good communication skills',
        'Willingness to learn'
      ],
      benefits: [
        'Remote work flexibility',
        'Health insurance',
        'Professional development budget',
        'Flexible working hours'
      ],
      applicants: []
    },
    {
      id: 'opp_2',
      title: 'Marketing Intern',
      company: 'Creative Agency Co',
      type: 'internships',
      location: 'hybrid',
      experience: 'entry',
      salary: '$15/hour',
      description: 'Join our marketing team as an intern and gain hands-on experience in digital marketing, content creation, and social media management.',
      requirements: [
        'Currently enrolled in or recent graduate of marketing/business program',
        'Basic understanding of social media platforms',
        'Creative mindset',
        'Strong written communication'
      ],
      benefits: [
        'Mentorship from experienced marketers',
        'Portfolio building opportunities',
        'Potential for full-time hire',
        'Flexible schedule'
      ],
      applicants: []
    },
    {
      id: 'opp_3',
      title: 'Freelance Content Writer',
      company: 'Content Hub',
      type: 'gigs',
      location: 'remote',
      experience: 'entry',
      salary: '$25-50 per article',
      description: 'We need talented writers to create engaging blog posts and articles on various topics. This is a flexible, project-based opportunity.',
      requirements: [
        'Excellent writing skills',
        'Ability to research topics',
        'Meet deadlines',
        'SEO knowledge is a plus'
      ],
      applicants: []
    },
    {
      id: 'opp_4',
      title: 'Data Analysis Apprentice',
      company: 'Analytics Corp',
      type: 'apprenticeships',
      location: 'onsite',
      experience: 'entry',
      salary: '$30,000/year',
      description: 'Learn data analysis skills while working on real projects. This 12-month apprenticeship includes training, mentorship, and potential for full-time employment.',
      requirements: [
        'Basic Excel skills',
        'Interest in data and analytics',
        'Strong attention to detail',
        'Bachelor\'s degree or equivalent'
      ],
      benefits: [
        'Structured learning program',
        'Industry certifications',
        'Full-time employment potential',
        'Health benefits'
      ],
      applicants: []
    },
    {
      id: 'opp_5',
      title: 'Project Coordinator',
      company: 'Business Solutions Inc',
      type: 'jobs',
      location: 'hybrid',
      experience: 'mid',
      salary: '$50,000 - $65,000',
      description: 'Coordinate multiple projects, manage timelines, and work with cross-functional teams to deliver successful outcomes.',
      requirements: [
        '2+ years project coordination experience',
        'Strong organizational skills',
        'Project management software proficiency',
        'Excellent communication'
      ],
      benefits: [
        'Hybrid work model',
        'Career advancement opportunities',
        'Comprehensive benefits package',
        'Annual bonus'
      ],
      applicants: []
    }
  ];
  
  localStorage.setItem('opportunities', JSON.stringify(defaultOpportunities));
  return defaultOpportunities;
}

function getLocationIcon(location) {
  const icons = {
    remote: '🏠',
    hybrid: '🔄',
    onsite: '🏢'
  };
  return icons[location] || '📍';
}

function getTypeLabel(type) {
  const labels = {
    jobs: 'Full-Time Job',
    internships: 'Internship',
    gigs: 'Freelance Gig',
    apprenticeships: 'Apprenticeship'
  };
  return labels[type] || type;
}

function truncateText(text, length) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

function addActivity(userId, type, description) {
  const activities = localStorage.getItem('activities_' + userId);
  const activityList = activities ? JSON.parse(activities) : [];
  
  activityList.unshift({
    id: 'activity_' + Date.now(),
    type,
    description,
    date: new Date().toISOString()
  });
  
  localStorage.setItem('activities_' + userId, JSON.stringify(activityList));
}
