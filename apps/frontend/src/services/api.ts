import axios from 'axios';

// Cria a instância base do axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_BACK_API_URL || 'http://localhost:3000', // ajuste se a porta for diferente
  withCredentials: true, // Garante que cookies sejam sempre enviados
});

// Flag para saber se já estamos atualizando o token
let isRefreshing = false;
// Fila de requisições que estão esperando o token atualizar
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Interceptor de Response: intercepta erros 401 e tenta atualizar o token via cookies
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for a própria rota de refresh que falhou
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tenta renovar o token chamando a rota de refresh
        // O backend lerá o cookie 'refreshToken' e setará um novo 'accessToken'
        await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });

        processQueue(null);
        isRefreshing = false;

        // Refaz a requisição original
        return api(originalRequest);
      } catch (err) {
        processQueue(err);
        isRefreshing = false;

        // Se falhou o refresh (ex: token expirado de vez), redireciona
        window.location.href = '/login';

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
