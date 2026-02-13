import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

const ProductQuickView = ({
  open,
  onClose,
  product,
  cartItem,
  loading,
  onAdd,
  onInc,
  onDec,
  variant = "food",
  dietType,
  shopDiscount = 0,
  DietIcon,
}) => {
  if (!open || !product) return null;

  let hasDiscount = false;
  let originalPrice = product.price;
  let finalPrice = product.price;
  let discountLabel = "";

  const isValentine = new Date().getMonth() === 1 && new Date().getDate() <= 14;

  if (variant === "grocery" && product.basePrice > product.price) {
    hasDiscount = true;
    originalPrice = product.basePrice;
    finalPrice = product.price;
    discountLabel = `${Math.round(
      ((product.basePrice - product.price) / product.basePrice) * 100,
    )}% OFF`;
  }

  if (variant === "food" && shopDiscount > 0) {
    hasDiscount = true;
    originalPrice = product.price;
    finalPrice = (product.price - (product.price * shopDiscount) / 100).toFixed(
      2,
    );
    discountLabel = `${shopDiscount}% OFF`;
  }
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* SHEET WRAPPER (FULL WIDTH POSITIONING) */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[9999]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* SHEET CONTENT (MAX WIDTH) */}
            <div className="mx-auto max-w-[600px] bg-white dark:bg-gray-900 rounded-t-2xl p-4">
              {/* HANDLE */}
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

              {/* IMAGE + INFO */}
              <div className="relative flex gap-4">
                {hasDiscount && (
                  <span className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-lg">
                    {discountLabel}
                  </span>
                )}

                {dietType && (
                  <div className="absolute top-2 right-2">
                    <DietIcon type={dietType} />
                  </div>
                )}

                {isValentine && (
                  <div className="absolute -inset-1 rounded-xl pointer-events-none" />
                )}

                <img
                  src={
                    product.images?.[0] ||
                    "https://tse3.mm.bing.net/th/id/OIP.j9lwZI84idgGDQj02DAXCgHaHa?pid=Api"
                  }
                  alt={product.name}
                  className="relative w-24 h-24 rounded-lg object-cover z-10"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                    {product.name}
                  </h3>

                  {variant === "food" && product.shopName && (
                    <p className="text-xs text-red-700 font-semibold">{product.shopName}</p>
                  )}

                  <div className="mt-2">
                    {hasDiscount ? (
                      <p className="text-sm">
                        <span className="line-through text-gray-800 dark:text-white mr-2">
                          ₹{originalPrice}
                        </span>
                        <span className="text-red-500 font-semibold">
                          ₹{finalPrice}
                        </span>
                      </p>
                    ) : (
                      <p className="text-green-600 font-semibold">
                        ₹{finalPrice}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CART CTA */}
              <div className="mt-4 flex gap-2">
                {/* PRIMARY CTA (3/4) */}
                <div className="flex-[3]">
                  {product.inStock ? (
                    loading ? (
                      <div className="w-full py-2 text-center bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg">
                        Adding…
                      </div>
                    ) : cartItem ? (
                      <div className="flex justify-between items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg px-4 py-2">
                        <button onClick={onDec}>−</button>
                        <span className="font-semibold">
                          {cartItem.quantity}
                        </span>
                        <button onClick={onInc}>+</button>
                      </div>
                    ) : (
                      <button
                        onClick={onAdd}
                        className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold"
                      >
                        Add to Cart
                      </button>
                    )
                  ) : (
                    <div className="w-full py-2 text-center bg-gray-400 text-white rounded-lg">
                      Not Available
                    </div>
                  )}
                </div>

                {/* SECONDARY CLOSE CTA (1/4) */}
                <button
                  onClick={onClose}
                  className="flex-[1] py-2 font-semibold bg-red-500 text-white rounded-lg"
                  aria-label="Close"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default ProductQuickView;
