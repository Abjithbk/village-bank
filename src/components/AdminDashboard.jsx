import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useLocation } from 'react-router-dom';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';


ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const AdminDashboard = () => {
  const [openMenu, setOpenMenu] = useState(false);
   const [showNotification,setShowNotification] = useState(false)
   const [activeSection,setActiveSection] = useState("dashboard");
   const [users,setUsers] = useState([])
   const [totalUsers,setTotalUsers] = useState(0)
   const [page,setPage] = useState(1);
   const [pagination,setPagination] = useState('')
   const [adminProfile,setAdminProfile] = useState('');
   const [selectedUser,setSelectedUser] = useState(null)
   const [loading,setLoading] = useState(false)
    const [notificationMessage,setNotificationMessage] = useState('')
  const navigate =  useNavigate()
  const location = useLocation()
  const { authToken,logout } = useAuth()
  const chartData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Total Transactions',
        data: [12000, 19000, 17000, 22000, 21000, 23000, 20000],
        fill: false,
        borderColor: '#10B981',
        tension: 0.4,
      },
    ],
  };
   const usersDetails = async (url) => {
        setLoading(true)
        if(!authToken || !authToken.access) return
        try {
          const response = await axios.get(url, {
          headers : {
            Authorization : `Bearer ${authToken?.access}`
          }
        });
        console.log(response.data);
        setPagination({
          next : response.data.next,
          previous : response.data.previous,
          count : response.data.count
        });
        setUsers(response.data.results);
        setTotalUsers(response.data.count);
        }
        catch(error) {
          console.log(error);
        }
        finally {
          setLoading(false)
        }
        
       }

       const getUserDetails =async () => {
          try {
           const response = await axios.get("https://village-banking-app.onrender.com/api/admin/dashboard/profile/", {
            headers : {
              Authorization : `Bearer ${authToken?.access}`
            }
           })
           setSelectedUser(response.data);
           setActiveSection("userdetails")
           console.log(response.data);
           
          }
          catch(error) {
           console.log(error);
           
          }
       }
  useEffect(()=> {

   const getAdminProfile =async () => {
    if(!authToken || !authToken.access) {
      return;
    }
    try {
      const response = await axios.get("https://village-banking-app.onrender.com/api/admin/dashboard/", {
      headers : {
        Authorization : `Bearer ${authToken?.access}`
      }
    })
    console.log(response.data);
    setAdminProfile(response.data);
    }
    catch(error) {
      console.log(error);
      
    }
    
   }

      if(location.state?.message) {
       setNotificationMessage(location.state.message)
       setShowNotification(true);

       setTimeout(() => {
         setShowNotification(false)
       }, 5000);
      }
       
      
       usersDetails("https://village-banking-app.onrender.com/api/admin/dashboard/profile/?page=1");
       getAdminProfile()
  },[location.state,authToken])

  

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-green-100 p-5 md:min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        <ul className="space-y-3">
         {
          [
            {key : "dashboard", label : "Dashboard" },
            {key : "users",label : "Users"},
            {key : "transactions",label : "Transactions"},
           
          ].map((item) => (
            <li
            key={item.key}
            onClick={()=> {
              setActiveSection(item.key);
            }}
            className={`p-2 rounded-md cursor-pointer ${
              activeSection === item.key ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"
            }`}
            >
             {item.label}
            </li>
          ))
         }
          <li
            className="hover:bg-green-200 p-2 rounded-md cursor-pointer"
            onClick={() => setOpenMenu(!openMenu)}
          >
            Settings
          </li>
        </ul>

        {openMenu && (
          <div className="mt-4 bg-white shadow p-3 rounded">
            <ul className="space-y-2 text-sm">
              <li onClick={() => {
                setActiveSection("profile");
                setOpenMenu(false)
              }} className="hover:bg-gray-100 p-2 rounded">Profile</li>
              <li  onClick={()=> {
                navigate("/ChangePassword")
              }} className="hover:bg-gray-100 p-2 rounded">Change Password</li>
              <li onClick={()=> {
                logout();
                navigate("/LoginPage")
              }} className="hover:bg-gray-100 p-2 rounded">Log Out</li>
            </ul>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold capitalize">{activeSection}</h2>
          {
            adminProfile ? (
           
            <span className="text-gray-800 font-semibold bg-green-100 px-3 py-1 rounded-full shadow-sm">
                 👋 Welcome, {adminProfile.current_user.first_name}
                     </span>

            ) : (
              <div className='space-x-2'>
                <button
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
             SignUp
            </button>
          <button
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
             Login
            </button>
              </div>
         
            )
          }
        </div>

        {/* Summary Cards */}
       {
        activeSection === "dashboard" && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded shadow">
            <p className="text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">{pagination.count}</p>
          </div>
          <div className="bg-green-50 p-4 rounded shadow">
            <p className="text-gray-600">Bank Balance</p>
            <p className="text-2xl font-bold">{adminProfile.bank_balance}</p>
          </div>
          <div className="bg-green-50 p-4 rounded shadow">
            <p className="text-gray-600">New Signups</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-md mb-6">
          <Line data={chartData} />
        </div>
        </>
        )
       }

       {showNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-md z-50">
          {notificationMessage}
        </div>
      )}
        

        {/* Users Table */}
        {
          activeSection === "users" && (
            <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-green-200 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {
                loading ? (
                  <tr><td className='p-3 col-span-4'>Loading...</td></tr>
                ) : users.length ? (
                  users.map((user) => (
                    <tr 
                    onClick={() => {
                      getUserDetails()
                    }}
                    // key={user.user_id}
                    className='border-t'>
                      <td className='p-3'>{user.first_name} {user.last_name} </td>
                      <td className='p-3'>{user.email}</td>
                      <td className='p-3'>{user.phonenumber} </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className='p-3'>No users found</td></tr>
                )
              }
            </tbody>
          </table>
             <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => {
                    if(pagination.previous) {
                      setPage((prev) => prev-1);
                      usersDetails(pagination.previous)
                    }
                  }}
                  disabled={!pagination.previous}
                  className={`px-4 py-2 rounded ${
                   !pagination.previous ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Previous
                </button>

                <span className="text-sm text-gray-700">
                  Page {page} of {Math.ceil(totalUsers/5)} ({totalUsers} users)
                </span>

                <button
                  onClick={() => {
                    if(pagination.next) {
                      setPage((prev) => prev+1);
                      usersDetails(pagination.next);
                    }
                  }}
                  disabled={!pagination.next}
                  className={`px-4 py-2 rounded ${
                   !pagination.next
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Next
                </button>
                  </div>
        </div>
          )
        }
        {
  activeSection === "profile" && adminProfile && (
    <div className="bg-white shadow p-6 rounded-lg max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold mb-8 text-center text-green-700">Admin Profile</h2>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src={adminProfile.current_user.profile_pic}
          alt="Profile"
          className="w-40 h-40 rounded-full object-cover border-4 border-green-200 shadow"
        />

        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'First Name', value: adminProfile.current_user.first_name },
            { label: 'Last Name', value: adminProfile.current_user.last_name },
            { label: 'Age', value: adminProfile.current_user.age },
            { label: 'Phone Number', value: adminProfile.current_user.phonenumber },
            { label: 'Email', value: adminProfile.current_user.email },
            { label: 'Employee ID', value: adminProfile.current_user.employee_id },
            {
              label: 'Created At',
              value: new Date(adminProfile.current_user.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
               
              })
            },
            {
              label: 'Date Joined',
              value: new Date(adminProfile.current_user.date_joined).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
            },
            {
              label: 'Last Login',
              value: new Date(adminProfile.current_user.last_login).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
                 hour :'numeric',minute : 'numeric',second : 'numeric',hour12 : true
              })
            },
            {
              label: 'Updated At',
              value: new Date(adminProfile.current_user.updated_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
            },
          ].map((item, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded shadow-sm">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-lg font-medium text-gray-800 break-words">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

      </main>
    </div>
  );
};

export default AdminDashboard;
