import { motion } from 'framer-motion'
export { ConfirmModal }

interface ConfirmProps {
    message: string;
    onConfirm: () => void;
    onClose: () => void;
}

const ConfirmModal = ({ message, onConfirm, onClose }: ConfirmProps) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#CFC9C9] p-6 rounded-lg shadow-2xl w-80 text-center"
            >
                <p className="text-lg mb-4">{message}</p>
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-all"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }}
                        className="px-4 py-2 bg-[#9E9494] text-white rounded-md hover:bg-[#867979] transition-all"
                    >
                        Hapus!
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}