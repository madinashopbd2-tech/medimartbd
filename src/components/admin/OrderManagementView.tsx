import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Printer, 
  Download, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  Phone, 
  MapPin, 
  FileText, 
  ExternalLink,
  Ban,
  QrCode
} from 'lucide-react';
import { OrderData, OrderStatus } from '../../types';

interface OrderManagementViewProps {
  orders: OrderData[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onBlacklistCustomer: (phone: string, reason: string) => void;
}

export const OrderManagementView: React.FC<OrderManagementViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onBlacklistCustomer,
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected order for Thermal Invoice Print Modal
  const [printInvoiceOrder, setPrintInvoiceOrder] = useState<OrderData | null>(null);
  const [invoiceType, setInvoiceType] = useState<'4x6' | 'A4'>('4x6');

  // Filter logic
  const filteredOrders = orders.filter((ord) => {
    // Status tab filter
    if (selectedStatusTab === 'HIGH_RISK') {
      if (ord.riskLevel !== 'HIGH') return false;
    } else if (selectedStatusTab !== 'ALL') {
      if (ord.status !== selectedStatusTab) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = ord.customerName.toLowerCase().includes(q);
      const matchPhone = ord.phone.includes(q);
      const matchOrderNum = ord.orderNumber.toLowerCase().includes(q);
      const matchDistrict = ord.district.toLowerCase().includes(q);
      return matchName || matchPhone || matchOrderNum || matchDistrict;
    }

    return true;
  });

