import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { getErrorMessage, getValidationErrors, isForbidden } from "./api";

function axiosErrorWith(status: number, data: unknown): AxiosError {
  const err = new AxiosError("Request failed");
  err.response = {
    status,
    data,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return err;
}

describe("getValidationErrors", () => {
  it("devuelve los errores de un 422", () => {
    const err = axiosErrorWith(422, {
      message: "Datos inválidos",
      errors: { email: ["El email ya existe"] },
    });
    expect(getValidationErrors(err)).toEqual({ email: ["El email ya existe"] });
  });

  it("devuelve null si no es 422", () => {
    expect(getValidationErrors(axiosErrorWith(500, {}))).toBeNull();
    expect(getValidationErrors(new Error("boom"))).toBeNull();
  });
});

describe("getErrorMessage", () => {
  it("usa el message del backend si existe", () => {
    const err = axiosErrorWith(422, { message: "No inscrito" });
    expect(getErrorMessage(err)).toBe("No inscrito");
  });

  it("usa el message de un Error nativo", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("cae al fallback para valores no-Error", () => {
    expect(getErrorMessage("algo raro", "fallback")).toBe("fallback");
    expect(getErrorMessage(null, "fallback")).toBe("fallback");
  });
});

describe("isForbidden", () => {
  it("detecta 403", () => {
    expect(isForbidden(axiosErrorWith(403, {}))).toBe(true);
    expect(isForbidden(axiosErrorWith(401, {}))).toBe(false);
    expect(isForbidden(new Error("x"))).toBe(false);
  });
});
