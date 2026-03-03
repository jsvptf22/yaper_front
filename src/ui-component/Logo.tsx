// material-ui

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from '@app/assets/images/logo-dark.svg';
 * import logo from '@app/assets/images/logo.svg';
 *
 */

import logo from '/logo.png';

const Logo = () => {
    return (
        <img src={logo} alt="YAPER" width="100" />
    );
};

export default Logo;
