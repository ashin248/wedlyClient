
// import { useState, useEffect, lazy, Suspense } from "react";

// import './App.css';



// const API = import.meta.env.VITE_ENV === 'development'
//   ? import.meta.env.VITE_LOCALHOST_BASE_URL
//   : import.meta.env.VITE_API_BASE_URL;

// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Outlet,
//   Navigate,
//   useNavigate,
// } from "react-router-dom";
// import axios from "axios";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// // Set axios defaults to include credentials
// axios.defaults.withCredentials = true;

// // Lazy-loaded components
// const NavBar = lazy(() => import("./Layout/Layout"));
// const Home = lazy(() => import("./components/home"));
// const Register = lazy(() => import("./components/register"));
// const Login = lazy(() => import("./components/login"));
// const Information = lazy(() => import('./components/information'));
// const UpdateInformation = lazy(() => import("./components/UpdateInformation"));
// const Interest = lazy(() => import("./components/interest"));
// const Message = lazy(() => import("./components/massage")); 
// const Block = lazy(() => import("./components/block"));
// const AdminLogin = lazy(() => import("./admin/adminLogin"));
// const Admin = lazy(() => import("./admin/adminHome"));
// const History = lazy(() => import('./admin/adminHistory'));
// const Reports = lazy(() => import('./admin/adminReports'));
// const Blocks = lazy(() => import('./admin/adminBlocks'));
// const AdminHelp = lazy(() => import('./admin/adminHelp'));
// const Help = lazy(() => import("./components/Help"));
// const Settings = lazy(() => import("./components/Settings"));

// function ProtectedRouteWrapper() {
//   const [isAuthenticated, setIsAuthenticated] = useState(
//     localStorage.getItem('isAuthenticated') === 'true' ? true : null
//   );
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await axios.get(`${API}/middleware`, {
//           withCredentials: true,
//         });
//         if (response.status === 200) {
//           setIsAuthenticated(true);
//           localStorage.setItem('isAuthenticated', 'true');
//         } else {
//           setIsAuthenticated(false);
//           localStorage.setItem('isAuthenticated', 'false');
//           toast.error('Session expired, please log in again.');
//           navigate("/login");
//         }
//       } catch (err) {
//         console.error('Auth check failed:', err.message, err.response?.status, err.response?.config.url);
//         if (err.response?.status === 404) {
//           console.error('Middleware endpoint not found. Check if /middleware route is defined in server.js.');
//           toast.error('Authentication service unavailable.');
//         } else if (err.response?.status === 401) {
//           toast.error('Unauthorized. Please log in.');
//         } else {
//           toast.error('Error verifying authentication.');
//         }
//         setIsAuthenticated(false);
//         localStorage.setItem('isAuthenticated', 'false');
//         navigate("/login");
//       }
//     };

//     // Only run authentication check for non-admin routes
//     if (!window.location.pathname.startsWith("/admin")) {
//       checkAuth();
//     } else {
//       setIsAuthenticated(true); // Bypass for admin routes
//     }
//   }, [navigate]);

//   if (isAuthenticated === null) {
//     return <p>Loading...</p>;
//   }

//   return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Suspense fallback={<div>Loading...</div>}>
//         <ToastContainer position="top-center" autoClose={3000} />
//         <Routes>
//           <Route path="/" element={<Register />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/admin/login" element={<AdminLogin />} />
//           <Route path="/admin/home" element={<Admin />} />
//           <Route path="/admin/history" element={<History />} />
//           <Route path="/admin/reports" element={<Reports />} />
//           <Route path="/admin/blocks" element={<Blocks />} />
//           <Route path="/admin/help" element={<AdminHelp />} />
//           <Route element={<ProtectedRouteWrapper />}>
//             <Route element={<NavBar />}>
//               <Route path="/home" element={<Home />} />
//               <Route path="/information" element={<Information />} />
//               <Route path="/update-information" element={<UpdateInformation />} />
//               <Route path="/interest" element={<Interest />} />
//               <Route path="/message" element={<Message />} />
//               <Route path="/block" element={<Block />} />
//               <Route path="/help" element={<Help />} />
//               <Route path="/settings" element={<Settings />} />
//             </Route>
//           </Route>
//         </Routes>
//       </Suspense>
//     </BrowserRouter>
//   );
// }

// export default App;


import { useState, useEffect, lazy, Suspense } from "react";
import './App.css';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Set axios defaults to include credentials
axios.defaults.withCredentials = true;

// API URL based on environment
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;

// Lazy-loaded components
const NavBar = lazy(() => import("./Layout/Layout"));
const Home = lazy(() => import("./components/home"));
const Register = lazy(() => import("./components/register"));
const Information = lazy(() => import('./components/information'));
const UpdateInformation = lazy(() => import("./components/UpdateInformation"));
const Interest = lazy(() => import("./components/interest"));
const Message = lazy(() => import("./components/massage"));
const Block = lazy(() => import("./components/block"));
const AdminLogin = lazy(() => import("./admin/adminLogin"));
const Admin = lazy(() => import("./admin/adminHome"));
const History = lazy(() => import('./admin/adminHistory'));
const Reports = lazy(() => import('./admin/adminReports'));
const Blocks = lazy(() => import('./admin/adminBlocks'));
const AdminHelp = lazy(() => import('./admin/adminHelp'));
const Settings = lazy(() => import('./components/settings'));
const Help = lazy(() => import('./components/help'));

// Redefine Login component with the fix
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/login`, formData);
      if (response.status === 200) {
        toast.success("Login successful!");
        // Add a small delay to allow the browser to set the session cookie
        setTimeout(() => {
          navigate('/information');
        }, 500); // 500 milliseconds delay
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
      console.error('Login error:', error);
    }
  };

  return (
    <div className='login-container'>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="********"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Login
            </button>
          </form>
          <p className="mt-6 text-center text-gray-600 text-sm">
            Don't have an account? <Link to="/register" className="text-blue-600 hover:underline font-medium">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Main App component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get(`${API}/middleware`);
        if (response.status === 200) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        setIsLoggedIn(false);
        console.error('Authentication check failed:', error);
      }
    };
    checkAuthentication();
  }, [navigate]);

  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <ToastContainer position="top-center" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/home" element={<Admin />} />
          <Route path="/admin/history" element={<History />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/blocks" element={<Blocks />} />
          <Route path="/admin/help" element={<AdminHelp />} />
          <Route element={<ProtectedRouteWrapper isLoggedIn={isLoggedIn} />}>
            <Route element={<NavBar />}>
              <Route path="/home" element={<Home />} />
              <Route path="/information" element={<Information />} />
              <Route path="/update-information" element={<UpdateInformation />} />
              <Route path="/interest" element={<Interest />} />
              <Route path="/message" element={<Message />} />
              <Route path="/block" element={<Block />} />
              <Route path="/help" element={<Help />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

const ProtectedRouteWrapper = ({ isLoggedIn }) => {
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default App;
