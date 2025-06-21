import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import ForgotPassword from './components/ForgotPassword';
import ChangePassword from './components/ChangePassword';
function App() {
  return (
    <div>
        <Router basename=''>
          <AuthProvider>
           <Routes>
              <Route path='/'  element={<SignUpPage />} />
              
              <Route path='/LoginPage'  element={<LoginPage />} />
              <Route path='/UserDashboard'  element={<UserDashboard />} />
              <Route path='/AdminDashboard'  element={<AdminDashboard />} />
              <Route path='/ForgotPassword'  element={<ForgotPassword />} />
              <Route path='/ChangePassword'  element={<ChangePassword />} />
           </Routes>
          </AuthProvider>
           
        </Router>
    </div>
  );
}

export default App;
