export class PaginationBuilder {
  BuildPaginationFooter(count, pageSize) {
    const paginationElement = document.querySelector(".pagination_lists");
    const pageCount = count / pageSize;
    for (let i = 1; i <= pageCount; i++) {
      paginationElement.innerHTML += this.CreateLiElement(i, pageSize);
    }
  }

  ResetPagination() {
    const paginationElement = document.querySelector(".pagination_lists");
    paginationElement.innerHTML = "";
  }

  CreateLiElement(iteration) {
    return `<li data-pagination=${iteration} class="pagination_lists-list">${iteration}</li>`;
  }
}
