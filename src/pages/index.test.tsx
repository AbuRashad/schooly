import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './index';

describe('HomePage', () => {
  it('renders the main startup content', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /مدرستك أكثر/i })).toBeInTheDocument();
    expect(screen.getByText('ابدأ الآن')).toBeInTheDocument();
  });
});
