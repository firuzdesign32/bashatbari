document.addEventListener('DOMContentLoaded', () => {
  // State
  let token = localStorage.getItem('admin_token');
  let currentEditingPropertyId = null;
  let currentEditingBlogId = null;
  let currentEditingJobId = null;
  let blogs = [];
  let jobs = [];

  // DOM Elements
  const loginOverlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const adminContainer = document.getElementById('admin-container');
  const logoutBtn = document.getElementById('logout-btn');

  // Nav Tabs
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-tab]');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Stats Counters
  const countTotalProps = document.getElementById('stat-total-properties');
  const countTotalLeads = document.getElementById('stat-total-leads');
  const countNewLeads = document.getElementById('stat-new-leads');
  const countSoldProps = document.getElementById('stat-sold-properties');

  // Lists
  const propertiesTableBody = document.getElementById('properties-table-body');
  const leadsTableBody = document.getElementById('leads-table-body');
  const blogsTableBody = document.getElementById('blogs-table-body');
  const jobsTableBody = document.getElementById('jobs-table-body');
  const applicationsTableBody = document.getElementById('applications-table-body');

  // Add/Edit Property Modal DOM
  const propertyModal = document.getElementById('property-modal');
  const propertyModalTitle = document.getElementById('property-modal-title');
  const propertyForm = document.getElementById('property-form');
  const addPropertyBtn = document.getElementById('add-property-btn');
  const propertyModalClose = document.getElementById('property-modal-close');
  const btnCancelProperty = document.getElementById('btn-cancel-property');

  // Add/Edit Blog Modal DOM
  const blogModal = document.getElementById('blog-modal');
  const blogModalTitle = document.getElementById('blog-modal-title');
  const blogForm = document.getElementById('blog-form');
  const addBlogBtn = document.getElementById('add-blog-btn');
  const blogModalClose = document.getElementById('blog-modal-close');
  const btnCancelBlog = document.getElementById('btn-cancel-blog');

  // Add/Edit Job Modal DOM
  const jobModal = document.getElementById('job-modal');
  const jobModalTitle = document.getElementById('job-modal-title');
  const jobForm = document.getElementById('job-form');
  const addJobBtn = document.getElementById('add-job-btn');
  const jobModalClose = document.getElementById('job-modal-close');
  const btnCancelJob = document.getElementById('btn-cancel-job');

  // Settings DOM
  const settingsForm = document.getElementById('settings-form');
  const settingsSuccess = document.getElementById('settings-success');

  // Initialize
  if (token) {
    showDashboard();
  } else {
    showLogin();
  }

  // Auth Functions
  function showLogin() {
    loginOverlay.style.display = 'flex';
    adminContainer.style.display = 'none';
  }

  function showDashboard() {
    loginOverlay.style.display = 'none';
    adminContainer.style.display = 'flex';
    
    // Load dashboard metrics & list data
    loadStats();
    loadProperties();
    loadLeads();
    loadSettings();
    loadBlogs();
    loadJobs();
    loadApplications();
  }

  // Handle Login Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.style.display = 'none';

      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
          token = data.token;
          localStorage.setItem('admin_token', token);
          showDashboard();
        } else {
          loginError.textContent = data.message || 'Login failed';
          loginError.style.display = 'block';
        }
      } catch (err) {
        console.error(err);
        loginError.textContent = 'Server communication error';
        loginError.style.display = 'block';
      }
    });
  }

  // Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('admin_token');
      token = null;
      showLogin();
    });
  }

  // Tab switching
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
      link.parentElement.classList.add('active');

      const tabId = link.getAttribute('data-tab');
      tabPanes.forEach(pane => {
        if (pane.id === tabId) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });

  // Fetch and Load Stats
  async function loadStats() {
    try {
      const res = await fetch('/api/leads/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) return handleSessionExpire();
      if (!res.ok) throw new Error('Failed to fetch statistics');

      const stats = await res.json();
      countTotalProps.textContent = stats.totalProperties;
      countTotalLeads.textContent = stats.totalLeads;
      countNewLeads.textContent = stats.newLeads;
      countSoldProps.textContent = stats.soldProperties;
    } catch (err) {
      console.error(err);
    }
  }

  // Fetch and Load Properties Table
  async function loadProperties() {
    try {
      const res = await fetch('/api/properties');
      if (!res.ok) throw new Error('Failed to fetch properties');

      const properties = await res.json();
      renderPropertiesTable(properties);
    } catch (err) {
      console.error(err);
    }
  }

  // Render Properties Table
  function renderPropertiesTable(list) {
    if (list.length === 0) {
      propertiesTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--admin-text-muted);">কোনো প্লট লিস্টিং পাওয়া যায়নি।</td></tr>';
      return;
    }

    propertiesTableBody.innerHTML = list.map(prop => {
      const priceText = prop.price > 0 
        ? `${(prop.price / 100000).toLocaleString('en-US')} লক্ষ BDT` 
        : 'আলোচনা সাপেক্ষে';

      const statusBadgeClass = prop.status === 'Available' 
        ? 'admin-badge-closed' 
        : (prop.status === 'Booked' ? 'admin-badge-contacted' : 'admin-badge-discarded');
      
      const statusLabel = prop.status === 'Available' ? 'বিক্রয়যোগ্য' : (prop.status === 'Booked' ? 'বুকড' : 'বিক্রীত');

      return `
        <tr data-id="${prop._id || prop.id}">
          <td style="font-weight: 600;">${prop.title}</td>
          <td class="eng-text">${prop.block}</td>
          <td>${prop.plotSize} কাঠা</td>
           <td>${prop.facing === 'North' ? 'উত্তরমুখী' : (prop.facing === 'South' ? 'দক্ষিণমুখী' : (prop.facing === 'East' ? 'পূর্বমুখী' : (prop.facing === 'West' ? 'পশ্চিমমুখী' : prop.facing)))}</td>
          <td class="eng-text">${priceText}</td>
          <td>
            <span class="admin-badge ${statusBadgeClass}">${statusLabel}</span>
          </td>
          <td>
            <div class="action-btns">
              <button class="admin-btn admin-btn-primary admin-btn-sm btn-edit-property" data-id="${prop._id || prop.id}">সম্পাদনা</button>
              <button class="admin-btn admin-btn-danger admin-btn-sm btn-delete-property" data-id="${prop._id || prop.id}">মুছুন</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.btn-edit-property').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditPropertyModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-property').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteProperty(id);
      });
    });
  }

  // Fetch and Load Leads Table
  async function loadLeads() {
    try {
      const res = await fetch('/api/leads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) return handleSessionExpire();
      if (!res.ok) throw new Error('Failed to fetch leads');

      const leads = await res.json();
      renderLeadsTable(leads);
    } catch (err) {
      console.error(err);
    }
  }

  // Render Leads Table
  function renderLeadsTable(list) {
    if (list.length === 0) {
      leadsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--admin-text-muted);">কোনো কাস্টমার লিড পাওয়া যায়নি।</td></tr>';
      return;
    }

    leadsTableBody.innerHTML = list.map(lead => {
      const date = new Date(lead.createdAt).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const relatedProperty = lead.propertyId 
        ? `${lead.propertyId.title} (${lead.propertyId.block})`
        : '<span style="color: var(--admin-text-muted);">সাধারণ জিজ্ঞাসা</span>';

      return `
        <tr data-id="${lead._id || lead.id}">
          <td style="font-weight:600;">${lead.name}</td>
          <td class="eng-text">${lead.phone}<br><span style="font-size:0.85rem; color:var(--admin-text-muted);">${lead.email || ''}</span></td>
          <td>${lead.message}</td>
          <td>${relatedProperty}</td>
          <td style="font-size: 0.85rem;">${date}</td>
          <td>
            <select class="lead-status-select" data-id="${lead._id || lead.id}">
              <option value="New" ${lead.status === 'New' ? 'selected' : ''}>নতুন</option>
              <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>যোগাযোগ করা হয়েছে</option>
              <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>সফল (Closed)</option>
              <option value="Discarded" ${lead.status === 'Discarded' ? 'selected' : ''}>বাতিল (Discarded)</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.lead-status-select').forEach(select => {
      select.addEventListener('change', async () => {
        const id = select.getAttribute('data-id');
        const newStatus = select.value;
        await updateLeadStatus(id, newStatus);
      });
    });
  }

  // Update Lead Status
  async function updateLeadStatus(id, status) {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.status === 401) return handleSessionExpire();
      if (!res.ok) throw new Error('Failed to update lead status');
      
      loadStats();
      loadLeads();
    } catch (err) {
      console.error(err);
      alert('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    }
  }

  // Load Website Content Settings
  async function loadSettings() {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();

      // Populate Settings inputs
      document.getElementById('set-hero-title').value = data.heroTitle || '';
      document.getElementById('set-hero-subtitle').value = data.heroSubtitle || '';
      document.getElementById('set-hero-video').value = data.heroVideoUrl || '';
      document.getElementById('set-about-title').value = data.aboutTitle || '';
      document.getElementById('set-about-text1').value = data.aboutText1 || '';
      document.getElementById('set-about-text2').value = data.aboutText2 || '';
      document.getElementById('set-about-image').value = data.aboutImage || '';
      document.getElementById('set-media1-title').value = data.mediaVideo1Title || '';
      document.getElementById('set-media1-url').value = data.mediaVideo1Url || '';
      document.getElementById('set-media2-title').value = data.mediaVideo2Title || '';
      document.getElementById('set-media2-url').value = data.mediaVideo2Url || '';
      document.getElementById('set-contact-address').value = data.contactAddress || '';
      document.getElementById('set-contact-phone').value = data.contactPhone || '';
      document.getElementById('set-contact-email').value = data.contactEmail || '';
      document.getElementById('set-contact-hours').value = data.contactHours || '';
    } catch (err) {
      console.error('Settings load error:', err);
    }
  }

  // Save Website Content Settings
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      settingsSuccess.style.display = 'none';

      const payload = {
        heroTitle: document.getElementById('set-hero-title').value.trim(),
        heroSubtitle: document.getElementById('set-hero-subtitle').value.trim(),
        heroVideoUrl: document.getElementById('set-hero-video').value.trim(),
        aboutTitle: document.getElementById('set-about-title').value.trim(),
        aboutText1: document.getElementById('set-about-text1').value.trim(),
        aboutText2: document.getElementById('set-about-text2').value.trim(),
        aboutImage: document.getElementById('set-about-image').value.trim(),
        mediaVideo1Title: document.getElementById('set-media1-title').value.trim(),
        mediaVideo1Url: document.getElementById('set-media1-url').value.trim(),
        mediaVideo2Title: document.getElementById('set-media2-title').value.trim(),
        mediaVideo2Url: document.getElementById('set-media2-url').value.trim(),
        contactAddress: document.getElementById('set-contact-address').value.trim(),
        contactPhone: document.getElementById('set-contact-phone').value.trim(),
        contactEmail: document.getElementById('set-contact-email').value.trim(),
        contactHours: document.getElementById('set-contact-hours').value.trim()
      };

      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.status === 401) return handleSessionExpire();
        if (!res.ok) throw new Error('Failed to update settings');

        settingsSuccess.textContent = 'ওয়েবসাইটের সেটিংস সফলভাবে আপডেট করা হয়েছে।';
        settingsSuccess.style.display = 'block';
        
        // Hide after 4s
        setTimeout(() => {
          settingsSuccess.style.display = 'none';
        }, 4000);

        // Reload data
        loadSettings();
      } catch (err) {
        console.error(err);
        alert('সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    });
  }

  // Open Add Modal
  if (addPropertyBtn) {
    addPropertyBtn.addEventListener('click', () => {
      currentEditingPropertyId = null;
      propertyModalTitle.textContent = 'নতুন প্লট লিস্টিং তৈরি করুন';
      propertyForm.reset();
      document.getElementById('prop-image').value = 'https://bashatbari.com/wp-content/uploads/2026/04/1-1-768x557-1.jpg';
      propertyModal.classList.add('active');
    });
  }

  // Open Edit Modal
  async function openEditPropertyModal(id) {
    try {
      const res = await fetch(`/api/properties/${id}`);
      if (!res.ok) throw new Error('Failed to fetch property details');
      const prop = await res.json();

      currentEditingPropertyId = prop._id || prop.id;
      propertyModalTitle.textContent = 'প্লট লিস্টিং সম্পাদনা করুন';

      document.getElementById('prop-title').value = prop.title;
      document.getElementById('prop-title-en').value = prop.titleEn;
      document.getElementById('prop-block').value = prop.block;
      document.getElementById('prop-size').value = prop.plotSize;
      document.getElementById('prop-facing').value = prop.facing;
      document.getElementById('prop-price').value = prop.price;
      document.getElementById('prop-status').value = prop.status;
      document.getElementById('prop-image').value = prop.image;
      document.getElementById('prop-category').value = prop.category;
      document.getElementById('prop-featured').checked = prop.featured === true;
      document.getElementById('prop-desc').value = prop.description || '';

      propertyModal.classList.add('active');
    } catch (err) {
      console.error(err);
      alert('প্লটের বিবরণ লোড করতে ব্যর্থ হয়েছে।');
    }
  }

  // Close Property Modal
  function closePropertyModal() {
    propertyModal.classList.remove('active');
    currentEditingPropertyId = null;
    propertyForm.reset();
  }

  if (propertyModalClose) propertyModalClose.addEventListener('click', closePropertyModal);
  if (btnCancelProperty) btnCancelProperty.addEventListener('click', closePropertyModal);

  // Handle Property Form Submission (Create or Update)
  if (propertyForm) {
    propertyForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('prop-title').value.trim();
      const titleEn = document.getElementById('prop-title-en').value.trim();
      const block = document.getElementById('prop-block').value.trim();
      const plotSize = Number(document.getElementById('prop-size').value);
      const facing = document.getElementById('prop-facing').value.trim();
      const price = Number(document.getElementById('prop-price').value || 0);
      const status = document.getElementById('prop-status').value;
      const image = document.getElementById('prop-image').value.trim();
      const category = document.getElementById('prop-category').value;
      const featured = document.getElementById('prop-featured').checked;
      const description = document.getElementById('prop-desc').value.trim();

      const payload = {
        title, titleEn, block, plotSize, facing, price, status, image, category, featured, description
      };

      const url = currentEditingPropertyId 
        ? `/api/properties/${currentEditingPropertyId}`
        : '/api/properties';
      
      const method = currentEditingPropertyId ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.status === 401) return handleSessionExpire();
        if (!res.ok) throw new Error('Failed to save property');

        closePropertyModal();
        loadStats();
        loadProperties();
      } catch (err) {
        console.error(err);
        alert('প্লট সংরক্ষণ ব্যর্থ হয়েছে। অনুগ্রহ করে সব প্রয়োজনীয় তথ্য ঠিকমত দিন।');
      }
    });
  }

  // Delete Property listing
  async function deleteProperty(id) {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই প্লট লিস্টিংটি ডিলিট করতে চান?')) return;

    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) return handleSessionExpire();
      if (!res.ok) throw new Error('Failed to delete property');

      loadStats();
      loadProperties();
    } catch (err) {
      console.error(err);
      alert('প্লট মুছতে ব্যর্থ হয়েছে।');
    }
  }

  // Blogs CRUD Functions
  async function loadBlogs() {
    try {
      const res = await fetch('/api/blogs');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      blogs = await res.json();
      renderBlogsTable(blogs);
    } catch (err) {
      console.error(err);
    }
  }

  function renderBlogsTable(list) {
    if (!blogsTableBody) return;
    if (list.length === 0) {
      blogsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--admin-text-muted);">কোনো ব্লগ পোস্ট পাওয়া যায়নি।</td></tr>';
      return;
    }

    blogsTableBody.innerHTML = list.map(blog => {
      const date = new Date(blog.createdAt).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      const tagsHTML = (blog.tags || []).map(t => `<span class="admin-badge admin-badge-new" style="margin-right: 4px; font-size: 0.75rem;">${t}</span>`).join('');
      
      return `
        <tr data-id="${blog._id || blog.id}">
          <td style="font-weight: 600;">${blog.title}</td>
          <td>${blog.author || 'Admin'}</td>
          <td>${tagsHTML}</td>
          <td class="eng-text">${date}</td>
          <td>
            <div class="action-btns">
              <button class="admin-btn admin-btn-primary admin-btn-sm btn-edit-blog" data-id="${blog._id || blog.id}">সম্পাদনা</button>
              <button class="admin-btn admin-btn-danger admin-btn-sm btn-delete-blog" data-id="${blog._id || blog.id}">মুছুন</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.btn-edit-blog').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditBlogModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-blog').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteBlog(id);
      });
    });
  }

  if (addBlogBtn) {
    addBlogBtn.addEventListener('click', () => {
      currentEditingBlogId = null;
      blogModalTitle.textContent = 'নতুন ব্লগ পোস্ট লিখুন';
      blogForm.reset();
      blogModal.classList.add('active');
    });
  }

  function openEditBlogModal(id) {
    const blog = blogs.find(b => b._id === id || b.id === id);
    if (!blog) return;

    currentEditingBlogId = blog._id || blog.id;
    blogModalTitle.textContent = 'ব্লগ পোস্ট সম্পাদনা করুন';

    document.getElementById('blog-title').value = blog.title;
    document.getElementById('blog-image').value = blog.image;
    document.getElementById('blog-author').value = blog.author || 'Admin';
    document.getElementById('blog-tags').value = (blog.tags || []).join(', ');
    document.getElementById('blog-content').value = blog.content;

    blogModal.classList.add('active');
  }

  function closeBlogModal() {
    blogModal.classList.remove('active');
    currentEditingBlogId = null;
    blogForm.reset();
  }

  if (blogModalClose) blogModalClose.addEventListener('click', closeBlogModal);
  if (btnCancelBlog) btnCancelBlog.addEventListener('click', closeBlogModal);

  if (blogForm) {
    blogForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('blog-title').value.trim();
      const image = document.getElementById('blog-image').value.trim();
      const author = document.getElementById('blog-author').value.trim() || 'Admin';
      const tagsInput = document.getElementById('blog-tags').value.trim();
      const content = document.getElementById('blog-content').value.trim();

      const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];

      const payload = { title, image, author, tags, content };
      const url = currentEditingBlogId ? `/api/blogs/${currentEditingBlogId}` : '/api/blogs';
      const method = currentEditingBlogId ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.status === 401) return handleSessionExpire();
        if (!res.ok) throw new Error('Failed to save blog post');

        closeBlogModal();
        loadBlogs();
      } catch (err) {
        console.error(err);
        alert('ব্লগ পোস্ট সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    });
  }

  async function deleteBlog(id) {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই ব্লগ পোস্টটি ডিলিট করতে চান?')) return;

    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) return handleSessionExpire();
      if (!res.ok) throw new Error('Failed to delete blog post');

      loadBlogs();
    } catch (err) {
      console.error(err);
      alert('ব্লগ পোস্ট ডিলিট করতে ব্যর্থ হয়েছে।');
    }
  }

  // Jobs CRUD Functions
  async function loadJobs() {
    try {
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Failed to fetch jobs');
      jobs = await res.json();
      renderJobsTable(jobs);
    } catch (err) {
      console.error(err);
    }
  }

  function renderJobsTable(list) {
    if (!jobsTableBody) return;
    if (list.length === 0) {
      jobsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--admin-text-muted);">কোনো নিয়োগ বিজ্ঞপ্তি পাওয়া যায়নি।</td></tr>';
      return;
    }

    jobsTableBody.innerHTML = list.map(job => {
      const statusBadge = (job.active === true || job.active === 'true')
        ? '<span class="admin-badge admin-badge-closed">সক্রিয়</span>'
        : '<span class="admin-badge admin-badge-discarded">নিষ্ক্রিয়</span>';

      return `
        <tr data-id="${job._id || job.id}">
          <td style="font-weight: 600;">${job.title}</td>
          <td>${job.department}</td>
          <td>${job.location || 'Nikunja, Dhaka'}</td>
          <td class="eng-text">${job.deadline}</td>
          <td>${statusBadge}</td>
          <td>
            <div class="action-btns">
              <button class="admin-btn admin-btn-primary admin-btn-sm btn-edit-job" data-id="${job._id || job.id}">সম্পাদনা</button>
              <button class="admin-btn admin-btn-danger admin-btn-sm btn-delete-job" data-id="${job._id || job.id}">মুছুন</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.btn-edit-job').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditJobModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-job').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteJob(id);
      });
    });
  }

  if (addJobBtn) {
    addJobBtn.addEventListener('click', () => {
      currentEditingJobId = null;
      jobModalTitle.textContent = 'নতুন নিয়োগ বিজ্ঞপ্তি তৈরি করুন';
      jobForm.reset();
      document.getElementById('job-active').checked = true;
      jobModal.classList.add('active');
    });
  }

  function openEditJobModal(id) {
    const job = jobs.find(j => j._id === id || j.id === id);
    if (!job) return;

    currentEditingJobId = job._id || job.id;
    jobModalTitle.textContent = 'নিয়োগ বিজ্ঞপ্তি সম্পাদনা করুন';

    document.getElementById('job-title').value = job.title;
    document.getElementById('job-dept').value = job.department;
    document.getElementById('job-location').value = job.location || 'Nikunja, Dhaka';
    document.getElementById('job-deadline').value = job.deadline;
    document.getElementById('job-active').checked = job.active === true || job.active === 'true';
    document.getElementById('job-desc').value = job.description;
    document.getElementById('job-reqs').value = job.requirements;

    jobModal.classList.add('active');
  }

  function closeJobModal() {
    jobModal.classList.remove('active');
    currentEditingJobId = null;
    jobForm.reset();
  }

  if (jobModalClose) jobModalClose.addEventListener('click', closeJobModal);
  if (btnCancelJob) btnCancelJob.addEventListener('click', closeJobModal);

  if (jobForm) {
    jobForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('job-title').value.trim();
      const department = document.getElementById('job-dept').value.trim();
      const location = document.getElementById('job-location').value.trim();
      const deadline = document.getElementById('job-deadline').value.trim();
      const active = document.getElementById('job-active').checked;
      const description = document.getElementById('job-desc').value.trim();
      const requirements = document.getElementById('job-reqs').value.trim();

      const payload = { title, department, location, deadline, active, description, requirements };
      const url = currentEditingJobId ? `/api/jobs/${currentEditingJobId}` : '/api/jobs';
      const method = currentEditingJobId ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.status === 401) return handleSessionExpire();
        if (!res.ok) throw new Error('Failed to save job opening');

        closeJobModal();
        loadJobs();
      } catch (err) {
        console.error(err);
        alert('নিয়োগ বিজ্ঞপ্তি সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    });
  }

  async function deleteJob(id) {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই নিয়োগ বিজ্ঞপ্তিটি ডিলিট করতে চান?')) return;

    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) return handleSessionExpire();
      if (!res.ok) throw new Error('Failed to delete job opening');

      loadJobs();
    } catch (err) {
      console.error(err);
      alert('নিয়োগ বিজ্ঞপ্তি মুছতে ব্যর্থ হয়েছে।');
    }
  }

  // Applications/CVs Functions
  async function loadApplications() {
    try {
      const res = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) return handleSessionExpire();
      if (!res.ok) throw new Error('Failed to fetch applications');
      
      const list = await res.json();
      renderApplicationsTable(list);
    } catch (err) {
      console.error(err);
    }
  }

  function renderApplicationsTable(list) {
    if (!applicationsTableBody) return;
    if (list.length === 0) {
      applicationsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--admin-text-muted);">কোনো চাকরির আবেদনপত্র পাওয়া যায়নি।</td></tr>';
      return;
    }

    applicationsTableBody.innerHTML = list.map(app => {
      const date = new Date(app.appliedAt).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      
      const jobTitleText = app.jobId 
        ? app.jobId.title 
        : '<span style="color: var(--admin-text-muted);">Unknown Position</span>';

      return `
        <tr data-id="${app._id || app.id}">
          <td style="font-weight: 600;">${app.name}</td>
          <td class="eng-text">
            ${app.phone}<br>
            <span style="font-size: 0.85rem; color: var(--admin-text-muted);">${app.email}</span>
          </td>
          <td>${jobTitleText}</td>
          <td style="white-space: pre-line; font-size: 0.9rem;">${app.coverLetter || '<span style="color: var(--admin-text-muted);">কোনো কভার লেটার দেওয়া হয়নি</span>'}</td>
          <td class="eng-text" style="font-size: 0.85rem;">${date}</td>
          <td>
            <a href="${app.resumePath}" target="_blank" class="admin-btn admin-btn-primary admin-btn-sm" style="font-size: 0.8rem; text-decoration: none;">
              <i class="fas fa-file-download"></i> সিভি দেখুন
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Handle Session Expiration (401 response)
  function handleSessionExpire() {
    alert('আপনার লগইন সেশন শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।');
    localStorage.removeItem('admin_token');
    token = null;
    showLogin();
  }
});
