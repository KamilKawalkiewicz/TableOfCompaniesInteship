import "./sass/index.scss";
import { ApiProxy } from "../src/DataProviders/DataProvider";
import $ from "jquery";
import { TableBuilder } from "./UIBuilder/TableBuilder";
import { PaginationBuilder } from "./UIBuilder/PaginationBuilder";
import { SortDescBy } from "./Utils/CompanyValueComparer";

require("webpack-jquery-ui");
require("webpack-jquery-ui/css");
require("chart.js");

let selectedCompany;
let provider;
let tableBuilder;
let pagination;
let appEvents;
let companies;
let tbody;
let companyId;

$(document).ready(async function() {
  tbody = document.querySelector(".table_companies-tbody");

  selectedCompany;
  provider = new ApiProxy();
  tableBuilder = new TableBuilder();
  pagination = new PaginationBuilder();
  appEvents = new ApplicatonListners();

  //get companies
  companies = await provider.GetCompanies();
  //wait ;-)
  $(".loader").show();
  $(".text").show();
  // file data with income - time consuming
  await provider.FillWithIncomes(companies);
  // sort result descending
  companies.sort(SortDescBy("totalIncomes"));
  // build table
  tableBuilder.BuildTableData(companies.slice((1 - 1) * 40, 1 * 40), tbody);
  // build pagination
  pagination.BuildPaginationFooter(companies.length, 40);

  $(".loader").hide();
  $(".text_p").hide();
  appEvents.detailsEvent();
  appEvents.paginationEvent();
  appEvents.prepareDatapickers();
  appEvents.searchEvent();
});

export class ApplicatonListners {
  constructor() {}

  prepareDatapickers() {
    $("#startDate,#endDate").datepicker({
      onSelect: function() {
        $(".table_result-tr").trigger("click");
      }
    });
  }
  // Searching companies from input
  searchEvent() {
    $(document).on("keyup", ".searchingInput_input", function() {
      const searchValue = $(".searchingInput_input").val();
      const searchResult = companies.filter(function(el) {
        return el.name.toLowerCase().includes(searchValue.toLowerCase());
      });
      tbody.innerHTML = "";
      tableBuilder.BuildTableData(searchResult, tbody);
      pagination.ResetPagination();
      pagination.BuildPaginationFooter(searchResult.length, 40);
    });
  }
  detailsEvent() {
    $(document).on("click", ".table_result-tr", function() {
      companyId = $(this).attr("id") ? $(this).attr("id") : companyId;

      const selectedCompany = companies.find(el => el.id == companyId);

      if (!$("#startDate").val() || !$("#endDate").val()) {
        $("#total").text(selectedCompany.totalIncomes);
        $("#avg").text(
          parseInt(selectedCompany.totalIncomes) /
            parseInt(selectedCompany.incomes.incomes.length)
        );
      } else {
        const selectedIncomes = selectedCompany.incomes.incomes.filter(
          d =>
            new Date(d.date) >= new Date($("#startDate").val()) &&
            new Date(d.date) <= new Date($("#endDate").val())
        );

        const rangeTotalValue = selectedIncomes
          .map(a => a.value)
          .reduce((a, b) => parseInt(a ? a : 0) + parseInt(b), 0);
        $("#total").text(rangeTotalValue);
        if (selectedIncomes.length > 0) {
          $("#avg").text(
            parseInt(rangeTotalValue) /
              parseInt(selectedIncomes.length ? selectedIncomes.length : 0)
          );
        } else {
          $("#avg").text("0");
        }
      }

      const lastMoth = selectedCompany.incomes.incomes.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      })[0];

      const summaryOfLastMonth = selectedCompany.incomes.incomes
        .filter(
          s =>
            new Date(s.date).getMonth() == new Date(lastMoth.date).getMonth() &&
            new Date(s.date).getFullYear() ==
              new Date(lastMoth.date).getFullYear()
        )
        .map(a => a.value)
        .reduce((a, b) => parseInt(a ? a : 0) + parseInt(b), 0);

      $("#sum").text(summaryOfLastMonth);

      const ctx = $("#myChart");

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];

      const dataByMonth = selectedCompany.incomes.incomes.reduce(function(
        dataByMonth,
        datum
      ) {
        const date = new Date(datum.date);
        const value = parseInt(datum.value);
        const month = monthNames[date.getMonth()];
        const year = ("" + date.getFullYear()).slice(-2);
        const group = month + "'" + year;

        dataByMonth[group] =
          (parseInt(dataByMonth[group]) || 0) + parseInt(value);

        return dataByMonth;
      },
      {});

      const chartData = Object.keys(dataByMonth).map(function(group) {
        return { name: group, value: dataByMonth[group] };
      });

      const myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: chartData.map(s => s.name),
          datasets: [
            {
              label: "# of INCOMES",
              data: chartData.map(s => parseInt(s.value)),
              borderWidth: 3
            }
          ],
          borderWidth: 1
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true
                }
              }
            ]
          }
        }
      });
      myChart.update();
    });
  }
  // pagination
  paginationEvent() {
    $(document).on("click", ".pagination_lists-list", function() {
      tbody.innerHTML = "";

      const pageNumber = $(this).attr("data-pagination");
      tableBuilder.BuildTableData(
        companies.slice((pageNumber - 1) * 40, pageNumber * 40),
        tbody
      );
      pagination.ResetPagination();
      pagination.BuildPaginationFooter(companies.length, 40);
    });
  }
}
