import { render, screen } from "@testing-library/react";
import React from "react";

// eslint-disable-next-line import/extensions
import App from "./App";

// eslint-disable-next-line mocha/no-global-tests
test("renders learn react link", function () {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  // eslint-disable-next-line no-undef
  expect(linkElement).toBeInTheDocument();
});
