import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Zap, 
  Shield, 
  Coins, 
  ArrowLeftRight, 
  Image, 
  TrendingUp,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Wallet,
  Globe,
  Lock,
  Layers
} from 'lucide-react';

const FEATURES = [
  {
    icon: Bot,
    title: 'AI-Powered Agent',
    description: '60+ automated Solana blockchain operations with intelligent decision making',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: DollarSign,
    title: 'x402 Payment Protocol',
    description: 'Multi-facilitator payment flows with PayAI, Coinbase CDP, and x402.org',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Coins,
    title: 'Token Operations',
    description: 'Deploy, transfer, swap, and manage SPL tokens with ease',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: ArrowLeftRight,
    title: 'DeFi Trading',
    description: 'Swap, limit orders, DCA strategies via Jupiter and other DEXs',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: TrendingUp,
    title: 'Staking & Lending',
    description: 'Stake SOL, lend assets, and earn yield on your holdings',
    color: 'from-indigo-500 to-violet-500'
  },
  {
    icon: Image,
    title: 'NFT Management',
    description: 'Mint, create collections, and manage NFTs on Solana',
    color: 'from-rose-500 to-red-500'
  },
  {
    icon: Shield,
    title: 'Secure & Audited',
    description: 'Production-ready with comprehensive error handling and security',
    color: 'from-slate-500 to-gray-500'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on Solana for high-speed, low-cost transactions',
    color: 'from-amber-500 to-yellow-500'
  }
];

const CAPABILITIES = [
  'Token deployment and transfers',
  'Jupiter DEX swaps and limit orders',
  'Staking and liquid staking (Marinade, Jito)',
  'NFT minting and collection creation',
  'Lending and borrowing (Lulo, Marginfi)',
  'PumpFun token launches',
  'Solana Pay integration',
  'Multi-chain bridging',
  'AI agent interactions',
  'Blinks and Actions support'
];

export default function Index() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Sparkles className="h-3 w-3 mr-1" />
            Production Ready
          </Badge>
          <h2 className="text-5xl font-bold text-white mb-4">
            Your Intelligent Solana
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Blockchain Assistant
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Automate complex blockchain operations with AI-powered intelligence. 
            Trade, stake, manage NFTs, and process payments seamlessly on Solana.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            {connected ? (
              <Link to="/agent">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Bot className="h-5 w-5 mr-2" />
                  Launch Agent
                </Button>
              </Link>
            ) : (
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !h-12 !px-6 !text-base" />
            )}
            <Link to="/x402payments">
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                <DollarSign className="h-5 w-5 mr-2" />
                x402 Payments
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Powerful Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Capabilities Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-400" />
                60+ Agent Capabilities
              </CardTitle>
              <CardDescription>
                Comprehensive Solana blockchain operations at your fingertips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CAPABILITIES.map((capability) => (
                  <div key={capability} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{capability}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-400" />
                Multi-Network Support
              </CardTitle>
              <CardDescription>
                x402 payment protocol across multiple blockchains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Supported Networks</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-purple-500/20 text-purple-300">Solana</Badge>
                  <Badge className="bg-blue-500/20 text-blue-300">Base</Badge>
                  <Badge className="bg-slate-500/20 text-slate-300">Ethereum</Badge>
                  <Badge className="bg-violet-500/20 text-violet-300">Polygon</Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-300">Arbitrum</Badge>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Payment Facilitators</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-500/20 text-green-300">PayAI</Badge>
                  <Badge className="bg-blue-500/20 text-blue-300">Coinbase CDP</Badge>
                  <Badge className="bg-orange-500/20 text-orange-300">x402.org</Badge>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Security Features</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Lock className="h-4 w-4 text-yellow-500" />
                    <span>Secure wallet integration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Production-grade error handling</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Zap className="h-4 w-4 text-purple-500" />
                    <span>Real-time transaction monitoring</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-700/50">
          <CardContent className="py-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Connect your Solana wallet and start automating your blockchain operations with AI-powered intelligence.
            </p>
            {connected ? (
              <Link to="/agent">
                <Button size="lg" className="bg-white text-purple-900 hover:bg-slate-100">
                  <Bot className="h-5 w-5 mr-2" />
                  Open Agent Dashboard
                </Button>
              </Link>
            ) : (
              <WalletMultiButton className="!bg-white !text-purple-900 hover:!bg-slate-100 !h-12 !px-8 !text-base !font-semibold" />
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p className="mb-2">Built with Solana-Agent-Kit v2.0.10 • x402 Payment Protocol • Solana Pay</p>
          <p className="text-xs">Production-ready for mainnet deployment</p>
        </div>
      </div>
    </div>
  );
}
