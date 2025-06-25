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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const AdminDashboard = () => {
  const [openMenu, setOpenMenu] = useState(false);
   const [showNotification,setShowNotification] = useState(false)
    const [notificationMessage,setNotificationMessage] = useState('')
  const navigate =  useNavigate()
  const location = useLocation()
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
  useEffect(()=> {
      if(location.state?.message) {
       setNotificationMessage(location.state.message)
       setShowNotification(true);

       setTimeout(() => {
         setShowNotification(false)
       }, 5000);
      }
  },[location.state])

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-green-100 p-5 md:min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        <ul className="space-y-3">
          <li className="hover:bg-green-200 p-2 rounded-md">Dashboard</li>
          <li className="hover:bg-green-200 p-2 rounded-md">Users</li>
          <li className="hover:bg-green-200 p-2 rounded-md">Transactions</li>
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
              <li className="hover:bg-gray-100 p-2 rounded">Manage Roles</li>
              <li  onClick={()=> {
                navigate("/ChangePassword")
              }} className="hover:bg-gray-100 p-2 rounded">Change Password</li>
              <li className="hover:bg-gray-100 p-2 rounded">Log Out</li>
            </ul>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Welcome, Admin</h2>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Logout
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded shadow">
            <p className="text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">156</p>
          </div>
          <div className="bg-green-50 p-4 rounded shadow">
            <p className="text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold">₹2,45,000</p>
          </div>
          <div className="bg-green-50 p-4 rounded shadow">
            <p className="text-gray-600">New Signups</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>

       {showNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-md z-50">
          {notificationMessage}
        </div>
      )}
        <div className="bg-gray-100 p-4 rounded-md mb-6">
          <Line data={chartData} />
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-green-200 text-left">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3">1</td>
                <td className="p-3">Alice</td>
                <td className="p-3">alice@example.com</td>
                <td className="p-3">User</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">2</td>
                <td className="p-3">Bob</td>
                <td className="p-3">bob@example.com</td>
                <td className="p-3">Moderator</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">3</td>
                <td className="p-3">Charlie</td>
                <td className="p-3">charlie@example.com</td>
                <td className="p-3">Admin</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
