export interface PaginationParams {
  query: string;
  dateRange: {
    from?: string;
    to?: string;
  };
  sort: {
    by: string;
    asc?: boolean;
  };
  dataPerPage: number;
  page: number;
}

export interface PaginationResponse {
  total?: number;
  pageCount?: numbes;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  currentPage?: number;
  prevPage?: number;
  nextPage?: number;
}
