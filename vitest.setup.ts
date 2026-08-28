import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

/*
 * The library's own stylesheet, loaded exactly as a consumer loads it. This is
 * the point of running in a browser: assertions can read computed styles, so a
 * test can prove a token resolved rather than that a class name was written.
 */
import "./src/styles/index.css";

afterEach(cleanup);
