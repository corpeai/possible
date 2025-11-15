import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Navbar } from '@/components/Navbar';
import { AgentProfile } from '@/components/AgentProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AGENT_ACTIONS, createSolanaAgent, executeAgentAction, AgentAction } from '@/utils/solanaAgentKit';
import { SolanaAgentKit } from 'solana-agent-kit';
import { 
  Loader2, 
  Send, 
  Coins, 
  ArrowLeftRight, 
  Layers, 
  Image, 
  Wallet,
  TrendingUp,
  Lock,
  Zap,
  DollarSign,
  Gift,
  Sparkles
} from 'lucide-react';

const FEATURE_CATEGORIES = [
  {
    title: 'Token Operations',
    icon: Coins,
    color: 'from-yellow-500 to-orange-500',
    actions: ['deploy_token', 'transfer', 'get_balance']
  },
  {
    title: 'Trading & Swaps',
    icon: ArrowLeftRight,
    color: 'from-blue-500 to-cyan-500',
    actions: ['swap', 'limit_order', 'dca']
  },
  {
    title: 'Staking & DeFi',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    actions: ['stake', 'lend', 'borrow']
  },
  {
    title: 'NFT Management',
    icon: Image,
    color: 'from-purple-500 to-pink-500',
    actions: ['mint_nft', 'create_collection', 'fetch_nft']
  },
  {
    title: 'Payments',
    icon: DollarSign,
    color: 'from-indigo-500 to-violet-500',
    actions: ['x402_payment', 'request_faucet']
  },
  {
    title: 'Advanced',
    icon: Sparkles,
    color: 'from-rose-500 to-red-500',
    actions: ['launch_pumpfun', 'create_gibwork', 'deploy_collection']
  }
];

export default function Agent() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [agent, setAgent] = useState<SolanaAgentKit | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Action parameters
  const [actionParams, setActionParams] = useState<Record<string, string>>({});

  const handleQuickAction = async (actionId: string) => {
    setLoading(actionId);
    try {
      // Initialize agent if not already done
      let agentInstance = agent;
      if (!agentInstance) {
        agentInstance = createSolanaAgent(connection);
        if (!agentInstance) {
          throw new Error('Agent initialization failed. Please configure VITE_AGENT_WALLET_PRIVATE_KEY.');
        }
        setAgent(agentInstance);
      }

      const action = AGENT_ACTIONS.find(a => a.id === actionId);
      if (!action) throw new Error('Action not found');

      const result = await executeAgentAction(agentInstance, actionId, actionParams);

      toast({
        title: `${action.name} Executed`,
        description: typeof result === 'object' && result.message 
          ? result.message 
          : `Success`,
      });
      
      // Clear params after successful execution
      setActionParams({});
    } catch (error: any) {
      toast({
        title: 'Action Failed',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const getActionIcon = (actionId: string) => {
    if (actionId.includes('token') || actionId.includes('transfer')) return Coins;
    if (actionId.includes('swap') || actionId.includes('trade')) return ArrowLeftRight;
    if (actionId.includes('stake') || actionId.includes('lend')) return TrendingUp;
    if (actionId.includes('nft') || actionId.includes('collection')) return Image;
    if (actionId.includes('payment') || actionId.includes('faucet')) return DollarSign;
    return Zap;
  };

  const renderActionButton = (actionId: string) => {
    const action = AGENT_ACTIONS.find(a => a.id === actionId);
    if (!action) return null;

    const Icon = getActionIcon(actionId);
    const isLoading = loading === actionId;

    return (
      <Button
        key={actionId}
        onClick={() => handleQuickAction(actionId)}
        disabled={isLoading || !wallet.connected}
        className="w-full justify-start gap-2 h-auto py-3 px-4 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600"
        variant="outline"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        <div className="flex-1 text-left">
          <div className="font-medium text-white">{action.name}</div>
          <div className="text-xs text-slate-400">{action.description}</div>
        </div>
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Agent Profile */}
          <div className="lg:col-span-1">
            <AgentProfile />
            
            {/* Connection Status */}
            <Card className="mt-6 bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Wallet Status</CardTitle>
              </CardHeader>
              <CardContent>
                {wallet.connected ? (
                  <div className="space-y-2">
                    <Badge className="bg-green-500/20 text-green-300">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                      Connected
                    </Badge>
                    <p className="text-xs text-slate-400 break-all">
                      {wallet.publicKey?.toBase58()}
                    </p>
                  </div>
                ) : (
                  <Badge className="bg-red-500/20 text-red-300">
                    Disconnected
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Agent Features */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Agent Features</h1>
              <p className="text-slate-300">
                Quick access to all Solana AI Agent capabilities
              </p>
            </div>

            {/* Feature Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.title;
                
                return (
                  <Card 
                    key={category.title}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-slate-700/70 border-purple-500' 
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
                    }`}
                    onClick={() => setSelectedCategory(isSelected ? null : category.title)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-white text-base">
                            {category.title}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {category.actions.length} actions available
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {isSelected && (
                      <CardContent className="space-y-2 pt-0">
                        {category.actions.map(actionId => renderActionButton(actionId))}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* All Actions List */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Available Actions</CardTitle>
                <CardDescription>
                  Complete list of {AGENT_ACTIONS.length} agent capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {AGENT_ACTIONS.map(action => {
                    const Icon = getActionIcon(action.id);
                    const isLoading = loading === action.id;
                    
                    return (
                      <Button
                        key={action.id}
                        onClick={() => handleQuickAction(action.id)}
                        disabled={isLoading || !wallet.connected}
                        className="justify-start gap-2 h-auto py-2 px-3 bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600/50"
                        variant="outline"
                        size="sm"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Icon className="h-3 w-3" />
                        )}
                        <span className="text-xs text-white">{action.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Action Parameters Input */}
            {selectedCategory && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Action Parameters</CardTitle>
                  <CardDescription className="text-xs">
                    Configure parameters for selected actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-slate-300 text-xs">Recipient Address</Label>
                    <Input
                      placeholder="Solana address..."
                      value={actionParams.recipient || ''}
                      onChange={(e) => setActionParams({ ...actionParams, recipient: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={actionParams.amount || ''}
                      onChange={(e) => setActionParams({ ...actionParams, amount: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs">Additional Data (JSON)</Label>
                    <Textarea
                      placeholder='{"key": "value"}'
                      value={actionParams.data || ''}
                      onChange={(e) => setActionParams({ ...actionParams, data: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
