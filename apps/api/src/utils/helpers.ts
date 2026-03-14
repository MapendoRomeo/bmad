import { Request } from 'express';
import { PAGINATION } from '@sgs/shared';

export function getPagination(req: Request) {
  const page = Math.max(1, parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function getSearchFilter(req: Request) {
  const search = req.query.search as string;
  if (!search) return undefined;
  return search.trim();
}

export function generateNumeroEleve(year: number, sequence: number): string {
  return `${year}-${String(sequence).padStart(4, '0')}`;
}
