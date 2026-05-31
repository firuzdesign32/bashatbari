const dataStore = require('./dataStore');

const initialProperties = [
  {
    title: 'বসতবাড়ী পূর্বাচল - ব্লক এ (আবাসিক রেডি প্লট)',
    titleEn: 'Bashatbari Purbachal - Block A (Residential Ready Plot)',
    block: 'Block A',
    plotSize: 3,
    facing: 'North',
    price: 4500000,
    status: 'Available',
    category: 'Residential',
    featured: true,
    image: 'https://bashatbari.com/wp-content/uploads/2026/04/1-1-768x557-1.jpg',
    description: 'রাজউক পূর্বাচল নিউ টাউনের সন্নিকটে শতভাগ নিষ্কণ্টক ও বালু ভরাট সম্পন্ন রেডি প্লট। রোড নং ৫ সংলগ্ন। এখনই বাড়ি করার উপযোগী।'
  },
  {
    title: 'বসতবাড়ী পূর্বাচল - ব্লক বি (লেকভিউ প্রাইম কর্নার প্লট)',
    titleEn: 'Bashatbari Purbachal - Block B (Lakeview Prime Corner Plot)',
    block: 'Block B',
    plotSize: 5,
    facing: 'South-East',
    price: 9000000,
    status: 'Available',
    category: 'Residential',
    featured: true,
    image: 'https://bashatbari.com/wp-content/uploads/2025/07/bashatbari-post-1.jpg',
    description: '৬০ ফুট প্রধান এভিনিউ রোডের কোণায় অবস্থিত দৃষ্টিনন্দন লেকভিউ প্লট। দক্ষিণ-পূর্বমুখী হওয়ায় পর্যাপ্ত আলো ও বাতাসের সুবিধা সম্পন্ন।'
  },
  {
    title: 'বসতবাড়ী পূর্বাচল - ব্লক সি (প্রাইম কমার্শিয়াল জোন)',
    titleEn: 'Bashatbari Purbachal - Block C (Prime Commercial Zone)',
    block: 'Block C',
    plotSize: 10,
    facing: 'South',
    price: 35000000,
    status: 'Booked',
    category: 'Commercial',
    featured: false,
    image: 'https://bashatbari.com/wp-content/uploads/2025/09/blog-1.jpg',
    description: 'বাণিজ্যিক এলাকায় ৮০ ফুট রোডের সাথে সংযুক্ত সেরা বিজনেস লোকেশন। ব্যাংক, কর্পোরেট অফিস বা শপিং হাবের জন্য উপযুক্ত।'
  },
  {
    title: 'বসতবাড়ী পূর্বাচল - ব্লক ডি (ডুপ্লেক্স রেসিডেন্স জোন)',
    titleEn: 'Bashatbari Purbachal - Block D (Duplex Residence Zone)',
    block: 'Block D',
    plotSize: 7.5,
    facing: 'East',
    price: 16500000,
    status: 'Available',
    category: 'Residential',
    featured: false,
    image: 'https://bashatbari.com/wp-content/uploads/2025/09/blog-2.jpg',
    description: 'পরিকল্পিত ও সুসজ্জিত ডুপ্লেক্স জোনে চমৎকার আবাসন। প্রাকৃতিক সবুজে ঘেরা কোলাহলমুক্ত নিরাপদ পরিবেশ।'
  }
];

const initialBlogs = [
  {
    title: '৩৬ কিস্তিতে প্লট কেনার সুবিধা — কোনো অতিরিক্ত চাপ ছাড়াই আপনার স্বপ্নের জমি হাতে নিন!',
    content: 'ভবিষ্যৎ ঢাকার জন্য নিরাপদ বিনিয়োগ করুন — আজই আপনার স্বপ্নের প্লট নিশ্চিত করুন! ঢাকার কোলাহল থেকে একটু দূরে, কিন্তু সুবিধার একদম কাছাকাছি রেডি প্লট কেনার দুর্দান্ত সুযোগ। মাত্র ৩৬ মাসের সহজ ও নির্ঝঞ্ঝাট কিস্তিতে আপনি হতে পারেন বসতবাড়ি পূর্বাচল প্রকল্পের একজন গর্বিত অংশীদার। কোনো হিডেন চার্জ বা অতিরিক্ত সুদ ছাড়া গ্রাহকবান্ধব কিস্তির সুবিধা আমাদের অন্যতম বিশেষত্ব।',
    image: 'https://bashatbari.com/wp-content/uploads/2025/09/blog-1.jpg',
    author: 'Admin',
    tags: ['কিস্তি সুবিধা', 'নিরাপদ বিনিয়োগ', 'রেডি প্লট']
  },
  {
    title: 'স্বপ্নের নিজের জমি — এখন হাতের নাগালেই!',
    content: 'আপনি কি ভেবেছেন, ঢাকার এত কাছে নিজের একটি রেডি প্লট পাওয়া সম্ভব মাত্র কয়েক লাখ টাকায়? প্রকৃতির মনোরম পরিবেশে আপনার স্বপ্নের বাড়ি গড়তে আজই ঘুরে যান আমাদের বসতবাড়ি পূর্বাচল। সবুজে ঘেরা প্রাকৃতিক পরিবেশ ও আধুনিক নাগরিক সুযোগ-সুবিধার এক অপূর্ব মিশেল গড়ে তোলা হয়েছে এই প্রকল্পে। মধ্যবিত্ত ও উচ্চবিত্ত সকলের সাধ্যের সাথে সংগতি রেখেই আমাদের ব্লকগুলোর ডিজাইন প্রস্তুত করা হয়েছে।',
    image: 'https://bashatbari.com/wp-content/uploads/2025/09/blog-2.jpg',
    author: 'Admin',
    tags: ['আবাসন', 'স্বপ্নের বাড়ি', 'পূর্বাচল সিটি']
  },
  {
    title: 'প্লট ডিমারকেশন ও বাউন্ডারি ওয়ালের কাজ সম্পন্ন',
    content: 'আমরা আনন্দের সাথে জানাচ্ছি যে বসতবাড়ি পূর্বাচল প্রজেক্টের ব্লক এ-র সমস্ত প্লটের ডিমারকেশন ও বাউন্ডারি দেয়াল নির্মাণের কাজ সম্পূর্ণ হয়েছে। গ্রাহকদের কাছে নির্দিষ্ট সময়ের মধ্যে সম্পূর্ণ রেডি প্লট হস্তান্তর করার প্রতিশ্রুতি বাস্তবায়নে আমরা এক ধাপ এগিয়ে গেলাম। এখন ব্লক এ-র গ্রাহকগণ চাইলে সীমানা পিলার ও সীমানা প্রাচীর পরিদর্শন করে তাদের স্থাপনা নির্মাণের প্রস্তুতি শুরু করতে পারেন।',
    image: 'https://bashatbari.com/wp-content/uploads/2025/07/blog-3.jpg',
    author: 'Admin',
    tags: ['ডিমারকেশন', 'উন্নয়ন কাজ', 'রেডি ব্লক']
  }
];

