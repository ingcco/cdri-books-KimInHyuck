export interface Response<T> {
  documents: T[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

export interface FailResponse {
  errorType: string;
  message: string;
}
