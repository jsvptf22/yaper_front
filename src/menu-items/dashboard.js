// assets
import { IconDashboard, IconGoGame } from '@tabler/icons';

// constant
const icons = { IconDashboard, IconGoGame };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
    id: 'dashboard',
    title: 'Inicio',
    type: 'group',
    children: [

        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/dashboard/data',
            icon: icons.IconDashboard,
            breadcrumbs: false
        },
        {
            id: 'default',
            title: 'Juegos',
            type: 'item',
            url: '/dashboard/default',
            icon: icons.IconGoGame,
            breadcrumbs: false
        },
    ]
};

export default dashboard;
