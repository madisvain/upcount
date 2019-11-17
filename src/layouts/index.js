import { has } from 'lodash';

import BaseLayout from './base';
import ElectronLayout from './electron';

export default has(window, 'require') ? ElectronLayout : BaseLayout;
