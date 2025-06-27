import {createContext,useContext,useState} from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const AuthProvider = ({children}) => {
 const [authToken,setAuthToken] = useState(()=> 
  localStorage.getItem('authToken') ? JSON.parse(localStorage.getItem('authToken')) : null
);

const signup =async (fname,lname,age,email,pno,password,confPassword,profileType,empId,profilePic) => {
   const response = await axios.post("https://village-banking-app.onrender.com/api/profile/register/",{
    first_name : fname,
    last_name : lname,
    age : age,
    email : email,
    phonenumber : pno,
    password1 : password,
    password2 : confPassword,
    profile_type : profileType,
    employee_id : empId,
    profile_pic : profilePic
   }, {
    headers : {
        "Content-Type" : "multipart/form-data"
    }
   })
   return response.data
   
}
  const login =async (email,password) => {
      const response = await axios.post("https://village-banking-app.onrender.com/api/profile/login/", {
        email : email,
        password: password
      })
      if(response.data.access) {
        setAuthToken(response.data)
        localStorage.setItem('authToken',JSON.stringify(response.data))

    
      }
      return response.data
  }
     const logout = () => {
         setAuthToken(null)
         localStorage.removeItem('authToken');
     }  
     const sendOtp =async (email) => {
       const response = await axios.post("https://village-banking-app.onrender.com/api/profile/login/sentotp/",{
        email ,
       },{
      headers: {
        "Content-Type": "application/json" 
      }
    });
       return response.data
     }

  const forgotPass = async (email,otp,new_pass,conf_new_pass) => {
    
    const response =   await axios.post("https://village-banking-app.onrender.com/api/profile/login/forgot-password/", {
        email : email,
        otp : otp,
        new_password : new_pass,
        confirm_new_password : conf_new_pass,
      })
    return response.data
  }
  
  const changePass =async (old_pass,new_pass,conf_new_pass) => {
     const response = await axios.patch("https://village-banking-app.onrender.com/api/profile/change-password/", {
      old_password : old_pass,
      new_password : new_pass,
      confirm_new_password : conf_new_pass
     }, {
      headers : {
        Authorization : `Bearer ${authToken.access}`
      }
     })
     return response.data
  }

  return (
    <AuthContext.Provider value={{authToken,signup,login,forgotPass,changePass,sendOtp,logout}}>
       {children}
    </AuthContext.Provider>
  )
}

export const useAuth =() => useContext(AuthContext)