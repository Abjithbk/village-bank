import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from 'chart.js';


ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

const UserDashboard = () => {

  const [openMenu, setOpenMenu] = useState(false);
  const [activeSection,setActiveSection] = useState("dashboard")
  const [transactions,setTransactions] = useState([]);
  const [amount,setAmount] = useState("");
  const [type,setType] = useState("deposit")
  const [accountNumber,setAccountNumber] = useState('')
  const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
  const [description, setDescription] = useState('');
  const [selectDetails,setSelectDetails] = useState('')
  const [tranMessage,setTranMessage] = useState('')
  const [error,setError] = useState('')
  const [showNotification,setShowNotification] = useState(false)
  const [notificationMessage,setNotificationMessage] = useState('')
  const [userProfile,setUserProfile] = useState(null)
  const [loading,setLoading] = useState(false)
  const [selectTxnId,setSelectTxnId] = useState(null)
  const navigate = useNavigate();
  const location = useLocation();
  const { authToken,logout } = useAuth()

  

  useEffect(()=> {

     const accountDetailsAndProfile =async ()=> {
      if(!authToken || !authToken.access) {
        return;
      }
      try {
       const response = await axios.get("https://village-banking-app.onrender.com/api/profile/",{
         headers : {
          Authorization: `Bearer ${authToken?.access}`
         }
       })
       setAccountNumber(response.data.account.account_number)
      }
      catch(error) {
       console.error(error);
      }
     try {
      
        const profileDetails = await axios.get("https://village-banking-app.onrender.com/api/profile/", {
        headers : {
          Authorization : `Bearer ${authToken?.access}`
        }
      })
      console.log(profileDetails.data);
      setUserProfile(profileDetails.data);
      const sender = profileDetails.data.account.sender;
      const receiver = profileDetails.data.account.receiver;

      const combinedDetails = [...sender,...receiver].map((txn) => (
        {
          ...txn, 
          direction : sender.includes(txn) ? "send" : "received"
        }
      ))
      setTransactions(combinedDetails)
     }
     catch(error) {
      console.log(error);
     }
     }

      if(location.state?.message) {
       setNotificationMessage(location.state.message)
       setShowNotification(true);
      navigate(location.pathname, { replace: true });
       setTimeout(() => {
         setShowNotification(false)
       }, 2000);
      }

       if (tranMessage || error) {
    const timer = setTimeout(() => {
      setTranMessage('');
      setError('');
    }, 2000);

    return () => clearTimeout(timer);
  }

     accountDetailsAndProfile();
  },[authToken,location.state,tranMessage,error])

                    const chartData = {
                labels: transactions.map(txn =>
                  new Date(txn.timestamp).toLocaleDateString()
                ),
                datasets: [
                  {
                    label: 'Transaction Amount (₹)',
                    data: transactions.map(txn => parseFloat(txn.amount)),
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
  
  const handleTransaction =async (e) => {
   e.preventDefault();
   setLoading(true)
    try {
       await axios.post("https://village-banking-app.onrender.com/api/profile/transaction/", 
       { account_number : accountNumber,
      transaction_type: type,
      amount: parseFloat(amount),
      description,
     ...(type === "transfer" && { receiver_account_number: receiverAccountNumber }),
       }
       ,{
        headers : {
          Authorization : `Bearer ${authToken?.access}`
        }
       })
      setAmount('');
      setType('deposit');
      setReceiverAccountNumber('');
      setDescription('');
      setTranMessage("Your Transaction Successfully Completed.");

    }
    catch(error) {
   
    setError(error.response?.data?.error || "Transaction Failed.Try Again..")
    
    }
    finally {
      setLoading(false)
    }
  }  
    const handleTransactionClick =async (txn) => {
      const requests = [];

      if(txn.sender) {
        requests.push(
         axios.get(`https://village-banking-app.onrender.com/api/profile/${txn.sender}/`, {
          headers : {
            Authorization : `Bearer ${authToken?.access}`
          }
        })
        )
      }

      if(txn.receiver) {
        requests.push(
           axios.get(`https://village-banking-app.onrender.com/api/profile/${txn.receiver}/`, {
          headers : {
            Authorization : `Bearer ${authToken?.access}`
          }
        })
        )
      }
      const [senderResponse,receiverResponse] = await Promise.all(requests)
      
      setSelectDetails({
        ...txn,
        senderDetails : senderResponse?.data,
        receiverDetails : receiverResponse?.data,
      })

    }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
  
      <aside className="w-full md:w-64 bg-gray-100 p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold mb-6">User Panel</h1>
        <ul className="space-y-3">
          {
            [
              {key : "dashboard",label : "Dashboard"},
              {key : "transactions",label : "Transactions"},
              {key : "perform",label : "Perform Transaction"},
              {key : "reports",label : "Reports"},
              {key : "profile",label : "Profile"}
            ].map((item) => (
              <li
               key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`p-2 rounded-md cursor-pointer ${
                activeSection === item.key ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"
              }`}
              >
               {item.label}
              </li>
            ))
          }
          <li className='text-gray-700 hover:bg-gray-200 p-2 rounded-md cursor-pointer'
           onClick={() => {
            setOpenMenu(!openMenu);
           }}
          >
            Settings
          </li>
        </ul>

        {openMenu && (
          <div className="mt-3 p-3 bg-white rounded shadow">
            <ul className="space-y-2 text-sm">
              <li onClick={() => {
                navigate("/ChangePassword")
              }} className="hover:bg-gray-100 p-2 rounded cursor-pointer">Change Password</li>
              {/* <li onClick={() => {
                setActiveSection("profile");
                setOpenMenu(false);
              }} className="hover:bg-gray-100 p-2 rounded cursor-pointer">Profile</li> */}
              <li onClick={() => {
                logout();
                navigate("/LoginPage",{replace : true});
              }} className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Logout</li>
            </ul>
          </div>
        )}
      </aside>

 
      <main className="flex-1 p-4 md:p-6 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold capitalize">{activeSection}</h2>
          {
            userProfile ? (
           
            <span className="text-gray-800 font-semibold bg-green-100 px-3 py-1 rounded-full shadow-sm cursor-pointer">
                 👋 Welcome, {userProfile?.first_name}
                     </span>

            ) : (
          <button
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
              onClick={() => {
                logout();
                navigate("/LoginPage", { replace: true });
              }}
            >
              Logout
            </button>
            )
          }
        </div>

     {showNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-md z-50">
          {notificationMessage}
        </div>
      )}
        {activeSection === "dashboard" && (
          <div className="bg-gray-100 p-4 rounded-md">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

      
        {activeSection === "transactions" && (
  <>
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full text-sm border rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, index) => (
            <tr onClick={()=> {
              handleTransactionClick(txn);
              setSelectTxnId(txn.id)
            }} key={index} className={`border-t cursor-pointer ${selectTxnId === txn.id ? 'bg-blue-100' : ''}`}>
              <td className="p-2">{txn.transaction_type}</td>
              <td className="p-2">₹ {txn.amount}</td>
              <td className={`p-2 font-semibold ${txn.status === "success" ? 'text-green-700': 'text-red-600'}`}>{txn.status}</td>
              <td className="p-2">{txn.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>  
       {
        selectDetails&& (
           <div className="mt-6 bg-white border p-4 rounded shadow">
        <h4 className="text-lg font-semibold mb-2">Full Details</h4>
        {
          selectDetails.senderDetails && (
 <>
              <div className="bg-white shadow p-6 rounded-lg max-w-3xl mx-auto w-full">
                  <h2 className="text-2xl font-bold mb-6 text-center">Sender</h2>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  
                    <img
                      src={userProfile.image_url}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-md"
                    />

                    
                    <div className="flex-1 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600 text-sm">First Name</p>
                          <p className="text-lg font-medium">{selectDetails.senderDetails.user.first_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Last Name</p>
                          <p className="text-lg font-medium">{selectDetails.senderDetails.user.last_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Age</p>
                          <p className="text-lg font-medium">{selectDetails.senderDetails.user.age}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Phone Number</p>
                          <p className="text-lg font-medium">{selectDetails.senderDetails.user.phonenumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Account Number</p>
                          <p className="text-lg font-medium">{selectDetails.senderDetails.account_number}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Account Balance</p>
                          <p className="text-lg font-medium">₹ {selectDetails.senderDetails.balance} </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-gray-600 text-sm">Created At</p>
                          <p className="text-lg font-medium">
                            {selectDetails.senderDetails.created_at}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
        </>
          )
        }
       {
        selectDetails.receiverDetails && (
<>
         <div className="bg-white shadow p-6 rounded-lg max-w-3xl mx-auto w-full">
                  <h2 className="text-2xl font-bold mb-6 text-center">Receiver</h2>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  
                    <img
                      src={userProfile.image_url}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-md"
                    />

                    
                    <div className="flex-1 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600 text-sm">First Name</p>
                          <p className="text-lg font-medium">{selectDetails.receiverDetails.user.first_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Last Name</p>
                          <p className="text-lg font-medium">{selectDetails.receiverDetails.user.last_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Age</p>
                          <p className="text-lg font-medium">{selectDetails.receiverDetails.user.age}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Phone Number</p>
                          <p className="text-lg font-medium">{selectDetails.receiverDetails.user.phonenumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Account Number</p>
                          <p className="text-lg font-medium">{selectDetails.receiverDetails.account_number}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Account Balance</p>
                          <p className="text-lg font-medium">₹ {selectDetails.receiverDetails.balance} </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-gray-600 text-sm">Created At</p>
                          <p className="text-lg font-medium">
                            {selectDetails.receiverDetails.created_at}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
        </>
        )
       }
        
      </div>
        )
       }
  </>
)}
          {
            activeSection === "perform" && (
              <form onSubmit={handleTransaction} className="bg-blue-50 border border-blue-200 p-4 rounded-md max-w-xl mb-6">
              <h3 className="text-lg font-bold mb-4">Perform Transaction</h3>
              {tranMessage && <p className='text-green-500'>{tranMessage}</p> }
              {error && <p className='text-red-600'>{error}</p> }
              <div className="flex flex-col gap-4">
                <select value={type} onChange={(e) =>{
                  setType(e.target.value)
                }} className="p-2 border rounded-md">
                  <option value="deposit">Deposit</option>
                  <option value="withdraw">Withdraw</option>
                  <option value="transfer">Transfer</option>
                </select>
                <input value={amount} onChange={(e)=> {
                  setAmount(e.target.value)
                }} type="number" placeholder="Amount" className="p-2 border rounded-md" />
                {
                  type === "transfer" && (
                    <input value={receiverAccountNumber} onChange={(e) => {
                  setReceiverAccountNumber(e.target.value)
                }} type="text" placeholder="Receiver Account Number (for Send)" className="p-2 border rounded-md" />
                  )
                }
                <textarea value={description} onChange={(e) => {
                  setDescription(e.target.value)
                }} placeholder="Description " required className="p-2 border rounded-md"></textarea>
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-blue-600 text-white px-4 py-2 rounded ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {loading ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </form>
            )
          }
    
        {activeSection === "reports" && (
          <div className="text-gray-600 text-center p-4 border rounded">
            <p>Reports feature coming soon...</p>
          </div>
        )}
          {
            activeSection === "profile" && userProfile && (
              <div className="bg-white shadow p-6 rounded-lg max-w-3xl mx-auto w-full">
             <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
              <img
                src={userProfile.image_url}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-md"
              />

              
              <div className="flex-1 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">First Name</p>
                    <p className="text-lg font-medium">{userProfile.first_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Last Name</p>
                    <p className="text-lg font-medium">{userProfile.last_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Age</p>
                    <p className="text-lg font-medium">{userProfile.age}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Phone Number</p>
                    <p className="text-lg font-medium">{userProfile.phonenumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Account Number</p>
                    <p className="text-lg font-medium">{userProfile.account?.account_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Account Balance</p>
                    <p className="text-lg font-medium">₹ {userProfile.account?.balance} </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600 text-sm">Created At</p>
                    <p className="text-lg font-medium">
                      {new Date(userProfile.account?.created_at).toLocaleDateString('en-IN', {
                        day : 'numeric',
                        month : 'short',
                        year : 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
            )
          }
      </main>
    </div>
  );
};

export default UserDashboard;
