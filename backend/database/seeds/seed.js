const db = require('../db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

console.log('🌱 Seeding the node. — healthcare database...');

console.log('🧹 Clearing existing data...');
db.prepare('DELETE FROM bookmarks').run();
db.prepare('DELETE FROM applications').run();
db.prepare('DELETE FROM jobs').run();
db.prepare('DELETE FROM candidate_profiles').run();
db.prepare('DELETE FROM users').run();

const hashPassword = (password) => bcrypt.hashSync(password, 10);

console.log('👥 Creating test users...');
const users = [
  { id: uuidv4(), email: 'employer@local.dev',  password: hashPassword('password'), name: 'Sarah Johnson',  role: 'employer',  avatar: null },
  { id: uuidv4(), email: 'recruiter@local.dev', password: hashPassword('password'), name: 'Mike Chen',      role: 'recruiter', avatar: null },
  { id: uuidv4(), email: 'clinician@local.dev', password: hashPassword('password'), name: 'Dr. A. Sterling', role: 'clinician', avatar: null },
  { id: uuidv4(), email: 'employer2@local.dev', password: hashPassword('password'), name: 'David Smith',    role: 'employer',  avatar: null },
];

const userStmt = db.prepare(`INSERT INTO users (id, email, password, name, role, avatar) VALUES (?, ?, ?, ?, ?, ?)`);
users.forEach(u => userStmt.run(u.id, u.email, u.password, u.name, u.role, u.avatar));

const employerId  = users[0].id;
const recruiterId = users[1].id;

console.log('👨‍⚕️ Creating clinician profiles...');

const clinicianSkills = [
  ['Emergency Medicine', 'FRCEM', 'ATLS', 'Resuscitation'],
  ['Intensive Care', 'FFICM', 'Ventilation', 'Sepsis Management'],
  ['Cardiology', 'Echocardiography', 'Cath Lab', 'Arrhythmia'],
  ['Anaesthesiology', 'GA & Regional', 'Airway Management', 'Pain Management'],
  ['Paediatrics', 'MRCPCH', 'Neonatal Care', 'Paediatric A&E'],
  ['Obs & Gynaecology', 'MRCOG', 'Labour Ward', 'C-Section'],
  ['Neurology', 'Stroke Management', 'TIA Clinic', 'Epilepsy'],
  ['Trauma & Orthopaedics', 'ATLS', 'Major Trauma', 'Fracture Management'],
  ['Gastroenterology', 'ERCP', 'Endoscopy', 'GI Bleed Pathway'],
  ['Psychiatry', 'MRCPsych', 'Section 12', 'Acute Admissions'],
  ['Geriatrics', 'Falls Assessment', 'Dementia Care', 'Frailty'],
  ['Radiology', 'CT Reporting', 'Interventional IR', 'MRI'],
  ['GP Locum', 'MRCGP', 'Minor Surgery', 'Chronic Disease'],
  ['Respiratory Medicine', 'Bronchoscopy', 'CPAP', 'Pulmonary Rehab'],
  ['Rheumatology', 'Joint Injection', 'Biologics', 'Connective Tissue'],
  ['Dermatology', 'Skin Surgery', 'Patch Testing', 'Phototherapy'],
  ['ENT', 'Microsuction', 'Nasendoscopy', 'Tonsillectomy'],
  ['Ophthalmology', 'Slit Lamp', 'Cataract Surgery', 'Retinal Assessment'],
  ['Haematology', 'Bone Marrow', 'Transfusion Medicine', 'Anticoagulation'],
  ['Endocrinology', 'Diabetes Management', 'Thyroid Clinic', 'Pituitary'],
];

const ukLocations = [
  'Royal London Hospital, London',
  'St. Thomas\' Hospital, London',
  'King\'s College Hospital, London',
  'Manchester Royal Infirmary',
  'Leeds General Infirmary',
  'Bristol Royal Infirmary',
  'Queen Elizabeth Hospital, Birmingham',
  'Newcastle Upon Tyne Hospitals NHS',
  'Oxford University Hospitals NHS',
  'Cambridge University Hospitals NHS',
];

const ukBios = [
  'GMC-registered consultant with extensive NHS and private sector experience. Specialist in high-acuity ward environments.',
  'Experienced locum clinician with 5-star Locum Trust rating. FRCEM/FFICM qualified. CQC audit-ready documentation.',
  'Senior registrar with strong procedural competence. Committed to evidence-based practice and MDT collaboration.',
  'Dual-qualified NHS consultant with academic research background. Published in NEJM and The Lancet.',
  'Highly regarded specialist with 12 years of post-CCT experience across major London teaching hospitals.',
  'Flexible locum available for short and long-term placements. All credentials verified and up to date.',
  'Enthusiastic clinician with special interest in quality improvement and clinical governance.',
  'MBBS, MRCS qualified with leadership experience. Former NHS trust clinical lead for emergency pathway.',
];

const ukWork = [
  [{ title: 'Locum Consultant', company: 'Royal London Hospital', years: '2023–Present' }],
  [{ title: 'SpR', company: 'Barts Health NHS Trust', years: '2021–Present' }],
  [{ title: 'Registrar', company: 'King\'s College Hospital NHS', years: '2022–Present' }],
  [{ title: 'Staff Grade Doctor', company: 'University College Hospital', years: '2020–Present' }],
];

const clinicianNames = [
  'Dr. Amara Sterling', 'Dr. Marcus Patel', 'Dr. Sofia Okafor', 'Dr. Richard Williams',
  'Dr. Chloe Nakamura', 'Dr. Benjamin Hassan', 'Dr. Yasmin Kimura', 'Dr. Felix Okonkwo',
  'Dr. Grace Adeyemi', 'Dr. James Whitfield', 'Dr. Priya Sharma', 'Dr. Oliver Chen',
  'Dr. Natalie Mensah', 'Dr. Daniel Adeyinka', 'Dr. Laura Fitzgerald', 'Dr. Samuel Tran',
  'Dr. Isabelle Osei', 'Dr. Aaron Malik', 'Dr. Hannah Bergstrom', 'Dr. Thomas Ihejirika',
];

const candidateStmt = db.prepare(`
  INSERT INTO candidate_profiles (id, name, email, phone, location, bio, skills, experience_years, education, work_history, available)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const candidates = [];
for (let i = 0; i < 50; i++) {
  const candidate = {
    id: uuidv4(),
    name: clinicianNames[i % clinicianNames.length] + (i >= 20 ? ' II' : ''),
    email: `clinician${i + 1}@nhs.example.com`,
    phone: `07${String(700000000 + i).slice(0, 9)}`,
    location: ukLocations[i % ukLocations.length],
    bio: ukBios[i % ukBios.length],
    skills: JSON.stringify(clinicianSkills[i % clinicianSkills.length]),
    experience_years: Math.floor(Math.random() * 18) + 2,
    education: JSON.stringify([{ degree: ['MBBS', 'MBChB', 'MBBCh'][i % 3], school: ['University of London', 'University of Manchester', 'University of Edinburgh', 'UCL Medical School'][i % 4], year: 2010 + (i % 12) }]),
    work_history: JSON.stringify(ukWork[i % ukWork.length]),
    available: Math.random() > 0.25 ? 1 : 0,
  };
  candidates.push(candidate);
  candidateStmt.run(
    candidate.id, candidate.name, candidate.email, candidate.phone,
    candidate.location, candidate.bio, candidate.skills, candidate.experience_years,
    candidate.education, candidate.work_history, candidate.available
  );
}

console.log('💼 Creating healthcare job postings...');

const standardForm = JSON.stringify({
  fields: [
    { id: '1', type: 'text',     label: 'Full Name',          required: true },
    { id: '2', type: 'email',    label: 'Email',              required: true },
    { id: '3', type: 'text',     label: 'GMC / NMC Number',   required: true },
    { id: '4', type: 'textarea', label: 'Clinical experience summary', required: true },
    { id: '5', type: 'file',     label: 'CV / Portfolio',     required: true },
    { id: '6', type: 'select',   label: 'Years post-CCT', options: ['0–2', '3–5', '6–10', '10+'], required: true },
  ],
});

const jobs = [
  {
    id: uuidv4(), employer_id: employerId,
    title: 'Emergency Medicine Consultant',
    description: 'Urgent cover needed in A&E at Royal London Hospital. FRCEM essential, ATLS preferred. Night and weekend shifts. GMC registration and DBS required.',
    company_name: 'Barts Health NHS Trust',
    location: 'Royal London Hospital, London',
    job_type: 'Locum',
    salary_range: '£1,200/day',
    form_schema: standardForm, status: 'published',
  },
  {
    id: uuidv4(), employer_id: employerId,
    title: 'ICU / Intensive Care Consultant',
    description: 'Level 3 ICU cover required at St. Thomas\'. FFICM or equivalent required. 1-in-4 on-call. Immediate start available for the right candidate.',
    company_name: 'Guy\'s & St Thomas\' NHS Foundation Trust',
    location: 'St. Thomas\' Hospital, London',
    job_type: 'Locum',
    salary_range: '£1,320/day',
    form_schema: standardForm, status: 'published',
  },
  {
    id: uuidv4(), employer_id: employerId,
    title: 'Cardiology SpR',
    description: 'ST6+ Cardiology registrar needed for inpatient ward cover and cath lab support at North Middlesex University Hospital. Echo skills desirable.',
    company_name: 'North Middlesex University Hospital NHS Trust',
    location: 'North Middlesex University Hospital, London',
    job_type: 'Locum',
    salary_range: '£980/day',
    form_schema: standardForm, status: 'published',
  },
  {
    id: uuidv4(), employer_id: employerId,
    title: 'Anaesthesiology Consultant',
    description: 'URGENT: Theatre cover required at King\'s College Hospital. GA and regional experience essential. Start immediately.',
    company_name: 'King\'s College Hospital NHS Foundation Trust',
    location: 'King\'s College Hospital, London',
    job_type: 'Locum',
    salary_range: '£1,450/day',
    form_schema: standardForm, status: 'draft',
  },
  {
    id: uuidv4(), employer_id: employerId,
    title: 'Paediatric A&E Registrar',
    description: 'Paediatric A&E registrar for busy Level 1 centre at Chelsea & Westminster. MRCPCH or FCEM required. Excellent team culture.',
    company_name: 'Chelsea and Westminster Hospital NHS Foundation Trust',
    location: 'Chelsea & Westminster Hospital, London',
    job_type: 'Locum',
    salary_range: '£920/day',
    form_schema: standardForm, status: 'published',
  },
];

const jobStmt = db.prepare(`
  INSERT INTO jobs (id, employer_id, title, description, company_name, location, job_type, salary_range, form_schema, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
jobs.forEach(j => jobStmt.run(j.id, j.employer_id, j.title, j.description, j.company_name, j.location, j.job_type, j.salary_range, j.form_schema, j.status));

console.log('📝 Creating shift applications...');

const firstJobId = jobs[0].id;
const applicationStmt = db.prepare(`
  INSERT INTO applications (id, job_id, candidate_name, candidate_email, candidate_data, status)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (let i = 0; i < 12; i++) {
  const c = candidates[i];
  applicationStmt.run(
    uuidv4(), firstJobId, c.name, c.email,
    JSON.stringify({
      'Full Name': c.name,
      'Email': c.email,
      'GMC / NMC Number': `GMC-${7000000 + i}`,
      'Clinical experience summary': `${c.experience_years} years post-qualification. ${JSON.parse(c.skills).join(', ')}.`,
      'Years post-CCT': c.experience_years > 10 ? '10+' : `${c.experience_years}`,
    }),
    'pending'
  );
}

console.log('✅ Seeding complete!');
console.log('📊 Summary:');
console.log(`   - ${users.length} users`);
console.log(`   - ${candidates.length} clinician profiles`);
console.log(`   - ${jobs.length} healthcare job postings`);
console.log(`   - 12 shift applications`);
console.log('\n🔐 Test credentials:');
console.log('   Employer:  employer@local.dev / password');
console.log('   Recruiter: recruiter@local.dev / password');
console.log('   Clinician: clinician@local.dev / password');
