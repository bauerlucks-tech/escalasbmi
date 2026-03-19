import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';

// Simple test to verify Jest setup
describe('Basic Tests', () => {
  it('should run a basic test', () => {
    expect(true).toBe(true);
  });

  it('should render simple component', () => {
    const TestComponent = () => <div data-testid="test">Hello World</div>;
    render(<TestComponent />);
    expect(screen.getByTestId('test')).toBeInTheDocument();
  });
});
