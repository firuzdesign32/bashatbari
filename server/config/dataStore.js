const fs = require('fs');
const path = require('path');
const dbConfig = require('./db');
const Property = require('../models/property');
const Lead = require('../models/lead');
const Settings = require('../models/settings');
const Blog = require('../models/blog');
const Job = require('../models/job');
const Application = require('../models/application');
const TeamMember = require('../models/teamMember');

// Paths for JSON file fallback
const DATA_DIR = path.join(__dirname, '..', 'data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
const TEAM_MEMBERS_FILE = path.join(DATA_DIR, 'teamMembers.json');

// Ensure directories and files exist for JSON fallback
function initJsonStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const files = [
    { path: PROPERTIES_FILE, default: [] },
    { path: LEADS_FILE, default: [] },
    { path: SETTINGS_FILE, default: {} },
    { path: BLOGS_FILE, default: [] },
    { path: JOBS_FILE, default: [] },
    { path: APPLICATIONS_FILE, default: [] },
    { path: TEAM_MEMBERS_FILE, default: [] }
  ];
  
  files.forEach(f => {
    if (!fs.existsSync(f.path)) {
      fs.writeFileSync(f.path, JSON.stringify(f.default, null, 2));
    }
  });
}

initJsonStore();

// Read/Write helper utilities for JSON fallback
function readJson(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return filePath === SETTINGS_FILE ? {} : [];
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error.message);
  }
}

