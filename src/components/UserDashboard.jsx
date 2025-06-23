import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';


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
  const [error,setError] = useState('')
  const [userProfile,setUserProfile] = useState(null)
  const navigate = useNavigate();
  const { authToken } = useAuth()

  useEffect(()=> {
     const accountDetailsAndProfile =async ()=> {
      try {
       const response = await axios.get("https://village-banking-app.onrender.com/api/profile/",{
         headers : {
          Authorization: `Bearer ${authToken?.access}`
         }
       })
       setAccountNumber(response.data.account.account_number)
       console.log(response.data.account.account_number);
       
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
     accountDetailsAndProfile();
  },[authToken])
  
  const handleTransaction =async (e) => {
   e.preventDefault();
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
    }
    catch(error) {
   
    setError(error.response.data.error)
    
    }
  }  
    const handleTransactionClick =async (txn) => {
      // const [senderResponse,receiverResponse] = await Promise.all([
      //    axios.get(`https://village-banking-app.onrender.com/api/profile/${txn.sender}/`, {
      //     headers : {
      //       Authorization : `Bearer ${authToken?.access}`,
      //     }
      //    }),
      //    axios.get(`https://village-banking-app.onrender.com/api/profile/${txn.receiver}/`, {
      //     headers : {
      //       Authorization : `Bearer ${authToken?.access}`,
      //     }
      //    })
      // ])
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
        senderDetails : senderResponse.data,
        receiverDetails : receiverResponse.data,
      })

    }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
  
      <aside className="w-full md:w-64 bg-gray-100 p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold mb-6">Village Banking System</h1>
        <ul className="space-y-3">
          {
            [
              {key : "dashboard",label : "Dashboard"},
              {key : "transactions",label : "Transactions"},
              {key : "perform",label : "Perform Transaction"},
              {key : "reports",label : "Reports"}
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
              }} className="hover:bg-gray-100 p-2 rounded">Change Password</li>
              <li onClick={() => {
                setActiveSection("profile");
                setOpenMenu(false);
              }} className="hover:bg-gray-100 p-2 rounded">Profile</li>
            </ul>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold capitalize">{activeSection}</h2>
          <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 w-full md:w-auto">
            Logout
          </button>
        </div>

     
        {activeSection === "dashboard" && (
          <div className="bg-gray-100 p-4 rounded-md">
            {/* <Line /> */}
          </div>
        )}

      
        {activeSection === "transactions" && (
  <>
    <h3 className="text-xl font-bold mb-4">Sent Transactions</h3>
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full text-sm border rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Type</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Date</th>
            <th className="p-2">Details</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, index) => (
            <tr onClick={()=> {
              handleTransactionClick(txn);
            }} key={index} className="border-t">
              <td className="p-2">{txn.transaction_type}</td>
              <td className="p-2">₹ {txn.amount}</td>
              <td className="p-2">{txn.status}</td>
              <td className="p-2">{txn.timestamp}</td>
              <td className="p-2">View</td>
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
                      src={selectDetails.senderDetails.user.profile_pic}
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
                      src={selectDetails.receiverDetails.user.profile_pic}
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
                }} placeholder="Description (optional)" className="p-2 border rounded-md"></textarea>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Submit
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
                src={userProfile.profile_pic}
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
                      {userProfile.account?.created_at}
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
