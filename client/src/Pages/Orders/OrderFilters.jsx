import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const OrderFilters = ({ filters, onFilterChange, onClose }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleApply = () => {
        onFilterChange(localFilters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = {
            ...localFilters,
            status: '',
            paymentStatus: '',
            orderType: '',
            dateFrom: '',
            dateTo: ''
        };
        setLocalFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filter Orders</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <FaTimes className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Order Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Status
                    </label>
                    <select
                        value={localFilters.status}
                        onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="canceled">Canceled</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>

                {/* Payment Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Status
                    </label>
                    <select
                        value={localFilters.paymentStatus}
                        onChange={(e) => setLocalFilters({ ...localFilters, paymentStatus: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Payments</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>

                {/* Order Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Type
                    </label>
                    <select
                        value={localFilters.orderType}
                        onChange={(e) => setLocalFilters({ ...localFilters, orderType: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Types</option>
                        <option value="course_purchase">Course Purchase</option>
                        <option value="subscription">Subscription</option>
                    </select>
                </div>

                {/* Items per page */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Items per page
                    </label>
                    <select
                        value={localFilters.limit}
                        onChange={(e) => setLocalFilters({ ...localFilters, limit: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                    </label>
                    <input
                        type="date"
                        value={localFilters.dateFrom}
                        onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                    </label>
                    <input
                        type="date"
                        value={localFilters.dateTo}
                        onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleApply}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                    Apply Filters
                </button>
                <button
                    onClick={handleReset}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                >
                    Reset
                </button>
                <button
                    onClick={onClose}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default OrderFilters;