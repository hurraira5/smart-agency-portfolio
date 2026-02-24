import React from 'react';
import { FaFileInvoiceDollar, FaCreditCard, FaUniversity, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Billing = () => {
  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen text-left">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-800">Billing & Plans</h1>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manage your subscription and invoices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Plan Details (PDF Page 8 Style) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Plan Card */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
                <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase">Trial Period</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Current Plan</p>
            <h2 className="text-3xl font-black text-gray-800 mb-6">Standard Monthly</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-gray-50">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Status</p>
                    <p className="text-sm font-bold text-green-500">Active</p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Renews On</p>
                    <p className="text-sm font-bold text-gray-700">Oct 24, 2024</p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Price</p>
                    <p className="text-sm font-bold text-gray-700">Rs. 5,000/mo</p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Payment</p>
                    <p className="text-sm font-bold text-gray-700">Bank Transfer</p>
                </div>
            </div>
          </div>

          {/* Payment Methods / Instructions (PDF Page 9 Style) */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-800 mb-6 flex items-center gap-2">
                <FaUniversity className="text-red-600" /> How to Pay?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Meezan Bank</p>
                    <p className="font-black text-gray-800 text-sm">SMART AGENCY SOLUTIONS</p>
                    <p className="text-sm font-bold text-red-600 tracking-wider mt-1">0102-030405060708</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Nayapay / JazzCash</p>
                    <p className="font-black text-gray-800 text-sm">TAYYAB RAZA</p>
                    <p className="text-sm font-bold text-red-600 tracking-wider mt-1">0300-1234567</p>
                </div>
            </div>
            <p className="mt-4 text-[10px] font-bold text-gray-400 italic italic">
                * Please send the payment screenshot on our WhatsApp after transfer.
            </p>
          </div>

        </div>

        {/* Right Column: Invoices History (PDF Page 10 Style) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 h-full">
            <h3 className="font-black text-gray-800 mb-6 flex items-center gap-2">
                <FaFileInvoiceDollar /> Invoices
            </h3>
            
            <div className="space-y-4">
                {/* Single Invoice Item */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg text-xs">
                            <FaCheckCircle />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-800">INV-001</p>
                            <p className="text-[10px] font-bold text-gray-400">Sep 24, 2024</p>
                        </div>
                    </div>
                    <p className="text-xs font-black text-gray-800">Rs. 5,000</p>
                </div>

                {/* Empty State for Invoices */}
                <div className="py-10 text-center flex flex-col items-center justify-center opacity-20">
                    <FaClock className="text-4xl mb-2" />
                    <p className="text-[10px] font-black uppercase">No more invoices</p>
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Billing;