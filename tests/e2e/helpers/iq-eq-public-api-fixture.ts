import { startPublicContentApiFixture } from "./public-content-api-fixture";

// Share the full public lookup contract used by SSR metadata, the landing and
// the take route. A minimal take-only response can poison later cached reads.
// Attempts, authentication, reports and payments remain test-owned browser mocks.
export const startIqEqPublicApiFixture = startPublicContentApiFixture;
