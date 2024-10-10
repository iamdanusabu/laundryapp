import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, List, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Laundry Management Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/new-transaction" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <PlusCircle className="w-12 h-12 mb-4 text-indigo-600 mx-auto" />
          <h2 className="text-xl font-semibold mb-2 text-center">New Transaction</h2>
          <p className="text-gray-600 text-center">Create a new laundry transaction</p>
        </Link>
        <Link to="/transactions" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <List className="w-12 h-12 mb-4 text-indigo-600 mx-auto" />
          <h2 className="text-xl font-semibold mb-2 text-center">Transaction List</h2>
          <p className="text-gray-600 text-center">View and manage all transactions</p>
        </Link>
        <Link to="/settings" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <Settings className="w-12 h-12 mb-4 text-indigo-600 mx-auto" />
          <h2 className="text-xl font-semibold mb-2 text-center">Settings</h2>
          <p className="text-gray-600 text-center">Configure app settings and statuses</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;