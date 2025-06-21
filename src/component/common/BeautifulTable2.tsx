// components/BeautifulTable.tsx
import { useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { getBasicDemoTableData } from '../../store/homeSlice';

interface Person {
    name: string;
    age: number;
    email: string;
}

// const defaultData: Person[] = [];

const columns: ColumnDef<Person>[] = [
    {
        header: 'REGIONNAME',
        accessorKey: 'REGIONNAME',
    },
    {
        header: 'REGION',
        accessorKey: 'REGION',
    },
    {
        header: 'REGIONID',
        accessorKey: 'REGIONID',
    },
];

const BeautifulTable2 = (defaultData: { defaultData: Person[] }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const dispatch = useDispatch<AppDispatch>();

    const table = useReactTable({
        data: defaultData.defaultData,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4" onClick={() => dispatch(getBasicDemoTableData())}>User List</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse !rounded-md shadow-sm">
                    <thead className="bg-gray-800 text-white !rounded-2xl">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-2 text-left text-sm font-semibold cursor-pointer select-none"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        {{
                                            asc: ' 🔼',
                                            desc: ' 🔽',
                                        }[header.column.getIsSorted() as string] ?? ''}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-gray-200 divide-y divide-gray-600">
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                                    No data found
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr
                                    key={row.id}
                                    className="hover:bg-blue-200 transition-colors duration-200"
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-4 py-2 text-sm text-gray-700">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BeautifulTable2;
