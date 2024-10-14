import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';
import { Loader2, Bell, Grid, Moon, User, ChevronDown, ChevronUp } from 'lucide-react';

type Transaction = {
  id: string;
  customer_phone: string;
  items: any[];
  status: string;
  created_at: string;
};

export default function Component() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
    fetchStatuses();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      toast.error('Error fetching transactions: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .select('name')
        .order('order', { ascending: true });

      if (error) throw error;
      setStatuses(data.map(status => status.name));
    } catch (error) {
      toast.error('Error fetching statuses: ' + error.message);
    }
  };

  const updateStatus = async (transactionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', transactionId);

      if (error) throw error;
      toast.success('Status updated successfully');
      fetchTransactions();
    } catch (error) {
      toast.error('Error updating status: ' + error.message);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) {
      toast.error('Please select a status for bulk update');
      return;
    }
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: bulkStatus })
        .in('id', selectedTransactions);

      if (error) throw error;
      toast.success('Bulk status update successful');
      fetchTransactions();
      setSelectedTransactions([]);
      setBulkStatus('');
    } catch (error) {
      toast.error('Error updating statuses: ' + error.message);
    }
  };

  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.customer_phone.includes(searchTerm) || 
      transaction.id.includes(searchTerm) ||   
      transaction.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCardExpansion = (transactionId: string) => {
    setExpandedCard(expandedCard === transactionId ? null : transactionId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-gray-900">Laundry</span>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="h-6 w-6 text-gray-500" />
            <Grid className="h-6 w-6 text-gray-500" />
            <Moon className="h-6 w-6 text-gray-500" />
            <User className="h-6 w-6 text-gray-500" />
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a href="#" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              Transactions
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <input
            type="text"
            placeholder="Search for Transaction or Customer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 p-2 border border-gray-300 rounded-md"
          />
          {selectedTransactions.length > 0 && (
            <div className="flex items-center space-x-2">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button
                onClick={handleBulkStatusUpdate}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out"
              >
                Update Selected
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="hidden sm:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction, index) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(transaction.id)}
                            onChange={() => toggleTransactionSelection(transaction.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.customer_phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.items.length} item(s)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={transaction.status}
                            onChange={(e) => updateStatus(transaction.id, e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No transactions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, index) => (
                  <div key={transaction.id} className="bg-white border-b border-gray-200 last:border-b-0">
                    <div className="px-4 py-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          #{index + 1} - {transaction.customer_phone}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleCardExpansion(transaction.id)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        {expandedCard === transaction.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {expandedCard === transaction.id && (
                      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <dt className="text-gray-500">Receipt ID</dt>
                            <dd className="font-medium text-gray-900">{transaction.id}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Items</dt>
                            <dd className="font-medium text-gray-900">{transaction.items.length}</dd>
                          </div>
                          <div className="col-span-2">
                            <dt className="text-gray-500">Status</dt>
                            <dd className="mt-1">
                              <select
                                value={transaction.status}
                                onChange={(e) => updateStatus(transaction.id, e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                              >
                                {statuses.map((status) => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">No transactions found</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}