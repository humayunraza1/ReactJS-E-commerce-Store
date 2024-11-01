import { SignedIn, SignedOut, SignIn, SignInButton, UserButton } from '@clerk/clerk-react'

export default function ClerkSign() {
  return (
    <div className='w-full h-screen flex justify-center items-center'>
        <SignIn/>
    </div>
  )
}