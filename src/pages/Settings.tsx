import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';
import { Loader2, Plus, X } from 'lucide-react';

type Status = {
  id: number;
  name: string;
  order: number;
};

const Settings: React.FC = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [newStatus, setNewStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('statuses')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setStatuses(data || []);
    } catch (error) {
      toast.error('Error fetching statuses: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addStatus = async () => {
    if (!newStatus.trim()) return;
    try {
      const { error } = await supabase
        .from('statuses')
        .insert({ name: newStatus, order: statuses.length });

      if (error) throw error;
      setNewStatus('');
      fetchStatuses();
      toast.success('Status added successfully');
    } catch (error) {
      toast.error('Error adding status: ' + error.message);
    }
  };

  const updateStatus = async (id: number, newName: string) => {
    try {
      const { error } = await supabase
        .from('statuses')
        .update({ name: newName })
        .eq('id', id);

      if (error) throw error;
      fetchStatuses();
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Error updating status: ' + error.message);
    }
  };

  const deleteStatus = async (id: number) => {
    try {
      const { error } = await supabase
        .from('statuses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchStatuses();
      toast.success('Status deleted successfully');
    } catch (error) {
      toast.error('Error deleting status: ' + error.message);
    }
  };

  const reorderStatuses = async (dragIndex: number, hoverIndex: number) => {
    const newStatuses = [...statuses];
    const [reorderedItem] = newStatuses.splice(dragIndex, 1);
    newStatuses.splice(hoverIndex, 0, reorderedItem);

    setStatuses(newStatuses);

    try {
      const updates = newStatuses.map((status, index) => ({
        id: status.id,
        order: index,
      }));

      const { error } = await supabase.from('statuses').upsert(updates);

      if (error) throw error;
      toast.success('Statuses reordered successfully');
    } catch (error) {
      toast.error('Error reordering statuses: ' + error.message);
      fetchStatuses(); // Revert to original order on error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Settings</h1>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Manage Statuses</h2>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <input
                type="text"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="New status name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <button
                onClick={addStatus}
                className="mt-2 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Status
              </button>
            </div>
            <ul>
              {statuses.map((status, index) => (
                <li key={status.id} className="flex items-center justify-between py-2 border-b">
                  <input
                    type="text"
                    value={status.name}
                    onChange={(e) => updateStatus(status.id, e.target.value)}
                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                  <button
                    onClick={() => deleteStatus(status.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;