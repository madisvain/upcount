import Index from '..';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import renderer from 'react-test-renderer';

let wrapper;

const mockStore = configureStore([]);
const store = mockStore({
  organizations: {
    items: [],
  },
});

describe('Page: index', () => {
  beforeEach(() => {
    wrapper = renderer.create(
      <Provider store={store}>
        <Index />
      </Provider>
    );
  });

  it('Render correctly', () => {
    expect(wrapper.root.children.length).toBe(1);
  });
});
