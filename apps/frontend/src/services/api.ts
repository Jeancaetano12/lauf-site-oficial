import axios from 'axios';

// Cria a instância base do axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_BACK_API_URL || 'http://localhost:3000', // ajuste se a porta for diferente
});

// Flag para saber se já estamos atualizando o token
let isRefreshing = false;
// Fila de requisições que estão esperando o token atualizar
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor de Request: injeta o access token caso exista
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@Lauf:accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de Response: intercepta erros 401 e tenta atualizar o token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for a própria rota de refresh que falhou
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('@Lauf:refreshToken');

      if (!refreshToken) {
        isRefreshing = false;
        // Se não tem refresh token, força deslogar limpando o storage
        localStorage.removeItem('@Lauf:accessToken');
        localStorage.removeItem('@Lauf:refreshToken');
        window.location.href = '/login'; // rediona pro login
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        localStorage.setItem('@Lauf:accessToken', newAccessToken);
        localStorage.setItem('@Lauf:refreshToken', newRefreshToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;

        // Se falhou o refresh (ex: token expirado de vez), limpa storage
        localStorage.removeItem('@Lauf:accessToken');
        localStorage.removeItem('@Lauf:refreshToken');
        window.location.href = '/login';

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
