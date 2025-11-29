// Community forum functionality

document.addEventListener('DOMContentLoaded', function() {
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  setupCreatePost();
  setupFilters();
  setupModal();
  loadPosts();
});

function setupCreatePost() {
  const form = document.getElementById('createPostForm');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const user = auth.getCurrentUser();
    const post = {
      id: 'post_' + Date.now(),
      title: document.getElementById('postTitle').value,
      category: document.getElementById('postCategory').value,
      content: document.getElementById('postContent').value,
      author: {
        id: user.id,
        name: user.fullName
      },
      date: new Date().toISOString(),
      comments: [],
      likes: 0,
      likedBy: []
    };
    
    savePosts(post);
    addActivity(user.id, 'post_create', `Created a new post: ${post.title}`);
    
    form.reset();
    alert('Post created successfully!');
    loadPosts();
  });
}

function setupFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const filter = this.getAttribute('data-filter');
      loadPosts(filter);
    });
  });
}

function setupModal() {
  const modal = document.getElementById('postModal');
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

function loadPosts(filter = 'all') {
  const container = document.getElementById('postsList');
  const posts = getAllPosts();
  
  let filteredPosts = posts;
  if (filter !== 'all') {
    filteredPosts = posts.filter(p => p.category === filter);
  }
  
  // Sort by date (newest first)
  filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (filteredPosts.length === 0) {
    container.innerHTML = '<p class="no-results">No posts found in this category</p>';
    return;
  }
  
  let html = '';
  filteredPosts.forEach(post => {
    const date = new Date(post.date);
    const timeAgo = getTimeAgo(date);
    
    html += `
      <div class="post-card" onclick="showPostDetail('${post.id}')">
        <div class="post-header">
          <div class="post-author">
            <div class="author-avatar">${post.author.name.charAt(0)}</div>
            <div class="author-info">
              <h4>${post.author.name}</h4>
              <span class="post-time">${timeAgo}</span>
            </div>
          </div>
          <span class="post-category-badge">${getCategoryLabel(post.category)}</span>
        </div>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-excerpt">${truncateText(post.content, 150)}</p>
        <div class="post-stats">
          <span>💬 ${post.comments.length} comments</span>
          <span>👍 ${post.likes} likes</span>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function showPostDetail(postId) {
  const post = getAllPosts().find(p => p.id === postId);
  if (!post) return;
  
  const user = auth.getCurrentUser();
  const hasLiked = post.likedBy && post.likedBy.includes(user.id);
  
  const date = new Date(post.date);
  const timeAgo = getTimeAgo(date);
  
  let commentsHtml = '';
  if (post.comments && post.comments.length > 0) {
    post.comments.forEach(comment => {
      const commentDate = new Date(comment.date);
      const commentTimeAgo = getTimeAgo(commentDate);
      
      commentsHtml += `
        <div class="comment">
          <div class="comment-author">
            <div class="author-avatar small">${comment.author.name.charAt(0)}</div>
            <div class="author-info">
              <strong>${comment.author.name}</strong>
              <span class="comment-time">${commentTimeAgo}</span>
            </div>
          </div>
          <p class="comment-content">${comment.content}</p>
        </div>
      `;
    });
  } else {
    commentsHtml = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
  }
  
  const modalContent = `
    <div class="post-detail">
      <div class="post-header-large">
        <div class="post-author">
          <div class="author-avatar large">${post.author.name.charAt(0)}</div>
          <div class="author-info">
            <h3>${post.author.name}</h3>
            <span class="post-time">${timeAgo}</span>
          </div>
        </div>
        <span class="post-category-badge">${getCategoryLabel(post.category)}</span>
      </div>
      
      <h2 class="post-title-large">${post.title}</h2>
      <p class="post-content-full">${post.content}</p>
      
      <div class="post-actions">
        <button class="action-btn ${hasLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
          👍 ${post.likes} ${hasLiked ? 'Unlike' : 'Like'}
        </button>
        <span class="action-btn">💬 ${post.comments.length} Comments</span>
      </div>
      
      <div class="comments-section">
        <h3>Comments</h3>
        ${commentsHtml}
        
        <div class="add-comment">
          <textarea id="commentContent" placeholder="Write a comment..." rows="3"></textarea>
          <button class="cta-button primary" onclick="addComment('${post.id}')">Post Comment</button>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('postDetailContent').innerHTML = modalContent;
  document.getElementById('postModal').style.display = 'block';
}

function toggleLike(postId) {
  const posts = getAllPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) return;
  
  const user = auth.getCurrentUser();
  const post = posts[postIndex];
  
  if (!post.likedBy) post.likedBy = [];
  
  if (post.likedBy.includes(user.id)) {
    // Unlike
    post.likedBy = post.likedBy.filter(id => id !== user.id);
    post.likes--;
  } else {
    // Like
    post.likedBy.push(user.id);
    post.likes++;
  }
  
  posts[postIndex] = post;
  localStorage.setItem('posts', JSON.stringify(posts));
  
  showPostDetail(postId);
}

function addComment(postId) {
  const content = document.getElementById('commentContent').value.trim();
  if (!content) {
    alert('Please enter a comment');
    return;
  }
  
  const user = auth.getCurrentUser();
  const posts = getAllPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) return;
  
  const comment = {
    id: 'comment_' + Date.now(),
    content,
    author: {
      id: user.id,
      name: user.fullName
    },
    date: new Date().toISOString()
  };
  
  posts[postIndex].comments.push(comment);
  localStorage.setItem('posts', JSON.stringify(posts));
  
  addActivity(user.id, 'post_create', `Commented on: ${posts[postIndex].title}`);
  
  showPostDetail(postId);
}

function savePosts(newPost) {
  const posts = getAllPosts();
  posts.unshift(newPost);
  localStorage.setItem('posts', JSON.stringify(posts));
}

function getAllPosts() {
  const posts = localStorage.getItem('posts');
  if (posts) return JSON.parse(posts);
  
  // Create some default posts
  const defaultPosts = [
    {
      id: 'post_1',
      title: 'Tips for staying motivated during the program',
      category: 'general',
      content: 'I wanted to share some strategies that have helped me stay motivated throughout this journey. First, setting small daily goals has been crucial...',
      author: {
        id: 'user_demo',
        name: 'Demo User'
      },
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      comments: [
        {
          id: 'comment_1',
          content: 'Great tips! The daily goals approach really works for me too.',
          author: { id: 'user_demo2', name: 'Another Student' },
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      likes: 5,
      likedBy: []
    },
    {
      id: 'post_2',
      title: 'Week 1 Reflection: Growth Mindset',
      category: 'phase1',
      content: 'Just completed Week 1 and I am already seeing the value of developing a growth mindset. The exercises on SMART goals were particularly helpful...',
      author: {
        id: 'user_demo3',
        name: 'Sarah Johnson'
      },
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      comments: [],
      likes: 8,
      likedBy: []
    }
  ];
  
  localStorage.setItem('posts', JSON.stringify(defaultPosts));
  return defaultPosts;
}

function getCategoryLabel(category) {
  const labels = {
    general: 'General Discussion',
    phase1: 'Phase 1',
    phase2: 'Phase 2',
    phase3: 'Phase 3',
    networking: 'Networking',
    jobs: 'Job Opportunities',
    help: 'Help & Support'
  };
  return labels[category] || category;
}

function truncateText(text, length) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
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
