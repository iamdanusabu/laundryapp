import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, X } from 'lucide-react';

type FormData = {
  customerPhone: string;
  customerName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    tags: string[];
  }[];
};

const NewTransaction: React.FC = () => {
  const { register, control, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      items: [{ name: '', quantity: 1, price: 0, tags: [] }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [customerExists, setCustomerExists] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Save customer information if new
      if (!customerExists) {
        const { error: customerError } = await supabase
          .from('customers')
          .insert({ phone: data.customerPhone, name: data.customerName });
        if (customerError) throw customerError;
      }

      // Generate 6-digit transaction ID
      const transactionId = Math.floor(100000 + Math.random() * 900000).toString();

      // Save transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          id: transactionId,
          customer_phone: data.customerPhone,
          items: data.items,
          status: 'In Queue',
        });

      if (transactionError) throw transactionError;

      toast.success('Transaction created successfully!');
      navigate('/transactions');
    } catch (error) {
      toast.error('Error creating transaction: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkCustomer = async (phone: string) => {
    const { data, error } = await supabase
      .from('customers')
      .select('name')
      .eq('phone', phone)
      .single();

    if (error) {
      setCustomerExists(false);
      setValue('customerName', '');
    } else {
      setCustomerExists(true);
      setValue('customerName', data.name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">New Transaction</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerPhone">
            Customer Phone
          </label>
          <input
            {...register('customerPhone')}
            onBlur={(e) => checkCustomer(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="customerPhone"
            type="tel"
            placeholder="Customer Phone"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerName">
            Customer Name
          </label>
          <input
            {...register('customerName')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="customerName"
            type="text"
            placeholder="Customer Name"
            readOnly={customerExists}
          />
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Items</h2>
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-wrap -mx-3 mb-4">
              <div className="w-full md:w-1/3 px-3 mb-4 md:mb-0">
                <input
                  {...register(`items.${index}.name` as const)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Item name"
                />
              </div>
              <div className="w-full md:w-1/6 px-3 mb-4 md:mb-0">
                <input
                  {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="number"
                  placeholder="Qty"
                />
              </div>
              <div className="w-full md:w-1/6 px-3 mb-4 md:mb-0">
                <input
                  {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                />
              </div>
              <div className="w-full md:w-1/3 px-3 mb-4 md:mb-0">
                <input
                  {...register(`items.${index}.tags` as const)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Tags (comma-separated)"
                />
              </div>
              <div className="w-full md:w-1/12 px-3 flex items-center">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ name: '', quantity: 1, price: 0, tags: [] })}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </button>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Processing...
              </>
            ) : (
              'Create Transaction'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTransaction;