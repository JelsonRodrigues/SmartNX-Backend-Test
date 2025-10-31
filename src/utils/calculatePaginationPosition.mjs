// return a json with pagination info, previous page and next page if applicable
export default async function calculatePaginationPosition(
  page,
  limit,
  item_count
) {
  const start_index = (page - 1) * limit;
  const end_index = page * limit;

  const pagination = {};
  if (start_index > 0 && start_index < item_count) {
    pagination.previous = {
      page: page - 1,
      limit: limit,
    };
  }
  if (end_index < item_count) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  return pagination;
}
