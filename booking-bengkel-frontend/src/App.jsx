import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './layouts/Navbar';
import { Footer } from './layouts/Footer';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Shared
import { Login }    from './pages/Login';
import { Register } from './pages/Register';
import { NotFound } from './pages/NotFound';

// Customer
import { Home }          from './pages/customer/Home';
import { Services }      from './pages/customer/Services';
import { ServiceDetail } from './pages/customer/ServiceDetail';
import { MyBookings }    from './pages/customer/MyBookings';
import { BookingDetail } from './pages/customer/BookingDetail';
import { Profile }       from './pages/customer/Profile';
import { Vehicles }      from './pages/customer/Vehicles';

// Admin
import { AdminDashboard }     from './pages/admin/Dashboard';
import { AdminBookings }      from './pages/admin/Bookings';
import { AdminBookingDetail } from './pages/admin/BookingDetail';
import { AdminPayments }      from './pages/admin/Payments';
import { AdminUsers }         from './pages/admin/Users';
import { AdminServices }      from './pages/admin/Services';

// Mechanic
import { MechanicDashboard } from './pages/mechanic/Dashboard';
import { MechanicJobs }      from './pages/mechanic/Jobs';
import { MechanicJobDetail } from './pages/mechanic/JobDetail';
import { MechanicHistory }   from './pages/mechanic/History';

// Customer/Guest layout wrapper
function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <main className="flex-1">{children}</main>
      <Footer/>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ===== PUBLIC & CUSTOMER — Top Navbar + Footer ===== */}
          <Route path="/"             element={<CustomerLayout><Home/></CustomerLayout>}/>
          <Route path="/services"     element={<CustomerLayout><Services/></CustomerLayout>}/>
          <Route path="/services/:id" element={<CustomerLayout><ServiceDetail/></CustomerLayout>}/>
          <Route path="/login"        element={<CustomerLayout><Login/></CustomerLayout>}/>
          <Route path="/register"     element={<CustomerLayout><Register/></CustomerLayout>}/>

          <Route path="/bookings"     element={<CustomerLayout><ProtectedRoute roles={['customer']}><MyBookings/></ProtectedRoute></CustomerLayout>}/>
          <Route path="/bookings/:id" element={<CustomerLayout><ProtectedRoute roles={['customer']}><BookingDetail/></ProtectedRoute></CustomerLayout>}/>
          <Route path="/profile"      element={<CustomerLayout><ProtectedRoute roles={['customer']}><Profile/></ProtectedRoute></CustomerLayout>}/>
          <Route path="/vehicles"     element={<CustomerLayout><ProtectedRoute roles={['customer']}><Vehicles/></ProtectedRoute></CustomerLayout>}/>

          {/* ===== ADMIN — Sidebar Layout ===== */}
          <Route path="/admin"              element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminDashboard/></DashboardLayout></ProtectedRoute>}/>
          <Route path="/admin/bookings"     element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminBookings/></DashboardLayout></ProtectedRoute>}/>
          <Route path="/admin/bookings/:id" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminBookingDetail/></DashboardLayout></ProtectedRoute>}/>
          <Route path="/admin/payments"     element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminPayments/></DashboardLayout></ProtectedRoute>}/>
          <Route path="/admin/users"        element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminUsers/></DashboardLayout></ProtectedRoute>}/>
          <Route path="/admin/services"     element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminServices/></DashboardLayout></ProtectedRoute>}/>

          {/* ===== MECHANIC — Sidebar Layout ===== */}
          <Route path="/mechanic"          element={<ProtectedRoute roles={['mechanic']}><DashboardLayout><MechanicDashboard/></DashboardLayout></ProtectedRoute>}/>
          <Route path="/mechanic/jobs"     element={<ProtectedRoute roles={['mechanic']}><DashboardLayout><MechanicJobs/></DashboardLayout></ProtectedRoute>}/>
          <Route path="/mechanic/jobs/:id" element={<ProtectedRoute roles={['mechanic']}><DashboardLayout><MechanicJobDetail/></DashboardLayout></ProtectedRoute>}/>
          <Route path="/mechanic/history"  element={<ProtectedRoute roles={['mechanic']}><DashboardLayout><MechanicHistory/></DashboardLayout></ProtectedRoute>}/>

          {/* 404 */}
          <Route path="*" element={<CustomerLayout><NotFound/></CustomerLayout>}/>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
