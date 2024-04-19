// 고객 정보를 위한 인터페이스
interface File {
  initial: string;
  name: string;
  size: number;
  url?: string;
  downloadUrl?: string;
}

// 각 행(row)의 데이터 구조를 정의하는 인터페이스
export interface DownloadsListRow {
  id: string;
  date: string;
  status: string;
  file: File;
  progress: number;
}




