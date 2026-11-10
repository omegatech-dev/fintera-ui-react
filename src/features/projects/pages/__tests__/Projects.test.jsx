import React from 'react';
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
    create: vi.fn()
  }
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

// We want to capture props passed to GenericFilter
const genericFilterProps = [];
vi.mock('@/shared/forms/GenericFilter', () => {
  return {
    default: (props) => {
      genericFilterProps.push(props);
      return <div data-testid="generic-filter">Generic Filter</div>;
    }
  };
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
    genericFilterProps.length = 0;
  });

  it('handleSearchChange and handleSortChange references should be stable across re-renders', async () => {
    // Mock initial fetch
    projectsApi.list.mockResolvedValue({
      projects: [],
      pagination: { pages: 1 }
    });

    renderProjects();

    // Wait for the effect to run and data to "load" (state update triggers re-render)
    await waitFor(() => expect(projectsApi.list).toHaveBeenCalled());

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText('projectsPage.loadingProjects')).not.toBeInTheDocument());

    expect(genericFilterProps.length).toBeGreaterThanOrEqual(2);

    const firstRenderProps = genericFilterProps[0];
    const lastRenderProps = genericFilterProps[genericFilterProps.length - 1];

    expect(firstRenderProps.onSearchChange).toBe(lastRenderProps.onSearchChange);
    expect(firstRenderProps.onFilterChange).toBe(lastRenderProps.onFilterChange);
  });
});

describe('Project card discovery fields', () => {
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
