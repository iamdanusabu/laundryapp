import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Grid, Moon, User, Search, LogOut, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DateRangePicker } from '../components/ui/date-range-picker';

type Transaction = {
  id: string;
  customer_phone: string;
  items: any[];
  status: string;
  created_at: string;
  total_amount: number;
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalClothes, setTotalClothes] = useState<number>(0);
  const [salesData, setSalesData] = useState<{ name: string; sales: number }[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    to: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchStatuses();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sales = transactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      const clothes = transactions?.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0) || 0;

      setTotalSales(sales);
      setTotalTransactions(transactions?.length || 0);
      setTotalClothes(clothes);
      setTransactions(transactions || []);

      // Generate sales data for the chart
      const salesByDay = transactions?.reduce((acc, t) => {
        const date = new Date(t.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + t.total_amount;
        return acc;
      }, {});

      const chartData = Object.entries(salesByDay || {}).map(([date, sales]) => ({
        name: date,
        sales: sales as number,
      }));

      setSalesData(chartData);

    } catch (error) {
      toast.error('Error fetching dashboard data: ' + error.message);
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const updateStatus = async (transactionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', transactionId);

      if (error) throw error;
      toast.success('Status updated successfully');
      fetchDashboardData();
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
      fetchDashboardData();
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
      transaction.customer_phone.includes(searchQuery) || 
      transaction.id.includes(searchQuery) ||   
      transaction.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCardExpansion = (transactionId: string) => {
    setExpandedCard(expandedCard === transactionId ? null : transactionId);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error logging out: ' + error.message);
    } else {
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                <Link to="/dashboard" className="bg-gray-100 text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  Dashboard
                </Link>
                <Link to="/transactions" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  Transactions
                </Link>
                <Link to="/customers" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  Customers
                </Link>
                <Link to="/new-transaction" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  New Transaction
                </Link>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button onClick={handleLogout} className="flex-shrink-0 group block">
                <div className="flex items-center">
                  <div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">Tom Cook</p>
                    <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">Logout</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Date Range Picker */}
              <div className="my-4">
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>

              {/* Dashboard stats */}
              <div className="mt-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{totalSales.toFixed(2)}</dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Transactions</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalTransactions}</dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Clothes Processed</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalClothes}</dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Chart */}
              <div className="mt-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="mt-8">
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                    <p className="mt-2 text-sm text-gray-700">A list of all recent transactions including their name, receipt ID, date, items, and status.</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
                  <input
                    type="text"
                    placeholder="Search for Transaction or Customer"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full sm:w-64 p-2 border border-gray-300 rounded-md mb-4 sm:mb-0"
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
                  <div className="flex justify-center items-center mt-8">
                    <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
                  </div>
                ) : (
                  <div className="mt-8 flex flex-col">
                    <div  className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                  <span className="sr-only">Select</span>
                                </th>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">#</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Receipt ID</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Items</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {filteredTransactions.slice(0, 10).map((transaction, index) => (
                                <tr key={transaction.id}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                    <input
                                      type="checkbox"
                                      checked={selectedTransactions.includes(transaction.id)}
                                      onChange={() => toggleTransactionSelection(transaction.id)}
                                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                  </td>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{index + 1}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.customer_phone}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.id}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.items.length} item(s)</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    <select
                                      value={transaction.status}
                                      onChange={(e) => updateStatus(transaction.id, e.target.value)}
                                      className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    >
                                      {statuses.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}