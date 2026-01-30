// law-frontend/app/cases/MainUploadLimitNotice.tsx
"use client";

export function MainUploadLimitNotice() {
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
        ⚠️ 이번 달 판례 분석 한도를 모두 사용하셨습니다
      </p>

      <p
        style={{
          margin: "0 0 12px 0",
          fontSize: 14,
          color: "#14532d",
          lineHeight: 1.7,
        }}
      >
        현재 구독 플랜에서 제공되는 월간 판례 분석 가능 횟수를 모두 사용하셨습니다.
        <br />
        다음 결제 주기부터 다시 분석 기능을 이용하실 수 있습니다.
      </p>

      <p
        style={{
          fontSize: 13,
          color: "#166534",
        }}
      >
        📌 잔여 분석 건수는 <b>마이페이지</b>에서 확인하실 수 있습니다.
      </p>
    </div>
  );
}
