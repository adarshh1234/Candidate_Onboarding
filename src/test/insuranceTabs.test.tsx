import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InsuranceTabs } from '@/features/recruiter/insurance/components/InsuranceTabs';
import { INSURANCE_TABS } from '@/features/recruiter/insurance/insurance.constants';

describe('Insurance Tabs Feature', () => {
  it('renders all 6 exact tabs with correct labels', () => {
    const handleTabChange = vi.fn();

    render(
      <InsuranceTabs
        activeTab="details"
        onTabChange={handleTabChange}
        counts={{
          details: 12,
          medical: 12,
          employee: 6,
          accident: 12,
          family: 5,
          group: 2,
        }}
      />
    );

    // Verify all 6 exact tab labels
    expect(screen.getByRole('tab', { name: /Insurance Details/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Medical Insurance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Employee Insurance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Accident Cover/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Family Insurance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Group Insurance/i })).toBeInTheDocument();

    // Verify exactly 6 tabs in INSURANCE_TABS constant
    expect(INSURANCE_TABS).toHaveLength(6);
    expect(INSURANCE_TABS.map((t) => t.label)).toEqual([
      'Insurance Details',
      'Medical Insurance',
      'Employee Insurance',
      'Accident Cover',
      'Family Insurance',
      'Group Insurance',
    ]);
  });

  it('triggers onTabChange with correct tab ID when clicked', () => {
    const handleTabChange = vi.fn();

    render(
      <InsuranceTabs
        activeTab="details"
        onTabChange={handleTabChange}
      />
    );

    const medicalTab = screen.getByRole('tab', { name: /Medical Insurance/i });
    fireEvent.click(medicalTab);
    expect(handleTabChange).toHaveBeenCalledWith('medical');

    const employeeTab = screen.getByRole('tab', { name: /Employee Insurance/i });
    fireEvent.click(employeeTab);
    expect(handleTabChange).toHaveBeenCalledWith('employee');

    const accidentTab = screen.getByRole('tab', { name: /Accident Cover/i });
    fireEvent.click(accidentTab);
    expect(handleTabChange).toHaveBeenCalledWith('accident');

    const familyTab = screen.getByRole('tab', { name: /Family Insurance/i });
    fireEvent.click(familyTab);
    expect(handleTabChange).toHaveBeenCalledWith('family');

    const groupTab = screen.getByRole('tab', { name: /Group Insurance/i });
    fireEvent.click(groupTab);
    expect(handleTabChange).toHaveBeenCalledWith('group');
  });

  it('renders badge counts for tabs', () => {
    render(
      <InsuranceTabs
        activeTab="details"
        onTabChange={vi.fn()}
        counts={{
          details: 12,
          employee: 6,
        }}
      />
    );

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });
});
