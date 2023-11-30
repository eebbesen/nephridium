// from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
export function exportTableToCSV (filename: any): void {
  const csv = []
  const rows = document.querySelectorAll('table tr')

  for (let i = 0; i < rows.length; i++) {
    const row = []; const
      cols: NodeListOf<HTMLElement> = rows[i].querySelectorAll('td, th')

    for (let j = 0; j < cols.length; j++) {
      row.push(cols[j].innerText)
    }

    csv.push(row.join(','))
  }

  downloadCSV(csv.join('\n'), filename)
}

// from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
function downloadCSV (csv: BlobPart, filename: string): void {
  const csvFile = new Blob([csv], { type: 'text/csv' })
  const downloadLink = document.createElement('a')
  downloadLink.download = filename
  downloadLink.href = window.URL.createObjectURL(csvFile)
  downloadLink.style.display = 'none'
  document.body.appendChild(downloadLink)

  downloadLink.click()
}

export function toggleFilterDisplay (): void {
  const style: CSSStyleDeclaration | undefined = document?.getElementById('filters')?.style
  const filter: HTMLElement | null = document?.getElementById('toggleFilters')

  if (style != null && style.getPropertyValue('display') === 'block') {
    style.setProperty('display', 'none')
    if (filter !== null) {
      filter.innerText = 'Show Filters'
    }
  } else if (style != null) {
    style.setProperty('display', 'block')
    if (filter !== null) {
      filter.innerText = 'Hide Filters'
    }
  }
}