const initialJobs = [
  {
    title: 'Executive, Sales & Marketing (প্লট বিক্রয়)',
    department: 'Sales & Marketing',
    location: 'Corporate Office, Nikunja-1, Dhaka',
    description: 'আমরা আমাদের সেলস টিমে অভিজ্ঞ এবং আত্মবিশ্বাসী সেলস এক্সিকিউটিভ খুঁজছি যারা বসতবাড়ি পূর্বাচল আবাসন প্রকল্পের প্লট বিক্রয় ও কাস্টমার রিলেশনশিপ ব্যবস্থাপনায় ভূমিকা রাখবেন। কাস্টমারদের প্রজেক্ট ভিজিট করানো এবং তাদের সাথে ডিল ক্লোজ করার সম্পূর্ণ দায়িত্ব পালন করতে হবে।',
    requirements: '১. যেকোনো স্বনামধন্য বিশ্ববিদ্যালয় থেকে স্নাতক ডিগ্রি।\n২. রিয়েল এস্টেট বা আবাসন খাতে ন্যূনতম ২ বছরের কাজের অভিজ্ঞতা।\n৩. চমৎকার যোগাযোগ দক্ষতা এবং ক্লায়েন্ট রিলেশনশিপ ব্যবস্থাপনায় পারদর্শিতা।',
    deadline: '৩০ জুন, ২০২৬',
    active: true
  },
  {
    title: 'Assistant Manager, Customer Relations',
    department: 'Customer Services',
    location: 'Corporate Office, Dhaka',
    description: 'গ্রাহকদের কিস্তি পেমেন্ট শিডিউল ট্র্যাকিং, তাদের বুকিং কনফার্মেশন প্রসেস করা এবং কাস্টমার ইনকোয়ারি গুলোর দ্রুত সমাধান দেওয়া এই পদের প্রধান কাজ। গ্রাহক সন্তুষ্টি বজায় রাখা ও পেপারওয়ার্ক সম্পন্ন করা এর প্রধান দায়িত্ব।',
    requirements: '১. স্নাতক বা স্নাতকোত্তর ডিগ্রি।\n২. রিয়েল এস্টেট বা কর্পোরেট কাস্টমার রিলেশনে ৩-৫ বছরের অভিজ্ঞতা।\n৩. এমএস অফিস এবং কাস্টমার ডাটাবেজ সিস্টেমে ভালো দক্ষতা।',
    deadline: '১৫ জুলাই, ২০২৬',
    active: true
  }
];

async function seedDatabase() {
  try {
    // 1. Seed Properties
    const existingProps = await dataStore.getAllProperties();
    if (existingProps.length === 0) {
      console.log('🌱 Database is empty. Seeding initial properties data...');
      for (const prop of initialProperties) {
        await dataStore.createProperty(prop);
      }
      console.log('✅ Successfully seeded initial properties.');
    }

    // 2. Seed Blogs
    const existingBlogs = await dataStore.getAllBlogs();
    if (existingBlogs.length === 0) {
      console.log('🌱 Seeding initial blog articles...');
      for (const blog of initialBlogs) {
        await dataStore.createBlog(blog);
      }
      console.log('✅ Successfully seeded initial blogs.');
    }

    // 3. Seed Jobs
    const existingJobs = await dataStore.getAllJobs();
    if (existingJobs.length === 0) {
      console.log('🌱 Seeding initial job openings...');
      for (const job of initialJobs) {
        await dataStore.createJob(job);
      }
      console.log('✅ Successfully seeded initial jobs.');
    }

    console.log('ℹ️ Database seeding verification finished.');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
}

module.exports = seedDatabase;
