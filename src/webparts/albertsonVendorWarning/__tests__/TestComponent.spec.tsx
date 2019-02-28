/// <reference types="mocha" />

import * as React from 'react';
import * as Adapter from 'enzyme-adapter-react-15';
import * as Sinon from 'sinon';
import { assert, expect } from 'chai';
import { configure, mount, ReactWrapper, shallow } from 'enzyme';
import TestComponent, { IState } from '../components/TestComponent';

configure({ adapter: new Adapter() });

describe('<TestComponent />', () => {
  const descTxt = "TestingThisOneOut";
  let componentDidMountSpy: Sinon.SinonSpy;
  let component: ReactWrapper<{}, IState>;

  beforeEach(() => {
    componentDidMountSpy = Sinon.spy(TestComponent.prototype, 'componentDidMount');
    component = mount(<TestComponent />);

  });

  afterEach(() => {
    component.unmount();
    componentDidMountSpy.restore();
  });
  it('should have correct initial state', () => {
    const comp = shallow(<TestComponent />, { disableLifecycleMethods: true });
    const text = comp.state().text;
    expect(text).to.equal('this is a test component');
  });
  it('should change text in component did mount', () => {
    expect(component.update().state().text).to.be.equal('this is the changed text');
  });
  it('should have correct elements', () => {
    const text = component.state().text;
    expect(component.find('.container').length).to.equal(1);
    expect(component.find('.container').find('.label').text()).to.equal(text);
    expect(component.find('button.btn').text()).to.equal('Click');
  });
  it('should call component did mount', () => {
    expect(componentDidMountSpy.calledOnce).to.be.true;
  });
  it('should call handleClick', () => {
    const handleClickSpy = Sinon.spy(TestComponent.prototype, 'handleClick');
    const btn = component.find('button.btn');
    btn.simulate('click');
    const text = component.state().text;
    expect(text).to.equal('button has clicked');
    console.log(handleClickSpy.calledOnce);
  });
});