import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Loader2 } from 'lucide-react'
import { AuthError } from '@supabase/supabase-js'

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [justSignedUp, setJustSignedUp] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/dashboard')
      }
    })

    return () => {
      if (authListener && typeof authListener.unsubscribe === 'function') {
        authListener.unsubscribe()
      }
    }
  }, [navigate])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.user) {
          toast.success('Logged in successfully!')
          navigate('/dashboard')
        } else {
          throw new Error('No user data returned')
        }
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          setJustSignedUp(true)
          toast.success('Registration successful! Please check your email to verify your account.')
        } else {
          throw new Error('No user data returned')
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      if (error instanceof AuthError) {
        toast.error(`Authentication error: ${error.message}`)
      } else if (error instanceof Error) {
        toast.error(`Error: ${error.message}`)
      } else {
        toast.error('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationCheck = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      if (data.user && data.user.email_confirmed_at) {
        toast.success('Email verified successfully!')
        navigate('/dashboard')
      } else {
        toast.info('Email not verified yet. Please check your inbox and click the verification link.')
      }
    } catch (error) {
      console.error('Verification check error:', error)
      if (error instanceof Error) {
        toast.error(`Error checking verification status: ${error.message}`)
      } else {
        toast.error('An unexpected error occurred while checking verification status. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        {justSignedUp ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-center mb-4">Please check your email to verify your account.</p>
            <button
              onClick={handleVerificationCheck}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "I've verified my email"}
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleAuth}>
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <span>{isLogin ? 'Sign in' : 'Sign up'}</span>
                )}
              </button>
            </div>
          </form>
        )}
        {!justSignedUp && (
          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-primary hover:text-primary-dark"
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  )
}

export default AuthPage