import React from 'react';
import { render } from '@testing-library/react';
import Weather from './Weather';

test('renders learn react link', () => {
  const { getByText } = render(<Weather />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
