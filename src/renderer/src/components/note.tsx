import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
export { Note }

interface Prop {
    refreshData:() => void,
    onSave:(pack:any) => void,
    onClose:() => void,
    setButton:() => void
}

const Note = ({refreshData, onSave, onClose, setButton}:Prop) => {

    const [ error, setError ] = useState<string | null>(null)
    const [ isInput, setIsInput ] = useState({
    title:'',
    amount:'',
    category:'',
    type:'',
    note:''
    })
800E13
    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setIsInput({
            ...isInput,
            [name]:value
        })
    }

    const handleType = (option:string) => {
        setIsInput((prev) => ({
            ...prev,
            type:option
        }))
    }

    const handleSubmit = async() => {
        if (isInput.amount.trim() === '' || isNaN(Number(isInput.amount)) ||isInput.category.trim() === '' || isInput.type.trim() === '' || isInput.title.trim() === '') {
            setError("Isi data, Bro")

            setTimeout(() =>{
                setError(null)
            },3000)

            return;
        }

        const pack = {
            ...isInput,
            amount : Number(isInput.amount)
        }
        try {
            await onSave(pack);
            await refreshData();
            onClose()
            setButton()
        } catch(error){
            console.error(error)
        }
    }

    return(
        <>
        <motion.div
        initial={{scale:0}}
        animate={{opacity:1, scale:1}}
        exit={{opacity:0, scale:0}}
        transition={{type:'spring', mass:1, damping:30, stiffness:400}}
        className="fixed z-49 inset-0 flex justify-center items-center will-change-transform transform-gpu"
        >
        <div id="main" className="bg-black/20 !backdrop-blur-lg bg- w-2/5 h-3/4 rounded-md border border-black/50 shadow-xl">
            <div className="w-full h-full p-10">
                <div id="input-user" className="flex flex-col">
                    <div id="wrapper" className="flex flex-col space-y-3">
                        <div>
                            <p>Title</p>
                            <input
                            name="title"
                            value={isInput.title}
                            onChange={handleChange}
                            className="h-fit p-1 border-b-1 outline-none"
                            placeholder=""
                            />
                        </div>
                        <div>
                            <p>Amount</p>
                            <input
                            name="amount"
                            value={isInput.amount}
                            onChange={handleChange}
                            className="h-fit p-1 border-b-1 outline-none"
                            placeholder=""
                            />
                        </div>
                        <div>
                            <div>
                                <p className='mb-2'>Category</p>
                                {/* Container Scroll Horizontal */}
                                <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide pb-2">
                                    {['Sales', 'Dividen', 'COGS', 'Rent & Utilities', 'Opex', 'Marketing', 'Liabilities'].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setIsInput({ ...isInput, category: cat })}
                                            className={`whitespace-nowrap px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-200 border
                                            ${isInput.category === cat 
                                                ? 'bg-[#867979] text-white border-[#867979] shadow-md scale-105' 
                                                : 'bg-white/30 text-[#3D3B3B] border-black/10 hover:bg-white/50'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="button-cage" className="flex gap-2 py-5">
                        <button
                        className={`bg-[#2D6A4F] p-3 rounded-md shadow-lg transition-all text-white
                        duration-200 ease-in-out hover:scale-100 hover:bg-[#40916C] active:scale-95 active:bg-[#1B4332]
                        ${isInput.type === 'Income' ? 'ring-1 ring-white scale-90' : 'opacity-100'}`}
                        onClick={() => handleType('Income')}
                        >Income</button>
                        <button
                        className={`bg-[#800E13] p-3 rounded-md shadow-lg transition-all text-white
                        duration-200 ease-in-out hover:scale-100 hover:bg-[#A4161A] active:scale-95 active:bg-[#660708]
                        ${isInput.type === 'Expense' ? 'ring-1 ring-white scale-90' : 'opacity-100'}`}
                        onClick={() => handleType('Expense')}
                        >Expense</button>
                    </div>
                    <div>
                        <p>Note</p>
                        <input
                        name="note"
                        value={isInput.note}
                        onChange={handleChange}
                        className="h-fit p-1 border-b-1 outline-none"
                        placeholder=""
                        />
                    </div>
                </div>
                <div className="flex fixed bottom-0 right-0 p-6">   
                <button
                onClick={handleSubmit}
                className="bg-[#CFC9C9] p-4 rounded-lg shadow-xl hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                >OK
                </button>
                </div>
            </div>
        </div>
         <AnimatePresence>
         {error && (
            <motion.div
            initial={{scale:0, opacity:0}}
            animate={{scale:1, opacity:1}}
            exit={{scale:0, opacity:0}}
            className="fixed z-50 top-0 p-3"
            >
                <p className="text-red-500">
                    {error}
                </p>
            </motion.div>
        )}
        </AnimatePresence>

        </motion.div>

       
        </>
    )
}