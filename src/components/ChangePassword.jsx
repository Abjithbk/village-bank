import React,{useState} from 'react'
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const [old_pass,setOld_Pass] = useState("");
    const [new_pass,setNew_Pass] = useState("");
    const [conf_new_pass,setConf_New_Pass]= useState("")
    const [message,setMessage] = useState("")
    const [error,setError] = useState("")
    const {changePass} = useAuth()
    const navigate = useNavigate()

    const handleChangePass =async (e) => {
        e.preventDefault();
      if(new_pass !== conf_new_pass) {
         setMessage("password do not match")
      }
        try {
            await changePass(old_pass,new_pass,conf_new_pass);
           setMessage("Password Changed successfully");
           navigate("/LoginPage")
        }
        catch(error) {
             setError("Password doesn't Changed.Try again")
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
            Change Password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleChangePass} className="space-y-6">
            <div>
              <label className="block text-sm/6 font-medium text-gray-900">
                Old Password
              </label>
              <div className="mt-2">
                <input
                  id="old-pass"
                  name="old-pass"
                  type="password"
                 value={old_pass}
                 onChange={(e)=> {
                    setOld_Pass(e.target.value);
                 }}
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900">
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
              <label  className="block text-sm/6 font-medium text-gray-900">
               Confirm New Password
              </label>
              <div className="mt-2">
                <input
                  id="conf-new-pass"
                  name="conf-new-pass"
                  type="password"
                 value={conf_new_pass}
                 onChange={(e) => {
                    setConf_New_Pass(e.target.value);
                 }}
                  required
                
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
                {message && <p className='text-green-400 mt-4'>{message}</p> }
                {error && <p className='text-red-500'>{error}</p> }
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
  )
}

export default ChangePassword
