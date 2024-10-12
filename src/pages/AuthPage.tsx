import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { Loader2, Shirt } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [storeId, setStoreId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
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
        toast.success('Logged in successfully!')
        navigate('/dashboard')
      } else {
        // Sign up process
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              store_id: storeId
            }
          }
        })
        if (error) throw error

        if (data.user) {
          // Insert the user's store association into the users table
          const { error: insertError } = await supabase
            .from('users')
            .insert({ id: data.user.id, store_id: storeId })
          
          if (insertError) throw insertError

          // Insert the store if it doesn't exist
          const { error: storeError } = await supabase
            .from('stores')
            .insert({ id: storeId })
            .onConflict('id')
            .ignore()
          
          if (storeError) throw storeError
        }

        toast.success('Registration successful! Please check your email to verify your account.')
        setIsLogin(true)
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Authentication error: ${error.message}`)
      } else {
        toast.error('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shirt className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details below to {isLogin ? 'sign in to' : 'create'} your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {!isLogin && (
                <div className="grid gap-2">
                  <Label htmlFor="storeId">Store ID</Label>
                  <Input
                    id="storeId"
                    type="text"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    required
                  />
                </div>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="link" className="w-full" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </Button>
        </CardFooter>
      </Card>
      <ToastContainer />
    </div>
  )
}

export default AuthPage