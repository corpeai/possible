import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AGENT_ACTIONS, createSolanaAgent, executeAgentAction, AgentAction } from '@/utils/solanaAgentKit';
import { X402PaymentProtocol, FACILITATORS } from '@/utils/x402Payment';
import { SolanaAgentKit } from 'solana-agent-kit';
import { Loader2, Send } from 'lucide-react';
import { PublicKey } from '@solana/web3.js';

export function AgentActions() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [agent, setAgent] = useState<SolanaAgentKit | null>(null);
  
  // x402 Payment state
  const [paymentRecipient, setPaymentRecipient] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleAction = async (action: AgentAction) => {
    setLoading(action.id);
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

      const result = await executeAgentAction(agentInstance, action.id);

      toast({
        title: `${action.name} Executed`,
        description: typeof result === 'object' && result.message 
          ? result.message 
          : `Result: ${JSON.stringify(result)}`,
      });
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

  const handleX402Payment = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to send payments',
        variant: 'destructive',
      });
      return;
    }

    if (!paymentRecipient || !paymentAmount) {
      toast({
        title: 'Missing Information',
        description: 'Please enter recipient address and amount',
        variant: 'destructive',
      });
      return;
    }

    setPaymentLoading(true);
    try {
      const facilitator = FACILITATORS.payai;
      
      // Create payment requirements
      const requirements = X402PaymentProtocol.createPaymentRequirements(
        paymentRecipient,
        parseFloat(paymentAmount),
        'solana-devnet',
        '/payment',
        'Agent Service Payment'
      );

      // Execute transfer using wallet
      const { Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
      
      if (!wallet.signTransaction) {
        throw new Error('Wallet does not support transaction signing');
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(paymentRecipient),
          lamports: parseFloat(paymentAmount) * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      // Create payment header
      const paymentPayload = await X402PaymentProtocol.createSolanaPaymentPayload(
        connection,
        wallet.publicKey,
        requirements.accepts[0]
      );
      const paymentHeader = X402PaymentProtocol.encodePaymentHeader(paymentPayload);

      // Verify payment
      const verification = await X402PaymentProtocol.verifyPayment(
        facilitator.url,
        paymentHeader,
        requirements.accepts[0]
      );

      if (verification.isValid) {
        // Settle payment
        const settlement = await X402PaymentProtocol.settlePayment(
          facilitator.url,
          paymentHeader,
          requirements.accepts[0]
        );

        if (settlement.success) {
          toast({
            title: 'Payment Successful',
            description: `Sent ${paymentAmount} SOL via x402 protocol`,
          });

          setPaymentRecipient('');
          setPaymentAmount('');
        } else {
          throw new Error(settlement.error || 'Settlement failed');
        }
      } else {
        throw new Error(verification.invalidReason || 'Payment verification failed');
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'defi':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'nft':
        return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
      case 'token':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'utility':
        return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  const groupedActions = AGENT_ACTIONS.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, AgentAction[]>);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Quick Actions</CardTitle>
        <CardDescription className="text-slate-300">
          Execute common operations with one click
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* x402 Quick Payment */}
        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Send className="h-4 w-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">x402 Quick Payment</h4>
          </div>
          <div className="space-y-2">
            <div>
              <Label htmlFor="quick-recipient" className="text-xs text-slate-300">Recipient Address</Label>
              <Input
                id="quick-recipient"
                placeholder="Solana address"
                value={paymentRecipient}
                onChange={(e) => setPaymentRecipient(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white text-sm h-8"
              />
            </div>
            <div>
              <Label htmlFor="quick-amount" className="text-xs text-slate-300">Amount (SOL)</Label>
              <Input
                id="quick-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white text-sm h-8"
              />
            </div>
            <Button
              onClick={handleX402Payment}
              disabled={paymentLoading || !paymentRecipient || !paymentAmount}
              className="w-full bg-purple-600 hover:bg-purple-700 h-8 text-sm"
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 mr-2" />
                  Send Payment
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {AGENT_ACTIONS.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className="h-auto flex-col items-center p-3 gap-2 bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-slate-500 text-white"
              onClick={() => handleAction(action)}
              disabled={loading === action.id}
            >
              <span className="text-xl">{action.icon}</span>
              <div className="text-center w-full">
                <div className="text-xs font-medium flex items-center justify-center gap-1">
                  {action.name}
                  {loading === action.id && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
