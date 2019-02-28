/// <reference types="mocha" />

import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as Adapter from 'enzyme-adapter-react-15';
import * as Sinon from 'sinon';
import { assert, expect } from 'chai';
import { configure, mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import AlbertsonLandingPage, { LandingPageState } from '../components/AlbertsonLandingPage';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import styles from '../components/AlbertsonVendorWarning.module.scss';
import { initializeIcons } from '@uifabric/icons';
import AlbertsonContactInfo from '../components/AlbertsonContactInfo';
initializeIcons();

configure({ adapter: new Adapter() });

const SecurityGroup = () => (
  <Icon iconName="SecurityGroup" className={styles.vendorportalLinkIcon} />
);

describe('<AlbertsonLandingPage />', () => {
  let component: ShallowWrapper<{}, LandingPageState>;
  const context = {};

  beforeEach(() => {
    component = shallow(<AlbertsonLandingPage context={context} />);
  });

  afterEach(() => {
    component.unmount();
  });
  it('should have correct initial state', () => {
    const { showMainModal, showAlertDialog, showConfirmDialog } = component.state();
    expect(showMainModal).to.not.be.true;
    expect(showAlertDialog).to.not.be.true;
    expect(showConfirmDialog).to.not.be.true;
  });
  it('should render correctly', () => {
    const props = {
      context: { pageContext: { site: { absoluteUrl: '' } } },
      toggleMainModal: () => { },
      _showAlertDialog: () => { },
      _showConfirmDialog: () => { }
    };
    expect(component.contains(<AlbertsonContactInfo {...props} />)).to.be.false;
  });
  it('should toggle main modal correctly', () => {
    const btn = component.find('.toggleMainModal');
    btn.simulate('click');
    component.update();
    setTimeout(() => {
      const { showMainModal } = component.state();
      expect(showMainModal).to.be.true;
      const props = {
        context: { pageContext: { site: { absoluteUrl: '' } } },
        toggleMainModal: () => { },
        _showAlertDialog: () => { },
        _showConfirmDialog: () => { }
      };
      expect(component.contains(<AlbertsonContactInfo {...props} />)).to.be.true;
    });
  });
});