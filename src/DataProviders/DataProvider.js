import {
  CompaniesAddress,
  IncomesAddress
} from "../Configuration/Environments";

import { Handle } from "../Utils/ErrorHandler";

export class ApiProxy {
  async GetIncomes(companyId) {
    return fetch(IncomesAddress + companyId)
      .then(response => {
        return response.json();
      })
      .then(data => {
        return data;
      })
      .catch(error => Handle(error));
  }

  async FillWithIncomes(data) {
    for (let i in data) {
      data[i].incomes = await this.GetIncomes(data[i].id);
      for (let income in data[i].incomes.incomes) {
        data[i].totalIncomes =
          parseInt(
            data[i].incomes.incomes[income].value
              ? data[i].incomes.incomes[income].value
              : 0
          ) + parseInt(data[i].totalIncomes ? data[i].totalIncomes : 0);
      }
    }
  }

  async GetCompanies() {
    return fetch(CompaniesAddress)
      .then(response => response.json())
      .then(data => {
        return data;
      })
      .catch(error => Handle(error));
  }
}
