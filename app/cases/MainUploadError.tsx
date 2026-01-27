// law-frontend/app/cases/MainUploadError.tsx

export function MainUploadError() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 720,
        backgroundColor: "#ffFf",
        borderRadius: 12,
        padding: "24px",
      }}
    >
      {/* 🔴 핵심 에러 한 줄 */}
      <p
        style={{
          margin: 0,
          marginBottom: 12,
          fontSize: 15,
          fontWeight: 700,
          color: "#dc2626",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        📄 업로드된 PDF에서 판례 본문을 인식하지 못했습니다.
      </p>

      {/* ⚫ 설명 */}
      <p
        style={{
          margin: "0 0 16px 0",
          fontSize: 14,
          color: "#374151",
          lineHeight: 1.7,
        }}
      >
        일부 판례 PDF는 스캔 이미지 형태이거나,<br />
        본문 텍스트가 포함되지 않은 형식으로 저장되어 있을 수 있습니다.
      </p>

      {/* ⚪ 가이드 */}
      <div
        style={{
          fontSize: 14,
          color: "#4b5563",
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>
          아래 방법을 시도해 주세요:
        </p>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li>🔍 본문 텍스트가 선택되는 PDF인지 확인해 주세요</li>
          <li>🖨 스캔본인 경우, OCR 처리된 PDF로 변환 후 다시 업로드해 주세요</li>
          <li>📑 다른 판례 원본 PDF가 있다면 해당 파일을 사용해 주세요</li>
        </ul>
      </div>

      {/* 🩶 주의 */}
      <p
        style={{
          marginTop: 16,
          fontSize: 12,
          color: "#6b7280",
          lineHeight: 1.6,
        }}
      >
        ※ 해당 문제는 파일 형식에 따른 제한으로, 시스템 오류가 아닌 경우가 많습니다.
      </p>
    </div>
  );
}
