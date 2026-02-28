import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { useEffect, useState } from 'react'
import { Note } from './components/note'
import { AnimatePresence, motion } from 'framer-motion'
import { IpcRenderer } from '@electron-toolkit/preload'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import scrollbarHide from 'tailwind-scrollbar-hide';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { IoAddOutline, IoLayersOutline } from "react-icons/io5";
import { Lib } from './components/lib'
import { IoIosTrendingUp, IoIosTrendingDown } from "react-icons/io";

interface Transaction {
  id:number,
  title:string,
  amount:number,
  category:string,
  type:string,
  note:string,
  created_at:string
}

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const [ today, setIsToday ] = useState(dayjs().format('YYYY-MM-DD'))
  const [ isNote, setIsNote ] = useState(false)
  const [ balance, setIsBalance ] = useState<number>(0)
  const [ graph, setIsGraph ] = useState<any[]>([])
  const [ report, setIsReport ] = useState<Transaction[]>([])
  const [ active, setIsAct ] = useState(false)
  const [ tab, setIsTab ] = useState(false)
  const [ isLib, setIsLib] = useState(false)
  const [ income, setIsIncome ] = useState<number>(0)
  const [ expense, setIsExpense ] = useState<number>(0)
  const [hasMounted, setHasMounted] = useState(false)


  useEffect(() => {
    setHasMounted(true)
    loadData()
    loadGraph()
    const removeListener = window.electron.ipcRenderer.on('open-note', () => {
      setIsNote((prev) => !prev)
      setIsAct((prev) => !prev)  
    })

    const removeCloseListener = window.electron.ipcRenderer.on('close-note', () => {
      setIsNote(false)
      setIsAct(false)
    })

    return () => {
      if (removeListener) removeListener()
      if (removeCloseListener) removeCloseListener()
    }
  }, [])

  const handleClose = () => {
    setIsNote(false)
  }

  const tanggalUI = () => {
    dayjs.locale('id')
    return (dayjs(today).format('dddd, D MMMM YYYY'))
  }

  const formatDuit = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'jt'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'rb'
  return n.toLocaleString('id-ID')
  }

  const loadGraph = async() => {
    const data = await window.api.getGraphData();
    setIsGraph(data)
  }

  const loadData = async () => {
    try {
      const finalReport = await window.api.fetchData()
      if (finalReport) {
        setIsReport([...finalReport])

        const dataBulanIni = finalReport.filter(item => 
          dayjs(item.created_at).isSame(dayjs(), 'month')
        )

        // Hitung Income & Expense khusus bulan ini
        const monthlyIncome = dataBulanIni
          .filter(item => item.type === 'Income')
          .reduce((acc, item) => acc + item.amount, 0)

        const monthlyExpense = dataBulanIni
          .filter(item => item.type === 'Expense')
          .reduce((acc, item) => acc + item.amount, 0)

        // --- LOGIC TOTAL SALDO (Tetap All Time) ---
        const totalAllIncome = finalReport
          .filter(item => item.type === 'Income')
          .reduce((acc, item) => acc + item.amount, 0)
        
        const totalAllExpense = finalReport
          .filter(item => item.type === 'Expense')
          .reduce((acc, item) => acc + item.amount, 0)

        // Set semua state
        setIsBalance(totalAllIncome - totalAllExpense) 
        setIsIncome(monthlyIncome)   
        setIsExpense(monthlyExpense)

        await loadGraph()
      }
    } catch (error) {
      console.error('Error refresh:', error)
    }
  }

  const handleButton = () => {
    setIsAct(!active)
  }

  const handleNote = () => {
    setIsNote(!isNote)
    setIsAct(!active)
  }

  const handleLib = () => {
    setIsLib(!isLib)
    setIsTab(!tab)
  }

  const handleBalance = async(pack:any) =>{
    const result = await window.api.takeBalance(pack)
    setIsBalance(result)
    loadGraph()
  }

  const filterDate = report.filter((item) => (
    dayjs(item.created_at).format('YYYY-MM-DD') === today
  ))

  return (
    <>
    <div className='flex flex-row'>
      <div className='bg-[#F3F2F2] w-1/3 h-screen flex flex-col border-r-1 border-[#867979]'>
          <div id='balance' className='bg-[#CFC9C9] w-full z-49 flex-shrink-0 shadow-lg border-b border-black/5'>
            <div className='p-8 -ml-2 flex flex-col w-full items-start justify-start'> 

              <p className='text-[11px] font-semibold text-[#6B6161] uppercase tracking-[0.2em] mb-2'>
                Account Balance
              </p>

              <p className='text-[35px] font-bold lg:text-6xl text-[#3D3B3B] leading-none'>
                {balance.toLocaleString('id-ID')}
              </p>
            </div>

            <div className='px-8 pb-6 flex flex-row gap-8 justify-center'>
              <div className='flex items-center gap-3'>
                <IoIosTrendingUp className='text-[#405D4E]' size={30}/>
                <div className='flex flex-col'>
                  <p className='text-sm text-[#6B6161] font-medium'>Monthly In</p>
                  <p className='text-sm font-bold text-[#405D4E]'>{formatDuit(income)}</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <IoIosTrendingDown className='text-[#864D4D]' size={30}/>
                <div className='flex flex-col'>
                  <p className='text-sm text-[#6B6161] font-medium'>Monthly Out</p>
                  <p className='text-sm font-bold text-[#864D4D]'>{formatDuit(expense)}</p>
                </div>
              </div>
            </div>
          </div>
          <div id='today-list' className='flex-1 overflow-y-auto scrollbar-hide'>
            <div id='list' className='bg-[#F3F2F2] p-4 flex flex-col gap-3'>
              {
                filterDate.map((item) => (
                  <motion.div key={item.id} 
                  initial={{scale:0, opacity:0}}
                  animate={{scale:1, opacity:1}}
                  exit={{scale:0, opacity:0}}
                  transition={{type:'spring', mass:1, damping:30, stiffness:400}}
                  className='bg-[#E7E4E4] border border-[#D1CCCC] flex flex-row p-5 rounded-md shadow-md transition-all duration-100 ease-in-out hover:scale-95'>
                    <div className='flex-1 flex justify-start'><p>{item.title}</p></div>
                    <div className='flex-1 flex justify-end'><p className={item.type === 'Income' ? 
                      'text-[#2D6A4F] font-bold' : 'text-[#800E13] font-bold'}>{item.amount.toLocaleString('id-ID')}</p></div>
                  </motion.div>
                ))
              }
            </div>
          </div>
      </div>
      <div className='bg-white w-2/3 h-full flex-1 relative'>
        <div className='fixed top-0 right-0 z-50 p-3 flex flex-row space-x-2'>
          <button 
          onClick={handleLib}
          className={`p-3 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-110 ${
            tab ? 'rotate-180 bg-[#867979] hover:opacity-70' : 'rotate-0 bg-[#B6AFAF]'
          }`}>
            <IoLayersOutline/>
          </button>

           <button 
          onClick={handleNote}
          className={`p-3 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-110 ${
            active ? 'rotate-45 bg-[#867979]' : 'rotate-0 bg-[#B6AFAF]'
          }`}><IoAddOutline/></button>

        </div>
        <div className='absolute inset-0 min-h-screen overflow-hidden scrollbar-hide flex items-end justify-center focus:outline-none outline-none'>
          {hasMounted && (
            <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0} minHeight={0} className="outline-none w-full h-full">
            <AreaChart data={graph}>
            <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
            dataKey="label" 
            textAnchor="start"
            axisLine={{ stroke: '#9E9494', strokeWidth: 1 }}
            tickLine={false}
            tick={{ fill: '#6B6161'}}
            />
            <YAxis hide />
            <Tooltip 
              formatter={(value: any) => 
                new Intl.NumberFormat('id-ID').format(value)
              } 
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="#2D6A4F" 
              fillOpacity={1} 
              fill="url(#colorIncome)" 
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              stroke="#800E13" 
              fillOpacity={1} 
              fill="url(#colorExpense)" 
            />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
    <AnimatePresence>
      {isLib && <Lib refreshAll={loadData} data={report}/>}
      {isNote && <Note refreshData={loadData} onSave={handleBalance} onClose={handleClose} setButton={handleButton}/>}
    </AnimatePresence>
    </>
  )
}

export default App
