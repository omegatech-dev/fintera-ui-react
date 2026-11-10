import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import ProjectPhotoCarousel from '../ProjectPhotoCarousel';

expect.extend(matchers);

vi.mock('@config', () => ({
  API_URL: 'http://localhost:8081/api/v1',
}));

vi.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({ t: (key) => key }),
}));

afterEach(cleanup);

const photos = [
  { id: 1, url: '/uploads/projects/front.jpg', alt: 'Front' },
  { id: 2, url: '/uploads/projects/pool.jpg', alt: 'Pool' },
];

describe('ProjectPhotoCarousel', () => {
  it('pages forward and wraps to the first photo', () => {
    render(<ProjectPhotoCarousel photos={photos} projectName="Costamar" />);

    fireEvent.click(screen.getByRole('button', { name: 'common.next' }));
    expect(screen.getByRole('img', { name: 'Pool' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'common.next' }));
    expect(screen.getByRole('img', { name: 'Front' })).toBeInTheDocument();
  });

  it('pages backward', () => {
    render(<ProjectPhotoCarousel photos={photos} projectName="Costamar" />);

    fireEvent.click(screen.getByRole('button', { name: 'common.previous' }));
    expect(screen.getByRole('img', { name: 'Pool' })).toBeInTheDocument();
  });

  it('renders the placeholder when there are no photos', () => {
    render(<ProjectPhotoCarousel photos={[]} projectName="Costamar" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'projects.galleryFor' })
    ).toBeInTheDocument();
  });
});
