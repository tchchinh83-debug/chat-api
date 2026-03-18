// services/knowledgeBase.ts

import { embedBatch } from "@/modules/rag/embedding.service"
import { upsertVector } from "@/db/vector.repository"
import { IngestDocumentInput } from "@/types"

export const KNOWLEDGE_BASE = `
# KIẾN THỨC PHÁP LUẬT BHXH & BHYT (CẬP NHẬT 2024-2025-2026)

## 1. CÁC VĂN BẢN PHÁP LUẬT CHỦ CHỐT
- **Luật Bảo hiểm xã hội số 41/2024/QH15**: Có hiệu lực từ 01/07/2025. Thay đổi quan trọng về điều kiện hưởng lương hưu (giảm từ 20 năm xuống 15 năm đóng BHXH).
- **Luật Bảo hiểm y tế số 51/2024/QH15**: Cập nhật các quy định mới về thông tuyến và quyền lợi khám chữa bệnh.
- **Nghị định 135/2020/NĐ-CP**: Quy định về tuổi nghỉ hưu.
- **Nghị định 74/2025/NĐ-CP**: Quy định về mức lương tối thiểu và các căn cứ đóng BHXH.
- **Nghị định 159/2025/NĐ-CP & 188/2025/NĐ-CP**: Hướng dẫn chi tiết thi hành Luật BHXH 2024.

## 2. BẢO HIỂM XÃ HỘI TỰ NGUYỆN
- **Đối tượng**: Công dân Việt Nam từ đủ 15 tuổi trở lên, không thuộc đối tượng tham gia BHXH bắt buộc.
- **Mức đóng**: 22% mức thu nhập tháng do người tham gia lựa chọn.
  - Thấp nhất: Bằng mức chuẩn hộ nghèo khu vực nông thôn (hiện là 1.500.000đ).
  - Cao nhất: Bằng 20 lần mức lương cơ sở.
- **Hỗ trợ từ Nhà nước**:
  - Hộ nghèo: 50% mức đóng thấp nhất (tương đương 165.000đ/tháng).
  - Hộ cận nghèo: 40% mức đóng thấp nhất (tương đương 132.000đ/tháng).
  - Dân tộc thiểu số: 30% mức đóng thấp nhất (tương đương 99.000đ/tháng).
  - Đối tượng khác: 20% mức đóng thấp nhất (tương đương 66.000đ/tháng).
- **Quyền lợi**: Hưu trí và Tử tuất.
- **Điểm mới Luật 2024**: Người tham gia BHXH tự nguyện được hưởng thêm chế độ Thai sản (trợ cấp 2.000.000đ cho mỗi con mới sinh).

## 3. BẢO HIỂM Y TẾ HỘ GIA ĐÌNH
- **Mức đóng**: Tính theo mức lương cơ sở (hiện tại là 2.340.000đ từ 01/07/2024).
  - Người thứ 1: 4,5% mức lương cơ sở.
  - Người thứ 2: 70% mức đóng của người thứ 1.
  - Người thứ 3: 60% mức đóng của người thứ 1.
  - Người thứ 4: 50% mức đóng của người thứ 1.
  - Người thứ 5 trở đi: 40% mức đóng của người thứ 1.
- **Quyền lợi**: Khám chữa bệnh đúng tuyến được hưởng 80% - 100% chi phí tùy đối tượng.

## 4. THÔNG TIN TẠI QUẢNG NGÃI
- BHXH tỉnh Quảng Ngãi có trụ sở tại: Số 08 Cao Bá Quát, P Cẩm Thành, Tỉnh Quảng Ngãi.
- Số điện thoại hỗ trợ: 0255.383.7171.
- Có các điểm thu tại tất cả các xã, phường, thị trấn thông qua hệ thống Bưu điện và các tổ chức dịch vụ thu.

## 5. CÔNG THỨC TÍNH CHIẾT KHẤU ĐÓNG GỘP
- Khi đóng gộp cho nhiều năm về sau, người tham gia được chiết khấu theo lãi suất đầu tư quỹ BHXH bình quân tháng do BHXH Việt Nam công bố (thường khoảng 0,31%/tháng).

## 6. ĐỊA GIỚI HÀNH CHÍNH TỈNH QUẢNG NGÃI (CẬP NHẬT THEO NQ 1677/2025)
Căn cứ Nghị quyết số 1677/NQ-UBTVQH15 ngày 16/06/2025 (có hiệu lực từ ngày thông qua, chính thức hoạt động từ 01/07/2025), tỉnh Quảng Ngãi thực hiện sắp xếp quy mô lớn các đơn vị hành chính cấp xã, giảm xuống còn **96 đơn vị** (86 xã, 09 phường, 01 đặc khu).

### 6.1. Các thay đổi trọng yếu tại các huyện/thành phố:
- **Thành phố Quảng Ngãi**:
  - Hợp nhất các phường Nguyễn Nghiêm, Trần Hưng Đạo, Nghĩa Chánh, Chánh Lộ thành **phường Cẩm Thành**.
  - Hợp nhất các phường Lê Hồng Phong, Trần Phú, Quảng Phú, Nghĩa Lộ thành **phường Nghĩa Lộ**.
  - Hợp nhất phường Trương Quang Trọng với các xã Tịnh Ấn Tây, Tịnh Ấn Đông, Tịnh An thành **phường Trương Quang Trọng**.
  - Hợp nhất các xã Tịnh Kỳ, Tịnh Châu, Tịnh Long, Tịnh Thiện, Tịnh Khê thành **xã Tịnh Khê**.
  - Hợp nhất các xã Nghĩa Hà, Nghĩa Dõng, Nghĩa Dũng, An Phú thành **xã An Phú**.
- **Thị xã Đức Phổ**:
  - Hợp nhất các phường Nguyễn Nghiêm, Phổ Hòa, Phổ Minh, Phổ Vinh, Phổ Ninh thành **phường Đức Phổ**.
  - Hợp nhất phường Phổ Thạnh và xã Phổ Châu thành **phường Sa Huỳnh**.
  - Hợp nhất phường Phổ Văn, phường Phổ Quang với các xã Phổ An, Phổ Thuận thành **phường Trà Câu**.
  - Hợp nhất các xã Phổ Nhơn, Phổ Phong thành **xã Nguyễn Nghiêm**.
  - Hợp nhất các xã Phổ Khánh, Phổ Cường thành **xã Khánh Cường**.
- **Huyện Bình Sơn**:
  - Hợp nhất thị trấn Châu Ổ và các xã Bình Thạnh, Bình Chánh, Bình Dương, Bình Nguyên, Bình Trung, Bình Long thành **xã Bình Sơn**.
  - Hợp nhất các xã Bình Thuận, Bình Đông, Bình Trị, Bình Hải, Bình Hòa, Bình Phước thành **xã Vạn Tường**.
  - Hợp nhất các xã Bình Hiệp, Bình Thanh, Bình Tân Phú, Bình Châu và xã Tịnh Hòa (từ TP Quảng Ngãi) thành **xã Đông Sơn**.
- **Đặc khu Lý Sơn**:
  - Sắp xếp toàn bộ huyện Lý Sơn thành **Đặc khu Lý Sơn** (thay đổi cấp hành chính từ huyện sang đặc khu).

### 6.2. Sắp xếp tại các huyện miền núi:
- **Huyện Trà Bồng**: Hợp nhất nhiều xã thành các đơn vị lớn như xã Trà Bồng, xã Đông Trà Bồng, xã Tây Trà, xã Thanh Bồng, xã Cà Đam, xã Tây Trà Bồng.
- **Huyện Sơn Tây**: Hợp nhất thành xã Sơn Tây, xã Sơn Tây Thượng, xã Sơn Tây Hạ.
- **Huyện Ba Tơ**: Hợp nhất thành xã Ba Tơ, xã Ba Vì, xã Ba Tô, xã Ba Dinh, xã Ba Vinh, xã Ba Động, xã Đặng Thùy Trâm.

### 6.3. Ý nghĩa đối với người tham gia BHXH/BHYT:
Việc sáp nhập các đơn vị hành chính dẫn đến thay đổi nơi đăng ký khám chữa bệnh ban đầu và các điểm thu BHXH tự nguyện, BHYT hộ gia đình. Người dân cần lưu ý tên đơn vị hành chính mới để thực hiện các thủ tục hành chính chính xác.
`;

