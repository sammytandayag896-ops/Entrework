// Data Storage
let posts = JSON.parse(localStorage.getItem('entreWorkPosts')) || [];
let userProfile = JSON.parse(localStorage.getItem('entreWorkProfile')) || { name: 'Anonymous', bio: '', title: '' };
let currentFilter = 'all';
let selectedPostId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  renderFeed();
  updateTrendingTags();
});

// User Profile Functions
function loadUserProfile() {
  const saved = localStorage.getItem('entreWorkProfile');
  if (saved) {
    userProfile = JSON.parse(saved);
    document.getElementById('profileName').value = userProfile.name || '';
    document.getElementById('profileBio').value = userProfile.bio || '';
    document.getElementById('profileTitle').value = userProfile.title || '';
  }
}

function saveProfile() {
  userProfile = {
    name: document.getElementById('profileName').value || 'Anonymous',
    bio: document.getElementById('profileBio').value,
    title: document.getElementById('profileTitle').value
  };
  localStorage.setItem('entreWorkProfile', JSON.stringify(userProfile));
  toggleProfileModal();
  alert('Profile saved!');
}

// Modal Functions
function toggleProfileModal() {
  document.getElementById('profileModal').style.display = 
    document.getElementById('profileModal').style.display === 'block' ? 'none' : 'block';
}

function toggleSettingsModal() {
  document.getElementById('settingsModal').style.display = 
    document.getElementById('settingsModal').style.display === 'block' ? 'none' : 'block';
}

function closeCommentModal() {
  document.getElementById('commentModal').style.display = 'none';
}

// Close modals when clicking outside
window.onclick = (event) => {
  const profileModal = document.getElementById('profileModal');
  const settingsModal = document.getElementById('settingsModal');
  const commentModal = document.getElementById('commentModal');
  
  if (event.target === profileModal) profileModal.style.display = 'none';
  if (event.target === settingsModal) settingsModal.style.display = 'none';
  if (event.target === commentModal) commentModal.style.display = 'none';
};

// Post Functions
function addPost() {
  const username = document.getElementById('username').value.trim() || 'Anonymous';
  const text = document.getElementById('postInput').value.trim();
  const category = document.getElementById('category').value;
  const tagsInput = document.getElementById('tagsInput').value.trim();

  if (!text) {
    alert('Please write something!');
    return;
  }

  // Extract tags
  const tags = tagsInput.match(/#\w+/g) || [];

  const post = {
    id: Date.now(),
    username: username,
    content: text,
    category: category,
    tags: tags,
    timestamp: new Date().toLocaleString(),
    likes: 0,
    liked: false,
    comments: []
  };

  posts.unshift(post);
  localStorage.setItem('entreWorkPosts', JSON.stringify(posts));

  clearPostForm();
  renderFeed();
  updateTrendingTags();
}

function clearPostForm() {
  document.getElementById('postInput').value = '';
  document.getElementById('tagsInput').value = '';
}

function deletePost(postId) {
  if (confirm('Are you sure you want to delete this post?')) {
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('entreWorkPosts', JSON.stringify(posts));
    renderFeed();
  }
}

function likePost(postId) {
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    localStorage.setItem('entreWorkPosts', JSON.stringify(posts));
    renderFeed();
  }
}

function openCommentModal(postId) {
  selectedPostId = postId;
  const post = posts.find(p => p.id === postId);
  
  let commentsHTML = '<div class="comments-list">';
  if (post.comments.length > 0) {
    post.comments.forEach(comment => {
      commentsHTML += `
        <div class="comment">
          <strong>${comment.username}</strong>
          <p>${comment.text}</p>
          <small>${comment.timestamp}</small>
        </div>
      `;
    });
  } else {
    commentsHTML += '<p style="color: #999;">No comments yet. Be the first!</p>';
  }
  commentsHTML += '</div>';
  
  document.getElementById('commentsList').innerHTML = commentsHTML;
  document.getElementById('commentModal').style.display = 'block';
}

function addComment() {
  const commentText = document.getElementById('commentInput').value.trim();
  if (!commentText || !selectedPostId) return;

  const post = posts.find(p => p.id === selectedPostId);
  if (post) {
    post.comments.push({
      username: userProfile.name || 'Anonymous',
      text: commentText,
      timestamp: new Date().toLocaleTimeString()
    });
    localStorage.setItem('entreWorkPosts', JSON.stringify(posts));
    document.getElementById('commentInput').value = '';
    openCommentModal(selectedPostId);
  }
}

// Filter & Search
function filterByCategory(category) {
  currentFilter = category;
  document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderFeed();
}

// Render Feed
function renderFeed() {
  const feed = document.getElementById('feed');
  const filteredPosts = currentFilter === 'all' 
    ? posts 
    : posts.filter(p => p.category === currentFilter);

  if (filteredPosts.length === 0) {
    feed.innerHTML = '';
    document.getElementById('noPostsMessage').style.display = 'block';
    return;
  }

  document.getElementById('noPostsMessage').style.display = 'none';
  feed.innerHTML = filteredPosts.map(post => `
    <div class="post-card">
      <div class="post-meta">
        <div>
          <strong>${post.username}</strong>
          <span class="category-badge">${post.category}</span>
        </div>
        <small class="timestamp">${post.timestamp}</small>
      </div>
      <div class="post-content">${post.content}</div>
      <div class="post-tags">
        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <div class="post-actions">
        <button onclick="likePost(${post.id})" class="action-btn ${post.liked ? 'liked' : ''}">
          ❤️ ${post.likes}
        </button>
        <button onclick="openCommentModal(${post.id})" class="action-btn">
          💬 ${post.comments.length}
        </button>
        <button onclick="deletePost(${post.id})" class="action-btn delete-btn">🗑️ Delete</button>
      </div>
    </div>
  `).join('');
}

// Trending Tags
function updateTrendingTags() {
  const tagMap = {};
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    });
  });

  const trending = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => `<span class="trending-tag">${tag} (${count})</span>`)
    .join('');

  document.getElementById('trendingTags').innerHTML = trending || '<p style="color: #999;">No tags yet</p>';
}

// Settings
function clearAllData() {
  if (confirm('Are you sure? This will delete ALL posts and profile data!')) {
    localStorage.clear();
    location.reload();
  }
}
