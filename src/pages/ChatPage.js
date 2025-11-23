// src/pages/ChatPage.js
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ChatList from '../components/chat/ChatList';
import ProfilePanel from '../components/layout/ProfilePanel';
import JsonViewer from '../components/common/JsonViewer/JsonViewer';
import TextFormatter from '../components/common/TextFormatter/TextFormatter';
import { uploadAndAnalyzeFile } from '../services/ApiService';
import { parseMalwareAnalysisResponse, formatAnalysisMessage } from '../utils/parsers/MalwareAnalysisParser';
import './ChatPage.css';

function ChatPage() {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const { chatId } = useParams();
  const navigate = useNavigate();

  const initialFile = location.state?.file || null;
  const initialMessage = location.state?.message || '';
  const loadFromStorage = location.state?.loadFromStorage || false;
  const existingChatSession = location.state?.chatSession || null;

  const [headerTitle, setHeaderTitle] = useState('파일 내 악성 코드 분석 서비스');
  const hasAnalyzedRef = useRef(false);
  const isMountedRef = useRef(true);
  const [text, setText] = useState('');
  const [showChatList, setShowChatList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatId_VT, setChatId_VT] = useState(null); // 수정: const [setChatId_VT] → const [chatId_VT, setChatId_VT]
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 새로 추가된 상태: 로그인 상태 및 세션 목록
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mySessions, setMySessions] = useState(null);

  const handleMenuClick = () => setShowChatList(true);
  const handleProfileClick = () => setShowProfile(true);
  const handleCloseChatList = () => setShowChatList(false);
  const handleCloseProfile = () => setShowProfile(false);

  const BASE_URL = '';

  // === 9. Get Auth Status (GET) - TestPage.js에서 가져옴 ===
  const handleGetAuthStatus = async () => {
    try {
      console.log('[디버깅] 로그인 상태 확인 시작');
      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      console.log('[디버깅] 로그인 상태 확인 결과:', data);

      if (data.authenticated === true) {
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        return false;
      }
    } catch (err) {
      console.error('[디버깅] 로그인 상태 확인 오류:', err.message);
      setIsAuthenticated(false);
      return false;
    }
  };

  // === 3. Get My Sessions (GET) - TestPage.js에서 가져옴 ===
  const handleGetMySessions = async () => {
    try {
      console.log('[디버깅] 내 세션 목록 가져오기 시작');
      const response = await fetch(`${BASE_URL}/api/chats-of-user/my-sessions`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      console.log('[디버깅] 내 세션 목록 결과:', data);

      if (!response.ok) {
        console.error('[디버깅] 세션 목록 가져오기 실패:', data.error || '알 수 없는 오류');
        return null;
      }

      setMySessions(data);
      return data;
    } catch (err) {
      console.error('[디버깅] 세션 목록 가져오기 오류:', err.message);
      return null;
    }
  };

  // === 4. Get Session Messages (GET) - TestPage.js에서 가져옴 ===
  const handleGetSessionMessages = async (sessionIdToView) => {
    if (!sessionIdToView) {
      console.error('[디버깅] 세션 ID가 없습니다.');
      return null;
    }

    try {
      console.log('[디버깅] 세션 메시지 가져오기 시작, sessionId:', sessionIdToView);
      const response = await fetch(`${BASE_URL}/api/chats-of-user/session/${sessionIdToView}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      console.log('[디버깅] 세션 메시지 결과:', data);

      if (!response.ok) {
        console.error('[디버깅] 세션 메시지 가져오기 실패:', data.error || '알 수 없는 오류');
        return null;
      }

      return data;
    } catch (err) {
      console.error('[디버깅] 세션 메시지 가져오기 오류:', err.message);
      return null;
    }
  };

  // === 새로 추가: 세션 데이터의 messages를 ChatPage 형식으로 변환 ===
  const convertSessionMessagesToChatMessages = (sessionMessages) => {
    if (!sessionMessages || !Array.isArray(sessionMessages)) {
      console.error('[디버깅] 잘못된 세션 메시지 형식:', sessionMessages);
      return [];
    }

    const convertedMessages = [];

    sessionMessages.forEach((msg) => {
      // sender에 따라 메시지 분류
      if (msg.sender === 'system') {
        // system 메시지는 분석 결과로 처리
        try {
          const parsedContent = JSON.parse(msg.content);
          
          // analysisResult 저장
          if (parsedContent.analysisResult) {
            const parsed = parseAnalysisResponse(parsedContent.analysisResult);
            setParsedData(parsed);
            setSessionParsedData(parsed);
            setAnalysisResult(parsedContent.analysisResult);
          }

          // fileName을 사용자 메시지로 추가
          if (parsedContent.fileName) {
            convertedMessages.push({
              text: parsedContent.fileName,
              isUser: true,
              timestamp: msg.timestamp,
              messageId: `${msg.messageId}-file` // 수정: 고유한 key 생성
            });
          }

          // LLM 리포트를 AI 메시지로 추가
          if (parsedContent.analysisResult?.reportfromLLM?.report) {
            convertedMessages.push({
              text: parsedContent.analysisResult.reportfromLLM.report,
              isUser: false,
              timestamp: msg.timestamp,
              messageId: `${msg.messageId}-llm` // 수정: 고유한 key 생성
            });
          }
        } catch (error) {
          console.error('[디버깅] system 메시지 파싱 실패:', error);
        }
      } else if (msg.sender === 'user') {
        // user 메시지
        convertedMessages.push({
          text: msg.content,
          isUser: true,
          timestamp: msg.timestamp,
          messageId: msg.messageId
        });
      } else if (msg.sender === 'llm') {
        // llm 메시지
        convertedMessages.push({
          text: msg.content,
          isUser: false,
          timestamp: msg.timestamp,
          messageId: msg.messageId
        });
      }
    });

    console.log('[디버깅] 변환된 메시지:', convertedMessages);
    return convertedMessages;
  };

  const generateRandomChatId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log('[디버깅] 난수 기반 chatId 생성:', result);
    return result;
  };

  const handleStartNewChat = async () => {
    console.log('[디버깅] 새 채팅 시작 버튼 클릭');

    // 로그인 상태 확인
    const authenticated = await handleGetAuthStatus();

    if (authenticated) {
      console.log('[디버깅] 로그인 상태 - 서버에 세션 생성 요청 (구현 필요)');
      // 로그인 상태에서는 서버에 새 세션을 생성하도록 요청해야 함
      // 현재는 난수 ID로 생성
      const newChatId = generateRandomChatId();
      navigate(`/chat/${newChatId}`);
    } else {
      console.log('[디버깅] 비로그인 상태 - 난수 기반 chatId 생성');
      const newChatId = generateRandomChatId();
      navigate(`/chat/${newChatId}`);
    }
  };

  const loadChatSessionFromStorage = (targetChatId) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      const session = sessions.find(s => s.chatId === targetChatId);
      return session;
    } catch (error) {
      console.error('채팅 세션 로드 실패:', error);
      return null;
    }
  };

  const restoreChatSession = (sessionData) => {
    if (!sessionData) return;

    console.log('채팅 세션 복원 중:', sessionData);

    if (sessionData.messages && sessionData.messages.length > 0) {
      setMessages(sessionData.messages);
    }

    if (sessionData.analysisResult) {
      setAnalysisResult(sessionData.analysisResult);
      const parsed = parseAnalysisResponse(sessionData.analysisResult);
      setParsedData(parsed);
      setSessionParsedData(parsed);
    }

    if (sessionData.title) {
      console.log('복원된 제목:', sessionData.title);
      setHeaderTitle(sessionData.title);
    } else if (sessionData.fileName) {
      const generatedTitle = `${sessionData.fileName} 파일의 악성 코드 분석`;
      console.log('생성된 제목:', generatedTitle);
      setHeaderTitle(generatedTitle);
    }

    setLoading(false);
  };

  const updateChatSession = (newMessage, isUser = false) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      const sessionIndex = sessions.findIndex(session => session.chatId === chatId);

      if (sessionIndex >= 0) {
        sessions[sessionIndex].messages.push(newMessage);
        sessions[sessionIndex].messageCount = sessions[sessionIndex].messages.length;
        sessions[sessionIndex].lastUpdated = new Date().toISOString();

        if (headerTitle) {
          sessions[sessionIndex].title = headerTitle;
        }

        localStorage.setItem('chatSessions', JSON.stringify(sessions));
        console.log('채팅 세션 업데이트됨:', chatId);
      } else {
        const newSession = {
          id: chatId,
          chatId: chatId,
          title: headerTitle || `${initialFile?.name || 'Unknown'} 파일의 악성 코드 분석`,
          fileName: initialFile?.name || null,
          fileSize: initialFile?.size || 0,
          analysisResult: analysisResult,
          messages: [newMessage],
          messageCount: 1,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };

        sessions.unshift(newSession);
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
        console.log('새 채팅 세션 생성됨:', chatId);
      }
    } catch (error) {
      console.error('채팅 세션 업데이트 실패:', error);
    }
  };

  const [sessionParsedData, setSessionParsedData] = useState(() => {
    const saved = localStorage.getItem('chatSessionData');
    return saved ? JSON.parse(saved) : null;
  });

  const parseAnalysisResponse = (response) => {
    try {
      console.log('=== 확장된 파싱 시작 ===');
      console.log('원본 응답:', response);

      const reportVT = response?.reportfromVT || {};
      const reportLLM = response?.reportfromLLM || {};
      const extractedId = response?.extractedId || '';
      const vtChatId = reportVT?._id || null;

      console.log('추출된 채팅 ID (reportfromVT._id):', vtChatId);

      const vtData = reportVT?.data || {};
      const vtAttributes = vtData?.attributes || {};

      // lastAnalysisResults가 null일 수 있으므로 빈 객체로 처리
      const lastAnalysisResults = vtAttributes?.lastAnalysisResults || {};
      const lastAnalysisStats = vtAttributes?.lastAnalysisStats || {};

      // 파일 정보들
      const fileInfo = vtAttributes?.names || [];
      const fileSize = vtAttributes?.size || 0;
      const fileType = vtAttributes?.type_description || '';
      const md5Hash = vtAttributes?.md5 || vtData?.id_SHA256 || ''; // SHA256을 md5 대신 사용
      const sha1Hash = vtAttributes?.sha1 || '';
      const sha256Hash = vtAttributes?.sha256 || vtData?.id_SHA256 || '';

      // lastAnalysisResults가 null이 아닐 때만 엔진 분석
      const maliciousEngines = lastAnalysisResults
        ? Object.entries(lastAnalysisResults)
            .filter(([engine, result]) => result.category === 'malicious')
            .map(([engine, result]) => ({
              engine,
              result: result.result
            }))
        : [];

      const suspiciousEngines = lastAnalysisResults
        ? Object.entries(lastAnalysisResults)
            .filter(([engine, result]) => result.category === 'suspicious')
            .map(([engine, result]) => ({
              engine,
              result: result.result
            }))
        : [];

      const totalEngines = lastAnalysisResults ? Object.keys(lastAnalysisResults).length : 0;

      const parsedResult = {
        vtChatId: vtChatId,
        vtId: reportVT?._id || '',
        vtScanId: vtData?.id_SHA256 || '', // SHA256을 scanId로 사용
        vtMaliciousCount: lastAnalysisStats?.malicious || 0,
        vtSuspiciousCount: lastAnalysisStats?.suspicious || 0,
        vtUndetectedCount: lastAnalysisStats?.undetected || 0,
        vtHarmlessCount: lastAnalysisStats?.harmless || 0,
        vtTimeoutCount: lastAnalysisStats?.timeout || 0,
        vtFailureCount: lastAnalysisStats?.failure || 0,
        vtTotalEngines: totalEngines,
        vtDetectionRate: `${lastAnalysisStats?.malicious || 0}/${totalEngines}`,
        fileName: fileInfo[0] || response?.fileName || 'Unknown File', // 파일명 추가
        fileSize: fileSize,
        fileType: fileType,
        md5: md5Hash,
        sha1: sha1Hash,
        sha256: sha256Hash,
        vtMaliciousEngines: maliciousEngines,
        vtSuspiciousEngines: suspiciousEngines,
        vtMaliciousEnginesList: maliciousEngines.map(e => e.engine).join(', '),
        vtSuspiciousEnginesList: suspiciousEngines.map(e => e.engine).join(', '),
        llmId: reportLLM?._id || '',
        llmReport: reportLLM?.report || '', // 이 부분이 핵심!
        extractedId: extractedId,
        analysisDate: new Date().toISOString(),
        rawResponse: response
      };

      if (vtChatId) {
        setChatId_VT(vtChatId);
      }

      localStorage.setItem('chatSessionData', JSON.stringify(parsedResult));

      console.log('=== 확장된 파싱 완료, 채팅 ID 설정 ===', vtChatId);
      console.log('저장된 변수들:', Object.keys(parsedResult));
      console.log('LLM 리포트:', parsedResult.llmReport); // 디버깅용

      return parsedResult;
    } catch (error) {
      console.error('파싱 오류:', error);
      return null;
    }
  };

  const checkVariableExists = (variableName, parsedData) => {
    if (!parsedData) return false;

    const availableVariables = [
      'vtChatId', 'vtId', 'vtScanId',
      'vtMaliciousCount', 'vtSuspiciousCount', 'vtUndetectedCount',
      'vtHarmlessCount', 'vtTimeoutCount', 'vtFailureCount',
      'vtTotalEngines', 'vtDetectionRate',
      'fileName', 'fileSize', 'fileType',
      'md5', 'sha1', 'sha256',
      'vtMaliciousEnginesList', 'vtSuspiciousEnginesList',
      'llmId', 'llmReport',
      'extractedId', 'analysisDate'
    ];

    return availableVariables.includes(variableName);
  };

  const getValueByVariableName = (variableName, parsedData) => {
    if (!parsedData) return null;

    const variableMap = {
      'vtChatId': parsedData.vtChatId,
      'vtId': parsedData.vtId,
      'vtScanId': parsedData.vtScanId,
      'vtMaliciousCount': parsedData.vtMaliciousCount,
      'vtSuspiciousCount': parsedData.vtSuspiciousCount,
      'vtUndetectedCount': parsedData.vtUndetectedCount,
      'vtHarmlessCount': parsedData.vtHarmlessCount,
      'vtTimeoutCount': parsedData.vtTimeoutCount,
      'vtFailureCount': parsedData.vtFailureCount,
      'vtTotalEngines': parsedData.vtTotalEngines,
      'vtDetectionRate': parsedData.vtDetectionRate,
      'fileName': parsedData.fileName,
      'fileSize': parsedData.fileSize,
      'fileType': parsedData.fileType,
      'md5': parsedData.md5,
      'sha1': parsedData.sha1,
      'sha256': parsedData.sha256,
      'vtMaliciousEnginesList': parsedData.vtMaliciousEnginesList,
      'vtSuspiciousEnginesList': parsedData.vtSuspiciousEnginesList,
      'llmId': parsedData.llmId,
      'llmReport': parsedData.llmReport,
      'extractedId': parsedData.extractedId,
      'analysisDate': parsedData.analysisDate,
      'vtMaliciousEngines': JSON.stringify(parsedData.vtMaliciousEngines, null, 2),
      'vtSuspiciousEngines': JSON.stringify(parsedData.vtSuspiciousEngines, null, 2)
    };

    // 값이 null/undefined이면 빈 문자열 말고 undefined 반환
    return variableMap.hasOwnProperty(variableName) 
      ? variableMap[variableName] ?? null 
      : null;
  };

  // **수정된 chatId 변경 useEffect - MainPage에서 넘어온 데이터 처리 통합 + 로그인 상태에 따른 세션 관리**
  useEffect(() => {
    const analyzeInitialFile = async () => {
      console.log('=== ChatPage 초기화 시작 ===');
      console.log('chatId:', chatId);
      console.log('location.state:', location.state);

      setHeaderTitle(null);
      setLoading(false);
      setText('');

      // 로그인 상태 확인
      const authenticated = await handleGetAuthStatus();

      if (authenticated) {
        console.log('[디버깅] 로그인 상태 - 서버 세션 목록 가져오기');
        const sessionsData = await handleGetMySessions();

        if (sessionsData && sessionsData.chatSessions) {
          // 현재 chatId와 일치하는 세션이 있는지 확인
          const matchingSession = sessionsData.chatSessions.find(
            session => session.sessionId === chatId
          );

          if (matchingSession) {
            console.log('[디버깅] 서버에서 일치하는 세션 발견:', matchingSession);

            // 해당 세션의 메시지를 가져옴
            const sessionData = await handleGetSessionMessages(chatId);

            if (sessionData) {
              console.log('[디버깅] 세션 데이터 로드 완료:', sessionData);

              // fileName을 사용하여 제목 설정
              if (sessionData.fileName) {
                const title = `${sessionData.fileName} 파일의 악성 코드 분석`;
                setHeaderTitle(title);
                console.log('[디버깅] 제목 설정:', title);
              }

              // messages 배열을 ChatPage 형식으로 변환
              if (sessionData.messages && Array.isArray(sessionData.messages)) {
                const convertedMessages = convertSessionMessagesToChatMessages(sessionData.messages);
                setMessages(convertedMessages);
                console.log('[디버깅] 변환된 메시지 설정 완료');
              }

              return;
            }
          } else {
            console.log('[디버깅] 서버에 일치하는 세션 없음 - 새 세션으로 진행');
          }
        }
      } else {
        console.log('[디버깅] 비로그인 상태 - localStorage 사용');
      }

      // 기존 세션 복원 처리 (로그인 안된 경우 또는 서버에 세션 없는 경우)
      if (loadFromStorage && existingChatSession && existingChatSession.chatId === chatId) {
        restoreChatSession(existingChatSession);
        return;
      }

      const storedSession = loadChatSessionFromStorage(chatId);
      if (storedSession) {
        restoreChatSession(storedSession);
        return;
      }

      // MainPage에서 넘어온 데이터 처리
      const { file, result, preGeneratedReport } = location.state || {};
      const message = location.state?.message;

      if (file && result) {
        console.log('=== MainPage에서 넘어온 데이터 처리 ===');
        console.log('파일:', file.name);
        console.log('결과:', result);
        console.log('미리 생성된 리포트:', preGeneratedReport);

        // 1. 사용자 메시지 생성
        const userMsg = {
          isUser: true,
          text: message?.trim() ? `${file.name}\n${message.trim()}` : `${file.name}`,
          file: file.name,
          timestamp: new Date().toISOString()
        };

        // 2. AI 응답 메시지 생성
        let aiResponseText = '';

        if (preGeneratedReport && preGeneratedReport.trim()) {
          // MainPage에서 미리 생성된 report 사용
          aiResponseText = preGeneratedReport;
          console.log('미리 생성된 리포트 사용');
        } else {
          // 기존 파싱 로직 사용
          try {
            const parsed = parseMalwareAnalysisResponse(result);
            console.log('parseMalwareAnalysisResponse 결과:', parsed);

            const internalParsed = parseAnalysisResponse(result);
            setParsedData(internalParsed);
            setSessionParsedData(internalParsed);
            setAnalysisResult(result);

            const llmReport = parsed?.analysisResult.reportfromLLM.report;

            if (llmReport && llmReport.trim()) {
              aiResponseText = llmReport;
            } else {
              const formattedMsg = formatAnalysisMessage(parsed);
              if (formattedMsg && formattedMsg !== '분석 결과를 파싱할 수 없습니다.') {
                aiResponseText = formattedMsg;
              } else {
                aiResponseText = `파일 분석이 완료되었습니다.\n\n파싱 결과:\n${JSON.stringify(internalParsed, null, 2)}`;
              }
            }
          } catch (error) {
            console.error('파싱 오류:', error);
            aiResponseText = `파일 분석이 완료되었습니다.\n\n원본 결과:\n${JSON.stringify(result, null, 2)}`;
          }
        }

        // 빈 문자열 방지
        if (!aiResponseText || aiResponseText.trim() === '') {
          aiResponseText = '파일 분석이 완료되었습니다. 분석 결과를 확인하려면 질문해주세요.';
        }

        // 3. AI 메시지 생성
        const aiMsg = {
          isUser: false,
          text: aiResponseText,
          timestamp: new Date().toISOString()
        };

        console.log('=== 대화창에 메시지 설정 ===');
        console.log('사용자 메시지:', userMsg);
        console.log('AI 메시지:', aiMsg);

        // 4. 메시지 설정 (TestPage처럼 즉시 표시)
        setMessages([userMsg, aiMsg]);

        // 5. 헤더 제목 설정
        setHeaderTitle(`${file.name} 파일의 악성 코드 분석`);

        // 6. 분석 결과 파싱 및 저장
        if (!preGeneratedReport) {
          try {
            const internalParsed = parseAnalysisResponse(result);
            setParsedData(internalParsed);
            setSessionParsedData(internalParsed);
            setAnalysisResult(result);
          } catch (error) {
            console.error('분석 결과 파싱 실패:', error);
          }
        }

        return;
      }

      // 기존 파일 분석 로직 (MainPage에서 오지 않은 경우)
      if (hasAnalyzedRef.current || !initialFile || !isMountedRef.current) {
        console.log('분석 스킵:', {
          hasAnalyzed: hasAnalyzedRef.current,
          hasFile: !!initialFile,
          isMounted: isMountedRef.current
        });
        return;
      }

      hasAnalyzedRef.current = true;

      const skipAnalysis = location.state?.skipAnalysis;
      const existingResult = location.state?.result;

      if (initialFile) {
        const userMessageText = initialMessage
          ? `${initialFile.name}\n${initialMessage}`
          : `${initialFile.name}`;

        const userMsg = {
          text: userMessageText,
          isUser: true,
          file: initialFile.name,
          timestamp: new Date().toISOString()
        };

        if (existingResult) {
          console.log('=== 기존 결과로 AI 메시지 생성 ===');
          const parsed = parseAnalysisResponse(existingResult);
          setParsedData(parsed);
          setSessionParsedData(parsed);
          setAnalysisResult(existingResult);

          let aiResponseText = '';
          try {
            const llmReport = parsed?.llmReport || parsed?.llmAnalysis?.report;
            if (llmReport) {
              aiResponseText = llmReport;
            } else {
              const formattedMsg = formatAnalysisMessage(parsed);
              if (formattedMsg && formattedMsg !== '분석 결과를 파싱할 수 없습니다.') {
                aiResponseText = formattedMsg;
              } else {
                aiResponseText = `파일 분석이 완료되었습니다.\n\n파싱 결과:\n${JSON.stringify(parsed, null, 2)}`;
              }
            }
          } catch (error) {
            console.error('AI 메시지 생성 오류:', error);
            aiResponseText = `파일 분석이 완료되었습니다.\n\n원본 결과:\n${JSON.stringify(existingResult, null, 2)}`;
          }

          if (!aiResponseText || aiResponseText.trim() === '') {
            aiResponseText = '파일 분석이 완료되었습니다. 분석 결과를 확인하려면 질문해주세요.';
          }

          const aiMsg = {
            text: aiResponseText,
            isUser: false,
            timestamp: new Date().toISOString()
          };

          setMessages([userMsg, aiMsg]);
        } else {
          setMessages([
            userMsg,
            {
              text: "분석 중입니다...",
              isUser: false,
              isLoading: true,
              timestamp: new Date().toISOString()
            }
          ]);
          setLoading(true);
        }
      }

      console.log('ChatPage 초기화 (단일 실행):', {
        initialFile: initialFile?.name,
        skipAnalysis,
        hasExistingResult: !!existingResult
      });

      try {
        let result;

        if (existingResult) {
          console.log('기존 결과 사용:', existingResult);
          result = existingResult;
        } else if (!skipAnalysis && initialFile) {
          console.log('새로 분석 시작');
          result = await uploadAndAnalyzeFile(initialFile);
        } else if (initialFile) {
          console.error('결과가 없는데 skipAnalysis가 true입니다.');
          throw new Error('분석 결과를 찾을 수 없습니다.');
        }

        if (!isMountedRef.current) return;

        if (result) {
          console.log('분석 결과 처리 중:', result);

          const parsed = parseAnalysisResponse(result);
          setParsedData(parsed);
          setSessionParsedData(parsed);

          const llmReport = parsed?.llmReport || '분석 리포트를 찾을 수 없습니다.';

          setMessages(prev => {
            const filteredMessages = prev.filter(msg => !msg.isLoading);
            const aiMessage = {
              text: llmReport,
              isUser: false,
              timestamp: new Date().toISOString()
            };
            console.log('AI 메시지 추가 (단일):', aiMessage);
            return [...filteredMessages, aiMessage];
          });

          setAnalysisResult(result);
        }
      } catch (error) {
        if (!isMountedRef.current) return;

        console.error('파일 분석 실패:', error);

        setMessages(prev => {
          const filteredMessages = prev.filter(msg => !msg.isLoading);
          const errorMessage = {
            text: `죄송합니다, 파일 분석 중 오류가 발생했습니다: ${error.message}`,
            isUser: false,
            timestamp: new Date().toISOString()
          };
          return [...filteredMessages, errorMessage];
        });
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }

      if (loadFromStorage && location.state) {
        window.history.replaceState({}, document.title);
      }
    };

    analyzeInitialFile();

    return () => {
      isMountedRef.current = false;
    };
  }, [chatId, location.state]); // location.state도 의존성에 추가

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleSendClick = async () => {
    console.log('handleSendClick 호출됨!', text);

    if ((!selectedFile && text.trim().length === 0) || loading) return;

    if (text.length > 3000) {
      alert('글자수는 최대 3000자까지 입력 가능합니다.');
      return;
    }

    const currentText = text.trim();
    const currentParsedData = sessionParsedData || parsedData;

    const userMessage = {
      text: currentText,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    updateChatSession(userMessage, true);
    setText('');
    setLoading(true);

    const loadingMessage = {
      text: "처리 중입니다...",
      isUser: false,
      isLoading: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      let responseText;

      if (checkVariableExists(currentText, currentParsedData)) {
        const variableValue = getValueByVariableName(currentText, currentParsedData);

        if (variableValue != null && variableValue !== '') {
          responseText = `${currentText}: ${variableValue}`;
        } else {
          responseText = `${currentText}: 값이 존재하지 않습니다.`; // 안내 메시지 추가
        }

        console.log('responseText:', responseText);
      } else {
        responseText = `${currentText}: 올바른 변수명이 아닙니다.`; // 없을 경우 안내
        console.log('responseText:', responseText);
      }

      if (selectedFile) {
        const result = await uploadAndAnalyzeFile(selectedFile);
        const newParsedData = parseAnalysisResponse(result);
        setSessionParsedData(newParsedData);
        setParsedData(newParsedData);
        setAnalysisResult(result);

        responseText = `파일 '${selectedFile.name}' 분석이 완료되었습니다. 분석 결과를 확인하려면 변수명을 입력하세요.`;
        setSelectedFile(null);
      }

      const aiMessage = {
        text: responseText,
        isUser: false,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        return [...filteredMessages, aiMessage];
      });

      updateChatSession(aiMessage, false);
    } catch (error) {
      console.error('처리 실패:', error);

      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        const errorMessage = {
          text: `처리 중 오류가 발생했습니다: ${error.message}`,
          isUser: false,
          timestamp: new Date().toISOString()
        };
        return [...filteredMessages, errorMessage];
      });
    } finally {
      setLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e) => {
    console.log('handleKeyPress 호출됨!', e.key);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  // **수정된 handleSelectChat - 로그인 상태 확인 및 sessionId로 통신**
  const handleSelectChat = async (selectedChatId, sessionData) => {
    console.log("[디버깅] 채팅 세션 선택:", selectedChatId, sessionData);

    // 채팅 세션을 클릭할 때마다 로그인 상태 확인
    const authenticated = await handleGetAuthStatus();

    if (authenticated) {
      console.log('[디버깅] 로그인 상태 - sessionId로 서버에서 데이터 가져오기');

      // sessionId로 서버에서 데이터 가져오기
      const sessionMessages = await handleGetSessionMessages(selectedChatId);

      if (sessionMessages) {
        console.log('[디버깅] 서버에서 세션 데이터 가져오기 성공:', sessionMessages);

        // sessionId를 chatId로 사용하여 navigate
        navigate(`/chat/${selectedChatId}`, {
          state: {
            chatSession: null, // 서버 데이터를 사용하므로 기존 세션 데이터 전달 안함
            loadFromStorage: false,
          },
        });
      } else {
        console.error('[디버깅] 서버에서 세션 데이터 가져오기 실패');
        alert('채팅 세션을 불러올 수 없습니다.');
      }
    } else {
      console.log('[디버깅] 비로그인 상태 - localStorage 사용');

      // 비로그인 상태에서는 기존 방식대로 localStorage 사용
      navigate(`/chat/${selectedChatId}`, {
        state: {
          chatSession: sessionData,
          loadFromStorage: true,
        },
      });
    }

    setShowChatList(false);
  };

  const renderMessageContent = (message) => {
    if (message.isLoading) {
      return (
        <div className="message-loading">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      );
    }

    // JSON 블록 처리 추가
    const jsonBlockRegex = /``````/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = jsonBlockRegex.exec(message.text)) !== null) {
      // JSON 블록 앞의 텍스트 추가
      if (match.index > lastIndex) {
        const textBefore = message.text.substring(lastIndex, match.index);
        parts.push(
          <div key={`text-${lastIndex}`} className="message-text">
            <TextFormatter text={textBefore} />
          </div>
        );
      }

      // JSON 블록 추가
      const jsonString = match[1];
      parts.push(
        <div key={`json-${match.index}`} className="json-viewer-container">
          <JsonViewer jsonString={jsonString} />
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // 마지막 남은 텍스트 추가
    if (lastIndex < message.text.length) {
      const remainingText = message.text.substring(lastIndex);
      parts.push(
        <div key={`text-${lastIndex}`} className="message-text">
          <TextFormatter text={remainingText} />
        </div>
      );
    }

    return parts.length > 0 ? parts : (
      <div className="message-text">
        <TextFormatter text={message.text} />
      </div>
    );
  };

  return (
    <div className="chat-page">
      <Header
        title={headerTitle || '파일 내 악성 코드 분석 서비스'}
        onMenuClick={handleMenuClick}
        onProfileClick={handleProfileClick}
      />

      <div className="chat-page__main">
        {messages.length === 0 ? (
          <div className="chat-page__empty-state">
            <div className="empty-state__content">
              <div className="empty-state__icon">💬</div>
              <h2 className="empty-state__title">채팅을 시작해보세요.</h2>
              <p className="empty-state__description">
                파일을 분석하거나 질문을 입력하여 대화를 시작할 수 있습니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="chat-page__messages" style={{marginTop: '20px', marginBottom: '100px'}}>
            {messages.map((message, index) => (
              <div
                key={message.messageId || `msg-${index}`} 
                className={`chat-message-wrapper ${message.isUser ? 'chat-message-wrapper--user' : 'chat-message-wrapper--ai'}`}
              >
                <div className={`chat-message-bubble ${message.isUser ? 'chat-message-bubble--user' : 'chat-message-bubble--ai'}`}>
                  {renderMessageContent(message)}
                </div>
                {message.timestamp && (
                  <div className="chat-message-timestamp">
                    {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <Footer
        text={text}
        setText={setText}
        onSendClick={handleSendClick}
        onKeyPress={handleKeyPress}
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        loading={loading}
        fileInputRef={fileInputRef}
      />

      {showChatList && (
        <ChatList
          onClose={handleCloseChatList}
          onSelectChat={handleSelectChat}
          onStartNewChat={handleStartNewChat}
        />
      )}

      {showProfile && (
        <ProfilePanel
          onClose={handleCloseProfile}
        />
      )}
    </div>
  );
}

export default ChatPage;
