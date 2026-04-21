import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiRupee } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { getUserData } from "../../Redux/Slices/AuthSlice";
import {
  getRazorPayId,
  transectionUserPayment,
} from "../../Redux/Slices/RazorpaySlice";

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const rzorpayKey = useSelector((state) => state?.razorpay?.key);
  const userData = useSelector((state) => state?.auth?.data);
  const [loading, setLoading] = useState(true);

  const handleSubscription = async (e) => {
    e.preventDefault();

    if (!rzorpayKey) {
      toast.error("Something went wrong. Try again.");
      return;
    }

    const options = {
      key: rzorpayKey,
      name: "Coursify Pvt Ltd",
      description: "Subscription",
      currency: "INR",
      handler: async function (response) {
        const paymentDetails = {
          razorpay_payment_id: response.razorpay_payment_id,
          user_id: userData?.id, // Send the user ID for testing
        };

        toast.success("Payment successful");

        const result = await dispatch(transectionUserPayment(paymentDetails));
        if (result?.payload?.success) {
          // Refresh user data to get updated subscription status
          await dispatch(getUserData());
          navigate("/checkout/success");
        } else {
          navigate("/checkout/fail");
        }
      },
      theme: {
        color: "#FFC107",
      },
      prefill: {
        email: userData?.email,
        name: userData?.fullName,
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  useEffect(() => {
    const initCheckout = async () => {
      setLoading(true);
      await dispatch(getRazorPayId());

      if (userData?.subscription?.status === "active") {
        navigate("/courses");
      } else if (userData?.subscription?.status === "created") {
        // no-op: subscription_id is already set in redux
      } else {
        // await dispatch(purchaseCourseBundle());
      }

      setLoading(false);
    };

    initCheckout();
  }, [dispatch, userData, navigate]);

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <Layout>
      <section className="flex flex-col gap-6 items-center py-8 px-3 min-h-[100vh]">
        <form
          onSubmit={handleSubscription}
          className="flex flex-col dark:bg-gray-800 bg-white gap-4 rounded-lg md:py-10 py-7 md:px-8 md:pt-3 px-3 md:w-[500px] w-full shadow-custom dark:shadow-xl transition duration-300"
        >
          <div>
            <h1 className="bg-yellow-500 w-full text-center py-4 text-2xl font-bold rounded-tl-lg rounded-tr-lg text-white">
              Subscription Bundle
            </h1>
            <div className="px-4 space-y-7 text-center text-gray-600 dark:text-gray-300">
              <p className="text-lg mt-5">
                Unlock access to all available courses on our platform for{" "}
                <span className="text-yellow-500 font-bold">1 year</span>. This
                includes both existing and new courses.
              </p>

              <p className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-500">
                <BiRupee />
                <span>499</span>
              </p>

              <div className="text-xs">
                <p className="text-blue-600 dark:text-yellow-500">
                  100% refund on cancellation
                </p>
                <p>* Terms and conditions apply *</p>
              </div>

              <button
                type="submit"
                className="bg-yellow-500 transition duration-300 w-full text-xl font-bold text-white py-2 rounded-bl-lg rounded-br-lg"
              >
                Buy now
              </button>
            </div>
          </div>
        </form>
      </section>
    </Layout>
  );
}
