import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, Shield, Sparkles } from 'lucide-react';

export function AgentProfile() {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 bg-gradient-to-br from-purple-600 to-blue-600">
            <AvatarFallback>
              <Bot className="h-8 w-8 text-white" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-white text-xl mb-1">
              Solana AI Agent
            </CardTitle>
            <CardDescription className="text-slate-300">
              Powered by Solana-Agent-Kit
            </CardDescription>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-green-500/20 text-green-300 text-xs">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Online
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                v1.0
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Description</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your intelligent Solana blockchain assistant. I can help you manage your crypto assets, 
            execute DeFi operations, handle NFTs, and process payments using the x402 protocol. 
            Built with advanced AI capabilities to make blockchain interactions simple and secure.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Capabilities</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Lightning-fast transaction processing</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Secure wallet integration</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>AI-powered decision making</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Network</h4>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-orange-500 rounded-full" />
            <span className="text-sm text-slate-300">Solana Devnet</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
