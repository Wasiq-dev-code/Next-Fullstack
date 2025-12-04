"use client"
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const router = useRouter()

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const result = await signIn("credentials", {
      email,
      password,
      redirect:false
    })

    if(result?.error) {
      console.error(result.error)
    } else {
      router.push("/")
    }
  }
  return (
    <div>
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type='submit'>Login</button>
      </form>

      <div>
        Dont have an Account ? 
        <a href="/register">Register</a>
        </div>
    </div>
  )
}

export default LoginPage
