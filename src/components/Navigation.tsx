import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, BarChart3, Coins, Bot } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex gap-2">
      <Link to="/">
        <Button
          variant={isActive('/') ? 'default' : 'outline'}
          size="sm"
          className={
            isActive('/')
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-white'
          }
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
      </Link>
      <Link to="/agent">
        <Button
          variant={isActive('/agent') ? 'default' : 'outline'}
          size="sm"
          className={
            isActive('/agent')
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-white'
          }
        >
          <Bot className="h-4 w-4 mr-2" />
          Agent
        </Button>
      </Link>
      <Link to="/x402payments">
        <Button
          variant={isActive('/x402payments') ? 'default' : 'outline'}
          size="sm"
          className={
            isActive('/x402payments')
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-white'
          }
        >
          <Coins className="h-4 w-4 mr-2" />
          x402 Payments
        </Button>
      </Link>
      <Link to="/x402scan">
        <Button
          variant={isActive('/x402scan') ? 'default' : 'outline'}
          size="sm"
          className={
            isActive('/x402scan')
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-white'
          }
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          x402Scan
        </Button>
      </Link>
    </div>
  );
}
