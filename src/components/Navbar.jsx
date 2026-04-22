import { NavLink, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function Navbar({ token, setToken }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/api/users/logout');
        } catch {
            // 서버 오류여도 클라이언트 상태는 초기화
        }
        localStorage.removeItem('accessToken');
        setToken(null);
        navigate('/');
    };

    // 💡 현재 페이지인지 확인하여 스타일을 다르게 반환하는 함수
    const navStyle = ({ isActive }) => ({
        textDecoration: 'none',
        color: isActive ? '#2c3e50' : '#868e96', // 활성화되면 진한 색, 아니면 옅은 회색
        fontWeight: isActive ? 'bold' : 'normal', // 활성화되면 볼드체
        fontSize: '18px',
        paddingBottom: '5px'
    });

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 30px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                <NavLink to="/" style={({ isActive }) => ({ ...navStyle({ isActive }), fontSize: '22px' })}>
                    📈 거래소
                </NavLink>
                {token && (
                    <>
                        <NavLink to="/assets" style={navStyle}>내 자산</NavLink>
                        <NavLink to="/orders" style={navStyle}>주문 내역</NavLink>
                    </>
                )}
            </div>

            <div>
                {token ? (
                    <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        로그아웃
                    </button>
                ) : (
                    <NavLink to="/login" style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                        로그인
                    </NavLink>
                )}
            </div>
        </nav>
    );
}

export default Navbar;