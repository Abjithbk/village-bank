import React,{useState} from 'react'
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email,setEmail] = useState('');
    const [pno,setPno] = useState('');
    const [new_pass,setNew_Pass] = useState('');
    const [conf_new_pass,setConf_New_Pass] = useState('')
    const [error,setError] = useState('');
    const {forgotPass} = useAuth()
    const navigate = useNavigate()
    const handleForgot =async (e) => {
        e.preventDefault();
   if(new_pass !== conf_new_pass) {
     setError("Password do not match")
   }
        try {
        await forgotPass(email,pno,new_pass,conf_new_pass);
         navigate("/LoginPage")
        }
        catch(error) {
         console.log(error);
         
        }

    }
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Forgot Password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleForgot} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                 value={email}
                 onChange={(e)=> {
                    setEmail(e.target.value);
                 }}
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900">
               Phone Number
              </label>
              <div className="mt-2">
                <input
                  id="pno"
                  name="pno"
                  type="number"
                 value={pno}
                 onChange={(e) => {
                    setPno(e.target.value);
                 }}
                  required
                
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                New Password
              </label>
              <div className="mt-2">
                <input
                  id="new-pass"
                  name="new-pass"
                  type="password"
                 value={new_pass}
                 onChange={(e) => {
                    setNew_Pass(e.target.value);
                 }}
                  required
                
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Confirm New Password
                </label>
                
              </div>
              <div className="mt-2">
                {error && <p className='text-red-500'>{error}</p> }
                <input
                  id="conf-new-pass"
                  name="conf-new-pass"
                  type="password"
                  value={conf_new_pass}
                  onChange={(e) => {
                    setConf_New_Pass(e.target.value)
                  }}
                  required
                  
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
  )
}

export default ForgotPassword
