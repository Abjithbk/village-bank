import React,{useState} from 'react'
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email,setEmail] = useState('');
    const [otp,setOtp] = useState('')
    const [new_pass,setNew_Pass] = useState('');
    const [conf_new_pass,setConf_New_Pass] = useState('')
    const [passError,setPassError] = useState('');
    const [otpError,setOtpError] = useState('')
    const [otpMessage,setOtpMessage] = useState('')
    const [rateLimitError,setRateLimitError] = useState('')
    const [step,setStep] = useState('requestOtp')
    const {forgotPass,sendOtp} = useAuth()
    const navigate = useNavigate()


    const handleOtp =async (e) => {
      e.preventDefault();
      try {
    const response =   await sendOtp(email);
    console.log(response);
    
      setOtpMessage(response.message)
      setStep('verifyOtp')
      }
      catch(error) {
        if(error.response?.status === 429) {
          setRateLimitError("Too many OTP requests. Please try again after a minute.")
        }
        else {
           setOtpError("otp do not send.Try again")
        }
      }
    } 

    const handleForgot =async (e) => {
        e.preventDefault();
   if(new_pass !== conf_new_pass) {
     setPassError("Password do not match")
   }
        try {
        await forgotPass(email,otp,new_pass,conf_new_pass);
         navigate("/LoginPage")
        }
        catch(error) {
         console.log(error);
         
        }

    }
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Forgot Password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm"> 
          {otpMessage && <p className='text-green-400'>{otpMessage}</p> }
          {otpError && <p className='text-red-600'>{otpError}</p> }
          {rateLimitError && <p className='text-red-500 font-semibold'>{rateLimitError}</p> }
          {
            step === 'requestOtp' && (

              <form onSubmit={handleOtp} className="space-y-6">
            <div>
              
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md border px-3 py-2 text-base"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white rounded py-2">
              Send OTP
            </button>
          </form>
            )
          }
           {
            step === 'verifyOtp' && (
              <form onSubmit={handleForgot} className="space-y-6">
            {passError && <p className="text-red-500">{passError}</p>}

            <div>
              <label className="block text-sm font-medium text-gray-900">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="block w-full rounded-md border px-3 py-2 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">New Password</label>
              <input
                type="password"
                value={new_pass}
                onChange={(e) => setNew_Pass(e.target.value)}
                required
                className="block w-full rounded-md border px-3 py-2 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Confirm Password</label>
              <input
                type="password"
                value={conf_new_pass}
                onChange={(e) => setConf_New_Pass(e.target.value)}
                required
                className="block w-full rounded-md border px-3 py-2 text-base"
              />
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white rounded py-2">
              Reset Password
            </button>
          </form>
            )
           }
        </div>
      </div>
  )
}

export default ForgotPassword
