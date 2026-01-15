export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token,
    },
  });

  if (res.status === 401) {
    let message = "Session expired. Please login again.";

    try {
      const data = await res.clone().json();

      if (data?.error) {
        if (data.error.includes("deleted")) {
          message = "Your account has been deleted.";
        } else if (data.error.includes("expired")) {
          message = "Session expired. Please login again.";
        } else {
          message = data.error;
        }
      }
    } catch (e) {}

    alert(`⚠ ${message}`);

    localStorage.clear();
    window.location.href = "/";
  }

  return res;
}
