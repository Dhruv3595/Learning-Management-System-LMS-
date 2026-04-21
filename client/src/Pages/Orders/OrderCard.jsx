import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaCalendar, FaCreditCard, FaDownload, FaEye, FaPlay, FaShoppingBag } from 'react-icons/fa';
import { MdExpandLess,MdExpandMore } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';

import { downloadInvoicePDF } from '../../utils/invoiceUtils';

const OrderCard = ({ order }) => {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'canceled':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadInvoice = () => {
        downloadInvoicePDF(order);
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            {/* Main Order Info */}
            <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                    <div className="flex items-center gap-4 mb-4 lg:mb-0">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <FaShoppingBag className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Order #{order.orderNumber}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FaCalendar className="w-4 h-4" />
                                {formatDate(order.createdAt)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                            Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Course Preview */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    {order.courseIds.slice(0, 2).map((course) => (
                        <div key={course._id} className="flex items-center gap-3 flex-1">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {course.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    ₹{course.price || 0}
                                </p>
                                {course.instructor && (
                                    <p className="text-xs text-gray-500">
                                        by {course.instructor}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {order.courseIds.length > 2 && (
                        <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 min-w-[120px]">
                            <span className="text-sm font-medium text-gray-600">
                                +{order.courseIds.length - 2} more
                            </span>
                        </div>
                    )}
                </div>

                {/* Price and Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-lg font-bold text-gray-900">
                            Total: ₹{order.pricing.total}
                        </div>
                        {order.pricing.discount > 0 && (
                            <div className="text-sm text-green-600">
                                Saved: ₹{order.pricing.discount}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {order.paymentStatus === 'paid' && order.courseIds.length === 1 && (
                            <button
                                onClick={() => navigate('/course/displaylectures', { state: order.courseIds[0] })}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                            >
                                <FaPlay className="w-4 h-4" />
                                Start Learning
                            </button>
                        )}
                        
                        <Link
                            to={`/orders/${order._id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                        >
                            <FaEye className="w-4 h-4" />
                            View Details
                        </Link>
                        
                        {order.paymentStatus === 'paid' && (
                            <button
                                onClick={handleDownloadInvoice}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                            >
                                <FaDownload className="w-4 h-4" />
                                Invoice
                            </button>
                        )}
                        
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {expanded ? <MdExpandLess className="w-5 h-5" /> : <MdExpandMore className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4">
                        <h5 className="font-medium text-gray-900 mb-3">Order Details</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-600">Order Type:</p>
                                <p className="font-medium">
                                    {order.orderType === 'subscription' ? 'Subscription' : 'Course Purchase'}
                                </p>
                            </div>
                            
                            {order.paymentDetails?.transactionId && (
                                <div>
                                    <p className="text-sm text-gray-600">Transaction ID:</p>
                                    <p className="font-medium font-mono text-sm">
                                        {order.paymentDetails.transactionId}
                                    </p>
                                </div>
                            )}
                            
                            {order.paymentDetails?.paymentMethod && (
                                <div>
                                    <p className="text-sm text-gray-600">Payment Method:</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <FaCreditCard className="w-4 h-4" />
                                        {order.paymentDetails.paymentMethod}
                                    </p>
                                </div>
                            )}
                            
                            <div>
                                <p className="text-sm text-gray-600">Currency:</p>
                                <p className="font-medium">{order.pricing.currency}</p>
                            </div>
                        </div>

                        {/* All Courses */}
                        {order.courseIds.length > 2 && (
                            <div>
                                <h6 className="font-medium text-gray-900 mb-2">All Courses ({order.courseIds.length})</h6>
                                <div className="space-y-2">
                                    {order.courseIds.map((course) => (
                                        <div key={course._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{course.title}</p>
                                                <p className="text-xs text-gray-600">₹{course.price || 0}</p>
                                            </div>
                                            {order.paymentStatus === 'paid' && (
                                                <Link
                                                    to={`materials/${course._id}`}
                                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                                >
                                                    Access Course
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

OrderCard.propTypes = {
    order: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        orderNumber: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        orderStatus: PropTypes.string.isRequired,
        paymentStatus: PropTypes.string.isRequired,
        orderType: PropTypes.string.isRequired,
        courseIds: PropTypes.arrayOf(PropTypes.shape({
            _id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
        })).isRequired,
        pricing: PropTypes.shape({
            total: PropTypes.number.isRequired,
            discount: PropTypes.number,
            currency: PropTypes.string,
        }).isRequired,
        paymentDetails: PropTypes.shape({
            transactionId: PropTypes.string,
            paymentMethod: PropTypes.string,
        }),
    }).isRequired,
};

export default OrderCard;