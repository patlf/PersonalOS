import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MailView } from '../mail-view';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';

// Mock the UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, variant, ...props }: any) => (
    <div className={className} data-variant={variant} {...props}>{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, className, variant, size, ...props }: any) => (
    <button className={className} data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  ),
}));

describe('MailView', () => {
  it('renders the three-panel layout', () => {
    render(<MailView />);
    
    // Check for mailboxes panel
    expect(screen.getByText('Mail')).toBeInTheDocument();
    expect(screen.getAllByText('Inbox')).toHaveLength(2); // One in sidebar, one in email list
    expect(screen.getByText('Starred')).toBeInTheDocument();
    expect(screen.getByText('Sent')).toBeInTheDocument();
    
    // Check for email list panel
    expect(screen.getByText('Unified inbox from all connected accounts')).toBeInTheDocument();
    
    // Check for conversation view panel
    expect(screen.getAllByText('Q4 Planning Meeting')).toHaveLength(2); // One in email list, one in conversation view
    expect(screen.getByText('Convert to Task')).toBeInTheDocument();
  });

  it('displays coming soon overlay', () => {
    render(<MailView />);
    
    expect(screen.getByText('Email Management')).toBeInTheDocument();
    expect(screen.getByText('Unified inbox with collaborative features and task conversion coming soon.')).toBeInTheDocument();
  });

  it('shows feature status indicators', () => {
    render(<MailView />);
    
    expect(screen.getByText('Three-panel layout')).toBeInTheDocument();
    expect(screen.getByText('Unified inbox concept')).toBeInTheDocument();
    expect(screen.getByText('Multiple account support')).toBeInTheDocument();
    expect(screen.getByText('Internal comments')).toBeInTheDocument();
    expect(screen.getByText('Task conversion')).toBeInTheDocument();
  });

  it('displays mock email data', () => {
    render(<MailView />);
    
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Mike Chen')).toBeInTheDocument();
    expect(screen.getByText('HR Team')).toBeInTheDocument();
    expect(screen.getByText('Project Update - Dashboard Redesign')).toBeInTheDocument();
  });

  it('shows internal comments section', () => {
    render(<MailView />);
    
    expect(screen.getByText('Internal Comments')).toBeInTheDocument();
    expect(screen.getByText('Team only')).toBeInTheDocument();
    expect(screen.getByText('No internal comments yet. Add a comment to collaborate with your team on this email.')).toBeInTheDocument();
  });
});