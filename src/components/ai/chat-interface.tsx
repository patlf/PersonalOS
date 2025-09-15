'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, Calendar, Mail, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cardStyles, badgeStyles, layoutStyles, animationStyles, typographyStyles } from '@/lib/component-styles';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Help me plan my day',
    role: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: '2',
    content: 'I\'d be happy to help you plan your day! I can analyze your calendar, review your task list, and suggest an optimal schedule. Would you like me to start by checking your upcoming meetings and deadlines?',
    role: 'assistant',
    timestamp: new Date(Date.now() - 1000 * 60 * 29)
  }
];

const quickActions = [
  { icon: CheckSquare, label: 'Plan my day', command: '/plan' },
  { icon: Mail, label: 'Summarize inbox', command: '/summarize-emails' },
  { icon: Calendar, label: 'Schedule review', command: '/schedule-review' },
];

export function ChatInterface() {
  const [message, setMessage] = useState('');
  const [isComingSoon] = useState(true);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // This would normally send the message
    console.log('Message would be sent:', message);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">AI Assistant</h1>
        <span className={badgeStyles({ variant: 'info', size: 'sm' })}>
          Coming Soon
        </span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {mockMessages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-muted rounded-lg px-4 py-3 max-w-[70%]">
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              )}
            </div>
          ))}
          
          {/* Coming Soon Message */}
          <div className="flex justify-center py-8">
            <Card className={cn(
              cardStyles({ variant: 'elevated', padding: 'lg' }),
              "text-center max-w-md bg-gradient-to-br from-primary/5 to-secondary/5"
            )}>
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className={cn(typographyStyles.h4, "mb-2")}>AI Assistant Coming Soon</h3>
              <p className={cn(typographyStyles.muted, "mb-4")}>
                We're building an intelligent assistant that will help you manage tasks, 
                schedule events, summarize emails, and optimize your productivity workflow.
              </p>
              <div className={cn("space-y-2", typographyStyles.caption)}>
                <p>• Natural language task creation</p>
                <p>• Smart scheduling suggestions</p>
                <p>• Email summarization</p>
                <p>• Workflow automation</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isComingSoon 
                    ? "Message AI Assistant (Coming Soon)" 
                    : "Message AI Assistant..."
                }
                disabled={isComingSoon}
                className="pr-12"
              />
              {message.startsWith('/') && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className={badgeStyles({ variant: 'secondary', size: 'sm' })}>
                    Command
                  </span>
                </div>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={isComingSoon || !message.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}