const MAX_DOCUMENT_SIZE = 50_000
const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200
const MIN_CHUNK_LENGTH = 80

// ==============================
// STRONG SANITIZATION
// ==============================

function normalizeUnicode(input: string): string {
  return input.normalize("NFKC")
}

function stripHTML(input: string): string {
  return input.replace(/<\/?[^>]+(>|$)/g, "")
}

function removeZeroWidth(input: string): string {
  return input.replace(/[\u200B-\u200D\uFEFF]/g, "")
}

function sanitize(input: string): string {
  return normalizeUnicode(
    removeZeroWidth(
      stripHTML(input)
    )
  ).trim()
}

// ==============================
// CHUNKING
// ==============================

function chunkText(text: string): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = start + CHUNK_SIZE
    const chunk = text.slice(start, end)

    if (chunk.length >= MIN_CHUNK_LENGTH) {
      chunks.push(chunk)
    }

    start += CHUNK_SIZE - CHUNK_OVERLAP
  }

  return chunks
}

function hashContent(content: string) {
  // Simple browser-safe hash function
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// ==============================
// INGEST DOCUMENT
// ==============================

export async function ingestDocument(
  input: IngestDocumentInput
) {
  if (!input.tenantId) {
    throw new Error("Tenant isolation required")
  }

  if (!input.documentId || !input.content) {
    throw new Error("Invalid document")
  }

  if (input.content.length > MAX_DOCUMENT_SIZE) {
    throw new Error("Document too large")
  }

  const sanitized = sanitize(input.content)

  if (!sanitized) {
    throw new Error("Empty content after sanitization")
  }

  const chunks = chunkText(sanitized)

  if (chunks.length === 0) {
    throw new Error("No valid chunks")
  }

  // Batch embedding
  const embeddings = await embedBatch(chunks)

  for (let i = 0; i < embeddings.length; i++) {
    const chunk = chunks[i]
    const embedding = embeddings[i]

    const chunkHash = hashContent(chunk)

    await upsertVector({
      id: `${input.documentId}_${chunkHash}`,
      values: embedding,
      metadata: {
        tenantId: input.tenantId,
        documentId: input.documentId,
        title: input.title,
        source: input.source,
        visibility: input.visibility ?? "private",
        chunkIndex: i,
        deleted: false
      }
    })
  }

  return {
    success: true,
    chunkCount: chunks.length
  }
}