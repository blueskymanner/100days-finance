import { useEffect, useState } from "react";
import { useWeb3React } from '@web3-react/core'
// import { useMoralis } from "react-moralis";

import { Dialog, DialogContent, Typography, Grid, ButtonBase } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';

import { getEllipsisTxt } from "utils/formatters";
import { injected, walletconnect } from '../../../utils/connector';
import { connectors } from "./config";

import WALLET_IMAGE from 'assets/images/astro/wallet.png';
import getRpcUrl from '../../../utils/getRpcUrl';

function Account() {
    const { activate, account, deactivate, error, status } = useWeb3React();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [IsConnected, setConnect] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("connectorId")) {
            activate(injected)
        }
    }, [])

    useEffect(() => {
        if (IsConnected && error) {
            console.log(error)
            if (error && error.name === "UnsupportedChainIdError") {
                const { ethereum } = window;
                (async () => {
                    try {
                        await ethereum.request({
                            method: "wallet_switchEthereumChain",
                            params: [{ chainId: "0xA86A" }],
                        });
                    } catch (switchError) {
                        if (switchError.code === 4902) {
                            try {
                                await ethereum.request({
                                    method: "wallet_addEthereumChain",
                                    params: [
                                        {
                                            chainId: "0xA86A",
                                            chainName: "Avalanche Mainnet C-Chain",
                                            nativeCurrency: {
                                                name: "AVAX",
                                                symbol: "AVAX",
                                                decimals: 18,
                                            },
                                            rpcUrls: [getRpcUrl()],
                                            blockExplorerUrls: ["https://snowtrace.io/"],
                                        },
                                    ],
                                });
                            } catch (addError) {
                                console.error(addError);
                            }
                        }
                    }
                    activate(injected);
                })();
            }
            setConnect(false)
        }
    }, [account, status, error]);

    const ConnectWallet = (connectorId) => {
        setConnect(true)

        if (connectorId === "walletconnect") {
            activate(walletconnect);

            window.localStorage.setItem("connectorId", connectorId);
        } else {
            activate(injected);
            window.localStorage.setItem("connectorId", connectorId);
        }
        onClose()
    }
    const onClose = () => {
        setIsModalVisible(false);
    }
    const onOpen = () => {
        setIsModalVisible(true);
    }

    return (
        <>
            {
                !account ?
                    <ButtonBase
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '44px',
                            padding: '10px 30px',
                            background: '#1e243e',
                            borderRadius: '8px',
                            alignItems: 'center'
                        }}
                        onClick={onOpen}
                    >
                        <Grid sx={{ display: 'flex' }}>
                            <img alt='wallet' width={24} src={WALLET_IMAGE} />
                            <Typography sx={{
                                marginLeft: '8px',
                                fontSize: '16px'
                            }}>Connect</Typography>
                        </Grid>
                    </ButtonBase>
                    :
                    <ButtonBase
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '62px',
                            padding: '10px 30px',
                            background: '#1e243e',
                            borderRadius: '8px',
                            alignItems: 'center'
                        }}
                        onClick={async () => {
                            deactivate();
                            localStorage.removeItem("connectorId");
                        }}
                    >
                        <Grid sx={{ display: 'flex' }}>
                            <img alt='wallet' width={24} src={WALLET_IMAGE} />
                            <Typography sx={{
                                marginLeft: '8px',
                                fontSize: '16px'
                            }}>{getEllipsisTxt(account, 5, 3)}</Typography>
                        </Grid>
                        <Typography>Disconnect</Typography>
                    </ButtonBase>
            }
            <Dialog open={isModalVisible} onClose={onClose} fullWidth={true} maxWidth={'sm'}>
                <DialogContent sx={{
                    background: '#273138',
                    padding: 0,
                    borderRadius: '12px'
                }}>
                    {connectors.map(({ title, icon, connectorId }, key) => (
                        <Grid key={key} sx={{
                            padding: '8px',
                            width: 1,
                            border: 'solid 1px #c3c3c324'
                        }}>
                            <ButtonBase
                                onClick={() => ConnectWallet(connectorId)
                                    // async () => {
                                    // try {
                                    //     await authenticate({ provider: connectorId });
                                    //     window.localStorage.setItem("connectorId", connectorId);
                                    //     setIsModalVisible(false);
                                    // } catch (e) {
                                    //     console.error(e);
                                    // }
                                    // }
                                }
                                // fullWidth={true}
                                sx={{
                                    paddingY: '20px',
                                    width: 1,
                                    borderRadius: '12px',
                                    flexDirection: 'column'
                                }}
                            >
                                <Grid sx={{ width: 1, textAlign: 'center' }}>
                                    <img src={icon} alt={title} width={'45px'} />
                                </Grid>
                                <Typography component={'div'} sx={{ fontSize: '24px', marginTop: '10px' }}>
                                    {title}
                                </Typography>
                                <Typography component={'div'} sx={{ fontSize: '18px', marginTop: '8px' }}>
                                    {title === 'Metamask' && 'Connect to your MetaMask Wallet'}
                                    {title === 'WalletConnect' && 'Scan with WalletConnect to connect'}
                                </Typography>
                            </ButtonBase>
                        </Grid>
                    ))}
                </DialogContent>
            </Dialog>
        </>
    )
}

export default Account;
