// src/components/Main/SidebarMenu.js
import React from 'react';

function SidebarMenu({ onSelectMenu, onClose }) {
  // 메뉴 목록 데이터
  const menuList = [
    { 
      id: 1, 
      title: "새 대화", 
      icon: "bi-chat-dots",
      description: "새로운 대화를 시작합니다" 
    },
    { 
      id: 2, 
      title: "도움말", 
      icon: "bi-question-circle",
      description: "사용법과 FAQ를 확인합니다" 
    },
    { 
      id: 3, 
      title: "설정", 
      icon: "bi-gear",
      description: "애플리케이션 설정을 변경합니다" 
    },
    { 
      id: 4, 
      title: "대화 기록", 
      icon: "bi-clock-history",
      description: "이전 대화 내역을 확인합니다" 
    },
    { 
      id: 5, 
      title: "내보내기", 
      icon: "bi-download",
      description: "대화 내용을 파일로 저장합니다" 
    }
  ];

  const handleMenuClick = (menu) => {
    if (onSelectMenu) {
      onSelectMenu(menu);
    }
  };

  return (
    <div className="offcanvas offcanvas-start" 
         tabIndex="-1" 
         id="sidebarMenu" 
         aria-labelledby="sidebarMenuLabel"
         style={{ width: '300px' }}>
      
      {/* 헤더 */}
      <div className="offcanvas-header bg-primary text-white">
        <h5 className="offcanvas-title fw-bold" id="sidebarMenuLabel">
          <i className="bi bi-list me-2"></i>
          메뉴
        </h5>
        <button 
          type="button" 
          className="btn-close btn-close-white" 
          data-bs-dismiss="offcanvas" 
          aria-label="Close"
          onClick={onClose}>
        </button>
      </div>

      {/* 메뉴 본체 */}
      <div className="offcanvas-body p-0">
        <div className="list-group list-group-flush">
          {menuList.map((menu) => (
            <button
              key={menu.id}
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-start py-3 border-0"
              onClick={() => handleMenuClick(menu)}
            >
              <div className="me-3 mt-1">
                <i className={`${menu.icon} fs-5 text-primary`}></i>
              </div>
              <div className="flex-grow-1">
                <div className="fw-semibold mb-1">{menu.title}</div>
                <small className="text-muted">{menu.description}</small>
              </div>
              <div className="ms-2 mt-1">
                <i className="bi bi-chevron-right text-muted"></i>
              </div>
            </button>
          ))}
        </div>

        {/* 하단 구분선과 추가 정보 */}
        <div className="mt-auto p-3 border-top bg-light">
          <small className="text-muted d-flex align-items-center">
            <i className="bi bi-info-circle me-2"></i>
            버전 1.0.0
          </small>
        </div>
      </div>
    </div>
  );
}

export default SidebarMenu;
