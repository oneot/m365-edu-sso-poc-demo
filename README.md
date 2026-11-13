# 학교별 Microsoft 365 SSO PoC 시연 영상

사이트: **https://demo.joowon.me**

[m365-edu-sso-poc](https://github.com/oneot/m365-edu-sso-poc)(학교별 Microsoft 365 테넌트 + SAML 2.0 IdP 하나) 시나리오를 헤드리스 Chromium으로 녹화한 MP4입니다.

| 그룹 | 내용 |
|---|---|
| 기본 SSO | 학교 계정 로그인, 겸임교사, MFA 필수 계정, 재인증 요구, SEN 포털 링크, IdP 시작 로그인 |
| 위조·오류 거부 | 등록되지 않은 Issuer, 서명 변조, ImmutableID 없음, 잘못된 라우팅 구현, 테넌트 고정 앱 |
| ④ 통합 아이디(라우팅) | SEN 아이디로 시작해 학교 테넌트로 로그인, 학교 선택, 공용 PC, 무음 로그인, 실제 앱 |
| 보안 데모 | 학교 B(Microsoft 365 A5) 데모 계정의 Tor(익명 IP) 로그인 탐지·차단, 관리자 침해 확인, 관리 포털 기록 |

- 각 영상 앞에는 시나리오 설명, 끝에는 실행 결과가 있습니다. 결과는 받은 토큰(계정·테넌트)과 Microsoft 응답(오류 코드)에서 읽은 값입니다.
- 시험용 앱은 Microsoft 공개 클라이언트(Azure CLI)를 쓰고, 마지막 리디렉션(`http://localhost:8400`)을 녹화 도구가 받아 결과 화면을 보여 줍니다.
- Tor 시나리오는 Azure 컨테이너의 Tor를 SSH 터널로 사용했습니다. 관리 포털 화면의 관리자 계정·테넌트 ID·접속 IP는 녹화 중 가렸습니다.
- 대기 시간이 긴 구간(포털 로딩, 침해 확인 후 대기)은 빨리 감기로 줄였고, 카드에 배속을 표시합니다.
- 2026-11-13 Microsoft 365 서비스 장애로 일부 시나리오는 보류했습니다(사이트의 보류 목록).

녹화·게시 도구: [`tools/record_demos.py`](https://github.com/oneot/m365-edu-sso-poc/blob/main/tools/record_demos.py)

```text
index.html, assets/      사이트(영상 위에 아무것도 덮지 않음, 조작 버튼은 영상 아래)
data/manifest.json       시나리오·결과·진행 단계(record_demos.py --publish 출력)
videos/*.mp4, posters/   H.264 MP4, 포스터 이미지
```

테스트 전용 계정·도메인(joowon.me)과 데모 테넌트입니다.
