import { IconCash, IconCoin, IconPalette, IconUserCircle, IconWindmill } from '@tabler/icons';

const icons = {
    IconPalette,
    IconWindmill,
    IconUserCircle,
    IconCoin,
    IconCash
};

const utilities = {
    id: 'utilities',
    title: '',
    type: 'group',
    children: [
        {
            id: 'profile',
            title: 'Mi perfil',
            type: 'item',
            url: '/profile/default',
            icon: icons.IconUserCircle,
            breadcrumbs: false
        },
        {
            id: 'recharge',
            title: 'Recargar',
            type: 'item',
            url: '/payments/recharge',
            icon: icons.IconCoin,
            breadcrumbs: false
        },
        {
            id: 'withdraw',
            title: 'Vender',
            type: 'item',
            url: '/payments/offer',
            icon: icons.IconCash,
            breadcrumbs: false
        },
        /*{
            id: 'util-color',
            title: 'Color',
            type: 'item',
            url: '/dashboard/utils/util-color',
            icon: icons.IconPalette,
            breadcrumbs: false
        },
        {
            id: 'icons',
            title: 'Icons',
            type: 'collapse',
            icon: icons.IconWindmill,
            children: [
                {
                    id: 'tabler-icons',
                    title: 'Tabler Icons',
                    type: 'item',
                    url: '/dashboard/icons/tabler-icons',
                    breadcrumbs: false
                }
            ]
        }*/
    ]
};

export default utilities;
