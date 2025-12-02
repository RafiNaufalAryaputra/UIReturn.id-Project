import axios from 'axios'

const BASE = import.meta.env.VITE_API || 'http://localhost:3000'

const API = axios.create({ baseURL: BASE })

// attach token from localStorage if present
API.interceptors.request.use(config => {
	try {
		const token = localStorage.getItem('token')
		if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` }
	} catch (e) {}
	return config
})

export default API
