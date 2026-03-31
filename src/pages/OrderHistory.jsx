import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://virtual-exchange.kro.kr';

function OrderHistory({ token }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // 💡 페이지네이션을 위한 상태 추가 (스프링은 0페이지부터 시작)
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true); // 페이지 이동 시 로딩 상태 표시
            try {
                const response = await axios.get(`${API_BASE_URL}/api/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        page: currentPage,
                        size: 10 // 한 페이지당 개수 (컨트롤러 기본값과 동일하게 맞춤)
                    }
                });


                setOrders(response.data.content || []);
                // 💡 여기를 수정합니다! response.data.page 안에 있는 totalPages를 꺼내옵니다.
                // (혹시 모를 에러를 방지하기 위해 옵셔널 체이닝(?.)을 사용합니다.)
                setTotalPages(response.data.page?.totalPages || response.data.totalPages || 1);
            } catch (error) {
                console.error("주문 내역 조회 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchOrders();
        }
    }, [token, currentPage]); // 💡 currentPage가 변경될 때마다 useEffect 재실행

    // 페이지 이동 핸들러
    const handlePrevPage = () => {
        if (currentPage > 0) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
    };

    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>📜 주문 내역</h2>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                        <th style={{ padding: '18px 20px', textAlign: 'left', color: '#495057' }}>주문 일시</th>
                        <th style={{ padding: '18px 20px', textAlign: 'center', color: '#495057' }}>구분</th>
                        <th style={{ padding: '18px 20px', textAlign: 'left', color: '#495057' }}>종목</th>
                        <th style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>주문 수량</th>
                        <th style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>체결 가격</th>
                        <th style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>총 금액</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                                데이터를 불러오는 중입니다...
                            </td>
                        </tr>
                    ) : orders.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                                주문 내역이 존재하지 않습니다.
                            </td>
                        </tr>
                    ) : (
                        orders.map(order => (
                            <tr key={order.orderId} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                <td style={{ padding: '18px 20px', color: '#6c757d', fontSize: '14px' }}>
                                    {order.orderDate}
                                </td>
                                <td style={{ padding: '18px 20px', textAlign: 'center', fontWeight: 'bold', color: order.orderType === '매수' ? '#dc3545' : '#007bff' }}>
                                    {order.orderType}
                                </td>
                                <td style={{ padding: '18px 20px', fontWeight: 'bold', color: '#2b2b2b' }}>
                                    {order.stockName}
                                </td>
                                <td style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>
                                    {order.quantity.toLocaleString()}
                                </td>
                                <td style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>
                                    {order.price.toLocaleString()}원
                                </td>
                                <td style={{ padding: '18px 20px', textAlign: 'right', fontWeight: 'bold', color: '#2b2b2b' }}>
                                    {order.totalAmount.toLocaleString()}원
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* 💡 페이지네이션 버튼 UI 추가 */}
            {!loading && orders.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '30px' }}>
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                        style={{ padding: '10px 20px', backgroundColor: currentPage === 0 ? '#e9ecef' : '#007bff', color: currentPage === 0 ? '#6c757d' : 'white', border: 'none', borderRadius: '6px', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    >
                        이전
                    </button>

                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#495057' }}>
                        {/* 스프링은 0부터 시작하므로 사용자에게 보여줄 때는 +1을 해줍니다 */}
                        {currentPage + 1} / {totalPages}
                    </span>

                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages - 1}
                        style={{ padding: '10px 20px', backgroundColor: currentPage === totalPages - 1 ? '#e9ecef' : '#007bff', color: currentPage === totalPages - 1 ? '#6c757d' : 'white', border: 'none', borderRadius: '6px', cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
}

export default OrderHistory;