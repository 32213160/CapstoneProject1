// src/pages/ChatPage.js

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Main/Header';
import ChatList from '../components/Main/ChatList';
import ProfilePanel from '../components/Main/ProfilePanel';
import { uploadAndAnalyzeFile, fetchScanResultById } from '../services/ApiService';
import JsonViewer from '../components/JsonViewer';
import '../components/Main/Main.css';

function ChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([
    { text: "이 APK 파일을 분석해줘!", isUser: true, file: "sample.apk" },
    { text: "네, 다음은 .apk 파일의 악성 코드를 분석한 결과입니다:\n\n``````\n이 코드는 공격자가 시스템에 원격으로 접근할 수 있도록 숨겨진 통로를 만듭니다.", isUser: false }
  ]);
  const [text, setText] = useState('');
  const [showChatList, setShowChatList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 채팅 목록 예시 데이터
  const chatList = [
    { id: 1, title: "'sample.apk' 파일의 악성 코드 분석", date: "오늘" },
    { id: 2, title: "Aegis.apk 파일의 악성 코드...", date: "어제" },
    { id: 3, title: "DanS.apk 파일의 악성 코드...", date: "어제" },
    { id: 4, title: "Danjeong.apk 파일의 악성 코드...", date: "2 days ago" },
    { id: 5, title: "NEWSWEEK.apk 파일의 악성 코드...", date: "2 days ago" },
    { id: 6, title: "ex.apk 악성 코드 분석 및 설명", date: "2 days ago" },
  ];

  // 날짜별 그룹핑
  const groupedChats = chatList.reduce((acc, chat) => {
    acc[chat.date] = acc[chat.date] ? [...acc[chat.date], chat] : [chat];
    return acc;
  }, {});

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 채팅 목록에서 채팅 선택 - ID로 결과 가져오기
  const handleSelectChat = async (chatId) => {
    try {
      setLoading(true);
      const result = await fetchScanResultById(chatId);
      setAnalysisResult(result);
      setMessages([
        { text: `${result.fileName || 'APK 파일'}을 분석해줘!`, isUser: true, file: result.fileName },
        { text: `네, 다음은 ${result.fileName || 'APK 파일'}의 악성 코드를 분석한 결과입니다:`, isUser: false, jsonResult: result }
      ]);
    } catch (error) {
      console.error('채팅 불러오기 실패:', error);
    } finally {
      setLoading(false);
      setShowChatList(false);
    }
  };

  // 파일 첨부 버튼 클릭 시 숨겨진 파일 input 클릭
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // 파일 선택 후 업로드 및 분석
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      // 사용자 메시지 추가
      const userMessage = { text: "", isUser: true, file: file.name, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, userMessage]);
      // 파일 업로드 및 분석
      const result = await uploadAndAnalyzeFile(file);
      setAnalysisResult(result);
      // AI 응답 메시지 추가
      const aiMessage = {
        text: `네, 다음은 ${file.name}의 악성 코드를 분석한 결과입니다:`,
        isUser: false,
        jsonResult: result,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('파일 분석 실패:', error);
      setMessages(prev => [
        ...prev,
        { text: "죄송합니다, 파일 분석 중 오류가 발생했습니다.", isUser: false, timestamp: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 메시지 전송
  const handleSendClick = async () => {
    if (text.trim().length === 0) return;
    if (text.length > 3000) {
      alert('글자수는 최대 3000자까지 입력 가능합니다.');
      return;
    }

    // "chatID: {id}" 형식인지 확인
    const chatIdPattern = /^ID:\s*([a-zA-Z0-9]+)/i;
    const match = text.match(chatIdPattern);

    // chatID 명령이면 ID로 결과 가져오기
    if (match) {
      const id = match[1];
      setMessages(prev => [
        ...prev,
        { text: text, isUser: true, timestamp: new Date().toISOString() }
      ]);
      setText('');
      try {
        setLoading(true);
        const result = await fetchScanResultById(id);
        setAnalysisResult(result);
        setMessages(prev => [
          ...prev,
          {
            text: `네, ID: ${id}의 분석 결과입니다:`,
            isUser: false,
            jsonResult: result,
            timestamp: new Date().toISOString()
          }
        ]);
      } catch (error) {
        setMessages(prev => [
          ...prev,
          {
            text: `죄송합니다, ID: ${id}에 대한 결과를 가져오는 중 오류가 발생했습니다.`,
            isUser: false,
            timestamp: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 일반 메시지 처리 (기존 로직)
    const newUserMessage = {
      text: text,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    setMessages([...messages, newUserMessage]);
    setText('');
    setTimeout(() => {
      const newResponse = {
        text: "네, 다음은 APK 파일의 악성 코드를 분석한 결과입니다:\n\n``````\n이 코드는 공격자가 시스템에 원격으로 접근할 수 있도록 숨겨진 통로를 만듭니다.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newResponse]);
    }, 1000);
  };

  // 엔터키 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  // 메뉴/프로필 패널 토글
  const handleMenuClick = () => setShowChatList(true);
  const handleProfileClick = () => setShowProfile(true);
  const handleCloseChatList = () => setShowChatList(false);
  const handleCloseProfile = () => setShowProfile(false);

  // 메시지 렌더링(파일, JSON 결과, 코드블록, 일반 텍스트)
  const renderMessageContent = (message) => {
    // 파일 메시지
    if (message.file) {
      return (
        <div>
          <span role="img" aria-label="파일">📎</span> {message.file}
        </div>
      );
    }
    // JSON 분석 결과 메시지
    if (message.jsonResult) {
      return (
        <div>
          <JsonViewer data={message.jsonResult} />
        </div>
      );
    }
    // 코드블록 처리 (백틱 3개)
    const regex = /``````/g;
    let lastIndex = 0;
    let match;
    const parts = [];
    while ((match = regex.exec(message.text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{message.text.slice(lastIndex, match.index)}</span>);
      }
      parts.push(
        <pre key={match.index}>
          <code>{match[1]}</code>
        </pre>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < message.text.length) {
      parts.push(<span key={lastIndex}>{message.text.slice(lastIndex)}</span>);
    }
    return parts.length > 0 ? parts : message.text;
  };

  return (
    <div className="chatContainer">
      <Header onMenuClick={handleMenuClick} onProfileClick={handleProfileClick} />

      {/* 채팅 리스트 패널 */}
      {showChatList && (
        <div className="chatListPanel">
          <button className="closeProfilePanel" onClick={handleCloseChatList} style={{ float: 'right' }}>×</button>
          <ChatList chats={chatList} onSelectChat={handleSelectChat} />
        </div>
      )}

      {/* 프로필 패널 */}
      {showProfile && (
        <div className="profilePanel">
          <ProfilePanel onClose={handleCloseProfile} />
        </div>
      )}

      {/* 채팅 메시지 영역 */}
      <div className="messagesContainer">
        <div className="messagesOverflow">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={message.isUser ? "userMessageWrapper" : "responseMessageWrapper"}
            >
              <div className={message.isUser ? "userMessageBubble" : "responseMessageBubble"}>
                {renderMessageContent(message)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력창 */}
      <div className="chatInputContainer">
        <button className="fileButton" onClick={handleFileButtonClick}>📎</button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <textarea
          className="chatTextField"
          placeholder="메시지를 입력하세요..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          maxLength={3000}
        />
        <button className="sendButton" onClick={handleSendClick}>➤</button>
      </div>
    </div>
  );
}

export default ChatPage;
