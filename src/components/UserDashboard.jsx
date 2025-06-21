import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {

  const [openMenu, setOpenMenu] = useState(false);
  const [activeSection,setActiveSection] = useState("dashboard")
  // const [transaction,setTransaction] = useState([]);
  const [amount,setAmount] = useState("");
  const [type,setType] = useState("deposit")
  const [accountNumber,setAccountNumber] = useState('')
  const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
  const [description, setDescription] = useState('');
  const [error,setError] = useState('')
  const navigate = useNavigate();
  const { authToken } = useAuth()

  useEffect(()=> {
     const accountDetails =async ()=> {
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
     }
     accountDetails();
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
            Profile
          </li>
        </ul>

        {openMenu && (
          <div className="mt-3 p-3 bg-white rounded shadow">
            <ul className="space-y-2 text-sm">
              <li onClick={() => {
                navigate("/ChangePassword")
              }} className="hover:bg-gray-100 p-2 rounded">Change Password</li>
              <li className="hover:bg-gray-100 p-2 rounded">View A/c Number</li>
              <li className="hover:bg-gray-100 p-2 rounded">Profile</li>
              <li className="hover:bg-gray-100 p-2 rounded">Log Out</li>
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
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-200 text-left">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">1</td>
                    <td className="p-3">Deposit</td>
                    <td className="p-3">₹ 1,000</td>
                    <td className="p-3">2025-06-17</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">2</td>
                    <td className="p-3">Withdraw</td>
                    <td className="p-3">₹ 500</td>
                    <td className="p-3">2025-06-18</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
        {/* Reports */}
        {activeSection === "reports" && (
          <div className="text-gray-600 text-center p-4 border rounded">
            <p>Reports feature coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
