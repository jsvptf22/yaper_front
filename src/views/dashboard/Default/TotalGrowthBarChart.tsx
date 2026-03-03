import PropTypes from 'prop-types';

// material-ui
import { Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// third-party
import Chart from 'react-apexcharts';

// project imports
import { gridSpacing } from '@app/store/constant';
import MainCard from '@app/ui-component/cards/MainCard';
import SkeletonTotalGrowthBarChart from '@app/ui-component/cards/Skeleton/TotalGrowthBarChart';

// chart data
import chartData from './chart-data/total-growth-bar-chart';


const TotalGrowthBarChart = ({ isLoading }) => {
    const theme = useTheme();

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
                            <Chart {...chartData} />
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
