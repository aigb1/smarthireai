export const DEMO_USERS = {
  employer: {
    id: 'demo-employer',
    email: 'trust@mednode.cloud',
    name: 'Royal London NHS Trust',
    role: 'employer' as const,
  },
  recruiter: {
    id: 'demo-recruiter',
    email: 'agent@mednode.cloud',
    name: 'Agent Recruiter',
    role: 'recruiter' as const,
  },
  clinician: {
    id: 'demo-clinician',
    email: 'dr.morgan@mednode.cloud',
    name: 'Dr. Alex Morgan',
    role: 'clinician' as const,
  },
  superadmin: {
    id: 'demo-superadmin',
    email: 'admin@mednode.cloud',
    name: 'Platform Admin',
    role: 'superadmin' as const,
  },
}

export const DEMO_JOBS = [
  { id: 'b01', title: 'Emergency Medicine Consultant', description: 'Experienced EM consultant required for A&E cover. FRCEM essential. Night and weekend shifts included.', company_name: 'Royal London Hospital', location: 'Whitechapel, E1', status: 'published', application_count: 12, salary_min: 95000, job_type: 'Full-time' },
  { id: 'b02', title: 'Cardiology SpR', description: 'ST6+ Cardiology registrar needed for inpatient ward cover and cath lab support. Echo skills desirable.', company_name: 'North Middlesex University', location: 'Edmonton, N18', status: 'published', application_count: 8, salary_min: 72000, job_type: 'Part-time' },
  { id: 'b03', title: 'Anaesthesiology Clinician', description: 'URGENT: Immediate theatre cover required. GA and regional experience essential. Start 30 March.', company_name: "St Thomas' Hospital", location: 'Lambeth, SE1', status: 'published', application_count: 3, salary_min: 105000, job_type: 'Emergency' },
  { id: 'b04', title: 'Trauma & Orthopaedics SpR', description: 'T&O registrar for busy major trauma centre. On-call commitment required. ATLS holder preferred.', company_name: "King's College Hospital", location: 'Denmark Hill, SE5', status: 'published', application_count: 15, salary_min: 68000, job_type: 'Full-time' },
  { id: 'b05', title: 'Intensive Care Physician', description: 'Level 3 ICU physician cover. FFICM or equivalent required. 1-in-4 on-call rota.', company_name: 'University College Hospital', location: 'Bloomsbury, WC1', status: 'draft', application_count: 0, salary_min: 98000, job_type: 'Full-time' },
]

export const DEMO_CANDIDATES = [
  { id: 'cand-01', name: 'Dr. S. Okafor',    specialty: 'Cardiology',         experience_years: 8,  available: true,  location: 'London',     skills: ['Echo', 'Cath Lab', 'ACS'],          rate: '£90/hr' },
  { id: 'cand-02', name: 'Dr. R. Williams',  specialty: 'Trauma & Ortho',     experience_years: 6,  available: true,  location: 'Birmingham', skills: ['ATLS', 'Arthroplasty', 'On-Call'],  rate: '£88/hr' },
  { id: 'cand-03', name: 'Dr. A. Sterling',  specialty: 'Emergency Medicine',  experience_years: 12, available: true,  location: 'London',     skills: ['FRCEM', 'Resus', 'Paeds EM'],       rate: '£100/hr' },
  { id: 'cand-04', name: 'Dr. M. Patel',     specialty: 'Intensive Care',      experience_years: 9,  available: true,  location: 'Manchester', skills: ['Ventilation', 'ECMO', 'Sepsis'],    rate: '£110/hr' },
  { id: 'cand-05', name: 'Dr. Y. Kimura',    specialty: 'Paediatrics',         experience_years: 7,  available: true,  location: 'London',     skills: ['MRCPCH', 'Neonates', 'PICU'],       rate: '£91/hr' },
  { id: 'cand-06', name: 'Dr. C. Nakamura',  specialty: 'Obs & Gynaecology',   experience_years: 11, available: false, location: 'Leeds',      skills: ['C-Section', 'Colposcopy', 'ANC'],   rate: '£102/hr' },
  { id: 'cand-07', name: 'Dr. F. Okonkwo',   specialty: 'Gastroenterology',    experience_years: 5,  available: true,  location: 'London',     skills: ['ERCP', 'Endoscopy', 'IBD'],         rate: '£93/hr' },
  { id: 'cand-08', name: 'Dr. B. Hassan',    specialty: 'Neurology',           experience_years: 4,  available: true,  location: 'Bristol',    skills: ['Stroke', 'EEG', 'TIA clinic'],      rate: '£96/hr' },
]

export const DEMO_BOOKMARKS = DEMO_CANDIDATES.slice(0, 4).map(c => ({
  ...c,
  bookmarked_at: '2026-03-25',
  experience_years: c.experience_years,
}))
