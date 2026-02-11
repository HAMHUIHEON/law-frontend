export function MainLoginRequiredNotice() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 720,
        backgroundColor: "#f0fdf4",
        borderRadius: 12,
        padding: "24px",
        border: "1px solid #86efac",
      }}
    >
      <p
        style={{
          margin: 0,
          marginBottom: 12,
          fontSize: 15,
          fontWeight: 700,
          color: "#065f46",
        }}
      >
        🔐 로그인이 필요합니다
      </p>

        <p
        style={{
            margin: "0 0 12px 0",
            fontSize: 14,
            color: "#14532d",
            lineHeight: 1.7,
        }}
        >
        본 서비스의 기능(판례 분석, 법률 해석, 전략 콘텐츠 등)은
        <b> 회원가입 후 로그인</b>하신 경우에만 이용할 수 있습니다.
        <br />
        로그인하시면 저장된 분석 결과 및 개인화 기능을 바로 확인하실 수 있습니다.
        </p>

      <p
        style={{
          fontSize: 13,
          color: "#166534",
        }}
      >
        📌 상단의 홈 화면으로 돌아가서 <b> 회원가입 / 로그인</b> 버튼을 이용해 주세요.
      </p>
    </div>
  );
}
