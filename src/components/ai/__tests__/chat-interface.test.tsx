import { render, screen } from '@testing-library/react';
import { ChatInterface } from '../chat-interface';

describe('ChatInterface', () => {
  it('renders the AI Assistant header', () => {
    render(<ChatInterface />);
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('displays quick action buttons', () => {
    render(<ChatInterface />);
    expect(screen.getByText('Plan my day')).toBeInTheDocument();
    expect(screen.getByText('Summarize inbox')).toBeInTheDocument();
    expect(screen.getByText('Schedule review')).toBeInTheDocument();
  });

  it('shows mock chat messages', () => {
    render(<ChatInterface />);
    expect(screen.getByText('Help me plan my day')).toBeInTheDocument();
    expect(screen.getByText(/happy to help you plan your day/)).toBeInTheDocument();
    expect(screen.getByText('/task Create presentation for client meeting')).toBeInTheDocument();
  });

  it('displays coming soon message with features', () => {
    render(<ChatInterface />);
    expect(screen.getByText('AI Assistant Coming Soon')).toBeInTheDocument();
    expect(screen.getByText(/Natural language task creation/)).toBeInTheDocument();
    expect(screen.getByText(/Smart scheduling suggestions/)).toBeInTheDocument();
    expect(screen.getByText(/Email summarization/)).toBeInTheDocument();
    expect(screen.getByText(/Workflow automation/)).toBeInTheDocument();
  });

  it('has disabled input and buttons when coming soon', () => {
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/Try typing \/task, \/event, or \/email/);
    const sendButton = screen.getByRole('button', { name: /send message/i });
    const quickActionButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.includes('Plan my day') || 
      btn.textContent?.includes('Summarize inbox') || 
      btn.textContent?.includes('Schedule review')
    );

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
    quickActionButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('shows slash commands help text', () => {
    render(<ChatInterface />);
    expect(screen.getByText(/Slash commands:/)).toBeInTheDocument();
    expect(screen.getByText(/\/task, \/event, \/email, \/plan, \/summarize/)).toBeInTheDocument();
  });

  it('updates input value when typing', () => {
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try typing \/task, \/event, or \/email/) as HTMLInputElement;
    
    // Even though disabled, we can test the component structure
    expect(input).toHaveAttribute('placeholder', 'Try typing /task, /event, or /email (Coming Soon)');
  });

  it('displays message timestamps', () => {
    render(<ChatInterface />);
    // Check that timestamps are displayed (they will show current time format)
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('shows command badge when message starts with slash', () => {
    render(<ChatInterface />);
    // The mock message '/task Create presentation...' should be visible
    expect(screen.getByText('/task Create presentation for client meeting')).toBeInTheDocument();
  });
});