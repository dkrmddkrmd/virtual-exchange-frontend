import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import MyAssets from './pages/MyAssets';
import OrderHistory from './pages/OrderHistory';
import Signup from './components/Signup';

function App() {
    // 전역으로 관리할 로그인 상태 (로컬 스토리지 확인)
    const [token, setToken] = useState(localStorage.getItem('accessToken'));

    return (
        <BrowserRouter>
            <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
                {/* 상단 네비게이션 바는 어느 페이지든 항상 띄워둔다 */}
                <Navbar token={token} setToken={setToken} />

                <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                    <Routes>
                        {/* 메인 주식 거래 화면 */}
                        <Route path="/" element={<Home token={token} />} />

                        {/* 로그인 화면 */}
                        <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} />

                        {/* 회원가입 화면 */}
                        <Route path="/signup" element={<Signup />} />

                        {/* 내 자산 화면 (로그인 안 했으면 로그인 페이지로 튕겨냄) */}
                        <Route path="/assets" element={token ? <MyAssets token={token} /> : <Navigate to="/login" />} />

                        {/* 주문 내역 화면 */}
                        <Route path="/orders" element={token ? <OrderHistory token={token} /> : <Navigate to="/login" />} />

                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;