  // Export Courier CSV (Steadfast Format)
  const handleExportSteadfastCsv = () => {
    const headers = ['Invoice_ID', 'Recipient_Name', 'Recipient_Phone', 'Recipient_Address', 'COD_Amount', 'Note'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      `"${o.customerName}"`,
      o.phone,
      `"${o.address}, ${o.upazila}, ${o.district}"`,
      o.totalAmount,
      `"${o.orderNote || 'Cash on Delivery'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Steadfast_Courier_Bulk_Orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ফোন বা অর্ডার ID দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all font-sans"
          />
        </div>

        {/* Courier Export Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleExportSteadfastCsv}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>স্টিডফাস্ট CSV এক্সপোর্ট ({filteredOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Order Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'ALL', label: 'সব অর্ডার', count: orders.length },
          { id: 'PENDING', label: 'পেন্ডিং', count: orders.filter((o) => o.status === 'PENDING').length },
          { id: 'CONFIRMED', label: 'কনফার্মড', count: orders.filter((o) => o.status === 'CONFIRMED').length },
          { id: 'SHIPPED', label: 'শিপড / কুরিয়ার', count: orders.filter((o) => o.status === 'SHIPPED').length },
          { id: 'DELIVERED', label: 'ডেলিভার্ড', count: orders.filter((o) => o.status === 'DELIVERED').length },
          { id: 'CANCELLED', label: 'ক্যান্সেলড', count: orders.filter((o) => o.status === 'CANCELLED').length },
          { id: 'HIGH_RISK', label: '⚠️ হাই-রিস্ক', count: orders.filter((o) => o.riskLevel === 'HIGH').length, isRisk: true },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatusTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
              selectedStatusTab === tab.id
                ? tab.isRisk
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                selectedStatusTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-mono font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-4">অর্ডার বিবরণ</th>
                <th className="p-4">কাস্টমার ও ডেলিভারি তথ্য</th>
                <th className="p-4">পরিমাণ ও মোট মূল্য</th>
                <th className="p-4">এন্টি-ফ্রড রিস্ক লেভেল</th>
                <th className="p-4">স্ট্যাটাস ও অ্যাকশন</th>
                <th className="p-4 text-center">ইনভয়েস প্রিন্ট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    কোনো অর্ডার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    {/* Order Details */}
                    <td className="p-4 space-y-1">
                      <div className="font-mono font-black text-slate-900 text-sm flex items-center gap-2">
                        <span>{ord.orderNumber}</span>
                        {ord.isOtpVerified && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                            OTP Verified
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {new Date(ord.createdAt).toLocaleString('bn-BD', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">CAPI ID: {ord.eventId}</div>
                    </td>

                    {/* Customer Info */}
                    <td className="p-4 space-y-1 max-w-xs">
                      <div className="font-bold text-slate-900">{ord.customerName}</div>
                      <div className="font-mono font-semibold text-emerald-600 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {ord.phone}
                      </div>
                      <div className="text-[11px] text-slate-600 leading-tight flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span>{ord.address}, {ord.upazila}, {ord.district}</span>
                      </div>
                      {ord.orderNote && (
                        <div className="text-[10px] bg-amber-50 text-amber-800 px-2 py-1 rounded-md border border-amber-200">
                          নোট: {ord.orderNote}
                        </div>
                      )}
                    </td>

                    {/* Pricing */}
                    <td className="p-4 space-y-1">
                      <div className="font-bold text-slate-800">{ord.quantity} টি পিস</div>
                      <div className="text-base font-mono font-black text-emerald-600">৳{ord.totalAmount}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        (প্রোডাক্ট: ৳{ord.unitPrice * ord.quantity} + ডেলিভারি: ৳{ord.deliveryFee})
                      </div>
                    </td>

                    {/* Anti-Fraud Risk Scoring */}
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border ${
                            ord.riskLevel === 'HIGH'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : ord.riskLevel === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <ShieldAlert className="w-3 h-3" />
                          {ord.riskLevel} (স্কোর: {ord.riskScore}/100)
                        </span>
                      </div>

                      {ord.riskReasons && ord.riskReasons.length > 0 && (
                        <div className="text-[10px] text-slate-500 leading-tight">
                          • {ord.riskReasons.join(', ')}
                        </div>
                      )}

                      <button
                        onClick={() => onBlacklistCustomer(ord.phone, 'Admin manual blacklist from order list')}
                        className="text-[10px] text-rose-600 hover:underline font-bold flex items-center gap-0.5 mt-1 cursor-pointer"
                      >
                        <Ban className="w-3 h-3" /> ব্ল্যাকলিস্ট করুন
                      </button>
                    </td>

                    {/* Status Update Dropdown */}
                    <td className="p-4 space-y-2">
                      <select
                        value={ord.status}
                        onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className={`w-full px-3 py-1.5 rounded-xl font-bold text-xs outline-none cursor-pointer border font-mono ${
                          ord.status === 'CONFIRMED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : ord.status === 'SHIPPED'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : ord.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ord.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="PENDING">PENDING (পেন্ডিং)</option>
                        <option value="CONFIRMED">CONFIRMED (কনফার্মড)</option>
                        <option value="SHIPPED">SHIPPED (কুরিয়ারে প্রেরিত)</option>
                        <option value="DELIVERED">DELIVERED (সম্পন্ন)</option>
                        <option value="CANCELLED">CANCELLED (বাতিল)</option>
                      </select>
                    </td>

                    {/* Invoice Print Modal Trigger */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setPrintInvoiceOrder(ord)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200"
                        title="Thermal Invoice Print"
                      >
                        <Printer className="w-4 h-4 text-slate-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thermal Sticker / A4 Invoice Printable Modal */}
      {printInvoiceOrder && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setInvoiceType('4x6')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    invoiceType === '4x6' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  4x6 ইঞ্চি থার্মাল স্টিকার
                </button>
                <button
                  onClick={() => setInvoiceType('A4')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    invoiceType === 'A4' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  A4 ইনভয়েস
                </button>
              </div>

              <button onClick={() => setPrintInvoiceOrder(null)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            {/* Printable Area Layout */}
            <div id="printable-invoice" className="border-2 border-slate-900 p-4 font-mono text-xs text-slate-900 space-y-3 bg-white">
              <div className="text-center border-b-2 border-slate-900 pb-2">
                <h3 className="font-extrabold text-base uppercase tracking-wider">CASH ON DELIVERY INVOICE</h3>
                <p className="text-[10px]">CASH ON DELIVERY COURIER PARCEL</p>
                <div className="text-lg font-black mt-1">ORDER ID: {printInvoiceOrder.orderNumber}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-300 pb-2">
                <div>
                  <span className="font-bold block">RECIPIENT NAME:</span>
                  <span className="font-extrabold">{printInvoiceOrder.customerName}</span>
                </div>
                <div>
                  <span className="font-bold block">PHONE NUMBER:</span>
                  <span className="font-extrabold">{printInvoiceOrder.phone}</span>
                </div>
              </div>

              <div className="text-[11px] border-b border-slate-300 pb-2">
                <span className="font-bold block">DELIVERY ADDRESS:</span>
                <span>{printInvoiceOrder.address}, {printInvoiceOrder.upazila}, {printInvoiceOrder.district}</span>
              </div>

              <div className="bg-slate-100 p-2 border border-slate-400 text-center space-y-1">
                <div className="text-xs font-bold">COLLECT COD AMOUNT:</div>
                <div className="text-2xl font-black text-emerald-800">৳{printInvoiceOrder.totalAmount} BDT</div>
                <div className="text-[10px] text-slate-600">(পণ্য হ্যান্ডওভারের পর গ্রাহকের থেকে বুঝে নিন)</div>
              </div>

              <div className="flex justify-between items-center text-[10px] pt-1">
                <span>Date: {new Date(printInvoiceOrder.createdAt).toLocaleDateString('en-GB')}</span>
                <span className="font-bold">Courier: Steadfast / Pathao</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন (Print Invoice)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
