import { FaStar } from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../utils/axiosInstance";

const ReviewSection = ({ order }) => {
  const [ratings, setRatings] = useState({
    deliveryRatings: order.deliveryRatings || 0,
    appRatings: order?.appRatings || 0,
    overallRatings: order?.overallRatings || 0,
  });
  const [reviewText, setReviewText] = useState(order?.review);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(order?.hasReviewed || false);

  const handleRating = (category, value) => {
    if (submitted) return; // disable rating after submission
    setRatings({ ...ratings, [category]: value });
  };

  const submitReview = async () => {
    if (submitted) return;

    setSubmitting(true);
    try {
      const res = await api.post(
        `/api/order/submit-review`,
        {
          orderId: order._id,
          ratings,
          reviewText,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setSubmitted(true);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (category) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`cursor-pointer transition-colors ${
          index < ratings[category]
            ? "text-yellow-400"
            : "text-gray-300 dark:text-gray-600"
        } ${submitted ? "pointer-events-none opacity-70" : ""}`}
        onClick={() => handleRating(category, index + 1)}
      />
    ));
  };

  return (
    <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Rate Your Order</h3>

      <div className="flex flex-col gap-3">
        <div>
          <p className="font-medium">Delivery Experience</p>
          <div className="flex gap-1">{renderStars("deliveryRatings")}</div>
        </div>

        <div>
          <p className="font-medium">App Experience</p>
          <div className="flex gap-1">{renderStars("appRatings")}</div>
        </div>

        <div>
          <p className="font-medium">Overall Satisfaction</p>
          <div className="flex gap-1">{renderStars("overallRatings")}</div>
        </div>

        {submitted ? (
          <>
            <p className="text-gray-800 dark:text-gray-100">Review: {reviewText}</p>
            <p className="text-green-500 font-medium">
              🎉 Thanks for dropping your review! You're awesome!
            </p>
          </>
        ) : (
          <>
            <textarea
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              rows={3}
              placeholder="Spill the tea ☕… what do you think?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              disabled={submitted}
            />

            <button
              onClick={submitReview}
              disabled={submitting}
              className={`mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-semibold ${
                submitting ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "Sending..." : "Send the vibes ✨"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
