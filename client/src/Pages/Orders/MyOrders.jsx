import { useCallback,useEffect, useState } from 'react';
import { FaFilter,FaSearch } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

import Layout from '../../Layout/Layout';
import { clearOrders,getMyOrders, getOrderStats, searchOrders } from '../../Redux/Slices/OrderSlice';
import EmptyState from './EmptyState';
import OrderCard from './OrderCard';
import OrderFilters from './OrderFilters';
import OrderSkeleton from './OrderSkeleton';

const MyOrders = () => {
    const dispatch = useDispatch();
    const { orders, orderStats, pagination, loading } = useSelector((state) => state.order);
    
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: '',
        paymentStatus: '',
        orderType: '',
        dateFrom: '',
        dateTo: ''
    });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        // Scroll to top on component mount
        window.scrollTo(0, 0);
    }, []);

    const handleSearch = useCallback(async () => {
        if (searchQuery.trim()) {
            setIsSearching(true);
            await dispatch(searchOrders({ 
                query: searchQuery, 
                page: filters.page, 
                limit: filters.limit 
            }));
        } else {
            setIsSearching(false);
            dispatch(getMyOrders(filters));
        }
    }, [dispatch, searchQuery, filters]);

    useEffect(() => {
        // Fetch order stats on component mount
        dispatch(getOrderStats());
        
        return () => {
            dispatch(clearOrders());
        };
    }, [dispatch]);

    useEffect(() => {
        // Refetch orders when filters change
        if (searchQuery.trim()) {
            handleSearch();
        } else {
            dispatch(getMyOrders(filters));
        }
    }, [filters, handleSearch, searchQuery, dispatch]);



    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        const newFilters = { ...filters, page: newPage };
        setFilters(newFilters);
        
        if (isSearching) {
            dispatch(searchOrders({ 
                query: searchQuery, 
                page: newPage, 
                limit: filters.limit 
            }));
        } else {
            dispatch(getMyOrders(newFilters));
        }
    };

    const handleRefresh = () => {
        dispatch(getOrderStats());
        if (isSearching) {
            handleSearch();
        } else {
            dispatch(getMyOrders(filters));
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
        dispatch(getMyOrders(filters));
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-4 xs:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm p-4 xs:p-6 mb-4 xs:mb-6">
                        <div className="flex flex-col gap-4 xs:gap-0 xs:flex-row justify-between items-start xs:items-center mb-4">
                            <div>
                                <h1 className="text-2xl xs:text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                                <p className="text-sm xs:text-base text-gray-600">Track and manage your course purchases</p>
                            </div>
                            <button
                                onClick={handleRefresh}
                                className="w-full xs:w-auto bg-blue-600 text-white px-3 xs:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm xs:text-base"
                                disabled={loading}
                            >
                                <MdRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {/* Order Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 mb-4 xs:mb-6">
                            <div className="bg-blue-50 p-3 xs:p-4 rounded-lg">
                                <div className="text-xl xs:text-2xl font-bold text-blue-600">{orderStats.totalOrders}</div>
                                <div className="text-xs xs:text-sm text-gray-600">Total Orders</div>
                            </div>
                            <div className="bg-green-50 p-3 xs:p-4 rounded-lg">
                                <div className="text-xl xs:text-2xl font-bold text-green-600">{orderStats.completedOrders}</div>
                                <div className="text-xs xs:text-sm text-gray-600">Completed</div>
                            </div>
                            <div className="bg-yellow-50 p-3 xs:p-4 rounded-lg">
                                <div className="text-xl xs:text-2xl font-bold text-yellow-600">{orderStats.pendingOrders}</div>
                                <div className="text-xs xs:text-sm text-gray-600">Pending</div>
                            </div>
                            <div className="bg-purple-50 p-3 xs:p-4 rounded-lg">
                                <div className="text-xl xs:text-2xl font-bold text-purple-600">₹{orderStats.totalSpent}</div>
                                <div className="text-xs xs:text-sm text-gray-600">Total Spent</div>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col gap-3 xs:gap-4 mb-4">
                            <div className="flex-1 relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 xs:w-4 xs:h-4" />
                                <input
                                    type="text"
                                    placeholder="Search orders by course name or order number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-9 xs:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm xs:text-base"
                                />
                                {isSearching && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col xs:flex-row gap-2 xs:gap-4">
                                <button
                                    onClick={handleSearch}
                                    className="flex-1 xs:flex-none bg-blue-600 text-white px-4 xs:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm xs:text-base"
                                >
                                    Search
                                </button>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex-1 xs:flex-none bg-gray-600 text-white px-4 xs:px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm xs:text-base"
                                >
                                    <FaFilter className="w-3 h-3 xs:w-4 xs:h-4" />
                                    Filters
                                </button>
                            </div>
                        </div>

                        {/* Filters Panel */}
                        {showFilters && (
                            <OrderFilters
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClose={() => setShowFilters(false)}
                            />
                        )}
                    </div>

                    {/* Orders List */}
                    <div className="bg-white rounded-lg shadow-sm">
                        {loading ? (
                            <div className="p-6">
                                {[...Array(5)].map((_, index) => (
                                    <OrderSkeleton key={index} />
                                ))}
                            </div>
                        ) : orders.length === 0 ? (
                            <EmptyState 
                                isSearching={isSearching} 
                                searchQuery={searchQuery}
                                onClearSearch={clearSearch}
                            />
                        ) : (
                            <>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <OrderCard key={order._id} order={order} />
                                        ))}
                                    </div>
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                                            {Math.min(pagination.currentPage * filters.limit, pagination.totalOrders)} of{' '}
                                            {pagination.totalOrders} orders
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                disabled={!pagination.hasPrev}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                            
                                            {/* Page numbers */}
                                            {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                                                const pageNum = Math.max(1, pagination.currentPage - 2) + index;
                                                if (pageNum > pagination.totalPages) return null;
                                                
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`px-3 py-1 text-sm rounded ${
                                                            pageNum === pagination.currentPage
                                                                ? 'bg-blue-600 text-white'
                                                                : 'border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                            
                                            <button
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                disabled={!pagination.hasNext}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MyOrders;