import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

// Create Supabase client
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

// API base URL
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-94a31f15`

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`
  }
}

// API service
export const apiService = {
  // Auth methods
  async register(email: string, password: string, name: string, role: string) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ email, password, name, role })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }
    
    return response.json()
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Profile methods
  async getProfile() {
    const response = await fetch(`${API_BASE}/profile`, {
      headers: await getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }
    
    return response.json()
  },

  async updateProfile(updates: any) {
    const response = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) {
      throw new Error('Failed to update profile')
    }
    
    return response.json()
  },

  // Test methods
  async getTests() {
    const response = await fetch(`${API_BASE}/tests`, {
      headers: await getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch tests')
    }
    
    return response.json()
  },

  async createTest(testData: any) {
    const response = await fetch(`${API_BASE}/tests`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(testData)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create test')
    }
    
    return response.json()
  },

  async submitTestResult(testId: string, answers: any[], score: number, timeSpent: number) {
    const response = await fetch(`${API_BASE}/tests/${testId}/submit`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ answers, score, timeSpent })
    })
    
    if (!response.ok) {
      throw new Error('Failed to submit test result')
    }
    
    return response.json()
  },

  // Results methods
  async getResults() {
    const response = await fetch(`${API_BASE}/results`, {
      headers: await getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch results')
    }
    
    return response.json()
  },

  // Analytics methods
  async getAnalytics() {
    const response = await fetch(`${API_BASE}/analytics`, {
      headers: await getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch analytics')
    }
    
    return response.json()
  },

  // AI Chat methods
  async sendAIMessage(message: string, context?: string) {
    const response = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ message, context })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      // Return fallback response if provided
      if (data.fallback) {
        return { response: data.fallback, isDemo: true }
      }
      throw new Error(data.error || 'AI service unavailable')
    }
    
    return { response: data.response, isDemo: false }
  },

  // Utility methods
  async initSampleData() {
    const response = await fetch(`${API_BASE}/init-data`, {
      method: 'POST',
      headers: await getAuthHeaders()
    })
    
    if (!response.ok) {
      console.warn('Failed to initialize sample data')
    }
    
    return response.ok
  }
}

// Auth state listener
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}