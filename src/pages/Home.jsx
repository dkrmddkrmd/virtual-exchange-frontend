import { useState, useEffect } from 'react';
import axios from 'axios';
// 💡 차트 라이브러리 임포트
import Chart from 'react-apexcharts';

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://virtual-exchange.kro.kr';

function Home({ token }) {
    const [stocks, setStocks] = useState([]);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [tradeType, setTradeType] = useState('BUY');

    // 💡 차트 데이터 상태 추가
    const [chartData, setChartData] = useState([]);
    const [isChartLoading, setIsChartLoading] = useState(false);

    // 코인 목록 불러오기 (기존 동일)
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/stocks`)
            .then(response => setStocks(response.data))
            .catch(error => console.error("코인 목록 조회 에러 발생", error));
    }, []);

    // 💡 코인 클릭 시 차트 데이터를 업비트 API에서 직접 가져오는 함수
    const fetchChartData = async (marketCode) => {
        setIsChartLoading(true);
        try {
            // 업비트 공용 API 사용 (백엔드 거치지 않음)
            // 최근 1분 봉 60개를 가져옵니다.
            const response = await axios.get(`/upbit-api/v1/candles/minutes/1?market=${marketCode}&count=60`);

            // ApexCharts 형식에 맞게 데이터 변환 [시간, 시가, 고가, 저가, 종가]
            const formattedData = response.data.map(candle => ({
                x: new Date(candle.candle_date_time_kst), // 한국 시간 기준
                y: [candle.opening_price, candle.high_price, candle.low_price, candle.trade_price]
            })).reverse(); // 시간 순서대로 정렬

            setChartData([{ data: formattedData }]);
        } catch (error) {
            console.error("차트 데이터 조회 실패:", error);
            setChartData([]); // 실패 시 차트 비우기
        } finally {
            setIsChartLoading(false);
        }
    };

    // 표에서 행 클릭 핸들러 수정
    const handleRowClick = (stock) => {
        setSelectedCoin(stock);
        setQuantity('');
        // 💡 클릭한 코인의 차트 데이터를 불러옵니다.
        fetchChartData(stock.code);
    };

    // 주문 처리 핸들러 (기존 주석 해제 버전 동일)
    const handleTrade = async (e) => {
        e.preventDefault();

        if (!token) {
            alert("로그인 후 거래를 진행해 주세요!");
            return;
        }

        if (!selectedCoin || !quantity || quantity <= 0) {
            alert("종목을 선택하고 올바른 수량을 입력해 주세요!");
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/api/orders`, {
                code: selectedCoin.code,
                quantity: Number(quantity),
                orderType: tradeType
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`${selectedCoin.name} ${quantity}개 주문이 성공적으로 접수되었습니다!`);
            setQuantity('');
        } catch (error) {
            console.error("거래 에러 상세 내역:", error.response);
            alert("주문에 실패했습니다. 서버를 확인해 주세요.");
        }
    };

    // 💡 ApexCharts 설정 (캔들스틱 차트)
    const chartOptions = {
        chart: {
            type: 'candlestick',
            height: 350,
            toolbar: { show: false }, // 도구 모음 숨김
            animations: { enabled: false } // 성능을 위해 애니메이션 끔
        },
        title: {
            text: selectedCoin ? `${selectedCoin.name} (1분 봉)` : '코인을 선택해 주세요',
            align: 'left',
            style: { fontSize: '18px', color: '#2c3e50' }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeUTC: false, // 로컬 시간 표시
                format: 'HH:mm',
                style: { colors: '#868e96' }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            tooltip: { enabled: true },
            labels: {
                formatter: (val) => val.toLocaleString() + '원', // 가격 포맷팅
                style: { colors: '#868e96' }
            },
            opposite: true // 우측에 가격 표시
        },
        grid: {
            borderColor: '#f1f3f5'
        },
        // 상승/하락 색상 설정 (한국 국룰 색상)
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#dc3545', // 상승 빨강
                    downward: '#007bff' // 하락 파랑
                },
                wick: { useFillColor: true }
            }
        },
        tooltip: {
            theme: 'light',
            x: { format: 'yyyy-MM-dd HH:mm' }
        }
    };

    return (
        <div>
            {/* 스핀 버튼 크기 키우는 스타일 태그 유지 */}
            <style>
                {`
                input[type="number"]::-webkit-inner-spin-button, 
                input[type="number"]::-webkit-outer-spin-button {
                    opacity: 1;
                    transform: scale(1.5);
                    margin-left: 15px;
                    cursor: pointer;
                }
                `}
            </style>

            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>📊 실시간 코인 목록 및 거래</h2>

            {/* 💡 차트 영역 영역 배치 (가로 전체 너비) */}
            {selectedCoin && (
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
                    {isChartLoading ? (
                        <div style={{ height: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#868e96' }}>
                            차트 데이터를 불러오는 중입니다...
                        </div>
                    ) : chartData.length > 0 && chartData[0].data.length > 0 ? (
                        <Chart
                            options={chartOptions}
                            series={chartData}
                            type="candlestick"
                            height={350}
                        />
                    ) : (
                        <div style={{ height: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#dc3545' }}>
                            차트 데이터를 불러올 수 없습니다. (업비트 API 연결 확인)
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
                {/* --- 좌측: 코인 목록 테이블 --- */}
                <div style={{ flex: 2, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '18px 20px', textAlign: 'left', color: '#495057' }}>코인명 (코드)</th>
                            <th style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>현재가(KRW)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {stocks.map(stock => (
                            <tr
                                key={stock.code}
                                onClick={() => handleRowClick(stock)}
                                style={{
                                    borderBottom: '1px solid #f1f3f5',
                                    cursor: 'pointer',
                                    backgroundColor: selectedCoin?.code === stock.code ? '#eef2f5' : 'transparent',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <td style={{ padding: '18px 20px', fontWeight: 'bold', color: '#2b2b2b' }}>
                                    {stock.name} <span style={{ fontSize: '13px', color: '#868e96', fontWeight: 'normal', marginLeft: '8px' }}>{stock.code}</span>
                                </td>
                                <td style={{ padding: '18px 20px', textAlign: 'right', color: '#dc3545', fontWeight: 'bold' }}>
                                    {stock.price.toLocaleString()}원
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* --- 우측: 매수/매도 주문 폼 --- */}
                <div style={{ flex: 1, backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
                    <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #f1f3f5', paddingBottom: '15px' }}>주문하기</h3>

                    {!selectedCoin ? (
                        <div style={{ padding: '40px 0', textAlign: 'center', color: '#adb5bd' }}>
                            <p>왼쪽 목록에서 거래할<br/>종목을 클릭해 주세요.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleTrade} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* 선택된 코인 정보 표시 영역 유지 */}
                            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                <div style={{ fontSize: '14px', color: '#495057', marginBottom: '5px' }}>{selectedCoin.code}</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2b2b2b', marginBottom: '10px' }}>{selectedCoin.name}</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{selectedCoin.price.toLocaleString()}원</div>
                            </div>

                            {/* 매수/매도 버튼 탭 유지 */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setTradeType('BUY')} style={{ flex: 1, padding: '12px', backgroundColor: tradeType === 'BUY' ? '#dc3545' : '#e9ecef', color: tradeType === 'BUY' ? 'white' : '#495057', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                                    매수
                                </button>
                                <button type="button" onClick={() => setTradeType('SELL')} style={{ flex: 1, padding: '12px', backgroundColor: tradeType === 'SELL' ? '#007bff' : '#e9ecef', color: tradeType === 'SELL' ? 'white' : '#495057', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                                    매도
                                </button>
                            </div>

                            {/* 주문 수량 입력 필드 유지 (min="0") */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>주문 수량 (개)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    style={{ padding: '15px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '16px', textAlign: 'right', width: '100%', boxSizing: 'border-box' }}
                                    min="0"
                                    required
                                />
                            </div>

                            {/* 총 주문금액 영역 유지 */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderTop: '1px dashed #ced4da', borderBottom: '1px dashed #ced4da' }}>
                                <span style={{ fontSize: '15px', color: '#495057' }}>총 주문금액</span>
                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2b2b2b' }}>
                                    {quantity ? (selectedCoin.price * Number(quantity)).toLocaleString() : 0}원
                                </span>
                            </div>

                            {/* 제출 버튼 유지 */}
                            <button type="submit" style={{ padding: '16px', backgroundColor: tradeType === 'BUY' ? '#dc3545' : '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', transition: 'background-color 0.2s' }}>
                                {tradeType === 'BUY' ? '매수하기' : '매도하기'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;