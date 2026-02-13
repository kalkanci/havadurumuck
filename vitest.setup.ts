import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Extend expect matchers
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

// @ts-expect-error - matchers type issue with vitest
expect.extend(matchers);

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
