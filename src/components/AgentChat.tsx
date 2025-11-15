import { useState, useRef, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { createSolanaAgent, executeAgentAction } from '@/utils/solanaAgentKit';
import { SolanaAgentKit } from 'solana-agent-kit';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export function AgentChat() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      content: 'Hello! I\'m your Solana AI Agent. I can help you check balances, swap tokens, stake SOL, and manage NFTs. What would you like to do today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const processUserMessage = async (message: string): Promise<string> => {
    const lowerMessage = message.toLowerCase();

    if (!wallet.connected) {
      return 'Please connect your wallet first to use agent features.';
    }

    try {
      const agent = createSolanaAgent(connection);
      if (!agent) {
        return 'Agent not configured. Please set VITE_AGENT_WALLET_PRIVATE_KEY in environment.';
      }

      if (lowerMessage.includes('balance') || lowerMessage.includes('how much')) {
        const result = await executeAgentAction(agent, 'check-balance');
        return result.message || `Your current balance is ${result.sol} SOL`;
      }

      if (lowerMessage.includes('swap') || lowerMessage.includes('trade')) {
        return 'Token swap feature is coming soon! I\'ll be able to help you swap tokens on Solana DEXs.';
      }

      if (lowerMessage.includes('stake')) {
        return 'Staking feature is coming soon! I\'ll help you stake SOL to validators for rewards.';
      }

      if (lowerMessage.includes('nft') && lowerMessage.includes('mint')) {
        return 'NFT minting feature is coming soon! I\'ll help you create and mint NFTs.';
      }

      if (lowerMessage.includes('nft') && lowerMessage.includes('transfer')) {
        return 'NFT transfer feature is coming soon! I\'ll help you send NFTs to other wallets.';
      }

      if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
        return 'I can help you with:\n• Check your SOL balance\n• Swap tokens (coming soon)\n• Stake SOL (coming soon)\n• Mint NFTs (coming soon)\n• Transfer NFTs (coming soon)\n\nJust ask me what you\'d like to do!';
      }

      return 'I\'m not sure how to help with that yet. Try asking about your balance, swapping tokens, staking, or NFTs. You can also use the quick action buttons below!';
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await processUserMessage(input);
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col bg-slate-800/50 border-slate-700">
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'agent' && (
                  <Avatar className="h-8 w-8 bg-purple-600">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 bg-blue-600">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 bg-purple-600">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-slate-700 text-slate-100 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-slate-700 p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about Solana..."
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
