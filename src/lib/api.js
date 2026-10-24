export async function api(path, { method = "GET", body, token } = {}) {
  const headers = {}
  if (body !== undefined) {
    headers["Content-Type"] = "application/json"
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error("Cannot reach the server. Start the backend and try again.")
  }

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!response.ok) {
    const message = Array.isArray(data?.message) ? data.message[0] : data?.message
    if (!message && response.status >= 500) {
      throw new Error("Cannot reach the server. Start the backend and try again.")
    }
    throw new Error(message || "Something went wrong.")
  }

  return data
}

export function saveSession({ access_token, refresh_token }) {
  localStorage.setItem("access_token", access_token)
  localStorage.setItem("refresh_token", refresh_token)
}
