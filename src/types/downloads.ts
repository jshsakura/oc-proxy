export type Status = 'S' | 'P' | 'C' | 'R' | 'N'

export interface DownloadItem {
  fileId: number; // 다운로드 아이디
  fileName: string | null; // 파일명
  fileOriginDownloadUrl: string; // 다운로드 원본 URL
  fileDownloadUrl: string | null; // 실제 다운로드 URL
  filePassword: string | null; // 다운로드에 필요한 비밀번호
  fileStatus: Status; // 현재 다운로드 상태
  fileSize: number; // 전체 파일 크기
  nowProgress: number | null; // 현재 진행율
  nowProxy: string | null; // 현재 사용중인 프록시
  createdAt: Date | string; // 생성 날짜와 시간
  completedAt: Date | string | null; // 완료 날짜와 시간 (완료되지 않았다면 null)
}





