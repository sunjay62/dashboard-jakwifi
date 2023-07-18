// assets
import { IconTypography, IconPalette, IconShadow, IconWindmill } from '@tabler/icons';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';

// constant
const icons = {
  IconTypography,
  IconPalette,
  IconShadow,
  IconWindmill,
  SettingsOutlinedIcon,
  LanguageOutlinedIcon,
  ManageAccountsOutlinedIcon
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'util-typography',
      title: 'JakWifi',
      type: 'collapse',
      icon: icons.LanguageOutlinedIcon,
      children: [
        {
          id: 'util-site',
          title: 'Analysis',
          type: 'item',
          url: '/jakwifi/analysis',
          breadcrumbs: true
        },
        {
          id: 'util-add-site',
          title: 'Sites',
          type: 'item',
          url: '/jakwifi/sites',
          breadcrumbs: true
        }
      ]
    },
    {
      id: 'icons',
      title: 'Account',
      type: 'item',
      icon: icons.ManageAccountsOutlinedIcon,
      url: '/account/administrator',
      breadcrumbs: true
    },
    {
      id: 'util-color',
      title: 'Setting',
      type: 'item',
      url: '/utils/util-color',
      icon: icons.SettingsOutlinedIcon,
      breadcrumbs: false
    }
    // {
    //   id: 'util-shadow',
    //   title: 'Shadow',
    //   type: 'item',
    //   url: '/utils/util-shadow',
    //   icon: icons.IconShadow,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'icons',
    //   title: 'Icons',
    //   type: 'collapse',
    //   icon: icons.IconWindmill,
    //   children: [
    //     {
    //       id: 'tabler-icons',
    //       title: 'Tabler Icons',
    //       type: 'item',
    //       url: '/icons/tabler-icons',
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'material-icons',
    //       title: 'Material Icons',
    //       type: 'item',
    //       external: true,
    //       target: '_blank',
    //       url: 'https://mui.com/material-ui/material-icons/',
    //       breadcrumbs: false
    //     }
    //   ]
    // }
  ]
};

export default utilities;
