import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import NewTransaction from './pages/NewTransaction';
import TransactionList from './pages/TransactionList';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions.tsx'
import TransactionsTest from './pages/TransactionsTest.tsx'
import ProtectedRoute from './components/ProtectedRoute';
import PublicStatusCheck from './pages/PublicStatusCheck';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<AuthPage/>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/new-transaction" element={<ProtectedRoute><NewTransaction /></ProtectedRoute>} />
          <Route path="/all" element={<ProtectedRoute><TransactionList /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/test" element={<ProtectedRoute><TransactionsTest /></ProtectedRoute>} />
          <Route path="/status" element={<PublicStatusCheck />} />
          {/* Redirect to login on root path */}
          <Route path="/" element={<AuthPage />} />
        </Routes>
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;