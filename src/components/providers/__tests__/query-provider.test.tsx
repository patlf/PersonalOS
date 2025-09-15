import { render, screen } from '@testing-library/react';
import { QueryProvider } from '../query-provider';
import { useQuery } from '@tanstack/react-query';

// Test component that uses React Query
function TestComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['test'],
    queryFn: () => Promise.resolve('test data'),
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>Data: {data}</div>;
}

describe('QueryProvider', () => {
  it('should provide QueryClient to child components', async () => {
    render(
      <QueryProvider>
        <TestComponent />
      </QueryProvider>
    );

    // Initially should show loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Should eventually show the data
    expect(await screen.findByText('Data: test data')).toBeInTheDocument();
  });

  it('should not throw error when QueryClient is accessed', () => {
    expect(() => {
      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      );
    }).not.toThrow();
  });
});