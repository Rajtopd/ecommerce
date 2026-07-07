'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { supabase } from '@/lib/supabase'

// Must match the OTP length Supabase actually generates for this project
// (Authentication > Emails > Magic Link template uses {{ .Token }}).
const OTP_LENGTH = 8

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/account'
  
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.push(redirectPath)
    }
  }, [isLoggedIn, authLoading, router, redirectPath])

  useEffect(() => {
    let interval
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const handleSendCode = async (e) => {
    e?.preventDefault()
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        }
      })

      if (error) throw error
      
      setStep(2)
      setResendTimer(30)
      setOtpCode('')
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (eOrCode) => {
    eOrCode?.preventDefault?.()
    
    const codeToVerify = typeof eOrCode === 'string' ? eOrCode : otpCode
    if (codeToVerify.length !== OTP_LENGTH) return

    setLoading(true)
    setErrorMsg('')

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: codeToVerify,
        type: 'email'
      })

      if (error) throw error

      // Note: onAuthStateChange in AuthContext handles the state update,
      // and the useEffect above will redirect automatically.
    } catch (err) {
      console.error(err)
      setErrorMsg('Invalid or expired code. Try again.')
      setLoading(false) // Only stop loading if error. Success will redirect.
    }
  }

  const handleResendCode = async () => {
    if (resendTimer > 0) return
    
    setErrorMsg('')
    setResendSuccess(false)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }
      })

      if (error) throw error
      
      setResendTimer(30)
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to resend code.')
    }
  }

  const handleGoogleLogin = async () => {
    setErrorMsg('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${redirectPath}`,
        }
      })
      if (error) throw error
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Google login failed. Please try again.')
    }
  }

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').substring(0, OTP_LENGTH)
    setOtpCode(val)
    if (val.length === OTP_LENGTH) {
      handleVerifyCode(val)
    }
  }

  if (authLoading || isLoggedIn) {
    return (
      <div className="pt-[140px] pb-20 min-h-[60vh] flex justify-center">
        <div className="w-8 h-8 border-2 border-[#E8E4DF] border-t-[#C8726A] rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-[420px] mx-auto pt-[140px] pb-20 px-6 flex flex-col items-center">
      <h1 className="font-display text-[24px] text-[#1C1410] tracking-[0.08em] mb-10">
        Soul Sisters
      </h1>

      {step === 1 ? (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="font-display text-[28px] text-[#1C1410] text-center">Welcome back</h2>
          <p className="font-body font-light text-[12px] text-[#6B5E54] text-center mt-2 mb-7">
            Enter your email to receive a login code.
          </p>

          <form onSubmit={handleSendCode} className="w-full">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[46px] rounded-[2px] border-[0.5px] border-[#E8E4DF] font-body font-light text-[13px] text-[#1C1410] px-4 outline-none focus:border-[#1C1410] transition-colors"
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[46px] mt-3 bg-[#1C1410] text-white rounded-[2px] font-body font-normal text-[10px] uppercase tracking-[0.12em] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#6B5E54] border-t-white rounded-full animate-spin"></div>
              ) : (
                'Send Login Code'
              )}
            </button>
            
            {errorMsg && (
              <p className="font-body font-light text-[11px] text-[#C8726A] text-center mt-2">
                {errorMsg}
              </p>
            )}
          </form>

          <div className="flex items-center my-6 w-full">
            <div className="flex-1 h-[0.5px] bg-[#E8E4DF]"></div>
            <span className="px-3 font-body font-light text-[10px] text-[#B5A89E] uppercase tracking-[0.1em]">or</span>
            <div className="flex-1 h-[0.5px] bg-[#E8E4DF]"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full h-[46px] border-[0.5px] border-[#E8E4DF] bg-white text-[#1C1410] rounded-[2px] font-body font-normal text-[10px] uppercase tracking-[0.12em] hover:bg-[#FAFAF8] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.186 4.114-3.51 0-6.356-2.85-6.356-6.36 0-3.51 2.846-6.36 6.356-6.36 1.63 0 3.127.619 4.276 1.629l3.062-3.062C19.102 2.372 15.895 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.898 0 10.873-4.225 10.873-10.873 0-.48-.048-.962-.124-1.322H12.24z"/>
            </svg>
            Continue with Google
          </button>

          <p className="font-body font-light text-[10px] text-[#B5A89E] text-center mt-6">
            New customer? You&apos;ll be registered automatically.
          </p>
        </div>
      ) : (
        <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="font-display text-[28px] text-[#1C1410] text-center">Check your email</h2>
          <p className="font-body font-light text-[12px] text-[#6B5E54] text-center mt-2 mb-7">
            We sent a {OTP_LENGTH}-digit code to {email}
          </p>

          <form onSubmit={handleVerifyCode} className="w-full flex flex-col items-center">
            <input
              type="text"
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              placeholder={'0'.repeat(OTP_LENGTH)}
              value={otpCode}
              onChange={handleOtpChange}
              className="w-full h-[56px] rounded-[2px] border-[0.5px] border-[#E8E4DF] font-body font-normal text-[24px] text-[#1C1410] text-center tracking-[0.3em] outline-none focus:border-[#1C1410] transition-colors"
            />

            <button
              type="submit"
              disabled={loading || otpCode.length !== OTP_LENGTH}
              className="w-full h-[46px] mt-3 bg-[#C8726A] text-white rounded-[2px] font-body font-normal text-[10px] uppercase tracking-[0.12em] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#6B5E54] border-t-white rounded-full animate-spin"></div>
              ) : (
                'Verify Code'
              )}
            </button>

            {errorMsg && (
              <p className="font-body font-light text-[11px] text-[#C8726A] text-center mt-2">
                {errorMsg}
              </p>
            )}

            <div className="mt-4 flex flex-col items-center gap-2">
              {resendSuccess ? (
                <span className="font-body font-light text-[10px] text-[#2E7D5E]">Code resent!</span>
              ) : resendTimer > 0 ? (
                <span className="font-body font-light text-[10px] text-[#B5A89E]">
                  Resend code in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="font-body font-light text-[10px] text-[#6B5E54] hover:text-[#1C1410] transition-colors"
                >
                  Didn&apos;t receive it? Resend code
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setErrorMsg('')
                }}
                className="font-body font-light text-[10px] text-[#6B5E54] hover:text-[#1C1410] transition-colors mt-2"
              >
                &larr; Change email
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="pt-[140px] pb-20 min-h-[60vh] flex justify-center">
        <div className="w-8 h-8 border-2 border-[#E8E4DF] border-t-[#C8726A] rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
