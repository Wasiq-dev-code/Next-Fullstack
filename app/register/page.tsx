"use client"
import { apiClient, RegisterData} from '@/lib/api-client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

function RegisterPage
() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()

  const registerMutation = useMutation({
      mutationFn:(data:RegisterData) => apiClient.register(data),
      onSuccess: () => {
        router.push("/login");
      },

      onError: (error) => {
        console.error("Registration failed:", error);
      }
    })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if(password !== confirmPassword) {
      alert("Passwords do not match")
       return;
    }

    registerMutation.mutate({
      email,
      password
    })
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Loading..." : "Register"}
        </button>
      </form>

      {registerMutation.isError && (
        <p style={{ color: "red" }}>
          {String(registerMutation.error)}
        </p>
      )}
      <p>already have an account? <a href="/login">Login</a></p>
    </div>
  )
}

export default RegisterPage

