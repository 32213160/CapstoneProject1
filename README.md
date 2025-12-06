# MalXplain
악성코드 분석을 위한 인공지능 기반 보안 분석 플랫폼의 프론트엔드 애플리케이션입니다. 파일을 업로드하면 VirusTotal API를 통해 종합적인 보안 분석 보고서를 생성하고, LLM 기반 AI 어시스턴트와 대화하며 추가 분석 및 솔루션을 받을 수 있습니다.
<br>
<br>

## 주요 기능
<br>

### 파일 보안 분석
- **VirusTotal 연동**: 파일 업로드 시 VirusTotal API를 통한 자동 악성코드 검사[file:1]
- **백신 탐지 현황**: 70개 이상의 백신 엔진에서 탐지된 악성코드 정보 표시[file:1]
- **취약점 분석**: 파일에 포함된 보안 취약점 상세 정보 제공[file:1]
- **권한 분석**: 파일이 요구하는 위험한 권한(Permissions) 목록 및 설명[file:1]

### AI 기반 대화형 분석
- **실시간 채팅**: 분석 보고서를 확인하면서 AI와 실시간 대화[file:1]
- **맞춤형 솔루션**: 사용자의 질문에 대한 구체적인 해결 방안 제시[file:1]
- **컨텍스트 인식**: 현재 분석 중인 파일 정보를 기반으로 한 정확한 답변[file:1]

## 기술 스택

### Frontend
- **React** 18.3.1 - UI 라이브러리[file:1]
- **React Router** 7.0.1 - 라우팅 관리[file:1]
- **Axios** 1.7.9 - HTTP 클라이언트[file:1]
- **Bootstrap** 5.3.3 - UI 프레임워크[file:1]
- **React Icons** 5.3.0 - 아이콘 라이브러리[file:1]

### Development Tools
- **Create React App** - 프로젝트 부트스트래핑[file:1]
- **ESLint** - 코드 린팅[file:1]
- **Jest** - 테스팅 프레임워크[file:1]

### Deployment
- **Microsoft Azure Static Web Apps** - 호스팅 플랫폼[file:1]
- **GitHub Actions** - CI/CD 파이프라인[file:1]

## 아키텍처
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│   Frontend  │─────▶│   Backend   │─────▶│     LLM     │
│   (React)   │◀─────│   (API)     │◀─────│   Service   │
│             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │
       │                    │
       ▼                    ▼
┌─────────────┐      ┌─────────────┐
│  VirusTotal │      │   Database  │
│     API     │      │             │
└─────────────┘      └─────────────┘
```

### 데이터 흐름
1. **파일 업로드**: 사용자가 파일을 업로드하면 Frontend에서 Backend로 전송[file:1]
2. **VirusTotal 분석**: Backend에서 VirusTotal API를 호출하여 파일 분석[file:1]
3. **보고서 생성**: 분석 결과를 구조화된 보고서 형태로 Frontend에 반환[file:1]
4. **ChatPage 전환**: 보고서 페이지로 이동하여 분석 결과 확인[file:1]
5. **AI 대화**: 사용자가 질문을 입력하면 Backend를 통해 LLM에 전달[file:1]
6. **답변 표시**: LLM의 응답을 Backend에서 받아 Frontend에 실시간 출력[file:1]

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── ChatPage.js     # 채팅 인터페이스 컴포넌트
│   ├── Footer.js       # 메시지 입력 컴포넌트
│   └── ...
├── public/             # 정적 파일
├── build/              # 프로덕션 빌드 결과물
└── node_modules/       # 의존성 패키지
```

## 설치 및 실행

### 사전 요구사항
- Node.js 14.0 이상
- npm 또는 yarn

### 로컬 개발 환경 설정

```
# 저장소 클론
git clone <repository-url>
cd <project-directory>

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다[file:1].

### 프로덕션 빌드

```
# 프로덕션 빌드 생성
npm run build

# 빌드 결과물은 build/ 디렉토리에 생성됩니다
```

## 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정하세요:

```
REACT_APP_API_URL=<Backend API URL>
REACT_APP_VIRUSTOTAL_API_KEY=<VirusTotal API Key>
```

## 주요 컴포넌트 설명

### ChatPage.js
- 파일 분석 보고서 표시
- 악성코드 탐지 결과 시각화
- 취약점 및 권한 정보 렌더링
- AI 채팅 히스토리 관리

### Footer.js
- 사용자 메시지 입력 인터페이스
- Backend로 메시지 전송
- LLM 응답 수신 및 표시

## API 연동

### Backend API 엔드포인트
```
POST /api/upload         // 파일 업로드 및 VirusTotal 분석 요청
POST /api/chat           // LLM 채팅 메시지 전송
GET  /api/report/:id     // 보고서 조회
```

## 배포

### Azure Static Web Apps
프로젝트는 Microsoft Azure Static Web Apps를 통해 배포됩니다[file:1].

```
# GitHub Actions를 통한 자동 배포
# .github/workflows/azure-static-web-apps-*.yml 참조
```

### 수동 배포
```
npm run build
# build/ 디렉토리를 Azure Static Web Apps에 배포
```

## 보안 고려사항

- **API 키 보호**: 환경 변수를 통한 민감 정보 관리[file:1]
- **HTTPS 통신**: 모든 API 통신은 HTTPS를 통해 암호화[file:1]
- **입력 검증**: 파일 업로드 시 크기 및 형식 제한[file:1]
- **XSS 방지**: React의 기본 XSS 보호 기능 활용[file:1]

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 라이선스

이 프로젝트는 [LICENSE](LICENSE) 파일에 명시된 라이선스를 따릅니다.

## 기여

프로젝트에 기여하고 싶으시다면:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 문의

프로젝트 관련 문의사항이 있으시면 Issue를 생성해주세요.

## 개발 로드맵

- [ ] 다국어 지원 (한국어, 영어)
- [ ] 파일 분석 히스토리 저장
- [ ] 대시보드 기능 추가
- [ ] 실시간 위협 모니터링
- [ ] PDF 보고서 내보내기
<br>
<br>

<<<<<<< HEAD
# CapstoneProject1
=======
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
>>>>>>> a215290 (Initial commit)
