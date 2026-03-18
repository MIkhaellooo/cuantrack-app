import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { getCoreRowModel, useReactTable, flexRender } from "@tanstack/react-table"
import { ConfirmModal } from "./confirm-modal" 
import { MdDelete } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5"
export { Lib }

interface Props {
    id: number;
    title: string;
    amount: number;
    type: string;
    category: string;
    note: string;
    created_at: string;
}

interface LibProps {
    refreshAll: () => void;
    data: any[]
}

const Lib = ({ refreshAll, data }: LibProps) => {
    const [isTabel, setIsTabel] = useState<Props[]>([])//
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<number | null>(null)

    const [search, setSearch] = useState('')
    const [filterCat, setFilterCat] = useState('All')

    useEffect(() => {
        setIsTabel(data)
    }, [data])

    const getData = async () => {
        const data = await window.api.fetchData()
        setIsTabel(data)
    }

    const triggerDelete = (id: number) => {
        setSelectedId(id)
        setConfirmOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (selectedId) {
            await window.api.deleteData(selectedId)
            await getData() 
            refreshAll()  
        }
    }

    const filteredData = useMemo(() => {
        return isTabel.filter((item) => {
            const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase())
            const matchesCat = filterCat === 'All' || item.category === filterCat
            return matchesSearch && matchesCat
        })
    }, [isTabel, search, filterCat])

    const Col = useMemo(() => [
        {
            header: 'Title',
            accessorKey: 'title',
            size: 150,
        },
        {
            header: 'Amount',
            accessorKey: 'amount',
            size: 120,
            cell: ({ getValue }: any) => {
                const value = getValue() as number
                return <span className="font-medium">Rp {value?.toLocaleString('id-ID')}</span>
            }
        },
        {
            header: 'Category',
            accessorKey: 'category',
            size: 100
        },
        {
            header: 'Type',
            accessorKey: 'type',
            size: 80,
            cell: ({ getValue }: any) => (
                <span className={getValue() === 'Income' ? 'text-[#2D6A4F]' : 'text-[#800E13]'}>
                    {getValue()}
                </span>
            )
        },
        {
            header: 'Date',
            accessorKey: 'created_at',
            size: 130,
        },
        {
            header: 'Note',
            accessorKey: 'note',
            cell: ({ getValue }: any) => {
                const val = getValue() || "-"
                return (
                    <div className="truncate w-full cursor-help" title={val}>
                        {val}
                    </div>
                )
            }
        },
        {
            header: 'Option',
            size: 90,
            cell: ({ row }: any) => (
                <button
                    className="bg-[#6B6161] text-white px-3 py-1 rounded-md text-xs hover:bg-[#9E9494] hover:scale-110 transition-all active:scale-95"
                    onClick={() => triggerDelete(row.original.id)}
                >
                    <MdDelete size={15}/>
                </button>
            )
        }
    ], [])

    const Mixer = useReactTable({
        data: filteredData || [],
        columns: Col,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: "onChange",
    })

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-49 bg-[#F3F2F2] overflow-hidden flex flex-col"
            >
                <div className="p-5 bg-[#F3F2F2] flex gap-4 items-center shadow-sm w-17/20">
                    <div className="relative flex-1">
                        <input 
                            type="text"
                            placeholder="Search Transactions"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[#F3F2F2] border border-[#D1CCCC] rounded-md outline-none text-sm"
                        />
                        <IoSearchOutline className="absolute left-3 top-2.5 text-gray-500" size={18}/>
                    </div>
                    
                    <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide py-2 max-w-full items-center w-1/2">
                        {['All', 'Sales', 'Dividen', 'COGS', 'Rent & Utilities', 'Opex', 'Marketing', 'Liabilities'].map((cat) => (
                            <button
                            key={cat}
                            onClick={() => setFilterCat(cat)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-200 border
                                ${filterCat === cat 
                                ? 'bg-[#867979] text-white border-[#867979]' 
                                : 'bg-[#F3F2F2] text-[#6B6161] border-[#D1CCCC] hover:bg-[#E7E4E4]'
                                }`}
                            >
                            {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full table-fixed border-collapse">
                        <thead>
                            {Mixer.getHeaderGroups().map(group => (
                                <tr key={group.id} className="bg-[#E7E4E4] border-b border-t border-gray-300">
                                    {group.headers.map(header => (
                                        <th 
                                            key={header.id} 
                                            style={{ width: header.getSize() !== 150 ? `${header.getSize()}px` : 'auto' }}
                                            className="px-4 py-3 text-left font-bold text-gray-700"
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {Mixer.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-100 border-b border-gray-200 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-4 py-3 text-sm overflow-hidden">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <AnimatePresence>
                {confirmOpen && (
                    <ConfirmModal 
                        message="Wanna to delete this data ?" 
                        onConfirm={handleConfirmDelete} 
                        onClose={() => setConfirmOpen(false)} 
                    />
                )}
            </AnimatePresence>
        </>
    )
}