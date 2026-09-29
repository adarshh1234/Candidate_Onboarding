import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
  CheckSquare,
  Square,
  MinusSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  searchPlaceholder?: string;
  searchKey?: string;
  bulkActions?: Array<{
    label: string;
    icon?: React.ElementType;
    onClick: (selected: TData[]) => void;
  }>;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  renderBulkActions?: (selectedRows: TData[]) => React.ReactNode;
  exportFilename?: string;
  enableRowSelection?: boolean;
}

export function DataTable<TData extends object>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchKey: _searchKey,
  bulkActions,
  isLoading = false,
  onRowClick,
  renderBulkActions,
  exportFilename = 'export.csv',
  enableRowSelection = true,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Augment columns with selection checkbox column if enabled
  const tableColumns = useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectColumn: ColumnDef<TData> = {
      id: 'select',
      header: ({ table }) => (
        <button
          type="button"
          onClick={table.getToggleAllRowsSelectedHandler()}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Select all rows"
        >
          {table.getIsAllRowsSelected() ? (
            <CheckSquare className="w-4 h-4 text-teal-600" />
          ) : table.getIsSomeRowsSelected() ? (
            <MinusSquare className="w-4 h-4 text-teal-600" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            row.toggleSelected();
          }}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={`Select row ${row.index + 1}`}
        >
          {row.getIsSelected() ? (
            <CheckSquare className="w-4 h-4 text-teal-600" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
        </button>
      ),
      enableSorting: false,
    };

    return [selectColumn, ...columns];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  const handleExportCSV = () => {
    const rows = table.getFilteredRowModel().rows;
    if (rows.length === 0) {
      toast.warning('No data to export', 'The current filtered view is empty.');
      return;
    }

    // Extract headers (skip select column)
    const exportableColumns = columns.filter((col) => col.id !== 'select');
    const headerRow = exportableColumns
      .map((col) => `"${String(col.header || col.id || '')}"`)
      .join(',');

    const csvRows = rows.map((row) => {
      return exportableColumns
        .map((col) => {
          const key = ((col as unknown) as { accessorKey?: string }).accessorKey || col.id;
          const val = key ? (row.original as Record<string, unknown>)[key] : '';
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = [headerRow, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV Exported', `Exported ${rows.length} rows to ${exportFilename}`);
  };

  return (
    <div className="space-y-3 text-left">
      {/* Search and Table Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="w-full text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs gap-1.5"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Floating Bulk Action Bar when rows are selected */}
      {selectedRows.length > 0 && (
        <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-between flex-wrap gap-2 text-xs text-teal-900 dark:text-teal-100 shadow-sm animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full font-bold bg-teal-600 text-white text-[11px]">
              {selectedRows.length} selected
            </span>
            <span className="hidden sm:inline text-teal-700 dark:text-teal-300 font-medium">
              Actions apply to selected items
            </span>
          </div>

          <div className="flex items-center gap-2">
            {renderBulkActions && renderBulkActions(selectedRows)}
            {bulkActions &&
              bulkActions.map((action, i) => (
                <Button
                  key={i}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5 bg-white dark:bg-slate-900 border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200"
                  onClick={() => action.onClick(selectedRows)}
                >
                  {action.icon && <action.icon className="w-3.5 h-3.5" />}
                  {action.label}
                </Button>
              ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
              className="text-xs text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50"
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* Responsive Table Container with Sticky Header */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft overflow-hidden">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className={cn(
                          'px-4 py-3.5 font-bold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400 select-none whitespace-nowrap',
                          canSort && 'cursor-pointer hover:text-slate-900 dark:hover:text-slate-100',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {canSort && (
                            <span className="text-slate-400">
                              {isSorted === 'asc' ? (
                                <ArrowUp className="w-3 h-3 text-teal-600" />
                              ) : isSorted === 'desc' ? (
                                <ArrowDown className="w-3 h-3 text-teal-600" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                // Row Skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {tableColumns.map((_, colIdx) => (
                      <td key={colIdx} className="px-4 py-3.5">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                // Empty state
                <tr>
                  <td
                    colSpan={tableColumns.length}
                    className="py-12 text-center text-slate-400 space-y-2"
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      No matching records found
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting your search terms or clearing filters.
                    </p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const isSelected = row.getIsSelected();

                  return (
                    <tr
                      key={row.id}
                      onClick={() => onRowClick && onRowClick(row.original)}
                      className={cn(
                        'transition-colors',
                        onRowClick && 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50',
                        isSelected && 'bg-teal-50/50 dark:bg-teal-950/30',
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3.5 whitespace-nowrap">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="w-20 text-xs py-1"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </Select>
            <span className="text-[11px] text-slate-400">
              Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px]">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {Math.max(1, table.getPageCount())}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 h-8 w-8"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1.5 h-8 w-8"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
