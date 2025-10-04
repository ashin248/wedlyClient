import { useState, useEffect, lazy, Suspense } from "react";
import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Set axios to include credentials this
axios.defaults.withCredentials = true;

// ✅ Dynamic API base URL from .env
const API = import.meta.env.VITE_ENV === 'development'
  ? import.meta.env.VITE_LOCALHOST_BASE_URL
  : import.meta.env.VITE_API_BASE_URL;

// Lazy-loaded components
const NavBar = lazy(() => import("./Layout/Layout"));
const Home = lazy(() => import("./components/home"));
const Register = lazy(() => import("./components/register"));
const Login = lazy(() => import("./components/login"));
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
const Help = lazy(() => import("./components/Help"));
const Settings = lazy(() => import("./components/Settings"));

function ProtectedRouteWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true' ? true : null
  );
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await axios.get(`${API}/middleware`, {
          withCredentials: true,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.status === 200) {
          setIsAuthenticated(true);
          localStorage.setItem('isAuthenticated', 'true');
        } else {
          setIsAuthenticated(false);
          localStorage.setItem('isAuthenticated', 'false');
          toast.error('Session expired, please log in again.');
          navigate("/login");
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          toast.error('Authentication check timed out. Please refresh.');
        }
        console.error('Auth check failed:', err.message, err.response?.status, err.response?.config?.url);
        if (err.response?.status === 404) {
          console.error('Middleware endpoint not found. Check if /middleware route is defined in server.js.');
          toast.error('Authentication service unavailable.');
        } else if (err.response?.status === 401) {
          toast.error('Unauthorized. Please log in.');
        } else {
          toast.error('Error verifying authentication.');
        }
        setIsAuthenticated(false);
        localStorage.setItem('isAuthenticated', 'false');
        navigate("/login");
      }
    };

    if (!window.location.pathname.startsWith("/admin")) {
      checkAuth();
    } else {
      setIsAuthenticated(true); // Skip auth check for admin routes
    }
  }, [navigate]);

  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
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
          <Route element={<ProtectedRouteWrapper />}>
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

export default App;








// import { useState, useEffect, lazy, Suspense } from "react";
// import './App.css';
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

// // Set axios to include credentials this
// axios.defaults.withCredentials = true;

// // ✅ Dynamic API base URL from .env
// const API = import.meta.env.VITE_ENV === 'development'
//   ? import.meta.env.VITE_LOCALHOST_BASE_URL
//   : import.meta.env.VITE_API_BASE_URL;

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
//         console.error('Auth check failed:', err.message, err.response?.status, err.response?.config?.url);
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

//     if (!window.location.pathname.startsWith("/admin")) {
//       checkAuth();
//     } else {
//       setIsAuthenticated(true); // Skip auth check for admin routes
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
