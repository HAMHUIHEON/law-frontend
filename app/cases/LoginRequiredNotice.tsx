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
        판례 분석 결과 조회는 <b>회원가입 후 로그인</b>하신 경우에만
        가능합니다.
        <br />
        로그인하시면 기존에 분석된 판례 결과를 바로 확인하실 수 있습니다.
      </p>

      <p
        style={{
          fontSize: 13,
          color: "#166534",
        }}
      >
        📌 상단의 <b>회원가입 / 로그인</b> 버튼을 이용해 주세요.
      </p>
    </div>
  );
}
