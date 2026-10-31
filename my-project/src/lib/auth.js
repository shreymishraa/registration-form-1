const TOKEN_KEY = "authToken";

async function requestAuth(path, credentials) {
  const response = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Unable to complete your request.");
  localStorage.setItem(TOKEN_KEY, result.token);
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userEmail", result.user.email);
  return result.user;
}

export function registerAccount(account) {
  return requestAuth("register", account);
}

export function loginAccount(email, password) {
  return requestAuth("login", { email, password });
}

export function loginWithGoogle(credential) {
  return requestAuth("google", { credential });
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
}

export function hasAuthToken() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}
