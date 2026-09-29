import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VisaTabs } from '@/features/recruiter/visa/components/VisaTabs';
import { VISA_TABS } from '@/features/recruiter/visa/visa.constants';

describe('Visa & Immigration Tabs Feature', () => {
  it('renders all 5 exact tabs with correct labels', () => {
    const handleTabChange = vi.fn();

    render(
      <VisaTabs
        activeTab="status"
        onTabChange={handleTabChange}
        counts={{
          status: 4,
          details: 4,
          expiry: 1,
          documents: 18,
          cost: 4,
        }}
      />
    );

    // Verify all 5 exact tab labels
    expect(screen.getByRole('tab', { name: /Visa Status/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Visa Details/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Visa Expiry/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Documents/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Cost/i })).toBeInTheDocument();

    // Verify exactly 5 tabs in VISA_TABS constant
    expect(VISA_TABS).toHaveLength(5);
    expect(VISA_TABS.map((t) => t.label)).toEqual([
      'Visa Status',
      'Visa Details',
      'Visa Expiry',
      'Documents',
      'Cost',
    ]);
  });

  it('triggers onTabChange with correct tab ID when clicked', () => {
    const handleTabChange = vi.fn();

    render(
      <VisaTabs
        activeTab="status"
        onTabChange={handleTabChange}
      />
    );

    const costTab = screen.getByRole('tab', { name: /Cost/i });
    fireEvent.click(costTab);
    expect(handleTabChange).toHaveBeenCalledWith('cost');

    const expiryTab = screen.getByRole('tab', { name: /Visa Expiry/i });
    fireEvent.click(expiryTab);
    expect(handleTabChange).toHaveBeenCalledWith('expiry');

    const detailsTab = screen.getByRole('tab', { name: /Visa Details/i });
    fireEvent.click(detailsTab);
    expect(handleTabChange).toHaveBeenCalledWith('details');
  });

  it('renders badge counts for tabs', () => {
    render(
      <VisaTabs
        activeTab="status"
        onTabChange={vi.fn()}
        counts={{
          status: 4,
          documents: 18,
        }}
      />
    );

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });
});
