import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// project imports
import { gridSpacing } from '@app/store/constant';
import MainCard from '@app/ui-component/cards/MainCard';
import SkeletonTotalGrowthBarChart from '@app/ui-component/cards/Skeleton/TotalGrowthBarChart';
import { DashboardService, WeeklyGamesType } from '@app/services/dashboard.service';

const TotalGrowthBarChart = ({ isLoading }) => {
    const theme = useTheme();
    const [data, setData] = useState<WeeklyGamesType[]>([]);

    useEffect(() => {
        DashboardService.getWeeklyGames()
            .then(setData)
            .catch(() => {});
    }, []);

    return (
        <>
            {isLoading ? (
                <SkeletonTotalGrowthBarChart />
            ) : (
                <MainCard>
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12}>
                            <Grid container alignItems="center" justifyContent="space-between">
                                <Grid item>
                                    <Grid container direction="column" spacing={1}>
                                        <Grid item>
                                            <Typography variant="h3">Reporte de juegos última semana</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <ResponsiveContainer width="100%" height={480}>
                                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="categoria" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Ganador" stackId="a" fill={theme.palette.success.dark} />
                                    <Bar dataKey="Empate" stackId="a" fill={theme.palette.grey[500]} />
                                    <Bar dataKey="Perdedor" stackId="a" fill={theme.palette.error.main} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Grid>
                    </Grid>
                </MainCard>
            )}
        </>
    );
};

TotalGrowthBarChart.propTypes = {
    isLoading: PropTypes.bool
};

export default TotalGrowthBarChart;
