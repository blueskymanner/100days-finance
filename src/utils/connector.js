import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

export const injected = new InjectedConnector({
    supportedChainIds: [43114],
})

export const walletconnect = new WalletConnectConnector({
    rpc: { 43114: "https://api.avax.network/ext/bc/C/rpc" },
    bridge: 'https://bridge.walletconnect.org',
    qrcode: true,
})