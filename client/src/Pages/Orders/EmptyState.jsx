import { FaSearch,FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EmptyState = ({ isSearching, searchQuery, onClearSearch }) => {
    if (isSearching) {
        return (
            <div className="p-12 text-center">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <FaSearch className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No orders found for &quot;{searchQuery}&quot;
                </h3>
                <p className="text-gray-600 mb-6">
                    Try adjusting your search terms or browse all your orders.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={onClearSearch}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Show All Orders
                    </button>
                    <Link
                        to="/courses"
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Browse Courses
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-12 text-center">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
                You haven&apos;t purchased any courses yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start your learning journey by exploring our wide range of courses. 
                Your orders will appear here once you make a purchase.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                    to="/courses"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Browse Courses
                </Link>
                <Link
                    to="/subscription"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    Get Subscription
                </Link>
            </div>
        </div>
    );
};

export default EmptyState;