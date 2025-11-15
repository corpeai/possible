import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Users, Coins } from 'lucide-react';
import axios from 'axios';

// Mock x402 token address - replace with actual token mint
const X402_TOKEN_MINT = 'x402TokenMintAddressHere';

interface PriceData {
  time: string;
  price: number;
  volume: number;
}

interface TokenStats {
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  totalSupply: number;
}

export default function X402Scan() {
  const { connection } = useConnection();
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [stats, setStats] = useState<TokenStats>({
    price: 0.0042,
    priceChange24h: 12.5,
    volume24h: 1250000,
    marketCap: 4200000,
    holders: 15420,
    totalSupply: 1000000000,
  });
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPriceData();
  }, [timeframe]);

  const loadPriceData = async () => {
    setLoading(true);
    try {
      // Generate mock data - replace with actual API call
      const mockData = generateMockPriceData(timeframe);
      setPriceData(mockData);
    } catch (error) {
      console.error('Failed to load price data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPriceData = (tf: string): PriceData[] => {
    const points = tf === '1H' ? 60 : tf === '24H' ? 24 : tf === '7D' ? 7 : 30;
    const basePrice = 0.0042;
    const data: PriceData[] = [];

    for (let i = 0; i < points; i++) {
      const variance = (Math.random() - 0.5) * 0.0005;
      const trend = (i / points) * 0.0003;
      data.push({
        time: tf === '1H' ? `${i}m` : tf === '24H' ? `${i}h` : `Day ${i + 1}`,
        price: basePrice + variance + trend,
        volume: Math.random() * 100000 + 50000,
      });
    }

    return data;
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(6)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    }
    return `$${(volume / 1000).toFixed(2)}K`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1000000) {
      return `$${(cap / 1000000).toFixed(2)}M`;
    }
    return `$${(cap / 1000).toFixed(2)}K`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">x402 Token Scanner</h1>
          <p className="text-slate-300 text-sm">Real-time analytics and market data</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400 text-xs">Price</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{formatPrice(stats.price)}</div>
                  <div className={`flex items-center gap-1 text-sm ${stats.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.priceChange24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(stats.priceChange24h).toFixed(2)}%
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400 text-xs">24h Volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{formatVolume(stats.volume24h)}</div>
                  <div className="text-sm text-slate-400">Trading volume</div>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400 text-xs">Market Cap</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{formatMarketCap(stats.marketCap)}</div>
                  <div className="text-sm text-slate-400">Total value</div>
                </div>
                <Coins className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400 text-xs">Holders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.holders.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">Unique wallets</div>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Chart */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Price Chart</CardTitle>
                <CardDescription className="text-slate-300">x402 Token Price History</CardDescription>
              </div>
              <div className="flex gap-2">
                {(['1H', '24H', '7D', '30D'] as const).map((tf) => (
                  <Badge
                    key={tf}
                    className={`cursor-pointer ${
                      timeframe === tf
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    onClick={() => setTimeframe(tf)}
                  >
                    {tf}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${value.toFixed(4)}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => [`$${value.toFixed(6)}`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Token Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Token Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Token Name</span>
                <span className="text-white font-semibold">x402 Token</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Symbol</span>
                <span className="text-white font-semibold">x402</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Supply</span>
                <span className="text-white font-semibold">{stats.totalSupply.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Network</span>
                <Badge className="bg-purple-500/20 text-purple-300">Solana Mainnet</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contract</span>
                <span className="text-white font-mono text-xs">
                  {X402_TOKEN_MINT.slice(0, 8)}...{X402_TOKEN_MINT.slice(-8)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Volume Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={priceData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value: any) => [formatVolume(value), 'Volume']}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
