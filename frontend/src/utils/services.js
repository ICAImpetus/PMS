import axios from "axios";

// Use the deployed Render URL in production, fallback to localhost for development
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:5000/";

// API prefix for MVC structure - all endpoints under /api
const API_PREFIX = "api/";

const resolveApiUrl = (endpoint) => {
  if (!endpoint || typeof endpoint !== "string") return BASE_URL + API_PREFIX;
  if (endpoint.startsWith("api/") || endpoint.startsWith("http")) return BASE_URL + endpoint;
  return BASE_URL + API_PREFIX + endpoint;
};
// Logout API function
export const logoutApi = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("current_user"));
    const token = currentUser?.token;

    // if (token) {
    //   await axios.post(
    //     resolveApiUrl("logout"),
    //     {},
    //     {
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //         "Content-Type": "application/json",
    //       },
    //     },
    //   );
    // }
    // Clear local storage and redirect to login
    localStorage.removeItem("current_user");

    window.location.href = "/login";

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    // Even if there's an error, we still want to clear local storage and redirect
    localStorage.removeItem("current_user");
    window.location.href = "/login";
    return { success: false, error };
  }
};

export const getDataFromServer = async ({
  end_point,
  params,
  call_back,
  props,
}) => {
  try {
    const url = resolveApiUrl(end_point);
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${params?.token}` },
      params: params,
    });
    const object = {
      response: response.data,
      status: "success",
      error: undefined,
      props,
    };
    call_back(object);
  } catch (error) {
    const object = {
      response: undefined,
      status: "error",
      error,
      props,
    };
    call_back(object);
  }
};

export const postDatatoServer = ({ end_point, body, call_back, props }) => {
  const header = props?.header
    ? { headers: { Authorization: `Bearer ${props?.token}` } }
    : null;
  const url = resolveApiUrl(end_point);
  axios
    .post(url, body, header)
    .then((response) => {
      const object = {
        response: response.data,
        status: "success",
        error: undefined,
        props,
      };
      call_back(object);
    })
    .catch((error) => {
      const object = {
        response: undefined,
        status: "error",
        error,
        props,
      };
      call_back(object);
    });
};

export const uploadImageToServer = async ({
  end_point,
  data,
  call_back,
  props,
}) => {
  try {
    const url = resolveApiUrl(end_point);
    const formData = new FormData();
    //formData.append('file', data, `${props.study}.docx`);
    formData.append(
      "file",
      data,
      `${props.study}.${data.name.split(".")[data.name.split(".").length - 1]}`,
    );

    const response = await axios.post(url, formData);
    const object = {
      response: response.data,
      status: "success",
      error: undefined,
      props,
    };
    return object;
  } catch (error) {
    console.log(error);
  }
};

export const downloadFileServer = async ({ end_point, call_back, props }) => {
  try {
    const url = resolveApiUrl(end_point);
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const fileBlob = new Blob([response.data], { type: "application/msword" });
    const fileUrl = window.URL.createObjectURL(fileBlob);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", props);
    document.body.appendChild(link);
    link.click();
    //call_back(true);
  } catch (error) {
    console.log(error);
    //call_back(false);
  }
};

export const sendDataApiFunc = async (end_point, data, method) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("current_user"));

    const token = currentUser ? currentUser.token : null;
    const url = resolveApiUrl(end_point);

    let response;

    if (method === "delete") {
      // For DELETE requests, include data inside the config object
      response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data, // Pass data here
      });
    } else {
      // For other methods, directly call the method with data and headers
      response = await axios[method](url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }

    return response.data; // Return response data on success
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Request failed",
      status: error?.response?.status,
      data: error?.response?.data,
    };
  }
};

export const sendDataApiFuncNew = async (
  end_point,
  data = {},
  method = "post",
) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("current_user"));
    const token = currentUser?.token || null;
    const url = resolveApiUrl(end_point);

    const config = {
      method,
      url,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    // Attach data properly based on method
    if (method === "get") {
      config.params = data;
    } else if (method === "delete") {
      config.data = data;
    } else {
      config.data = data;
    }

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("API error:", error);

    return {
      success: false,
      status: error?.response?.status || 500,
      message:
        error?.response?.data?.error || error.message || "Something went wrong",
    };
  }
};

export const getDataFunc = async (end_point) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("current_user"));
    const token = currentUser ? currentUser.token : null;
    const url = resolveApiUrl(end_point);
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return response.data;
  } catch (error) {
    console.log("error message in api", error.message);
    if (error.message === "Cannot read properties of null (reading 'token')") {
      localStorage.clear();
      // // Navigate('/login');
      window.location.href = "/";
    }
    const errorMessage = error.message;
    if (errorMessage === "Request failed with status code 401") {
      // console.log("error message in api", errorMessage);
      localStorage.clear();
      // // Navigate('/login');
      window.location.href = "/";
    }
    return { message: error.message, success: false };
  }
};
