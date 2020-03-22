export class TableBuilder {
  // Create table with dataCompanies
  BuildTableData(dataCompanies, tableSource) {
    if (dataCompanies.length > 0) {
      dataCompanies.forEach(data => {
        const companyRow = this.CreateTrElement(
          "table_result-tr",
          tableSource,
          data.id
        );
        this.CreateDataRow(data, companyRow);
      });
    }
  }

  // Create element tr
  CreateTrElement(className, tableSource, id) {
    const itemTr = document.createElement("tr");
    itemTr.className = className;
    itemTr.id = id;
    tableSource.appendChild(itemTr);
    return itemTr;
  }

  // Create element td
  CreateTdElement(className, data) {
    const itemTd = document.createElement("td");
    itemTd.classList.add(className);
    itemTd.innerText += data;
    return itemTd;
  }

  //Create td element filled with company data
  CreateDataRow(rowData, companyRow) {
    companyRow.innerHTML = `<td class='table_result'>${rowData.id}</td>
        <td class='table_result'>${rowData.name}</td>
        <td class='table_result'>${rowData.city}</td>
        <td class='table_result'>${rowData.totalIncomes}</td>`;
  }
}
