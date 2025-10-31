// return a json with pagination info, previous page and next page if applicable
export default async function calculatePaginationPosition(
  page,
  limit,
  itemCount
) {
  const startIndex = (page - 1) * limit;
  const end_index = page * limit;

  const pagination = {};
  if (startIndex > 0 && startIndex < itemCount) {
    pagination.previous = {
      page: page - 1,
      limit: limit,
    };
  }
  if (end_index < itemCount) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  return pagination;
}
