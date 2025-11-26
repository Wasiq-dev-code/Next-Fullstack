"use client"
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

function RegisterPage
() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if(password !== confirmPassword) {
      alert("Passwords do not match")
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if(!res.ok) {
        throw new Error("Registration failed")
      }


      const data = await res.json()

      console.log(data)
      router.push('/login')
    } catch (error) {
      console.error("Registration failed", error)
    }
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
        <button type="submit">Register</button>
      </form>
      <p>already have an account? <a href="/login">Login</a></p>
    </div>
  )
}

export default RegisterPage

