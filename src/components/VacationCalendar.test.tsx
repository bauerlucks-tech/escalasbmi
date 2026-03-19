import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import VacationCalendar from './VacationCalendar';
import { VacationRequest } from '@/data/scheduleData';

// Mock data
const mockVacations = [
  {
    id: '1',
    operatorId: 'op1',
    operatorName: 'JOÃO SILVA',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    status: 'approved' as const,
    totalDays: 6,
    requestedAt: '2024-01-05T10:00:00Z',
    approvedBy: 'ADMIN',
    approvedAt: '2024-01-10T10:00:00Z',
    month: 1,
    year: 2024,
  },
  {
    id: '2',
    operatorId: 'op2',
    operatorName: 'MARIA SANTOS',
    startDate: '2024-01-25',
    endDate: '2024-01-30',
    status: 'approved' as const,
    totalDays: 6,
    requestedAt: '2024-01-05T10:00:00Z',
    approvedBy: 'ADMIN',
    approvedAt: '2024-01-10T10:00:00Z',
    month: 1,
    year: 2024,
  },
];

describe('VacationCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders vacation calendar with approved vacations', () => {
    render(<VacationCalendar approvedVacations={mockVacations} />);
    
    // Check if statistics are displayed
    expect(screen.getByText('2')).toBeInTheDocument(); // Approved vacations
    expect(screen.getByText('12')).toBeInTheDocument(); // Total days
    expect(screen.getByText('2')).toBeInTheDocument(); // Operators on vacation
    
    // Check if legend is displayed
    expect(screen.getByText('Legenda do Calendário')).toBeInTheDocument();
    expect(screen.getByText('Período Ocupado')).toBeInTheDocument();
    expect(screen.getByText('Operador')).toBeInTheDocument();
  });

  it('renders empty state when no vacations', () => {
    render(<VacationCalendar approvedVacations={[]} />);
    
    expect(screen.getByText('Nenhuma Férias Agendada')).toBeInTheDocument();
    expect(screen.getByText('Não há períodos de férias aprovados no momento.')).toBeInTheDocument();
  });

  it('displays calendar navigation', () => {
    render(<VacationCalendar approvedVacations={mockVacations} />);
    
    // Check if current month is displayed
    const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    expect(screen.getByText(currentMonth, { exact: false })).toBeInTheDocument();
  });

  it('shows vacation badges on occupied days', () => {
    render(<VacationCalendar approvedVacations={mockVacations} />);
    
    // Find vacation badges
    const badges = screen.getAllByText(/JOÃO|MARIA/);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('has responsive grid layout', () => {
    const { container } = render(<VacationCalendar approvedVacations={mockVacations} />);
    
    // Check for grid layout
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('lg:grid-cols-2');
  });

  it('has glass card styling', () => {
    const { container } = render(<VacationCalendar approvedVacations={mockVacations} />);
    
    // Check for glass card styling
    const glassCard = container.querySelector('.glass-card');
    expect(glassCard).toBeInTheDocument();
  });

  it('displays correct statistics calculations', () => {
    render(<VacationCalendar approvedVacations={mockVacations} />);
    
    // Check statistics calculations
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 approved vacations
    expect(screen.getByText('12')).toBeInTheDocument(); // 6 + 6 total days
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 unique operators
  });
});
