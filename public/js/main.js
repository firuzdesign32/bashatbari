document.addEventListener('DOMContentLoaded', () => {
  // State
  let properties = [];
  let selectedPropertyId = null;

  // DOM Elements
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const propertiesGrid = document.getElementById('properties-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formError = document.getElementById('form-error');

  // Modal DOM Elements
  const detailsModal = document.getElementById('details-modal');
  const modalClose = document.getElementById('modal-close');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalBlock = document.getElementById('modal-block');
  const modalSize = document.getElementById('modal-size');
  const modalFacing = document.getElementById('modal-facing');
  const modalPrice = document.getElementById('modal-price');
  const modalDesc = document.getElementById('modal-desc');
  const modalInquiryBtn = document.getElementById('modal-inquiry-btn');

  // Editable Page Elements DOM
  const heroVideoContainer = document.getElementById('hero-video-container');
  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');
  const aboutTitle = document.getElementById('about-title');
  const aboutText1 = document.getElementById('about-text-1');
  const aboutText2 = document.getElementById('about-text-2');
  const aboutImg = document.getElementById('about-img');
  const mediaVideo1Container = document.getElementById('media-video-1-container');
  const mediaVideo1Title = document.getElementById('media-video-1-title');
  const mediaVideo2Container = document.getElementById('media-video-2-container');
  const mediaVideo2Title = document.getElementById('media-video-2-title');
  const contactAddress = document.getElementById('contact-address');
  const contactPhone = document.getElementById('contact-phone');
  const contactEmail = document.getElementById('contact-email');
  const contactHours = document.getElementById('contact-hours');

  // YouTube Video ID Extractor
  function getYouTubeVideoId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  }

  // Scroll Header Effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.querySelector('i').className = 'fas fa-bars';
      });
    });
  }

  // Fetch Page Settings
  async function fetchSettings() {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to load settings');
      const settings = await response.json();
      applySettings(settings);
    } catch (error) {
      console.error('Settings Error:', error);
      // Fallback background iframe load
      loadFallbackVideo('MeyrmCzjjf0');
    }
  }

  // Apply fetched layout settings to DOM
  function applySettings(settings) {
    // 1. Hero Background Video
    const videoId = getYouTubeVideoId(settings.heroVideoUrl);
    if (videoId) {
      loadFallbackVideo(videoId);
    }

    // 2. Texts
    if (settings.heroTitle) heroTitle.textContent = settings.heroTitle;
    if (settings.heroSubtitle) heroSubtitle.textContent = settings.heroSubtitle;
    if (settings.aboutTitle) aboutTitle.textContent = settings.aboutTitle;
    if (settings.aboutText1) aboutText1.textContent = settings.aboutText1;
    if (settings.aboutText2) aboutText2.textContent = settings.aboutText2;
    if (settings.aboutImage) aboutImg.src = settings.aboutImage;

    // 3. Media Videos
    if (settings.mediaVideo1Url) {
      const vidId = getYouTubeVideoId(settings.mediaVideo1Url);
      if (vidId) {
        mediaVideo1Container.innerHTML = `<iframe src="https://www.youtube.com/embed/${vidId}" allowfullscreen></iframe>`;
      }
    }
    if (settings.mediaVideo1Title) mediaVideo1Title.textContent = settings.mediaVideo1Title;

    if (settings.mediaVideo2Url) {
      const vidId = getYouTubeVideoId(settings.mediaVideo2Url);
      if (vidId) {
        mediaVideo2Container.innerHTML = `<iframe src="https://www.youtube.com/embed/${vidId}" allowfullscreen></iframe>`;
      }
    }
    if (settings.mediaVideo2Title) mediaVideo2Title.textContent = settings.mediaVideo2Title;

    // 4. Contact Details
    if (settings.contactAddress) contactAddress.textContent = settings.contactAddress;
    if (settings.contactPhone) contactPhone.textContent = settings.contactPhone;
    if (settings.contactEmail) contactEmail.textContent = settings.contactEmail;
    if (settings.contactHours) contactHours.textContent = settings.contactHours;
  }

  function loadFallbackVideo(videoId) {
    if (heroVideoContainer) {
      heroVideoContainer.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&enablejsapi=1&iv_load_policy=3&playsinline=1" 
                allow="autoplay; encrypted-media" 
                title="Background Video"></iframe>
      `;
    }
  }

  // Fetch Properties from API
  async function fetchProperties() {
    try {
      propertiesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--primary-color); font-weight: 500;">প্লট লোড হচ্ছে...</div>';
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      properties = await response.json();
      renderProperties(properties);
    } catch (error) {
      console.error('Error:', error);
      propertiesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #E53E3E;">প্লট ডাটা লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।</div>';
    }
  }

  // Render Properties
  function renderProperties(list) {
    if (list.length === 0) {
      propertiesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">কোনো প্লট পাওয়া যায়নি।</div>';
      return;
    }

    propertiesGrid.innerHTML = list.map(prop => {
      const statusLabel = prop.status === 'Available' ? 'বিক্রয়যোগ্য' : (prop.status === 'Booked' ? 'বুকড' : 'বিক্রীত');
      const badgeClass = prop.status === 'Available' ? 'badge-available' : (prop.status === 'Booked' ? 'badge-booked' : 'badge-sold');
      
      const formattedPrice = prop.price > 0 
        ? `${(prop.price / 100000).toLocaleString('en-US')} লক্ষ BDT` 
        : '<span class="price-negotiable">আলোচনা সাপেক্ষে</span>';

      return `
        <div class="property-card reveal-element active" data-id="${prop._id || prop.id}">
          <div class="property-img-container">
            <img src="${prop.image}" alt="${prop.title}" loading="lazy">
            <span class="property-badge ${badgeClass}">${statusLabel}</span>
            ${prop.featured ? '<span class="property-featured-badge"><i class="fas fa-star"></i> আকর্ষণীয়</span>' : ''}
          </div>
          <div class="property-details">
            <span class="property-block">${prop.block}</span>
            <h3 class="property-title">${prop.title}</h3>
            <div class="property-meta">
              <div class="meta-item">
                <i class="fas fa-ruler-combined"></i>
                <span>আকার: ${prop.plotSize} কাঠা</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-compass"></i>
                <span>মুখ: ${prop.facing === 'North' ? 'উত্তরমুখী' : (prop.facing === 'South' ? 'দক্ষিণমুখী' : (prop.facing === 'East' ? 'পূর্বমুখী' : (prop.facing === 'West' ? 'পশ্চিমমুখী' : prop.facing)))}</span>
              </div>
            </div>
            <div class="property-footer">
              <div class="property-price">${formattedPrice}</div>
              <button class="btn btn-primary btn-sm view-details-btn" data-id="${prop._id || prop.id}">বিস্তারিত</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        openPropertyDetails(id);
      });
    });
  }

  // Filter functionality
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');
      if (filterValue === 'all') {
        renderProperties(properties);
      } else {
        const filtered = properties.filter(p => p.block && p.block.toLowerCase().replace(' ', '') === filterValue.toLowerCase());
        renderProperties(filtered);
      }
    });
  });

  // Modal Handlers
  function openPropertyDetails(id) {
    const prop = properties.find(p => p._id === id || p.id === id);
    if (!prop) return;

    selectedPropertyId = prop._id || prop.id;
    
    modalImg.src = prop.image;
    modalTitle.textContent = prop.title;
    modalBlock.textContent = prop.block;
    modalSize.textContent = `${prop.plotSize} কাঠা`;
    modalFacing.textContent = prop.facing === 'North' ? 'উত্তরমুখী' : (prop.facing === 'South' ? 'দক্ষিণমুখী' : (prop.facing === 'East' ? 'পূর্বমুখী' : (prop.facing === 'West' ? 'পশ্চিমমুখী' : prop.facing)));
    
    modalPrice.textContent = prop.price > 0 
      ? `${(prop.price / 100000).toLocaleString('en-US')} লক্ষ BDT` 
      : 'আলোচনা সাপেক্ষে';

    modalDesc.textContent = prop.description || 'এই প্লটের অতিরিক্ত কোনো বিবরণ নেই।';

    detailsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    detailsModal.classList.remove('active');
    document.body.style.overflow = '';
    selectedPropertyId = null;
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  
  if (detailsModal) {
    detailsModal.addEventListener('click', (e) => {
      if (e.target === detailsModal) closeModal();
    });
  }

  if (modalInquiryBtn) {
    modalInquiryBtn.addEventListener('click', () => {
      closeModal();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        
        const messageInput = document.getElementById('form-message');
        if (messageInput) {
          const selectedProp = properties.find(p => p._id === selectedPropertyId || p.id === selectedPropertyId);
          if (selectedProp) {
            messageInput.value = `আসসালামু আলাইকুম, আমি আপনাদের "${selectedProp.title}" প্লটটি সম্পর্কে বিস্তারিত জানতে আগ্রহী। অনুগ্রহ করে যোগাযোগ করুন।`;
          }
        }
      }
    });
  }

  // Handle Contact Form Submission
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      formSuccess.style.display = 'none';
      formError.style.display = 'none';

      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const phone = document.getElementById('form-phone').value.trim();
      const message = document.getElementById('form-message').value.trim();

      if (!name || !phone || !message) {
        showError('দয়া করে সব আবশ্যক ক্ষেত্রগুলো পূরণ করুন।');
        return;
      }

      const bodyData = {
        name,
        email,
        phone,
        message,
        propertyId: selectedPropertyId
      };

      try {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const origText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'পাঠানো হচ্ছে...';

        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyData)
        });

        const data = await response.json();
        submitBtn.disabled = false;
        submitBtn.textContent = origText;

        if (response.ok) {
          formSuccess.textContent = 'আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। আমাদের প্রতিনিধি শীঘ্রই যোগাযোগ করবেন। ধন্যবাদ!';
          formSuccess.style.display = 'block';
          contactForm.reset();
          selectedPropertyId = null;
        } else {
          showError(data.message || 'একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        }
      } catch (error) {
        console.error('Submit Error:', error);
        showError('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করুন।');
      }
    });
  }

  function showError(msg) {
    formError.textContent = msg;
    formError.style.display = 'block';
  }

  // Fetch Team Members from API
  async function fetchTeamMembers() {
    const teamGrid = document.getElementById('team-grid');
    if (!teamGrid) return;
    try {
      teamGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--primary-color);">লোড হচ্ছে...</div>';
      const response = await fetch('/api/team-members');
      if (!response.ok) throw new Error('Failed to fetch team members');
      const members = await response.json();
      renderTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
      teamGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #E53E3E;">ব্যবস্থাপনা পরিষদের তথ্য লোড করতে সমস্যা হয়েছে।</div>';
    }
  }

  // Render Team Members
  function renderTeamMembers(list) {
    const teamGrid = document.getElementById('team-grid');
    if (!teamGrid) return;
    if (list.length === 0) {
      teamGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">কোনো সদস্য পাওয়া যায়নি।</div>';
      return;
    }

    teamGrid.innerHTML = list.map(member => {
      return `
        <div class="team-member">
          <div class="member-img">
            <img src="${member.image}" alt="${member.name}" loading="lazy">
          </div>
          <div class="member-info">
            <h4 class="member-name">${member.name}</h4>
            <p class="member-role">${member.role}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // Initialize page settings and listings
  fetchSettings();
  fetchProperties();
  fetchTeamMembers();
});
