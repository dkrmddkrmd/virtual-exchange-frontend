import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/api/users/signup', { email, password, name });
            alert("회원가입이 완료되었습니다! 로그인을 진행해 주세요.");
            navigate('/login');
        } catch (error) {
            console.error("회원가입 에러", error);
            alert("회원가입에 실패했습니다. 이미 존재하는 이메일이거나 입력 형식을 확인해 주세요.");
        }
    };

    return (
        <div style={{ backgroundColor: '#fff', padding: '40px 30px', borderRadius: '12px', maxWidth: '400px', margin: '50px auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px', marginTop: 0 }}>📝 회원가입</h2>
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input
                    type="text"
                    placeholder="이름 입력"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
                    required
                />
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
                <button type="submit" style={{ padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>
                    회원가입 하기
                </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>이미 계정이 있으신가요? </span>
                <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>
                    로그인으로 이동
                </button>
            </div>
        </div>
    );
}

export default Signup;
