import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { X402PaymentProtocol, FACILITATORS, type FacilitatorInfo } from '@/utils/x402Payment';
import { createSolanaAgent } from '@/utils/solanaAgentKit';
import { SolanaAgentKit } from 'solana-agent-kit';
import { Loader2, Copy, QrCode, CheckCircle2, XCircle, Network } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export function X402Payment() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Send state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedFacilitator, setSelectedFacilitator] = useState<string>('payai');
  const [network, setNetwork] = useState<string>('solana-devnet');

  // Receive state
  const [receiveAmount, setReceiveAmount] = useState('');
  const [receiveLabel, setReceiveLabel] = useState('');
  const [receiveMessage, setReceiveMessage] = useState('');
  const [paymentURL, setPaymentURL] = useState('');

  // x402 Protocol state
  const [paymentRequirements, setPaymentRequirements] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [settlementStatus, setSettlementStatus] = useState<'idle' | 'settling' | 'settled' | 'failed'>('idle');
  const [txHash, setTxHash] = useState<string>('');

  // Facilitator info
  const [supportedMethods, setSupportedMethods] = useState<Array<{scheme: string; network: string}>>([]);
  const currentFacilitator = FACILITATORS[selectedFacilitator];

  useEffect(() => {
    loadSupportedMethods();
  }, [selectedFacilitator]);

  const loadSupportedMethods = async () => {
    if (!currentFacilitator) return;
    try {
      const methods = await X402PaymentProtocol.getSupportedMethods(currentFacilitator.url);
      setSupportedMethods(methods);
    } catch (error) {
      console.error('Failed to get supported methods:', error);
      // Fallback to default supported methods based on facilitator
      const defaultMethods = currentFacilitator.networks.map(net => ({
        scheme: net.includes('solana') ? 'solana' : 'evm',
        network: net
      }));
      setSupportedMethods(defaultMethods);
    }
  };

  const handleX402Send = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to send payments',
        variant: 'destructive',
      });
      return;
    }

    if (!X402PaymentProtocol.isValidAddress(recipient)) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Solana address',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setVerificationStatus('idle');
    setSettlementStatus('idle');

    try {
      // Validate facilitator is available
      if (!currentFacilitator) {
        throw new Error('No facilitator selected');
      }

      // Step 1: Create payment requirements
      const requirements = X402PaymentProtocol.createPaymentRequirements(
        recipient,
        parseFloat(amount),
        network,
        '/payment',
        memo || 'x402 Payment'
      );
      setPaymentRequirements(requirements);

      // Step 2: Create payment payload
      const payload = await X402PaymentProtocol.createSolanaPaymentPayload(
        connection,
        wallet.publicKey,
        requirements.accepts[0]
      );

      const paymentHeader = X402PaymentProtocol.encodePaymentHeader(payload);

      // Step 3: Verify payment with facilitator
      setVerificationStatus('verifying');
      const verification = await X402PaymentProtocol.verifyPayment(
        currentFacilitator.url,
        paymentHeader,
        requirements.accepts[0]
      );

      if (!verification.isValid) {
        setVerificationStatus('failed');
        toast({
          title: 'Verification Failed',
          description: verification.invalidReason || 'Payment verification failed',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setVerificationStatus('verified');

      // Step 4: Settle payment with facilitator
      setSettlementStatus('settling');
      const settlement = await X402PaymentProtocol.settlePayment(
        currentFacilitator.url,
        paymentHeader,
        requirements.accepts[0]
      );

      if (!settlement.success) {
        setSettlementStatus('failed');
        toast({
          title: 'Settlement Failed',
          description: settlement.error || 'Payment settlement failed',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setSettlementStatus('settled');
      setTxHash(settlement.txHash || '');

      toast({
        title: 'Payment Successful',
        description: `Transaction: ${settlement.txHash?.slice(0, 8)}...${settlement.txHash?.slice(-8)}`,
      });

      // Reset form
      setRecipient('');
      setAmount('');
      setMemo('');
    } catch (error: any) {
      console.error('x402 payment error:', error);
      setVerificationStatus('failed');
      setSettlementStatus('failed');
      toast({
        title: 'Payment Failed',
        description: error.message || 'An error occurred during payment processing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSend = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to send payments',
        variant: 'destructive',
      });
      return;
    }

    if (!X402PaymentProtocol.isValidAddress(recipient)) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Solana address',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Use wallet adapter to send SOL directly
      const { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } = await import('@solana/web3.js');
      
      if (!wallet.signTransaction) {
        throw new Error('Wallet does not support transaction signing');
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey!,
          toPubkey: new PublicKey(recipient),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey!;

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      toast({
        title: 'Payment Sent',
        description: `Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}`,
      });

      setRecipient('');
      setAmount('');
      setMemo('');
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePaymentURL = () => {
    if (!wallet.publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to generate payment requests',
        variant: 'destructive',
      });
      return;
    }

    const url = X402PaymentProtocol.generatePaymentURL({
      recipient: wallet.publicKey.toString(),
      amount: parseFloat(receiveAmount) || 0,
      label: receiveLabel || undefined,
      message: receiveMessage || undefined,
    });

    setPaymentURL(url);
    toast({
      title: 'Payment URL Generated',
      description: 'Share this URL to receive payments',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'settled':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'verifying':
      case 'settling':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>x402 Payment Protocol</CardTitle>
        <CardDescription>
          Production-ready payments with multiple facilitators on Solana
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send">Send Payment</TabsTrigger>
            <TabsTrigger value="receive">Receive Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-4">
            {/* Facilitator Selection */}
            <div className="space-y-2">
              <Label>Payment Facilitator</Label>
              <Select value={selectedFacilitator} onValueChange={setSelectedFacilitator}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FACILITATORS).map(([key, facilitator]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4" />
                        <span>{facilitator.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentFacilitator && (
                <p className="text-xs text-muted-foreground">
                  {currentFacilitator.description}
                </p>
              )}
            </div>

            {/* Network Selection */}
            <div className="space-y-2">
              <Label>Network</Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentFacilitator?.networks.map((net) => (
                    <SelectItem key={net} value={net}>
                      {net}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Supported Methods */}
            {supportedMethods.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Supported Payment Methods</Label>
                <div className="flex flex-wrap gap-1">
                  {supportedMethods.slice(0, 5).map((method, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {method.scheme} on {method.network}
                    </Badge>
                  ))}
                  {supportedMethods.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{supportedMethods.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="Enter Solana address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (SOL)</Label>
              <Input
                id="amount"
                type="number"
                step="0.001"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memo">Memo (Optional)</Label>
              <Input
                id="memo"
                placeholder="Payment note"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            {/* Payment Status */}
            {(verificationStatus !== 'idle' || settlementStatus !== 'idle') && (
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Verification</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(verificationStatus)}
                    <span className="text-xs capitalize">{verificationStatus}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Settlement</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(settlementStatus)}
                    <span className="text-xs capitalize">{settlementStatus}</span>
                  </div>
                </div>
                {txHash && (
                  <div className="pt-2 border-t">
                    <Label className="text-xs">Transaction Hash</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-background px-2 py-1 rounded flex-1 truncate">
                        {txHash}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(txHash)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleX402Send}
                disabled={loading || !wallet.connected}
                variant="default"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                x402 Payment
              </Button>
              <Button
                onClick={handleDirectSend}
                disabled={loading || !wallet.connected}
                variant="outline"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Direct Send
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="receive" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiveAmount">Amount (SOL)</Label>
              <Input
                id="receiveAmount"
                type="number"
                step="0.001"
                placeholder="0.00"
                value={receiveAmount}
                onChange={(e) => setReceiveAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiveLabel">Label (Optional)</Label>
              <Input
                id="receiveLabel"
                placeholder="e.g., Store Name"
                value={receiveLabel}
                onChange={(e) => setReceiveLabel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiveMessage">Message (Optional)</Label>
              <Input
                id="receiveMessage"
                placeholder="e.g., Order #123"
                value={receiveMessage}
                onChange={(e) => setReceiveMessage(e.target.value)}
              />
            </div>

            <Button
              onClick={handleGeneratePaymentURL}
              disabled={!wallet.connected}
              className="w-full"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Generate Payment Request
            </Button>

            {paymentURL && (
              <div className="space-y-2">
                <Label>Payment URL (Solana Pay)</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={paymentURL}
                    readOnly
                    className="font-mono text-xs"
                    rows={3}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(paymentURL)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this URL or QR code to receive payments via Solana Pay compatible wallets
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
