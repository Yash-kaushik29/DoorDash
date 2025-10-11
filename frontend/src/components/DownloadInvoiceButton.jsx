import { FiDownload } from "react-icons/fi"; 
import Tippy from "@tippyjs/react"; 
import "tippy.js/dist/tippy.css";
import API_BASE_URL from "../config/api";

function DownloadInvoiceButton({ orderId }) {
  const handleDownload = () => {
    window.open(`${API_BASE_URL}/api/order/download-invoice/${orderId}`, "_blank");
  };

  return (
    <Tippy content="Download Invoice" placement="top">
      <button
        onClick={handleDownload}
        className="p-2 rounded-full hover:bg-green-500 hover:text-white transition"
      >
        <FiDownload size={20} />
      </button>
    </Tippy>
  );
}

export default DownloadInvoiceButton;
