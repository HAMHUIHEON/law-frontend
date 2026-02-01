// law-frontend/app/cases/MainUploadSubscriptionRequiredNotice.tsx
"use client";

export function MainUploadSubscriptionRequiredNotice() {
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
        🔒 판례 분석은 구독자 전용 기능입니다
      </p>

      <p
        style={{
          margin: "0 0 12px 0",
          fontSize: 14,
          color: "#14532d",
          lineHeight: 1.7,
        }}
      >
        판례 파일 업로드 및 분석 기능은 <b>구독을 완료한 사용자</b>만 이용할 수 있습니다.
        <br />
        기존 DB에 이미 구축된 판례에 대해서는 계속 조회하실 수 있습니다.
      </p>

      <p
        style={{
          fontSize: 13,
          color: "#166534",
        }}
      >
        📌 구독을 원하시는 경우 <b>마이페이지</b>에서 요금제 및 구독을 진행하실 수 있습니다.
      </p>
    </div>
  );
}
