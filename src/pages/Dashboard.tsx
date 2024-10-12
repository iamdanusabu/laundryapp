import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, List, Settings } from 'lucide-react';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search query
  const [searchResults, setSearchResults] = useState<any[]>([]); // State for search results
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null); // State for selected transaction
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State for modal visibility
  const navigate = useNavigate(); // Hook for navigation

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    if (searchQuery.trim()) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .or(`customer_phone.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%`); // Search by phone number or transaction ID

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        toast.error('Error fetching transactions: ' + error.message);
      }
    } else {
      setSearchResults([]); // Clear results if search query is empty
    }
  };

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction); // Set the selected transaction
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedTransaction(null); // Clear the selected transaction
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut(); // Call Supabase logout method
    if (error) {
      toast.error('Error logging out: ' + error.message);
    } else {
      toast.success('Logged out successfully');
      navigate('/login'); // Redirect to login page after logout
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Laundry Management Dashboard</h1>
      <form onSubmit={handleSearch} className="mb-4 flex justify-center">
        <input
          type="text"
          placeholder="Search by Phone Number or Transaction ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded-md p-2 w-1/2"
        />
        <button type="submit" className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Search
        </button>
      </form>
      {searchResults.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Search Results:</h2>
          <ul className="bg-white shadow rounded-md">
            {searchResults.map((transaction) => (
              <li
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction)} // Open modal on click
                className="p-4 border-b cursor-pointer hover:bg-gray-100"
              >
                <div>
                  <strong>ID:</strong> {transaction.id}
                </div>
                <div>
                  <strong>Phone:</strong> {transaction.customer_phone}
                </div>
                <div>
                  <strong>Status:</strong> {transaction.status}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
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

      {/* Logout Button */}
      <div className="mt-4 text-center">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Modal for Transaction Details */}
      {isModalOpen && selectedTransaction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-1/2">
            <h2 className="text-2xl font-bold mb-4">Transaction Details</h2>
            <div>
              <strong>ID:</strong> {selectedTransaction.id}
            </div>
            <div>
              <strong>Phone:</strong> {selectedTransaction.customer_phone}
            </div>
            <div>
              <strong>Status:</strong> {selectedTransaction.status}
            </div>
            {/* Add more details as needed */}
            <div>
              <strong>Item Details:</strong> {/* Add item details here */}
              <ul>
                {selectedTransaction.items.map((item: any) => ( // Assuming items is an array in the transaction
                  <li key={item.id}>
                    {item.name} - Quantity: {item.quantity} {/* Adjust according to your item structure */}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={closeModal} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
