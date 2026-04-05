import http from 'k6/http';

// Faz login e retorna o token JWT
export function obterToken() {
    const payload = JSON.stringify({
        email: 'admin@planner.com',
        senha: 'admin123',
    });

    const res = http.post('http://localhost:3000/auth/login', payload, {
        headers: { 'Content-Type': 'application/json' },
    });

    return JSON.parse(res.body).token;
}