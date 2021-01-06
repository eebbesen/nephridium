// from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
function exportTableToCSV(filename) {
  const csv = [];
  const rows = document.querySelectorAll('table tr');

  for (let i = 0; i < rows.length; i++) {
    const row = []; const
      cols = rows[i].querySelectorAll('td, th');

    for (let j = 0; j < cols.length; j++) {
      row.push(cols[j].innerText);
    }

    csv.push(row.join(','));
  }

  downloadCSV(csv.join('\\n'), filename);
}

// from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
function downloadCSV(csv, filename) {
  const csvFile = new Blob([csv], { type: 'text/csv' });
  const downloadLink = document.createElement('a');
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);

  downloadLink.click();
}

function toggleFilterDisplay() {
  const style = document.getElementById('filters').style.display;
  if (style && style == 'block') {
    document.getElementById('filters').style.display = 'none';
    const b = document.getElementById('toggleFilters').innerText = 'Show Filters';
  } else {
    document.getElementById('filters').style.display = 'block';
    const b = document.getElementById('toggleFilters').innerText = 'Hide Filters';
  }
}
