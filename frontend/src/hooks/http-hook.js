import { useState, useCallback, useRef, useEffect } from "react";

export const useHttpClient = () => {
  //   const [error, setError] = useState();
  const activeHttpRequest = useRef([]);

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      const httpAbortController = new AbortController();
      activeHttpRequest.current.push(httpAbortController);

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortController.signal,
        });

        // const responseData = await response.json();

        const contentType = response.headers.get("content-type");
        let responseData = null;

        if (contentType && contentType.includes("application/json")) {
          responseData = await response.json();
        } else {
          alert("Error: response from BE server was empty");
          console.log("log> Error: response from BE server was empty");
        }

        activeHttpRequest.current = activeHttpRequest.current.filter(
          (requestController) => requestController !== httpAbortController
        );

        // if (!response.ok) throw new Error(responseData.message);

        if (!response.ok) {
          throw new Error(responseData?.message || "Request failed");
        }

        return responseData;
      } catch (err) {
        // setError(err.message);

        alert(`Error: ${err.message}`);
        // Error: Failed to execute 'json' on 'Response': Unexpected end of JSON input -> (response from BE server was empty)

        console.log(`log> Error: ${err.message}`);

        throw err;
      }
    },
    []
  );

  //   const clearError = () => {
  //     setError(null);
  //   };

  useEffect(() => {
    return () => {
      activeHttpRequest.current.forEach((abortController) =>
        abortController.abort()
      );
    };
  }, []);

  //   return { error, sendRequest, clearError };
  return { sendRequest };
};
