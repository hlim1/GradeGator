export const logoutUser = async () => {
  const access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");

  if (refresh && access) {
    try {
      await fetch("http://18.188.140.218:8000/api/token/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh }),
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("userData");
  sessionStorage.removeItem("instructorId");
  sessionStorage.setItem("hasRefreshedDashboard" , "false");
  window.location.href = "/login";
};
