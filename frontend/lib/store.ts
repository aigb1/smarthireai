import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  role: 'employer' | 'recruiter' | 'clinician' | 'superadmin'
  avatar?: string
}

const STORAGE_KEY = 'mednode_demo_user'

function loadUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveUser(user: User | null) {
  if (typeof window === 'undefined') return
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  else localStorage.removeItem(STORAGE_KEY)
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  initFromStorage: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => {
    saveUser(user)
    set({ user, isAuthenticated: !!user, isLoading: false })
  },
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => {
    saveUser(null)
    set({ user: null, isAuthenticated: false })
  },
  initFromStorage: () => {
    const user = loadUser()
    set({ user, isAuthenticated: !!user, isLoading: false })
  },
}))

interface Job {
  id: string
  title: string
  description?: string
  company_name?: string
  location?: string
  status: string
  application_count: number
}

interface JobsStore {
  jobs: Job[]
  selectedJob: Job | null
  setJobs: (jobs: Job[]) => void
  setSelectedJob: (job: Job | null) => void
  addJob: (job: Job) => void
  updateJob: (id: string, job: Partial<Job>) => void
  deleteJob: (id: string) => void
}

interface SidebarStore {
  isOpen: boolean
  mobileOpen: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
  setMobileOpen: (open: boolean) => void
  toggleMobile: () => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: false,
  mobileOpen: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setMobileOpen: (open) => set({ mobileOpen: open }),
  toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
}))

// ── Theme store ──────────────────────────────────────────────────────────────
interface ThemeStore {
  theme: 'dark' | 'light'
  toggle: () => void
  setTheme: (t: 'dark' | 'light') => void
  initTheme: () => void
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'dark',
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    if (typeof window !== 'undefined') localStorage.setItem('mn_theme', next)
    document.documentElement.classList.toggle('light', next === 'light')
    set({ theme: next })
  },
  setTheme: (t) => {
    if (typeof window !== 'undefined') localStorage.setItem('mn_theme', t)
    document.documentElement.classList.toggle('light', t === 'light')
    set({ theme: t })
  },
  initTheme: () => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('mn_theme') as 'dark' | 'light' | null
    const theme = saved ?? 'dark'
    document.documentElement.classList.toggle('light', theme === 'light')
    set({ theme })
  },
}))

// ── Voice store ─────────────────────────────────────────────────────────────
interface VoiceStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  isOpen: false,
  open:  () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))

export const useJobsStore = create<JobsStore>((set) => ({
  jobs: [],
  selectedJob: null,
  setJobs: (jobs) => set({ jobs }),
  setSelectedJob: (job) => set({ selectedJob: job }),
  addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
  updateJob: (id, updatedJob) =>
    set((state) => ({
      jobs: state.jobs.map((job) => (job.id === id ? { ...job, ...updatedJob } : job)),
    })),
  deleteJob: (id) => set((state) => ({ jobs: state.jobs.filter((job) => job.id !== id) })),
}))
