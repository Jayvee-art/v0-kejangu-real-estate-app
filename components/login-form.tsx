"use client"

import { useActionState, useState } from "react"
import { signIn, signUp } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [signInState, signInAction, signInPending] = useActionState(signIn, null)
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, null)

  const action = isLogin ? signInAction : signUpAction
  const pending = isLogin ? signInPending : signUpPending
  const state = isLogin ? signInState : signUpState

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
        <CardDescription>
          {isLogin ? "Enter your credentials to access the chat." : "Create an account to start chatting."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (isLogin ? "Signing In..." : "Signing Up...") : isLogin ? "Sign In" : "Sign Up"}
          </Button>
          {state && state.message && (
            <p className={`text-sm text-center ${state.success ? "text-green-600" : "text-red-600"}`}>
              {state.message}
            </p>
          )}
        </form>
        <div className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="p-0 h-auto">
            {isLogin ? "Sign Up" : "Sign In"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
