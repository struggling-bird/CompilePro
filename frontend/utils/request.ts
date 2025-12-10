const BASE_URL = '/api'; // Adjust as needed

interface RequestOptions extends RequestInit {
  data?: any;
}

export const request = async <T = any>(url: string, options: RequestOptions = {}): Promise<T> => {
  const { data, headers, ...rest } = options;
  
  const config: RequestInit = {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    // Handle empty response
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
};

export default request;
