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
   const [transaction,setTransaction] = useState([])
   const [transPagination,setTransPagination] = useState('')
   const [transPage,setTransPage] = useState(1);
   const [totalTrans,setTotalTrans] = useState(0)
   const [senderRes,setSenderRes] = useState('');
   const [receiverRes,setReceiverRes] = useState('');
   const [selectedTxnId,setSelectedTxnId] = useState('')
   const [userTransaction,setUserTransaction] = useState([])
   const [loading,setLoading] = useState(false)
   const [notificationMessage,setNotificationMessage] = useState('')
   const [statusFilter,setStatusFilter] = useState('');
   const [typeFilter,setTypeFilter] = useState('')
   const [filters,setFilters] = useState({
              selectedField : "name",
              searchValue : '',
   })
   const [error,setError] = useState('')
  const navigate =  useNavigate()
  const location = useLocation()
  const { authToken,logout } = useAuth()
   const chartData = {
                labels: transaction.map(txn =>
                      new Date(txn.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })
                    ),
                datasets: [
                  {
                    label: 'Transaction Amount (₹)',
                    data: transaction.map(txn => parseFloat(txn.amount)),
                    fill: false,
                    borderColor: '#3b82f6',
                    tension: 0.3,
                  }
                ]
              };

              const chartOptions = {
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `₹ ${context.raw}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Amount (₹)',
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Date',
                    }
                  }
                }
              };
            const buildSingleUserFilterUrl = () => {
          const baseUrl = new URL("https://village-banking-app.onrender.com/api/admin/dashboard/profile/");
          if (filters.searchValue.trim() && filters.selectedField) {
            baseUrl.searchParams.append(filters.selectedField, filters.searchValue.trim());
          }
          baseUrl.searchParams.set("page", 1);
          return baseUrl.toString();
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
       const buildTransactionUrl = (baseUrl) => {
        const url = new URL(baseUrl);
        if (statusFilter) url.searchParams.set('status', statusFilter);
        if (typeFilter) url.searchParams.set('transaction_type', typeFilter);
        return url.toString();
      };
         const getTransactionDetails =async (url) => {
    try {
        const res = await axios.get(url, {
          headers : {
            Authorization : `Bearer ${authToken?.access}`
          }
         })
         setTransaction(res.data.results);
         setTransPagination({
          next : res.data.next,
          previous : res.data.previous
         })
         setTotalTrans(res.data.count)
    }
    catch(error) {
      console.log(error);
      
    }    
   }
     
   const handleTransactionClick =async (id) => { 
       try {
        const response = await axios.get(`https://village-banking-app.onrender.com/api/admin/dashboard/transaction/${id}/`,{
          headers :{
            Authorization : `Bearer ${authToken?.access}`
          }
        })
            setSenderRes(response.data.sender)
            setReceiverRes(response.data.receiver)
            
       }
       catch(error) {
     if(error.response?.status === 429) {
      setError("Too many requests. Please try again after a minute.")
     }
     else {
      console.log(error);
      
     }
        
       }
   }
       const getUserDetails =async (id) => {
    
        
          try {
           const response = await axios.get(`https://village-banking-app.onrender.com/api/admin/dashboard/profile/${id}`, {
            headers : {
              Authorization : `Bearer ${authToken?.access}`
            }
           })
           setSelectedUser(response.data);
           setUserTransaction({
            sender : response.data.account?.sender,
            receiver : response.data.account?.receiver
           })
           setActiveSection("userdetails")         
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
    setAdminProfile(response.data);
    }
    catch(error) {
      console.log(error); 
    }
   }
      if(location.state?.message) {
       setNotificationMessage(location.state.message);
       navigate(location.pathname, { replace: true });
       setShowNotification(true);

       setTimeout(() => {
         setShowNotification(false)
       }, 2000);
      }
       usersDetails("https://village-banking-app.onrender.com/api/admin/dashboard/profile/?page=1");
       getAdminProfile()
       setTransPage(1)
       const url = buildTransactionUrl("https://village-banking-app.onrender.com/api/admin/dashboard/transaction/?page=1")
       getTransactionDetails(url);
  },[location.state,authToken,statusFilter,typeFilter])

  

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
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
                <button onClick={() => {
                  navigate("/SignUpPage")
                }}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
             SignUp
            </button>
          <button
          onClick={() => {
                  navigate("/LoginPage")
                }}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
             Login
            </button>
              </div>
         
            )
          }
        </div>

     
       {
        activeSection === "dashboard" &&  (
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
            <p className="text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold">{totalTrans}</p>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-md mb-6">
          <Line data={chartData} options={chartOptions} />
        </div>
        </>
        )
       }

       {showNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-md z-50">
          {notificationMessage}
        </div>
      )}
        

        {
          activeSection === "users" && (
            <div className="overflow-x-auto">
                     <div className="flex flex-wrap items-center gap-4 mb-4">
                      <select
                        value={filters.selectedField}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, selectedField: e.target.value }))
                        }
                        className="border px-3 py-2 rounded"
                      >
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="phonenumber">Phone Number</option>
                        <option value="account_number">Account Number</option>
                      </select>

                      <input
                        type="text"
                        placeholder={`Search by ${filters.selectedField || 'field'}`}
                        value={filters.searchValue}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, searchValue: e.target.value }))
                        }
                        className="px-3 py-2 border rounded"
                      />

                      <button
                        onClick={() => {
                          const url = buildSingleUserFilterUrl();
                          usersDetails(url);
                          setPage(1);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Search
                      </button>
                    </div>
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
                  users.map((user,index) => (
                    <tr 
                     onClick={() => {
                      getUserDetails(user.id)
                     }}
                    key={index}
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
                      if (pagination.previous) {
                        setPage((prev) => prev - 1);
                        const prevUrl = new URL(pagination.previous);
                        Object.entries(filters).forEach(([key, value]) => {
                          if (value.trim()) prevUrl.searchParams.set(key, value.trim());
                        });
                        usersDetails(prevUrl.toString());
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
                  if (pagination.next) {
                    setPage((prev) => prev + 1);
                    const nextUrl = new URL(pagination.next);
                    Object.entries(filters).forEach(([key, value]) => {
                      if (value.trim()) nextUrl.searchParams.set(key, value.trim());
                    });
                    usersDetails(nextUrl.toString());
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
            activeSection === "userdetails" && selectedUser && (
              <div className="bg-white shadow p-6 rounded-lg max-w-3xl mx-auto w-full">
             <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
              <img
                src={selectedUser.image_url}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-md"
              />

              
              <div className="flex-1 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">First Name</p>
                    <p className="text-lg font-medium">{selectedUser.first_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Last Name</p>
                    <p className="text-lg font-medium">{selectedUser.last_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Age</p>
                    <p className="text-lg font-medium">{selectedUser.age}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Phone Number</p>
                    <p className="text-lg font-medium">{selectedUser.phonenumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Account Number</p>
                    <p className="text-lg font-medium">{selectedUser.account?.account_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Account Balance</p>
                    <p className="text-lg font-medium">₹ {selectedUser.account?.balance} </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600 text-sm">Created At</p>
                    <p className="text-lg font-medium">
                      {new Date(selectedUser.account?.created_at).toLocaleDateString('en-IN', {
                        day : 'numeric',
                        month : 'short',
                        year : 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>


               <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
      
      {userTransaction.sender?.length || userTransaction.receiver?.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="p-3 border">Type</th>
                <th className="p-3 border">Amount</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {[...userTransaction.sender,...userTransaction.receiver].map((txn, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-3 capitalize">{txn.transaction_type}</td>
                  <td className="p-3">₹ {txn.amount}</td>
                  <td className={`p-3 font-semibold ${txn.status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {txn.status}
                  </td>
                  <td className="p-3">
                    {new Date(txn.timestamp).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric', hour :'numeric',minute : 'numeric',second : 'numeric',hour12 : true
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No transactions found for this user.</p>
      )}
    </div>
          </div>
         
            )
           }
           

        
        {
          activeSection === "transactions" && (
            <div className="overflow-x-auto mb-6">
                     <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdrawal</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>
              {error && <p className='text-red-600 font-semibold'>{error}</p> }
      <table className="min-w-full text-sm border rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
           {
            transaction.length ? (
              transaction.map((txn,index) => (
                <tr onClick={() => {
                  handleTransactionClick(txn.id)
                  setSelectedTxnId(txn.id)
                }} key={index} className={`border-t cursor-pointer ${selectedTxnId === txn.id ? 'bg-blue-100 text-blue-700' : ''}`}>
              <td className="p-2 capitalize">{txn.transaction_type}</td>
              <td className="p-2">₹ {txn.amount}</td>
              <td className={`p-2 font-semibold ${txn.status === "success" ? 'text-green-700': 'text-red-600'}`}>{txn.status}</td>
            </tr>
              )) 
            ) : (
              <tr><td className='p-3'>No Transaction found</td></tr> 
            )
           }
        </tbody>
      </table>
       <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => {
                   
                    if(transPagination.previous) {
                      setTransPage((prev) => prev-1);
                      getTransactionDetails(buildTransactionUrl(transPagination.previous))
                    }
                  }}
                  disabled={!transPagination.previous}
                  className={`px-4 py-2 rounded ${
                   !transPagination.previous ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Previous
                </button>

                <span className="text-sm text-gray-700">
                  Page {transPage} of {Math.ceil(totalTrans/5)} ({totalTrans} Transactions)
                </span>

                <button
                  onClick={() => {
                    //  const totalPage = Math.ceil(totalTrans/5)
                    if(transPagination.next) {
                      setTransPage((prev) => prev+1);
                      getTransactionDetails(buildTransactionUrl(transPagination.next));
                    }
                  }}
                  disabled={!transPagination.next}
                  className={`px-4 py-2 rounded ${
                   !transPagination.next
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Next
                </button>
                  </div>
                  {
                    senderRes && (
                      <div className="bg-white shadow p-6 rounded-lg max-w-3xl mx-auto w-full">
                  <h2 className="text-2xl font-bold mb-6 text-center">Sender</h2>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  
                    <img
                      src={senderRes.user.image_url}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-md"
                    />

                    
                    <div className="flex-1 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600 text-sm">First Name</p>
                          <p className="text-lg font-medium">{senderRes.user.first_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Last Name</p>
                          <p className="text-lg font-medium">{senderRes.user.last_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Age</p>
                          <p className="text-lg font-medium">{senderRes.user.age}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Phone Number</p>
                          <p className="text-lg font-medium">{senderRes.user.phonenumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Account Number</p>
                          <p className="text-lg font-medium">{senderRes.account_number}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Account Balance</p>
                          <p className="text-lg font-medium">₹ {senderRes.balance} </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-gray-600 text-sm">Created At</p>
                          <p className="text-lg font-medium">
                            {senderRes.created_at}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                    )
                  }

                  {
                    receiverRes && (
                      <div className="bg-white shadow p-6 rounded-lg max-w-3xl mx-auto w-full">
                  <h2 className="text-2xl font-bold mb-6 text-center">Receiver</h2>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  
                    <img
                      src={receiverRes.user.image_url}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-md"
                    />

                    
                    <div className="flex-1 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600 text-sm">First Name</p>
                          <p className="text-lg font-medium">{receiverRes.user.first_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Last Name</p>
                          <p className="text-lg font-medium">{receiverRes.user.last_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Age</p>
                          <p className="text-lg font-medium">{receiverRes.user.age}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Phone Number</p>
                          <p className="text-lg font-medium">{receiverRes.user.phonenumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Account Number</p>
                          <p className="text-lg font-medium">{receiverRes.account_number}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Account Balance</p>
                          <p className="text-lg font-medium">₹ {receiverRes.balance} </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-gray-600 text-sm">Created At</p>
                          <p className="text-lg font-medium">
                            {receiverRes.created_at}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                    )
                  }
                </div>
            
                
          )
        }
        {
  activeSection === "profile" && adminProfile && (
    <div className="bg-white shadow p-6 rounded-lg max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold mb-8 text-center text-green-700">Admin Profile</h2>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src={adminProfile.current_user.image_url}
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
