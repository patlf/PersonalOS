'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Inbox, 
  Star, 
  Send, 
  Archive, 
  Trash2, 
  Clock, 
  User,
  Paperclip,
  MessageSquare,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { cardStyles, badgeStyles, interactiveStyles, layoutStyles, animationStyles } from '@/lib/component-styles';

// Mock data for the placeholder
const mockMailboxes = [
  { id: 'inbox', name: 'Inbox', count: 12, icon: Inbox },
  { id: 'starred', name: 'Starred', count: 3, icon: Star },
  { id: 'sent', name: 'Sent', count: 0, icon: Send },
  { id: 'archived', name: 'Archived', count: 45, icon: Archive },
  { id: 'snoozed', name: 'Snoozed', count: 2, icon: Clock },
  { id: 'drafts', name: 'Drafts', count: 1, icon: Archive },
  { id: 'assigned', name: 'Assigned to Me', count: 5, icon: User },
  { id: 'trash', name: 'Trash', count: 8, icon: Trash2 },
];

const mockEmails = [
  {
    id: '1',
    subject: 'Q4 Planning Meeting',
    sender: 'Sarah Johnson',
    senderEmail: 'sarah@company.com',
    preview: 'Hi team, I wanted to schedule our Q4 planning meeting for next week...',
    timestamp: '2 hours ago',
    isRead: false,
    isStarred: true,
    hasAttachments: true,
    threadCount: 3,
  },
  {
    id: '2',
    subject: 'Project Update - Dashboard Redesign',
    sender: 'Mike Chen',
    senderEmail: 'mike@company.com',
    preview: 'The latest mockups are ready for review. Please take a look at...',
    timestamp: '4 hours ago',
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    threadCount: 1,
  },
  {
    id: '3',
    subject: 'Welcome to the team!',
    sender: 'HR Team',
    senderEmail: 'hr@company.com',
    preview: 'Welcome aboard! We are excited to have you join our team...',
    timestamp: '1 day ago',
    isRead: true,
    isStarred: false,
    hasAttachments: true,
    threadCount: 2,
  },
];

export function MailView() {
  return (
    <div className="flex h-full bg-background">
      {/* Left Panel - Mailboxes */}
      <div className="w-64 border-r border-border bg-muted/30">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">Mail</h2>
          <div className="space-y-1">
            {mockMailboxes.map((mailbox) => {
              const IconComponent = mailbox.icon;
              return (
                <div
                  key={mailbox.id}
                  className={cn(
                    interactiveStyles({ variant: 'ghost', size: 'sm' }),
                    "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {mailbox.name}
                    </span>
                  </div>
                  {mailbox.count > 0 && (
                    <span className={badgeStyles({ variant: 'secondary', size: 'sm' })}>
                      {mailbox.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Middle Panel - Email List */}
      <div className="w-96 border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Inbox</h3>
            <span className={badgeStyles({ variant: 'outline', size: 'sm' })}>
              {mockEmails.length} emails
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Unified inbox from all connected accounts
          </div>
        </div>
        
        <div className="divide-y divide-border">
          {mockEmails.map((email) => (
            <div
              key={email.id}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 ease-out hover:bg-muted/50",
                !email.isRead && "bg-muted/20"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {email.sender}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {email.senderEmail}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {email.isStarred && (
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  )}
                  {email.hasAttachments && (
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {email.timestamp}
                  </span>
                </div>
              </div>
              
              <div className="mb-2">
                <div className={`text-sm ${!email.isRead ? 'font-semibold' : 'font-medium'} text-foreground mb-1`}>
                  {email.subject}
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {email.preview}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {email.threadCount > 1 && (
                    <span className={cn(badgeStyles({ variant: 'outline', size: 'sm' }), "gap-1")}>
                      <MessageSquare className="h-3 w-3" />
                      {email.threadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Archive className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Star className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Conversation View */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Q4 Planning Meeting
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Convert to Task
              </Button>
              <Button variant="ghost" size="sm">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Archive className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>From: sarah@company.com</span>
            <span>To: team@company.com</span>
            <span>2 hours ago</span>
          </div>
        </div>

        <div className="flex-1 p-6">
          <Card className="p-6 mb-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground">
                Hi team,
              </p>
              <p className="text-foreground">
                I wanted to schedule our Q4 planning meeting for next week. We need to review our progress on the current initiatives and plan for the upcoming quarter.
              </p>
              <p className="text-foreground">
                Please let me know your availability for Tuesday or Wednesday afternoon.
              </p>
              <p className="text-foreground">
                Best regards,<br />
                Sarah
              </p>
            </div>
          </Card>

          {/* Internal Comments Section */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">
                Internal Comments
              </h4>
              <span className={badgeStyles({ variant: 'outline', size: 'sm' })}>
                Team only
              </span>
            </div>
            
            <Card className="p-4 bg-muted/30">
              <div className="text-sm text-muted-foreground text-center py-8">
                No internal comments yet. Add a comment to collaborate with your team on this email.
              </div>
            </Card>
          </div>
        </div>

        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Card className={cn(cardStyles({ variant: 'elevated', padding: 'xl' }), "text-center max-w-md")}>
            <div className="mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Inbox className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Email Management
              </h3>
              <p className="text-muted-foreground mb-6">
                Unified inbox with collaborative features and task conversion coming soon.
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Three-panel layout</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Unified inbox concept</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Multiple account support</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Internal comments</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Task conversion</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}