import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'http://35.247.83.127:8080';

function Login({ setToken }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
                email: email,
                password: password
            });
            const token = response.data.accessToken;
            localStorage.setItem('accessToken', token);
            setToken(token);
            alert("로그인 성공입니다!"); // 💡 존댓말로 수정
            navigate('/');
        } catch (error) {
            console.error("로그인 에러", error);
            alert("로그인에 실패했습니다. 이메일이나 비밀번호를 확인해 주세요."); // 💡 존댓말로 수정
        }
    };

    return (
        <div style={{ backgroundColor: '#fff', padding: '40px 30px', borderRadius: '12px', maxWidth: '400px', margin: '50px auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px', marginTop: 0 }}>🔑 로그인</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input
                    type="email"
                    placeholder="이메일 입력 (예: test@test.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
                    required
                />
                <input
                    type="password"
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
                    required
                />
                <button type="submit" style={{ padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>
                    로그인
                </button>
            </form>
        </div>
    );
}

export default Login;