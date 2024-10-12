import React, { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';

const PublicStatusCheck: React.FC = () => {
  const [transactionId, setTransactionId] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('public_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) throw error;

      if (data) {
        setTransactionStatus(data);
      } else {
        toast.error('Transaction not found');
      }
    } catch (error) {
      toast.error('Error checking status: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Check Transaction Status
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleCheck}>
            <div>
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">
                Transaction ID
              </label>
              <div className="mt-1">
                <input
                  id="transactionId"
                  name="transactionId"
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? 'Checking...' : 'Check Status'}
              </button>
            </div>
          </form>

          {transactionStatus && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
              <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                <div className="py-3 flex justify-between text-sm font-medium">
                  <dt className="text-gray-500">Status:</dt>
                  <dd className="text-gray-900">{transactionStatus.status}</dd>
                </div>
                <div className="py-3 flex justify-between text-sm font-medium">
                  <dt className="text-gray-500">Created At:</dt>
                  <dd className="text-gray-900">{new Date(transactionStatus.created_at).toLocaleString()}</dd>
                </div>
                <div className="py-3 flex justify-between text-sm font-medium">
                  <dt className="text-gray-500">Last Updated:</dt>
                  <dd className="text-gray-900">{new Date(transactionStatus.updated_at).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicStatusCheck;