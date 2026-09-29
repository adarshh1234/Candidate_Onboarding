import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/recruiter/DataTable';

interface TestItem {
  id: string;
  name: string;
  department: string;
  score: number;
}

const mockData: TestItem[] = [
  { id: '1', name: 'Zoya Khan', department: 'Engineering', score: 92 },
  { id: '2', name: 'Aarav Sharma', department: 'Product', score: 85 },
  { id: '3', name: 'Deepak Verma', department: 'Sales', score: 78 },
  { id: '4', name: 'Kavita Iyer', department: 'Engineering', score: 96 },
];

const testColumns: ColumnDef<TestItem>[] = [
  {
    accessorKey: 'name',
    header: 'Full Name',
    cell: ({ row }) => <span>{row.original.name}</span>,
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: ({ row }) => <span>{row.original.department}</span>,
  },
  {
    accessorKey: 'score',
    header: 'Score',
    cell: ({ row }) => <span>{row.original.score}</span>,
  },
];

describe('DataTable Component', () => {
  it('renders all rows and columns properly', () => {
    render(<DataTable data={mockData} columns={testColumns} searchKey="name" />);

    expect(screen.getByText('Zoya Khan')).toBeInTheDocument();
    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('Deepak Verma')).toBeInTheDocument();
    expect(screen.getByText('Kavita Iyer')).toBeInTheDocument();
  });

  it('filters rows based on global search input', () => {
    render(<DataTable data={mockData} columns={testColumns} searchKey="name" />);

    const searchInput = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(searchInput, { target: { value: 'Aarav' } });

    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.queryByText('Zoya Khan')).not.toBeInTheDocument();
    expect(screen.queryByText('Deepak Verma')).not.toBeInTheDocument();
  });

  it('sorts columns when clicking sortable header', () => {
    render(<DataTable data={mockData} columns={testColumns} searchKey="name" />);

    // Click 'Full Name' header to sort ascending
    const nameHeader = screen.getByText('Full Name').closest('th');
    expect(nameHeader).not.toBeNull();
    if (nameHeader) {
      fireEvent.click(nameHeader);
    }

    const rows = screen.getAllByRole('row');
    // First data row (index 1) should be Aarav Sharma (A comes first)
    expect(rows[1]).toHaveTextContent('Aarav Sharma');

    // Click again for descending sort
    if (nameHeader) {
      fireEvent.click(nameHeader);
    }
    const rowsDesc = screen.getAllByRole('row');
    // First data row should be Zoya Khan
    expect(rowsDesc[1]).toHaveTextContent('Zoya Khan');
  });

  it('shows empty state when no records match filter', () => {
    render(<DataTable data={mockData} columns={testColumns} searchKey="name" />);

    const searchInput = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentPerson123' } });

    expect(screen.getByText(/No matching records found/i)).toBeInTheDocument();
  });
});
