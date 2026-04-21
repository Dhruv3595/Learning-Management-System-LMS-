import { useEffect } from 'react';
import { FaArrowLeft, FaCalendar, FaCreditCard, FaDownload, FaPlay,FaShoppingBag } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate,useParams } from 'react-router-dom';

import Layout from '../../Layout/Layout';
import { clearCurrentOrder,getOrderById } from '../../Redux/Slices/OrderSlice';
import { downloadInvoicePDF } from '../../utils/invoiceUtils';

const OrderDetails = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentOrder, loading } = useSelector((state) => state.order);

    useEffect(() => {
        // Scroll to top on component mount
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (orderId) {
            dispatch(getOrderById(orderId));
        }

        return () => {
            dispatch(clearCurrentOrder());
        };
    }, [dispatch, orderId]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'canceled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'refunded':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'refunded':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleDownloadInvoice = () => {
        downloadInvoicePDF(currentOrder);
    };

    if (loading || !currentOrder) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-20 bg-gray-200 rounded"></div>
                                    <div className="h-20 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/orders')}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                        >
                            <FaArrowLeft className="w-4 h-4" />
                            Back to Orders
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                    </div>

                    {/* Order Summary Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                            <div className="flex items-center gap-4 mb-4 lg:mb-0">
                                <div className="bg-blue-100 p-4 rounded-lg">
                                    <FaShoppingBag className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Order #{currentOrder.orderNumber}
                                    </h2>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaCalendar className="w-4 h-4" />
                                        Placed on {formatDate(currentOrder.createdAt)}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(currentOrder.orderStatus)}`}>
                                    {currentOrder.orderStatus.charAt(0).toUpperCase() + currentOrder.orderStatus.slice(1)}
                                </span>
                                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getPaymentStatusColor(currentOrder.paymentStatus)}`}>
                                    {currentOrder.paymentStatus.charAt(0).toUpperCase() + currentOrder.paymentStatus.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {currentOrder.paymentStatus === 'paid' && (
                                <>
                                    <button
                                        onClick={handleDownloadInvoice}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                                    >
                                        <FaDownload className="w-4 h-4" />
                                        Download Invoice
                                    </button>
                                    {currentOrder.courseIds.length === 1 && (
                                        <button
                                            onClick={() => navigate('/course/displaylectures', { state: currentOrder.courseIds[0] })}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                            <FaPlay className="w-4 h-4" />
                                            Start Learning
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Order Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Order Type:</span>
                                        <span className="font-medium">
                                            {currentOrder.orderType === 'subscription' ? 'Subscription' : 'Course Purchase'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Currency:</span>
                                        <span className="font-medium">{currentOrder.pricing.currency}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Order ID:</span>
                                        <span className="font-mono text-xs">{currentOrder._id}</span>
                                    </div>
                                </div>
                            </div>

                            {currentOrder.paymentDetails && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                        <FaCreditCard className="w-4 h-4" />
                                        Payment Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        {currentOrder.paymentDetails.paymentMethod && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Method:</span>
                                                <span className="font-medium">{currentOrder.paymentDetails.paymentMethod}</span>
                                            </div>
                                        )}
                                        {currentOrder.paymentDetails.razorpay_payment_id && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Payment ID:</span>
                                                <span className="font-mono text-xs">{currentOrder.paymentDetails.razorpay_payment_id}</span>
                                            </div>
                                        )}
                                        {currentOrder.paymentDetails.transactionId && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Transaction ID:</span>
                                                <span className="font-mono text-xs">{currentOrder.paymentDetails.transactionId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Price Breakdown</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span>₹{currentOrder.pricing.subtotal}</span>
                                    </div>
                                    {currentOrder.pricing.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount:</span>
                                            <span>-₹{currentOrder.pricing.discount}</span>
                                        </div>
                                    )}
                                    {currentOrder.pricing.tax > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax:</span>
                                            <span>₹{currentOrder.pricing.tax}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                                        <span>Total:</span>
                                        <span>₹{currentOrder.pricing.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Courses List */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Courses ({currentOrder.courseIds.length})
                        </h3>
                        <div className="space-y-4">
                            {currentOrder.courseIds.map((course) => (
                                <div key={course._id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-medium text-gray-900 mb-1">
                                            {course.title}
                                        </h4>
                                        {course.description && (
                                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                                {course.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            {course.instructor && (
                                                <span>Instructor: {course.instructor}</span>
                                            )}
                                            {course.duration && (
                                                <span>Duration: {course.duration}</span>
                                            )}
                                            {course.lectures && (
                                                <span>Lectures: {course.lectures.length}</span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="text-lg font-bold text-gray-900">
                                                ₹{course.price || 0}
                                            </div>
                                            {currentOrder.paymentStatus === 'paid' && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate('/courses/description', { state: course })}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                                                    >
                                                        View Course
                                                    </button>
                                                    <button
                                                        onClick={() => navigate('/course/displaylectures', { state: course })}
                                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                                                    >
                                                        <FaPlay className="w-3 h-3" />
                                                        Start Learning
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default OrderDetails;