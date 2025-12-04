// src/components/chat/ChatDisplay.js
import React, { useRef, useEffect } from 'react';
import TextFormatter from '../common/TextFormatter/TextFormatter';
import JsonViewer from '../common/JsonViewer/JsonViewer';

function ChatDisplay({ 
  messages, 
  parsedData, 
  analysisResult, 
  showAnalysisPanel,
  onToggleAnalysisPanel 
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderMessageContent = (message) => {
    if (message.isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          color: '#666' 
        }}>
          <div className="loading-spinner" style={{
            width: '20px',
            height: '20px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          {message.text}
        </div>
      );
    }

    // 파싱된 데이터가 있는 경우 TextFormatter 사용
    if (!message.isUser && parsedData) {
      return (
        <TextFormatter 
          text={message.text} 
          parsedData={parsedData}
          showCopyButton={true}
        />
      );
    }

    return (
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {message.text}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* 메인 채팅 영역 */}
      <div 
        className="chat-messages-container" 
        style={{
          flex: showAnalysisPanel ? '1 0 60%' : 1,
          overflowY: 'auto',
          padding: '20px',
          backgroundColor: '#ffffff',
          transition: 'flex 0.3s ease'
        }}
      >
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start',
              marginBottom: '15px'
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: message.isUser ? '#007bff' : '#f1f3f5',
                color: message.isUser ? 'white' : '#333',
                fontSize: '14px',
                lineHeight: '1.4',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {renderMessageContent(message)}
              
              {message.file && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  opacity: 0.8,
                  fontStyle: 'italic'
                }}>
                  📎 {message.file}
                </div>
              )}
              
              <div style={{
                marginTop: '5px',
                fontSize: '10px',
                opacity: 0.6,
                textAlign: message.isUser ? 'right' : 'left'
              }}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 분석 결과 패널 */}
      {showAnalysisPanel && (analysisResult || parsedData) && (
        <div style={{
          width: '400px',
          minWidth: '400px',
          maxWidth: '400px',
          backgroundColor: 'white',
          borderLeft: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '15px',
            borderBottom: '1px solid #eee',
            backgroundColor: '#f8f9fa',
            fontWeight: 'bold',
            fontSize: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>📊 분석 결과</span>
            <button 
              onClick={() => onToggleAnalysisPanel(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px'
          }}>
            {parsedData && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>파싱된 데이터</h4>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  border: '1px solid #e9ecef'
                }}>
                  <div><strong>파일명:</strong> {parsedData.fileName}</div>
                  <div><strong>파일 크기:</strong> {parsedData.fileSize} bytes</div>
                  <div><strong>악성 탐지:</strong> {parsedData.vtMaliciousCount}/{parsedData.vtTotalEngines}</div>
                  <div><strong>SHA256:</strong> {parsedData.sha256?.substring(0, 16)}...</div>
                  {parsedData.vtMaliciousEnginesList && (
                    <div><strong>탐지 엔진:</strong> {parsedData.vtMaliciousEnginesList}</div>
                  )}
                </div>
              </div>
            )}

            {analysisResult && (
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>원본 응답</h4>
                <JsonViewer 
                  data={analysisResult}
                  maxHeight="300px"
                  showCopyButton={true}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 분석 결과 토글 버튼 */}
      {(analysisResult || parsedData) && (
        <button
          onClick={() => onToggleAnalysisPanel(!showAnalysisPanel)}
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: showAnalysisPanel ? '#28a745' : '#007bff',
            color: 'white',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 999,
            transition: 'background-color 0.3s ease'
          }}
          title={showAnalysisPanel ? "분석 결과 숨기기" : "분석 결과 보기"}
        >
          📊
        </button>
      )}
    </div>
  );
}

export default ChatDisplay;
