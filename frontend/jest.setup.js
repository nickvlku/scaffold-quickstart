// frontend/jest.setup.js
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRefresh = jest.fn();
const mockBack = jest.fn();
const mockForward = jest.fn();

const mockSearchParamsGet = jest.fn();
const mockPathname = jest.fn(() => '/'); // Default pathname

jest.mock('next/navigation', () => {
  const originalModule = jest.requireActual('next/navigation');
  return {
    ...originalModule,
    useRouter: jest.fn(() => ({
      push: mockPush,
      replace: mockReplace,
      refresh: mockRefresh,
      back: mockBack,
      forward: mockForward,
    })),
    useSearchParams: jest.fn(() => ({
      get: mockSearchParamsGet,
    })),
    usePathname: mockPathname,
  };
});

// Optional: After each test, clear all these specific mocks
// This is often better than relying on jest.clearAllMocks() for shared module mocks
afterEach(() => {
  mockPush.mockClear();
  mockReplace.mockClear();
  mockRefresh.mockClear();
  mockBack.mockClear();
  mockForward.mockClear();
  mockSearchParamsGet.mockClear();
  mockPathname.mockClear(); // Or reset to default: mockPathname.mockImplementation(() => '/');
});