import { shallow } from 'enzyme'
import AlbertsonLandingPage from '../AlbertsonLandingPage.tsx';

describe('AlbertsonLandingPage Component', () => {

  it('has a wrapper div', () => {
    const component = shallow(<AlbertsonLandingPage context={{}} />);
    var node = component.find('div');
    expect(node.length).toEqual(1);

  });
});