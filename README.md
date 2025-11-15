# Solana AI Agent with x402 Payment Protocol

A production-ready Solana AI agent application with integrated x402 payment protocol support for multi-facilitator payment flows.

## Features

### 🤖 AI Agent
- Intelligent Solana blockchain interactions
- Natural language processing for crypto operations
- Automated transaction management
- Real-time balance tracking

### 💳 x402 Payment Protocol
- **Multi-Facilitator Support**: PayAI, Coinbase CDP, x402.org
- **Payment Lifecycle**: Request → Verify → Settle
- **Solana Pay Integration**: Generate and parse payment URLs
- **Multi-Network**: Solana (mainnet/devnet), Base, Ethereum, Polygon, Arbitrum
- **Production Ready**: Error handling, timeouts, retry logic

### 🔐 Wallet Integration
- Phantom, Solflare, and other Solana wallets
- Secure transaction signing
- Balance management

### 🎨 Modern UI
- React + TypeScript
- Tailwind CSS styling
- Responsive design
- Real-time status updates

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Solana wallet (Phantom, Solflare, etc.)

### Installation

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration
```

### Environment Configuration

Create a `.env` file with the following:

```env
# Solana Network
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_SOLANA_NETWORK=devnet

# Agent Configuration
VITE_AGENT_WALLET_PRIVATE_KEY=your_private_key_here
VITE_OPENAI_API_KEY=your_openai_key_here

# x402 Payment Protocol
VITE_X402_DEFAULT_FACILITATOR=payai
VITE_X402_PAYAI_URL=https://facilitator.payai.network
VITE_X402_COINBASE_CDP_URL=https://facilitator.cdp.coinbase.com
VITE_X402_DEFAULT_NETWORK=solana:devnet
VITE_X402_TIMEOUT_MS=30000

# Jupiter Swap (Optional)
VITE_JUPITER_API_URL=https://quote-api.jup.ag/v6

# Application
VITE_APP_NAME=Solana AI Agent
VITE_APP_DESCRIPTION=AI-powered Solana agent with x402 payment support
```

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## x402 Payment Protocol Usage

### Payment Flow

1. **Create Payment Requirements**
```typescript
const requirements = X402PaymentProtocol.createPaymentRequirements(
  recipientAddress,
  amount,
  'solana-devnet',
  '/payment',
  'Payment description'
);
```

2. **Create Payment Payload**
```typescript
const payload = await X402PaymentProtocol.createSolanaPaymentPayload(
  connection,
  payerPublicKey,
  requirements.accepts[0]
);
```

3. **Verify Payment**
```typescript
const verification = await X402PaymentProtocol.verifyPayment(
  facilitatorUrl,
  paymentHeader,
  requirements.accepts[0]
);
```

4. **Settle Payment**
```typescript
const settlement = await X402PaymentProtocol.settlePayment(
  facilitatorUrl,
  paymentHeader,
  requirements.accepts[0]
);
```

### Supported Facilitators

#### PayAI
- **URL**: `https://facilitator.payai.network`
- **Networks**: Solana, Base, Avalanche, Polygon
- **Features**: No API keys required, Solana-first

#### Coinbase CDP
- **URL**: `https://facilitator.cdp.coinbase.com`
- **Networks**: Base, Ethereum, Polygon
- **Features**: Production-ready, USDC support

#### x402.org
- **URL**: `https://facilitator.x402.org`
- **Networks**: Solana, Base, Ethereum, Polygon, Arbitrum
- **Features**: Community-run, multi-chain

### Solana Pay URLs

Generate payment request URLs:

```typescript
const url = X402PaymentProtocol.generatePaymentURL({
  recipient: walletAddress,
  amount: 1.5,
  label: 'Coffee Shop',
  message: 'Thanks for your purchase!',
  memo: 'Order #12345'
});
```

Parse payment URLs:

```typescript
const request = X402PaymentProtocol.parsePaymentURL(url);
```

## Project Structure

