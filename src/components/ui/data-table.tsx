'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  Column,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type FilterOption = {
  label: string;
  value: string;
};

type DataTableColumnMeta = {
  filterVariant?: 'text' | 'select';
  filterPlaceholder?: string;
  filterOptions?: FilterOption[];
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  renderMobileCard?: (row: TData) => React.ReactNode;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  onRowClick,
  renderMobileCard,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const hasFilters = table
    .getHeaderGroups()
    .some((headerGroup) =>
      headerGroup.headers.some(
        (header) =>
          !header.isPlaceholder && header.column.getCanFilter()
      )
    );

  const renderFilterControl = (column: Column<TData, unknown>) => {
    if (!column.getCanFilter()) {
      return null;
    }

    const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
    const filterValue = column.getFilterValue();

    if (meta?.filterVariant === 'select') {
      const options = meta.filterOptions ?? [];
      const currentValue =
        typeof filterValue === 'string' ? filterValue : '';
      return (
        <Select
          value={currentValue}
          onChange={(event) => {
            const { value } = event.target;
            if (!value) {
              column.setFilterValue(undefined);
              return;
            }

            column.setFilterValue(value);
          }}
          options={options}
          className="h-9 text-sm"
        />
      );
    }

    return (
      <Input
        value={typeof filterValue === 'string' ? filterValue : ''}
        onChange={(event) => column.setFilterValue(event.target.value)}
        placeholder={meta?.filterPlaceholder}
        className="h-9 text-sm"
      />
    );
  };

  return (
    <div className="space-y-4" dir="rtl">
      {searchKey && (
        <div className="flex items-center">
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <React.Fragment key={headerGroup.id}>
                <TableRow>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-right">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>

                {hasFilters && (
                  <TableRow>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={`${header.id}-filter`} className="text-right">
                        {header.isPlaceholder ? null : renderFilterControl(header.column)}
                      </TableHead>
                    ))}
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  טוען...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? 'cursor-pointer' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-right">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  אין תוצאות
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      {renderMobileCard && (
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">טוען...</div>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div key={row.id} onClick={() => onRowClick?.(row.original)}>
                {renderMobileCard(row.original)}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">אין תוצאות</div>
          )}
        </div>
      )}
    </div>
  );
}

export interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: any;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>;
  }

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>{title}</span>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
