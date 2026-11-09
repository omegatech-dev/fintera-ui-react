/**
 * @vitest-environment jsdom
 */
import React, { useContext, useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthContext, { AuthProvider } from '../AuthContext';
import { setAuthToken, request } from '../../lib/apiClient';

vi.mock('../../lib/apiClient', () => ({
  setAuthToken: vi.fn(),
  request: vi.fn(),
  apiClient: {}
}));

vi.mock('../../features/auth/api', () => ({
  authApi: {
    refresh: vi.fn().mockResolvedValue({}),
    login: vi.fn()
  }
}));

const ChildThatMakesApiCall = () => {
  const { loading } = useContext(AuthContext);
  useEffect(() => {
    if (!loading) {
      console.log('Child making API call');
      request('/test-api-call');
    }
  }, [loading]);
  return <div>{loading ? 'Loading...' : 'Ready'}</div>;
};

describe('AuthContext Sync Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('verifies that setAuthToken is called before a child makes an API call when loading finishes', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    localStorage.setItem('refresh_token', 'refresh-token');

    let requestCalledWithToken = null;

    const { getByText } = render(
      <AuthProvider>
        <ChildThatMakesApiCall />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(request).toHaveBeenCalled();
    });

    // Check call orders
    const setAuthTokenCalls = setAuthToken.mock.invocationCallOrder;
    const requestCalls = request.mock.invocationCallOrder;

    console.log("setAuthToken calls:", setAuthTokenCalls);
    console.log("request calls:", requestCalls);

    // It should have been called before the child made the request
    expect(setAuthTokenCalls[setAuthTokenCalls.length - 1]).toBeLessThan(requestCalls[0]);
  });
});
