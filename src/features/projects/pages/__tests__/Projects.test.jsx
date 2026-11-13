import { render, waitFor, screen, cleanup, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import Projects from '../index';
import Project from '../../components';
import CreateProject from '../create';

expect.extend(matchers);
import { projectsApi } from '../../api';
import AuthContext from '@/contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('../../api', () => ({
  projectsApi: {
    list: vi.fn(),
    import: vi.fn(),
    create: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn()
  }
}));

vi.mock('@config', () => ({
  API_URL: 'http://localhost:8081/api/v1',
  PUBLIC_PORTAL_URL: 'https://portal.example.com'
}));

// Mock useLocale
vi.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({ t: (key) => key })
}));

// Mock useToast
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() })
}));

// Framer Motion is not relevant to the payload assertions.
vi.mock('framer-motion', () => {
  const Motion = ({ children }) => <div>{children}</div>;
  return { motion: new Proxy({}, { get: () => Motion }) };
});

// Mock contexts
const mockAuthContext = {
  user: { role: 'admin' },
  token: 'mock-token',
  loading: false
};

const renderProjects = () => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <BrowserRouter>
        <Projects />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

afterEach(() => {
  cleanup();
});

describe('Projects Component Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the toolbar and applies visibility filters through the API params', async () => {
    projectsApi.list.mockResolvedValue({
      projects: [],
      pagination: { pages: 1 }
    });

    renderProjects();

    await waitFor(() => expect(projectsApi.list).toHaveBeenCalled());

    expect(
      screen.getByPlaceholderText('projectsPage.searchPlaceholder')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'projectsPage.sortPlaceholder' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'projects.publishedPlural' }));

    await waitFor(() => {
      const params = projectsApi.list.mock.calls.at(-1)[0];
      expect(params.get('is_published')).toBe('1');
    });
  });
});

const baseProject = {
  id: 1,
  name: 'Altos de Santa María',
  project_type: 'residential',
  lot_count: 10,
  available_lots: 4,
  reserved_lots: 2,
  sold_lots: 4,
  price_per_square_unit: 1950,
  address: 'Valle de Ángeles, Francisco Morazán',
  guid: 'project-guid',
};

describe('Project card discovery fields', () => {
  it('shows the city and the project code when present', () => {
    render(
      <BrowserRouter>
        <Project
          project={{ ...baseProject, city: 'Valle de Ángeles', code: 'ASM-2025' }}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Valle de Ángeles')).toBeInTheDocument();
    expect(screen.getByText('ASM-2025')).toBeInTheDocument();
  });

  it('falls back to the address and hides the code chip when missing', () => {
    render(
      <BrowserRouter>
        <Project project={{ ...baseProject, city: null, code: null }} />
      </BrowserRouter>
    );

    expect(screen.getByText('Valle de Ángeles, Francisco Morazán')).toBeInTheDocument();
    expect(screen.queryByText(/projects\.code:/)).not.toBeInTheDocument();
  });
});

describe('Project card publishing controls', () => {
  it('shows the published badge, cover photo, and portal link', () => {
    render(
      <BrowserRouter>
        <Project
          project={{
            ...baseProject,
            is_published: true,
            cover_photo_url: '/uploads/projects/cover.jpg',
          }}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('projects.published')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'projects.coverPhoto' })).toHaveAttribute(
      'src',
      'http://localhost:8081/uploads/projects/cover.jpg'
    );
    expect(
      screen.getByRole('link', { name: 'projects.publicPortal' })
    ).toHaveAttribute(
      'href',
      `https://portal.example.com/projects/${baseProject.guid}`
    );
  });

  it('publishes an unpublished project from the card', async () => {
    projectsApi.publish.mockResolvedValue({});
    const onVisibilityChanged = vi.fn();

    render(
      <BrowserRouter>
        <Project
          project={{ ...baseProject, is_published: false }}
          user={{ role: 'admin' }}
          onVisibilityChanged={onVisibilityChanged}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('projects.unpublished')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('projects.publish'));

    await waitFor(() => expect(projectsApi.publish).toHaveBeenCalledWith(1));
    expect(onVisibilityChanged).toHaveBeenCalled();
  });

  it('hides publishing controls from non-admins', () => {
    render(
      <BrowserRouter>
        <Project
          project={{ ...baseProject, is_published: true }}
          user={{ role: 'user' }}
        />
      </BrowserRouter>
    );

    expect(screen.queryByTitle('projects.unpublish')).not.toBeInTheDocument();
  });
});

describe('Project card gallery and metadata', () => {
  it('shows the first gallery photo with carousel controls and pages forward', () => {
    render(
      <BrowserRouter>
        <Project
          project={{
            ...baseProject,
            photos: [
              { id: 1, position: 0, url: '/uploads/projects/front.jpg', alt: 'Front' },
              { id: 2, position: 1, url: '/uploads/projects/pool.jpg', alt: 'Pool' },
            ],
          }}
        />
      </BrowserRouter>
    );

    expect(screen.getByRole('img', { name: 'Front' })).toHaveAttribute(
      'src',
      'http://localhost:8081/uploads/projects/front.jpg'
    );
    fireEvent.click(screen.getByRole('button', { name: 'common.next' }));

    expect(screen.getByRole('img', { name: 'Pool' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Front' })).not.toBeInTheDocument();
  });

  it('falls back to the gradient placeholder when the project has no photos', () => {
    render(
      <BrowserRouter>
        <Project project={baseProject} />
      </BrowserRouter>
    );

    expect(screen.queryByRole('img', { name: /projects\./ })).not.toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'projects.galleryFor' })
    ).toBeInTheDocument();
  });

  it('shows the code, lot availability, and price per unit in the card body', () => {
    render(
      <BrowserRouter>
        <Project
          project={{
            ...baseProject,
            code: 'PR-2026',
            delivery_date: '2029-11-12',
            created_at: '2026-01-01T00:00:00Z',
            guid: 'e5419645-0e1f-435a-b8d8-460a9e0b1ac0',
          }}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('PR-2026')).toBeInTheDocument();
    expect(screen.getByText('projects.freeOfTotal')).toBeInTheDocument();
    expect(screen.getByText('projects.pricePerUnitShort')).toBeInTheDocument();
  });
});

describe('Project create discovery fields', () => {
  it('sends city and code in the create payload', async () => {
    projectsApi.create.mockResolvedValue({});

    const { container } = render(
      <BrowserRouter>
        <CreateProject />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('projects.enterCity'), {
      target: { value: 'Valle de Ángeles' },
    });
    fireEvent.change(screen.getByPlaceholderText('projects.enterCode'), {
      target: { value: 'ASM-2025' },
    });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => expect(projectsApi.create).toHaveBeenCalled());
    expect(projectsApi.create.mock.calls[0][0].project.city).toBe(
      'Valle de Ángeles'
    );
    expect(projectsApi.create.mock.calls[0][0].project.code).toBe('ASM-2025');
  });
});
