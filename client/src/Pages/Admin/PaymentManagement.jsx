import { Calendar, CreditCard, DollarSign, Search,TrendingUp } from "lucide-react";
import { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../Layout/AdminLayout";
import { getUserData } from "../../Redux/Slices/AuthSlice";
import { getPaymentRecord } from "../../Redux/Slices/RazorpaySlice";

export default function PaymentManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const { allPayments, loading } = useSelector((state) => state.razorpay);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState("ALL");

  // Redirect if not admin
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (role !== 'ADMIN') {
      // Validate user's role before proceeding
      dispatch(getUserData())
        .then((response) => {
          const currentRole = response?.payload?.user?.role;
          if (currentRole !== 'ADMIN') {
            navigate('/login');
          } else {
            // Refresh payments data after confirming admin role
            dispatch(getPaymentRecord());
          }
        })
        .catch(() => {
          navigate('/login');
        });
    } else {
      // User already has admin role in state, fetch data
      dispatch(getPaymentRecord());
    }
  }, [dispatch, isLoggedIn, role, navigate]);

  // Calculate payment statistics using actual amounts from payments
  const totalRevenue = allPayments?.reduce((sum, payment) => {
    return sum + (payment.razorpay_payment_id ? (payment.amount || 500) : 0); // Use actual amount or fallback to 500
  }, 0) || 0;

  const successfulPayments = allPayments?.filter(payment => payment.razorpay_payment_id) || [];
  const failedPayments = allPayments?.filter(payment => !payment.razorpay_payment_id) || [];

  // Filter payments
  const filteredPayments = (allPayments || []).filter(payment => {
    const matchesSearch = payment.razorpay_payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.razorpay_subscription_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "SUCCESS") matchesStatus = !!payment.razorpay_payment_id;
    if (statusFilter === "FAILED") matchesStatus = !payment.razorpay_payment_id;
    
    return matchesSearch && matchesStatus;
  });

  if (!isLoggedIn || role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Management</h1>
          <p className="text-gray-600">Monitor and manage all payment transactions</p>
        </div>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{allPayments?.length || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">{successfulPayments.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedPayments.length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by payment ID or subscription ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="SUCCESS">Successful</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="md:w-48">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="WEEK">This Week</option>
                <option value="MONTH">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading payments...</span>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 font-medium text-gray-700">
                  <div className="col-span-3">Payment ID</div>
                  <div className="col-span-3">Subscription ID</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Date</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredPayments.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== "ALL" 
                        ? "Try adjusting your search or filter criteria."
                        : "No payments have been processed yet."
                      }
                    </p>
                  </div>
                ) : (
                  filteredPayments.map((payment) => (
                    <div key={payment._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Payment ID */}
                        <div className="col-span-3">
                          <div className="flex items-center">
                            <CreditCard size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm font-mono text-gray-900">
                              {payment.razorpay_payment_id || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Subscription ID */}
                        <div className="col-span-3">
                          <span className="text-sm font-mono text-gray-600">
                            {payment.razorpay_subscription_id || 'N/A'}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="col-span-2">
                          <span className="text-sm font-medium text-gray-900">
                            ₹{payment.razorpay_payment_id ? (payment.amount || 500) : '0'}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.razorpay_payment_id 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.razorpay_payment_id ? 'Success' : 'Failed'}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <Calendar size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Payment Summary</h3>
              <p className="text-sm text-gray-600">
                Showing {filteredPayments.length} of {allPayments?.length || 0} payments
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {allPayments?.length > 0 
                  ? Math.round((successfulPayments.length / allPayments.length) * 100)
                  : 0
                }%
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}