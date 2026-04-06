export function pegarParams(token) {
    const params = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (token) {
        params.headers['Authorization'] = `Bearer ${token}`;
    }

    return params;
}