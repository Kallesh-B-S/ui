// components/BeautifulTable.tsx
import type { ColumnDef } from '@tanstack/react-table';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';

interface Person {
    name: string;
    age: number;
    email: string;
}

const defaultData: Person[] = [
    { name: 'Alice', age: 25, email: 'alice@example.com' },
    { name: 'Bob', age: 30, email: 'bob@example.com' },
    { name: 'Charlie', age: 22, email: 'charlie@example.com' },
];

const columns: ColumnDef<Person>[] = [
    {
        header: 'Name',
        accessorKey: 'name',
    },
    {
        header: 'Age',
        accessorKey: 'age',
    },
    {
        header: 'Email',
        accessorKey: 'email',
    },
];

const BeautifulTable = () => {
    const table = useReactTable({
        data: defaultData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {},
    });

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">User List</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse rounded-md shadow-sm">
                    <thead className="bg-blue-600 text-white">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-2 text-left text-sm font-semibold"
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                className="hover:bg-blue-50 transition-colors duration-200"
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-4 py-2 text-sm text-gray-700">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BeautifulTable;