```
src/
├── components/
│   ├── AgentActions.tsx      # Quick agent actions
│   ├── AgentChat.tsx          # AI chat interface
│   ├── AgentProfile.tsx       # Agent profile display
│   ├── Navigation.tsx         # App navigation
│   ├── X402Payment.tsx        # x402 payment UI component
│   └── ui/                    # Reusable UI components
├── pages/
│   ├── Index.tsx              # Main agent page
│   ├── X402Payments.tsx       # Dedicated payments page
│   └── X402Scan.tsx           # QR code scanner
├── utils/
│   ├── x402Payment.ts         # x402 protocol implementation
│   ├── solanaAgent.ts         # Solana agent utilities
│   ├── jupiterSwap.ts         # Jupiter swap integration
│   └── stakingService.ts      # Staking utilities
├── contexts/
│   └── WalletProvider.tsx     # Wallet context provider
└── hooks/
    └── use-toast.ts           # Toast notifications

```

## API Reference

### X402PaymentProtocol

#### Static Methods

- `createPaymentRequirements(payTo, amount, network, resource, description)` - Create payment requirements
- `createSolanaPaymentPayload(connection, payer, requirements)` - Create Solana payment payload
- `verifyPayment(facilitatorUrl, paymentHeader, requirements)` - Verify payment with facilitator
- `settlePayment(facilitatorUrl, paymentHeader, requirements)` - Settle payment with facilitator
- `getSupportedMethods(facilitatorUrl)` - Get supported payment methods
- `generatePaymentURL(request)` - Generate Solana Pay URL
- `parsePaymentURL(url)` - Parse Solana Pay URL
- `encodePaymentHeader(payload)` - Encode payment payload to header
- `decodePaymentHeader(header)` - Decode payment header
- `isValidAddress(address)` - Validate Solana address
- `getSupportedFacilitators(network)` - Get facilitators for network

### SolanaAgentKit

- `sendSOL(to, amount)` - Send SOL to address
- `getBalance()` - Get wallet balance
- `requestAirdrop(amount)` - Request devnet airdrop

## Production Deployment

### Build Optimization

```bash
# Production build with optimizations
pnpm build

# Analyze bundle size
pnpm build --analyze
```

### Environment Variables

Ensure all production environment variables are set:
- Use mainnet RPC URLs for production
- Secure API keys properly
- Configure production facilitator URLs
- Set appropriate timeout values

### Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **API Keys**: Use environment variables for all API keys
3. **RPC Endpoints**: Use reliable, production-grade RPC providers
4. **Wallet Security**: Implement proper wallet connection security
5. **Transaction Validation**: Always validate transactions before signing
6. **Error Handling**: Implement comprehensive error handling
7. **Rate Limiting**: Respect facilitator rate limits

### Performance

- Lazy load components for faster initial load
- Optimize bundle size with tree shaking
- Use connection pooling for RPC calls
- Implement caching for frequently accessed data
- Monitor and optimize re-renders

## Troubleshooting

### Common Issues

**Wallet Connection Fails**
- Ensure wallet extension is installed and unlocked
- Check network configuration matches wallet network
- Clear browser cache and reload

**Payment Verification Fails**
- Verify facilitator URL is correct and accessible
- Check network connectivity
- Ensure payment requirements are valid
- Review facilitator-specific requirements

**Transaction Fails**
- Ensure sufficient SOL balance for transaction + fees
- Verify recipient address is valid
- Check network congestion and retry
- Review transaction logs for specific errors

**RPC Errors**
- Switch to alternative RPC endpoint
- Check rate limits
- Verify network status

### Debug Mode

Enable debug logging:

```typescript
// In browser console
localStorage.setItem('debug', 'x402:*');
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/solana-ai-agent/issues)
- Documentation: [Read the docs](https://docs.x402.org)
- Community: [Join Discord](https://discord.gg/x402)

## Acknowledgments

- [x402 Protocol](https://x402.org) - Payment protocol specification
- [Solana](https://solana.com) - Blockchain platform
- [Solana Pay](https://solanapay.com) - Payment standard
- [PayAI](https://payai.network) - Payment facilitator
- [Coinbase CDP](https://coinbase.com/cdp) - Payment facilitator

---

Built with ❤️ for the Solana ecosystem
