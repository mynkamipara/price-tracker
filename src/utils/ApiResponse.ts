/* eslint-disable prettier/prettier */
class GenericListDto<T> {
  data: T[];
  metadata: {
    limit: number;
    page:number;
    totalItems?: number;
    totalPages?: number;
    currentPage?: number;
  };

  constructor(data: T[], page:number, limit:number, totalItems?:number, totalPages?:number, currentPage?:number) {
    this.data = data;
    this.metadata = {
      page,
      limit,
      totalItems,
      totalPages,
      currentPage,
    };
  }
}

class GenericResponseDto<T> {
  data: T;

  constructor(data: T) {
    this.data = data;
  }
}

class CommonApiResponse<T> {
  public status: number;
  public success: boolean;
  public message: string;
  public data: T;

  constructor(status: number, data: T, message = 'Success') {
    this.status = status;
    this.success = status < 400;
    this.message = message;

    if (data instanceof GenericListDto) {
      Object.assign(this, data);
    } else {
      this.data = data;
    }
  }
}

export { GenericListDto, GenericResponseDto, CommonApiResponse };
