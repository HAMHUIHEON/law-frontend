export function MainUploadCachedNotice() {
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
        ✅ 이미 분석된 판례입니다
      </p>

      <p
        style={{
          margin: "0 0 12px 0",
          fontSize: 14,
          color: "#14532d",
          lineHeight: 1.7,
        }}
      >
        이 판례는 이미 분석된 이력이 있어 새로 업로드할 필요가 없습니다.
        <br />
        기존 분석 결과를 바로 확인하실 수 있습니다.
      </p>

      <p
        style={{
          fontSize: 13,
          color: "#166534",
        }}
      >
        📌 사이드바에서 <b>판례 조회</b>를 이용해 주세요.
      </p>
    </div>
  );
}
