import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/api/orders', {
                    params: { page: currentPage, size: 10 }
                });
                setOrders(response.data.content || []);
                setTotalPages(response.data.page?.totalPages || response.data.totalPages || 1);
            } catch (error) {
                console.error("주문 내역 조회 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentPage]);

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
                        <th style={{ padding: '18px 20px', textAlign: 'center', color: '#495057' }}>상태</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                                데이터를 불러오는 중입니다...
                            </td>
                        </tr>
                    ) : orders.length === 0 ? (
                        <tr>
                            <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                                주문 내역이 존재하지 않습니다.
                            </td>
                        </tr>
                    ) : (
                        orders.map(order => {
                            const isFailed = order.status === 'FAILED';
                            return (
                                <tr key={order.orderId} style={{ borderBottom: '1px solid #f1f3f5', backgroundColor: isFailed ? '#fff5f5' : 'transparent' }}>
                                    <td style={{ padding: '18px 20px', color: '#6c757d', fontSize: '14px' }}>{order.orderDate}</td>
                                    <td style={{ padding: '18px 20px', textAlign: 'center', fontWeight: 'bold', color: order.orderType === '매수' ? '#dc3545' : '#007bff' }}>{order.orderType}</td>
                                    <td style={{ padding: '18px 20px', fontWeight: 'bold', color: isFailed ? '#999' : '#2b2b2b' }}>{order.stockName}</td>
                                    <td style={{ padding: '18px 20px', textAlign: 'right', color: isFailed ? '#999' : '#495057' }}>{order.quantity.toLocaleString()}</td>
                                    <td style={{ padding: '18px 20px', textAlign: 'right', color: isFailed ? '#999' : '#495057' }}>{order.price.toLocaleString()}원</td>
                                    <td style={{ padding: '18px 20px', textAlign: 'right', fontWeight: 'bold', color: isFailed ? '#999' : '#2b2b2b' }}>{order.totalAmount.toLocaleString()}원</td>
                                    <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: isFailed ? '#dc3545' : '#28a745', color: 'white' }}>
                                            {isFailed ? '실패' : '성공'}
                                        </span>
                                        {isFailed && order.failReason && (
                                            <div style={{ marginTop: '5px', fontSize: '12px', color: '#dc3545' }}>
                                                {order.failReason}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>

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
