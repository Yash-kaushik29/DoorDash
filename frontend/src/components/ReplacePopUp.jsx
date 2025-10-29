import { motion } from "framer-motion";

export default function ReplacePopUp({ shopName, onCancel, currShopName, newProduct, replaceCart, loading }) {

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-[90%] max-w-md text-center transition-colors"
      >
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
          Replace existing cart?
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
          Your cart already contains items from{" "}
          <span className="font-semibold text-red-500 dark:text-red-400">{shopName}</span>.
          <br />
          Do you want to clear your cart and add items from{" "}
          <span className="font-semibold text-green-600 dark:text-green-400">{currShopName}</span> instead?
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={replaceCart}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            disabled={loading}
          >
            {loading ? "Replacing..." : "Replace Cart"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
