import * as React from 'react';
import { useWeb3React } from '@web3-react/core'

import {
    Grid
} from '@mui/material';
import useMediaQuery from "@mui/material/useMediaQuery";

import CommunityPerformance from './CommunityPerformance';
import YourActivity from './YourActivity';

export default function Dashboard() {
    const { account, activate } = useWeb3React();
    const isMobile = useMediaQuery("(max-width: 1650px)");

    return (
        <Grid sx={ isMobile ? { padding: '20px 20px', color: '#4ed047' } : { padding: '20px 30px', color: '#4ed047' }}>
            <CommunityPerformance />
            <YourActivity />
        </Grid>
    );
}
