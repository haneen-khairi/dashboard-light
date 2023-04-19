//Prouduct Chart

const dataProduct = {
  labels: ["Positive", "Negative"],
  datasets: [
    {
      label: "",
      data: [51, 49],
      backgroundColor: ["#1AB0B0", "#F85C7F"],
      borderColor: ["#1AB0B0", "#F85C7F"],
      borderWidth: 1,
    },
  ],
};

// config
const configProduct = {
  type: "doughnut",
  data: dataProduct,
};

// render init block
const ProductChart = new Chart(
  document.getElementById("ProductChart"),
  configProduct
);