module.exports = {
  // Properties API
  async getAllProperties(filters = {}) {
    if (dbConfig.getIsConnected()) {
      const query = {};
      if (filters.category) query.category = filters.category;
      if (filters.block) query.block = filters.block;
      if (filters.status) query.status = filters.status;
      if (filters.featured !== undefined) query.featured = filters.featured;
      return await Property.find(query).sort({ createdAt: -1 });
    } else {
      let list = readJson(PROPERTIES_FILE);
      if (filters.category) list = list.filter(p => p.category === filters.category);
      if (filters.block) list = list.filter(p => p.block === filters.block);
      if (filters.status) list = list.filter(p => p.status === filters.status);
      if (filters.featured !== undefined) {
        const featVal = filters.featured === 'true' || filters.featured === true;
        list = list.filter(p => p.featured === featVal);
      }
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async getPropertyById(id) {
    if (dbConfig.getIsConnected()) {
      return await Property.findById(id);
    } else {
      const list = readJson(PROPERTIES_FILE);
      return list.find(p => p._id === id || p.id === id) || null;
    }
  },

  async createProperty(data) {
    if (dbConfig.getIsConnected()) {
      const prop = new Property(data);
      return await prop.save();
    } else {
      const list = readJson(PROPERTIES_FILE);
      const newProp = {
        _id: 'prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        ...data,
        createdAt: new Date().toISOString()
      };
      list.push(newProp);
      writeJson(PROPERTIES_FILE, list);
      return newProp;
    }
  },

  async updateProperty(id, data) {
    if (dbConfig.getIsConnected()) {
      return await Property.findByIdAndUpdate(id, data, { new: true });
    } else {
      const list = readJson(PROPERTIES_FILE);
      const index = list.findIndex(p => p._id === id || p.id === id);
      if (index === -1) return null;
      list[index] = { ...list[index], ...data };
      writeJson(PROPERTIES_FILE, list);
      return list[index];
    }
  },

  async deleteProperty(id) {
    if (dbConfig.getIsConnected()) {
      return await Property.findByIdAndDelete(id);
    } else {
      const list = readJson(PROPERTIES_FILE);
      const index = list.findIndex(p => p._id === id || p.id === id);
      if (index === -1) return null;
      const deleted = list.splice(index, 1)[0];
      writeJson(PROPERTIES_FILE, list);
      return deleted;
    }
  },

  // Leads API
  async getAllLeads() {
    if (dbConfig.getIsConnected()) {
      return await Lead.find().populate('propertyId').sort({ createdAt: -1 });
    } else {
      const leads = readJson(LEADS_FILE);
      const properties = readJson(PROPERTIES_FILE);
      
      return leads.map(lead => {
        const prop = properties.find(p => p._id === lead.propertyId);
        return {
          ...lead,
          propertyId: prop || null
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async createLead(data) {
    if (dbConfig.getIsConnected()) {
      const lead = new Lead(data);
      return await lead.save();
    } else {
      const list = readJson(LEADS_FILE);
      const newLead = {
        _id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: data.name,
        email: data.email || '',
        phone: data.phone,
        message: data.message,
        propertyId: data.propertyId || null,
        status: data.status || 'New',
        createdAt: new Date().toISOString()
      };
      list.push(newLead);
      writeJson(LEADS_FILE, list);
      return newLead;
    }
  },

  async updateLead(id, data) {
    if (dbConfig.getIsConnected()) {
      return await Lead.findByIdAndUpdate(id, data, { new: true });
    } else {
      const list = readJson(LEADS_FILE);
      const index = list.findIndex(l => l._id === id || l.id === id);
      if (index === -1) return null;
      list[index] = { ...list[index], ...data };
      writeJson(LEADS_FILE, list);
      return list[index];
    }
  },

  // Settings API
  async getSettings() {
    const defaultSettings = {
      heroTitle: 'বসতবাড়ি পূর্বাচল ডেভেলপমেন্ট লিমিটেড',
      heroSubtitle: 'প্রকৃতি, প্রযুক্তি ও নিরাপত্তার অনন্য সমন্বয়ে গড়ে উঠেছে ‘বসতবাড়ি পূর্বাচল’',
      heroVideoUrl: 'https://youtu.be/MeyrmCzjjf0',
      aboutTitle: 'বসতবাড়ি পূর্বাচল ডেভেলপমেন্ট লিমিটেড',
      aboutText1: 'অপরূপ প্রাকৃতিক সৌন্দর্যে ভরা আমাদের বাংলাদেশ। এই সৌন্দর্যময়, নিরাপদ ও মনোরম পরিবেশে সুখ, শান্তি ও নিরাপদ আশ্রয়ের জন্য চাই নিষ্কণ্টক জমিতে প্রাণ খুলে নিঃশ্বাস নেয়ার স্বপ্নীল আবাসন যা দূষণ ও কোলাহলমুক্ত সবুজে ঘেরা নিরিবিলি ও সুন্দর।',
      aboutText2: 'আমাদের রাজধানী ঢাকা জনসংখ্যার ভারে নুয়ে পড়েছে। এই সমস্যা সমাধানে প্রকৃতি-প্রযুক্তি-নিরাপত্তা ও আভিজাত্যের সমন্বয়ে রাজউক পূর্বাচল নিউ টাউনের পাশেই আধুনিক পরিকল্পিত নগরী ‘বসতবাড়ি পূর্বাচল’ গড়ে তোলা হয়েছে। এখানে আপনি পাবেন নিষ্কণ্টক নির্ভেজাল এক খণ্ড জমির মালিকানা।',
      aboutImage: 'https://bashatbari.com/wp-content/uploads/2026/04/1-1-768x557-1.jpg',
      mediaVideo1Url: 'https://www.youtube.com/embed/Xx3XnL3VJyA',
      mediaVideo1Title: 'সম্মানিত চেয়ারম্যান মহোদয়ের বক্তব্য',
      mediaVideo2Url: 'https://www.youtube.com/embed/56JRp9n_Tx8',
      mediaVideo2Title: 'আমাদের সম্মানিত প্লট ক্রেতার মতামত',
      contactAddress: 'রোড-৮/এ, বাড়ি-১৩, নিকুঞ্জ-০১, ঢাকা-১২২৯, বাংলাদেশ',
      contactPhone: '+8801962191919',
      contactEmail: 'info@bashatbari.com',
      contactHours: 'শনিবার - বৃহস্পতিবার: সকাল ৯:০০ - সন্ধ্যা ৬:০০'
    };

    if (dbConfig.getIsConnected()) {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings(defaultSettings);
        await settings.save();
      }
      return settings;
    } else {
      let settings = readJson(SETTINGS_FILE);
      if (!settings || Object.keys(settings).length === 0) {
        settings = defaultSettings;
        writeJson(SETTINGS_FILE, settings);
      }
      return settings;
    }
  },

  async updateSettings(data) {
    if (dbConfig.getIsConnected()) {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings(data);
        return await settings.save();
      } else {
        return await Settings.findByIdAndUpdate(settings._id, data, { new: true });
      }
    } else {
      let settings = readJson(SETTINGS_FILE);
      settings = { ...settings, ...data };
      writeJson(SETTINGS_FILE, settings);
      return settings;
    }
  },

  // Blogs API
  async getAllBlogs() {
    if (dbConfig.getIsConnected()) {
      return await Blog.find().sort({ createdAt: -1 });
    } else {
      const list = readJson(BLOGS_FILE);
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async getBlogById(id) {
    if (dbConfig.getIsConnected()) {
      return await Blog.findById(id);
    } else {
      const list = readJson(BLOGS_FILE);
      return list.find(b => b._id === id || b.id === id) || null;
    }
  },

  async createBlog(data) {
    if (dbConfig.getIsConnected()) {
      const blog = new Blog(data);
      return await blog.save();
    } else {
      const list = readJson(BLOGS_FILE);
      const newBlog = {
        _id: 'blog_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        ...data,
        createdAt: new Date().toISOString()
      };
      list.push(newBlog);
      writeJson(BLOGS_FILE, list);
      return newBlog;
    }
  },

  async updateBlog(id, data) {
    if (dbConfig.getIsConnected()) {
      return await Blog.findByIdAndUpdate(id, data, { new: true });
    } else {
      const list = readJson(BLOGS_FILE);
      const index = list.findIndex(b => b._id === id || b.id === id);
      if (index === -1) return null;
      list[index] = { ...list[index], ...data };
      writeJson(BLOGS_FILE, list);
      return list[index];
    }
  },

  async deleteBlog(id) {
    if (dbConfig.getIsConnected()) {
      return await Blog.findByIdAndDelete(id);
    } else {
      const list = readJson(BLOGS_FILE);
      const index = list.findIndex(b => b._id === id || b.id === id);
      if (index === -1) return null;
      const deleted = list.splice(index, 1)[0];
      writeJson(BLOGS_FILE, list);
      return deleted;
    }
  },

  // Jobs API
  async getAllJobs(activeOnly = false) {
    if (dbConfig.getIsConnected()) {
      const query = activeOnly ? { active: true } : {};
      return await Job.find(query).sort({ createdAt: -1 });
    } else {
      let list = readJson(JOBS_FILE);
      if (activeOnly) {
        list = list.filter(j => j.active === true || j.active === 'true');
      }
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async getJobById(id) {
    if (dbConfig.getIsConnected()) {
      return await Job.findById(id);
    } else {
      const list = readJson(JOBS_FILE);
      return list.find(j => j._id === id || j.id === id) || null;
    }
  },

  async createJob(data) {
    if (dbConfig.getIsConnected()) {
      const job = new Job(data);
      return await job.save();
    } else {
      const list = readJson(JOBS_FILE);
      const newJob = {
        _id: 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        ...data,
        createdAt: new Date().toISOString()
      };
      list.push(newJob);
      writeJson(JOBS_FILE, list);
      return newJob;
    }
  },

  async updateJob(id, data) {
    if (dbConfig.getIsConnected()) {
      return await Job.findByIdAndUpdate(id, data, { new: true });
    } else {
      const list = readJson(JOBS_FILE);
      const index = list.findIndex(j => j._id === id || j.id === id);
      if (index === -1) return null;
      list[index] = { ...list[index], ...data };
      writeJson(JOBS_FILE, list);
      return list[index];
    }
  },

  async deleteJob(id) {
    if (dbConfig.getIsConnected()) {
      return await Job.findByIdAndDelete(id);
    } else {
      const list = readJson(JOBS_FILE);
      const index = list.findIndex(j => j._id === id || j.id === id);
      if (index === -1) return null;
      const deleted = list.splice(index, 1)[0];
      writeJson(JOBS_FILE, list);
      return deleted;
    }
  },

  // Applications API
  async getAllApplications() {
    if (dbConfig.getIsConnected()) {
      return await Application.find().populate('jobId').sort({ appliedAt: -1 });
    } else {
      const list = readJson(APPLICATIONS_FILE);
      const jobs = readJson(JOBS_FILE);
      
      return list.map(app => {
        const job = jobs.find(j => j._id === app.jobId);
        return {
          ...app,
          jobId: job || null
        };
      }).sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    }
  },

  async createApplication(data) {
    if (dbConfig.getIsConnected()) {
      const app = new Application(data);
      return await app.save();
    } else {
      const list = readJson(APPLICATIONS_FILE);
      const newApp = {
        _id: 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        ...data,
        appliedAt: new Date().toISOString()
      };
      list.push(newApp);
      writeJson(APPLICATIONS_FILE, list);
      return newApp;
    }
  },

  // TeamMembers API
  async getAllTeamMembers() {
    if (dbConfig.getIsConnected()) {
      return await TeamMember.find().sort({ order: 1, createdAt: 1 });
    } else {
      const list = readJson(TEAM_MEMBERS_FILE);
      return list.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  },

  async getTeamMemberById(id) {
    if (dbConfig.getIsConnected()) {
      return await TeamMember.findById(id);
    } else {
      const list = readJson(TEAM_MEMBERS_FILE);
      return list.find(m => m._id === id || m.id === id) || null;
    }
  },

  async createTeamMember(data) {
    if (dbConfig.getIsConnected()) {
      const member = new TeamMember(data);
      return await member.save();
    } else {
      const list = readJson(TEAM_MEMBERS_FILE);
      const newMember = {
        _id: 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        ...data,
        createdAt: new Date().toISOString()
      };
      list.push(newMember);
      writeJson(TEAM_MEMBERS_FILE, list);
      return newMember;
    }
  },

  async updateTeamMember(id, data) {
    if (dbConfig.getIsConnected()) {
      return await TeamMember.findByIdAndUpdate(id, data, { new: true });
    } else {
      const list = readJson(TEAM_MEMBERS_FILE);
      const index = list.findIndex(m => m._id === id || m.id === id);
      if (index === -1) return null;
      list[index] = { ...list[index], ...data };
      writeJson(TEAM_MEMBERS_FILE, list);
      return list[index];
    }
  },

  async deleteTeamMember(id) {
    if (dbConfig.getIsConnected()) {
      return await TeamMember.findByIdAndDelete(id);
    } else {
      const list = readJson(TEAM_MEMBERS_FILE);
      const index = list.findIndex(m => m._id === id || m.id === id);
      if (index === -1) return null;
      const deleted = list.splice(index, 1)[0];
      writeJson(TEAM_MEMBERS_FILE, list);
      return deleted;
    }
  },

  // Helper Stats API
  async getStats() {
    let propertiesList = [];
    let leadsList = [];
    let blogsList = [];
    let jobsList = [];
    let applicationsList = [];

    if (dbConfig.getIsConnected()) {
      propertiesList = await Property.find();
      leadsList = await Lead.find();
      blogsList = await Blog.find();
      jobsList = await Job.find();
      applicationsList = await Application.find();
    } else {
      propertiesList = readJson(PROPERTIES_FILE);
      leadsList = readJson(LEADS_FILE);
      blogsList = readJson(BLOGS_FILE);
      jobsList = readJson(JOBS_FILE);
      applicationsList = readJson(APPLICATIONS_FILE);
    }

    const totalProperties = propertiesList.length;
    const totalLeads = leadsList.length;
    const newLeads = leadsList.filter(l => l.status === 'New').length;
    const soldProperties = propertiesList.filter(p => p.status === 'Sold').length;
    const availableProperties = propertiesList.filter(p => p.status === 'Available').length;
    const totalBlogs = blogsList.length;
    const totalJobs = jobsList.length;
    const totalApplications = applicationsList.length;

    return {
      totalProperties,
      totalLeads,
      newLeads,
      soldProperties,
      availableProperties,
      totalBlogs,
      totalJobs,
      totalApplications
    };
  }
};
