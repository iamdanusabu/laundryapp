import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, X, Search, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

type FormData = {
  customerPhone: string;
  customerName: string;
  items: {
    name: string;
    procedure: string;
    quantity: number;
    price: number;
    tags: string[];
  }[];
};

type Customer = {
  phone: string;
  name: string;
  address: string;
  tag: string;
};

const NewTransaction: React.FC = () => {
  const { register, control, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      items: [{ name: '', procedure: '', quantity: 1, price: 0, tags: [] }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [customerExists, setCustomerExists] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const navigate = useNavigate();

  const watchItems = watch('items');
  const total = watchItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

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
          total_amount: total,
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
      if (confirm('Customer not found. Would you like to add a new customer?')) {
        setShowNewCustomerModal(true);
      }
    } else {
      setCustomerExists(true);
      setValue('customerName', data.name);
    }
  };

  const handleAddNewCustomer = async (customerData: Customer) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select();
      
      if (error) throw error;

      setCustomerExists(true);
      setValue('customerPhone', customerData.phone);
      setValue('customerName', customerData.name);
      setShowNewCustomerModal(false);
      toast.success('New customer added successfully!');
    } catch (error) {
      toast.error('Error adding new customer: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">New Transaction</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4 flex items-center">
          <Input
            {...register('customerPhone')}
            className="flex-grow mr-2"
            placeholder="Search customer by phone"
            type="tel"
          />
          <Button type="button" onClick={() => checkCustomer(watch('customerPhone'))}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button type="button" onClick={() => setShowNewCustomerModal(true)} className="ml-2">
            <UserPlus className="w-4 h-4 mr-2" />
            New Customer
          </Button>
        </div>
        <div className="mb-4">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            {...register('customerName')}
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
              <div className="w-full md:w-1/4 px-3 mb-4 md:mb-0">
                <Input
                  {...register(`items.${index}.name` as const)}
                  placeholder="Item name"
                />
              </div>
              <div className="w-full md:w-1/4 px-3 mb-4 md:mb-0">
                <Input
                  {...register(`items.${index}.procedure` as const)}
                  placeholder="Procedure"
                />
              </div>
              <div className="w-full md:w-1/6 px-3 mb-4 md:mb-0">
                <Input
                  {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                  type="number"
                  placeholder="Qty"
                />
              </div>
              <div className="w-full md:w-1/6 px-3 mb-4 md:mb-0">
                <Input
                  {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="Price"
                />
              </div>
              <div className="w-full md:w-1/6 px-3 mb-4 md:mb-0">
                <Input
                  value={(watchItems[index].quantity * watchItems[index].price).toFixed(2)}
                  readOnly
                  placeholder="Total"
                />
              </div>
              <div className="w-full md:w-1/12 px-3 flex items-center">
                <Button type="button" onClick={() => remove(index)} variant="destructive">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => append({ name: '', procedure: '', quantity: 1, price: 0, tags: [] })}
            className="mb-4"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
        <div className="mb-4">
          <strong>Total Amount: ₹{total.toFixed(2)}</strong>
        </div>
        <div className="flex items-center justify-between">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Processing...
              </>
            ) : (
              'Create Transaction'
            )}
          </Button>
        </div>
      </form>

      <NewCustomerModal
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        onSubmit={handleAddNewCustomer}
      />
    </div>
  );
};

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Customer) => void;
}

const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { register, handleSubmit } = useForm<Customer>();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" {...register('name', { required: true })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" {...register('phone', { required: true })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input id="address" {...register('address')} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tag" className="text-right">
                Tag
              </Label>
              <Input id="tag" {...register('tag')} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Customer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTransaction;